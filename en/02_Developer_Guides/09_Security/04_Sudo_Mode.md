---
title: Sudo Mode
summary: Require users to verify their identity when performing sensitive actions
icon: key
---

# Sudo mode

Sudo mode represents a heightened level of permission in that you are more certain that the current CMS user is actually the person whose account is logged in. This is performed by re-validating that the account's password is correct, and will then last for a certain amount of time (configurable) until it will be checked again.

Sudo mode is not active when a user logs in to the CMS. If the PHP session lifetime expires before the sudo mode lifetime, that sudo mode will also be cleared. If the user leaves their CMS open, or continues to use it, for an extended period of time with automatic refreshing in the background, sudo mode will eventually deactivate once the max lifetime is reached.

## Configuring the sudo mode lifetime

The default [`SudoModeServiceInterface`](api:SilverStripe\Security\SudoMode\SudoModeServiceInterface) implementation is [`SudoModeService`](api:SilverStripe\Security\SudoMode\SudoModeService), and its lifetime can be configured with YAML. You should read the lifetime value using `SudoModeServiceInterface::getLifetime()`.

```yml
SilverStripe\Security\SudoMode\SudoModeService:
  lifetime_minutes: 25
```

## Sudo mode for models

Models which are protected by sudo mode (usually a [`DataObject`](api:SilverStripe\ORM\DataObject) subclass) are still viewable without entering the password. Any actions that modify data, e.g. POSTing an edit form submission, will require the user to enter their password. This is done to balance usability with security.

The following `DataObject` subclasses are protected by sudo mode out of the box:

- [`Member`](api:SilverStripe\Security\Member)
- [`Group`](api:SilverStripe\Security\Group)
- [`PermissionRole`](api:SilverStripe\Security\PermissionRole)
- [`PermissionRoleCode`](api:SilverStripe\Security\PermissionRoleCode)

### Configuring sudo mode for your models

To add sudo mode for a particular model, including your `DataObject` subclasses, simply set the [`require_sudo_mode`](api:SilverStripe\View\ViewableData->require_sudo_mode) configuration property to `true`, either directly on the class or via yml.

> [!NOTE]
> This will only add sudo mode to edit forms within the CMS interface. It will have no effect on forms outside of the CMS, such as custom forms in the frontend.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Product extends DataObject
{
    // ...
    private static bool $require_sudo_mode = true;
}
```

```yml
SomeModule\Model\Player:
  require_sudo_mode: true
```

> [!WARNING] If you add new fields to form that is protected by sudo mode, such as in an overridden [`LeftAndMain::getEditForm()`](api:SilverStripe\Admin\LeftAndMain::getEditForm()) method, it may mean having to call [`Form::requireSudoMode()`](api:SilverStripe\Forms\Form::requireSudoMode()) on the form to ensure the newly added fields are set to read-only while sudo mode is inactive.

## Sudo mode for controller endpoints

Performing a sudo mode verification check in a controller endpoint by using the sudo mode service to validate the request:

```php
namespace App\Control;

use SilverStripe\Core\Injector\Injector;
use SilverStripe\Security\SudoMode\SudoModeServiceInterface;

class MyController extends Controller
{
    // ...

    public function myAction(HTTPRequest $request): HTTPResponse
    {
        $service = Injector::inst()->get(SudoModeServiceInterface::class);
        if (!$service->check($request->getSession())) {
            return $this->httpError(403, 'Sudo mode is required for this action');
        }
        // ... continue with sensitive operations
    }
}
```

## Sudo mode for react components

The `silverstripe/admin` module defines a [React Higher-Order-Component](https://reactjs.org/docs/higher-order-components.html) (aka HOC) which can
be applied to React components in your module or code to intercept component rendering and show a "sudo mode required"
information and log in screen, which will validate, activate sudo mode, and re-render the wrapped component afterwards
on success.

This sudo mode differs from sudo mode for `DataObject`s in that it is not tied to a specific model, but rather to a
specific react component.

> [!WARNING]
> Sudo mode for react components does not protect the data the component manages, or any endpoints the component uses, it simply requires the user to re-enter their password before the component is rendered.

> [!IMPORTANT]
> The `WithSudoMode` HOC is exposed via [Webpack's expose-loader plugin](https://webpack.js.org/loaders/expose-loader/). You will need to add it as a [webpack external](https://webpack.js.org/configuration/externals/) to use it. The recommended way to do this is via the [@silverstripe/webpack-config npm package](https://www.npmjs.com/package/@silverstripe/webpack-config) which handles all the external configuration for you.

You can get the injector to apply the HOC to your component automatically using [injector transformations](/developer_guides/customising_the_admin_interface/reactjs_redux_and_graphql/#transforming-services-using-middleware):

```js
import WithSudoMode from 'containers/SudoMode/SudoMode';

Injector.transform('MyComponentWithSudoMode', (updater) => {
  updater.component('MyComponent', WithSudoMode);
});
```

If the user has already activated sudo mode and it has not expired, they can interact with your component automatically. Otherwise, they will need to verify their identity by re-entering their password.

![Sudo mode HOC example](../../_images/sudomode.png)

### Requirements for adding to a component

While the `sudoModeActive` prop is gathered automatically from the Redux configuration store, backend validation is
also implemented to ensure that the frontend UI cannot simply be tampered with to avoid re-validation on sensitive
operations.

Ensure you protect your endpoints from [cross site request forgery (CSRF)](/developer_guides/forms/form_security/#cross-site-request-forgery-csrf)
at the same time.
