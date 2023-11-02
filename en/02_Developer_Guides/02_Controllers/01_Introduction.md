---
title: Introduction to a Controller
summary: A brief look at the definition of a Controller, creating actions and how to respond to requests.
---

# Introduction to controllers

The following example is for a simple [Controller](api:SilverStripe\Control\Controller) class. When building off the Silverstripe CMS you will
subclass the base `Controller` class.

```php
// app/src/Control/TeamController.php
namespace App\Control;

use SilverStripe\Control\Controller;
use SilverStripe\Control\HTTPRequest;

class TeamController extends Controller
{
    private static $allowed_actions = [
        'players',
        'index',
    ];

    public function index(HTTPRequest $request)
    {
        // ...
    }

    public function players(HTTPRequest $request)
    {
        print_r($request->allParams());
    }
}
```

## Routing

We need to define the URL that this controller can be accessed on. In our case, the `TeamsController` should be visible
at <http://yoursite.com/teams/> and the `players` custom action is at <http://yoursite.com/team/players/>.

[info]
If you're using the `cms` module with and dealing with `Page` objects then for your custom `Page Type` controllers you
would extend `ContentController` or `PageController`. You don't need to define the routes value as the `cms` handles
routing.
[/info]

[alert]
Make sure that after you have modified the `routes.yml` file, that you clear your Silverstripe CMS caches using `?flush=1`.
[/alert]

```yml
# app/_config/routes.yml
---
Name: approutes
After: framework/_config/routes#coreroutes
---
SilverStripe\Control\Director:
  rules:
    'teams//$Action/$ID/$Name': 'App\Control\TeamController'
```

For more information about creating custom routes, see the [Routing](routing) documentation.

## Actions

Controllers respond by default to an `index` method. You don't need to define this method (as it's assumed) but you
can override the `index()` response to provide custom data back to the [Template and Views](../templates).

[notice]
It is standard in Silverstripe CMS for your controller actions to be `lowercasewithnospaces`
[/notice]

Action methods can return one of four main things:

- an array. In this case the values in the array are available in the templates and the controller completes as usual by returning a [HTTPResponse](api:SilverStripe\Control\HTTPResponse) with the body set to the current template.
- `HTML`. Silverstripe CMS will wrap the `HTML` into a `HTTPResponse` and set the status code to 200.
- an [HTTPResponse](api:SilverStripe\Control\HTTPResponse) containing a manually defined `status code` and `body`.
- an [HTTPResponse_Exception](api:SilverStripe\Control\HTTPResponse_Exception). A special type of response which indicates an error. By returning the exception, the execution pipeline can adapt and display any error handlers.

```php
// app/src/Control/TeamController.php
namespace App\Control;

use SilverStripe\Control\Controller;
// ...

class TeamPageController extends Controller
{
    // ...

    /**
     * Return some additional data to the current response that is waiting to go out, this makes $Title set to
     * 'MyTeamName' and continues on with generating the response.
     */
    public function index(HTTPRequest $request)
    {
        return [
            'Title' => 'My Team Name',
        ];
    }

    /**
     * We can manually create a response and return that to ignore any previous data.
     */
    public function someaction(HTTPRequest $request)
    {
        $this->setResponse(HTTPResponse::create());
        $this->getResponse()->setStatusCode(400);
        $this->getResponse()->setBody('invalid');

        return $this->getResponse();
    }

    /**
     * Or, we can modify the response that is waiting to go out.
     */
    public function anotheraction(HTTPRequest $request)
    {
        $this->getResponse()->setStatusCode(400);

        return $this->getResponse();
    }

    /**
     * We can render HTML and leave Silverstripe CMS to set the response code and body.
     */
    public function htmlaction()
    {
        return $this->customise(ArrayData::create([
            'Title' => 'HTML Action',
        ]))->renderWith('MyCustomTemplate');
    }

    /**
     * We can send stuff to the browser which isn't HTML
     */
    public function ajaxaction()
    {
        $this->getResponse()->setBody(json_encode([
            'json' => true,
        ]));

        $this->getResponse()->addHeader('Content-type', 'application/json');

        return $this->getResponse()
    }
}
```

For more information on how a URL gets mapped to an action see the [Routing](routing) documentation.

## Security

See the [Access Controller](access_control) documentation.

## Templates

Controllers are automatically rendered with a template that makes their name. Our `TeamsController` would be rendered
with a `TeamsController.ss` template. Individual actions are rendered in `TeamsController_{actionname}.ss`.

If a template of that name does not exist, then Silverstripe CMS will fall back to the `TeamsController.ss` then to
`Controller.ss`.

Controller actions can use `renderWith` to override this template selection process as in the previous example with
`htmlaction`. `MyCustomTemplate.ss` would be used rather than `TeamsController`.

For more information about templates, inheritance and how to render into views, See the
[Templates and Views](../templates) documentation.

## Link

Each controller inherits a [`Link()`](api:App\Control\RequestHandler::Link()) method from `RequestHandler`. For this to function correctly, the controller needs the `url_segment` configuration property to be declared.

This should be used to avoid hard coding your routing in views,
as well as give other features in Silverstripe CMS the ability to influence link behaviour.

```php
// app/src/Control/TeamController.php
namespace App\Control;

use SilverStripe\Control\Controller;

class TeamPageController extends Controller
{
    private static $url_segment = 'teams';

    // ...
}
```

Calling `$this->Link()` in the above controller will now give a valid relative URL for accessing the controller on your site. If this is a subcontroller or otherwise has some part of its route that is dynamic, you will need to override the `Link()` method to resolve the correct URL dynamically.

## Connecting pages to controllers

By default, a controller for a page type must reside in the same namespace as its page. If you find that your controllers are in a different namespace then you'll need to override SiteTree::getControllerName().

Example controller:

```php
namespace App\Control;

use PageController;

class TeamPageController extends PageController
{
    // ...

    public function getExample()
    {
        return 'example';
    }
}
```

Example page:

```php
namespace App\PageType;

use App\Control\TeamPageController;
use Page;

class TeamPage extends Page
{
    // ...

    public function getControllerName()
    {
        return TeamPageController::class;
    }
}
```

You'd now be able to access methods of the controller in the pages template

```html
<!-- TeamPage.ss -->
<p>{$getExample}</p>
```

## Related lessons

- [Controller actions/DataObjects as pages](https://www.silverstripe.org/learn/lessons/v4/controller-actions-dataobjects-as-pages-1)
- [Creating filtered views](https://www.silverstripe.org/learn/lessons/v4/creating-filtered-views-1)

## Related documentation

- [Execution Pipeline](../execution_pipeline)
- [Templates and Views](../templates)

## API documentation

- [Controller](api:SilverStripe\Control\Controller)
- [Director](api:SilverStripe\Control\Director)
