---
title: Access Control
summary: Define allowed behavior and add permission based checks to your Controllers.
icon: user-lock
---

# Access Control

Within your controllers you should declare and restrict what people can see and do to ensure that users cannot run 
actions on the website they shouldn't be able to. 

## Allowed Actions

Any action you define on a controller must be defined in a `$allowed_actions` configuration array. This prevents users from
directly calling methods that they shouldn't.

```php
use SilverStripe\Control\Controller;

class MyController extends Controller 
{
    private static $allowed_actions = [
        // someaction can be accessed by anyone, any time
        'someaction', 

        // So can otheraction
        'otheraction' => true, 
        
        // restrictedaction can only be people with ADMIN privilege
        'restrictedaction' => 'ADMIN', 

        // restricted to uses that have the 'CMS_ACCESS_CMSMain' access
        'cmsrestrictedaction' => 'CMS_ACCESS_CMSMain',
        
        // complexaction can only be accessed if $this->canComplexAction() returns true.
        'complexaction' => '->canComplexAction',

        // complexactioncheck can only be accessed if $this->canComplexAction("MyRestrictedAction", false, 42) is true.
        'complexactioncheck' => '->canComplexAction("MyRestrictedAction", false, 42)',
    ];
}
```

[notice]
If you want to add access checks in a subclass for an action which is declared in a parent class, and the parent class _doesn't_ declare an access check for that action, your subclass will have to redeclare the action method.

The declaration of the method can be as simple as:

```php
public function someAction(HTTPRequest $request)
{
    return parent::someAction($request);
}
```

[/notice]

[info]
If the permission check fails, Silverstripe CMS will return a `403` Forbidden HTTP status.
[/info]

An action named "index" is allowed by default, unless `allowed_actions` is defined as an empty array, or the action
is specifically restricted.

```php
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Control\Controller;
 
class MyController extends Controller 
{
    public function index(HTTPRequest $request) 
    {
        // allowed without being defined in $allowed_actions
    }
}
```

`$allowed_actions` can be defined on `Extension` classes applying to the controller:

```yml
Vendor\Module\Control\SomeModuleController:
  extensions:
    - 'App\Control\Extension\MyExtension'
```

```php
namespace App\Control\Extension;

use SilverStripe\Core\Extension;

class MyExtension extends Extension 
{
    private static $allowed_actions = [
        'mycustomaction'
    ];
}
```

Only public methods can be made accessible.

```php
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Control\Controller;

class MyController extends Controller 
{
    private static $allowed_actions = [
        'secure',
        // secureaction won't work as it's protected.
    ];

    public function secure(HTTPRequest $request) 
    {
        // ..
    }

    protected function secureaction() 
    {
        // ..
    }
}
```

If a method on a parent class is overwritten, access control for it has to be redefined as well.

```php
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Control\Controller;

class MyController extends Controller 
{
    private static $allowed_actions = [
        'action',
    ];

    public function action(HTTPRequest $request) 
    {
        // ..
    }
}

class MyChildController extends MyController 
{
    private static $allowed_actions = [
        'action', // required as we are redefining the action
    ];

    public function action(HTTPRequest $request) 
    {

    }
}
```

## Forms

Form action methods should **not** be included in `$allowed_actions`. However, the form method **should** be included 
as an allowed action.

```php
use SilverStripe\Forms\Form;
use SilverStripe\Control\Controller;

class MyController extends Controller 
{

    private static $allowed_actions = [
        'ContactForm' // use the Form method, not the action
    ];

    public function ContactForm() 
    {
        return new Form(..);
    }

    public function doContactForm($data, $form) 
    {
        // ..
    }
}
```

See [the forms section](/developer_guides/forms/) for more information about handling routing for forms and their actions.

## Action Level Checks

Each method responding to a URL can also implement custom permission checks, e.g. to handle responses conditionally on 
the passed request data.

```php
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Control\Controller;

class MyController extends Controller 
{
    private static $allowed_actions = [
        'myaction'
    ];

    public function myaction(HTTPRequest $request) 
    {
        if (!$request->getVar('apikey')) {
            return $this->httpError(403, 'No API key provided');
        } 
            
        return 'valid';
    }
}
```

[notice]
This is recommended as an addition to access checks defined in `$allowed_actions`, in order to handle more complex checks, rather than a
replacement.
[/notice]

## Controller Level Checks

After checking for allowed_actions, each controller invokes its [`init()`](api:SilverStripe\Control\Controller::init()) method, which is typically used to set up
common state. If an `init()` method returns a `HTTPResponse` with either a 3xx or 4xx HTTP status code, it'll abort
execution. This behavior can be used to implement permission checks.

[info]
`init()` is called regardless of the action that will ultimately handle the request, and executes before the action does.
[/info]

```php
use SilverStripe\Security\Permission;
use SilverStripe\Control\Controller;

class MyController extends Controller 
{
    public function init() 
    {
        parent::init();

        // Only allow administrators to perform ANY action (including index) on this controller via HTTP requests
        if (!Permission::check('ADMIN')) {
            return $this->httpError(403);
        }
    }
}
```

## Related Documentation

* [Security](../security)

## API Documentation

* [Controller](api:SilverStripe\Control\Controller)
