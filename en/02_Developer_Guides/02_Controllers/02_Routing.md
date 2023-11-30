---
title: Routing
summary: A more in depth look at how to map requests to particular controllers and actions.
---

# Routing

[info]
If you're extending [`ContentController`](api:SilverStripe\CMS\Controllers\ContentController) or `PageController` for your [`SiteTree`](api:SilverStripe\CMS\Model\SiteTree) records you don't need to define the routing rules as the `cms` handles routing for those. You may still need to define [url_handlers](#url-handlers) in some cases though.
[/info]

Routing is the process of mapping URL's to [Controller](api:SilverStripe\Control\Controller) and actions.

[hint]
Getting routing rules right can be tricky. Add `?debug_request` to the end of your URL in your browser (while in dev mode) to see debug information about how your controller is matching actions against your URL pattern.
See [URL Variable Tools](/developer_guides/debugging/url_variable_tools) for more useful URL variables for debugging.
[/hint]

Routes are defined by setting the `rules` configuration array on [`Director`](api:SilverStripe\Control\Director). Typically you will add this configuration in a `routes.yml` file in your application or module's `_config` folder alongside your other configuration files.

```yml
# app/_config/routes.yml
---
Name: approutes
After:
  - '#rootroutes'
  - '#coreroutes'
---
SilverStripe\Control\Director:
  rules:
    'teams//$Action/$ID/$Name': 'App\Control\TeamController'
    'player/': 'App\Control\PlayerController'
    '': 'App\Control\HomeController'
```

[hint]
The `//` before `$Action` in the above routing pattern is important! Without this, the appropriate action will not be matched. See [URL patterns](#url-patterns) below for more information about this.
[/hint]

The above declarations will instantiate a new controller with the given class name. If your controller needs some additional setup (e.g. it has constructor parameters or needs some method to be called before handling certain requests) you can set up a service with the injector and tell the `Director` to use that specific service.

```yml
SilverStripe\Control\Director:
  rules:
    'player/': '%$SpecialInjectedController'
```

See [Dependency Injection](/developer_guides/extending/injector) for more information about the injector configuration syntax and how to define services.

[hint]
You can also define redirections in your routing rules! See [Redirection](redirection#redirections-in-routing-rules) for more information.
[/hint]

Read the [Configuration](../configuration) documentation for more information about the configuration API and syntax in general.

## Alternative syntax

The above example, and other examples in this section, show the controller class or service name as a single value in the array, with the routing rule that applies to it being the key.

If you want to be more explicit in your configuration declaration, you can instead set the value of the array to be *another* array, where the key is the word "Controller", and the value is again your controller class or service name.

```yml
SilverStripe\Control\Director:
  rules:
    'teams//$Action/$ID/$Name':
      Controller: 'App\Control\TeamController'
    'player/':
      Controller: '%$SpecialInjectedController'
```

## Parameters

```yml
SilverStripe\Control\Director:
  rules:
    'teams//$Action/$ID/$Name': 'App\Control\TeamController'
```

This route has defined that any URL beginning with `teams/` should instantiate and be handled by a `TeamController`.

It also contains 3 `parameters` (or `params` for short). `$Action`, `$ID` and `$Name`. These are placeholders
which will be filled when the user makes their request. Request parameters are available on the `HTTPRequest` object
and can be pulled out from a controller using `$this->getRequest()->param($name)`.

[hint]
The base `Controller` class already defines `$Action//$ID/$OtherID` in the `url_handlers` configuration array - so you can omit that part of the routing rule if you want, simplifying the above rule to:

```yml
SilverStripe\Control\Director:
  rules:
    'teams': 'App\Control\TeamController'
```

[/hint]

[alert]
Be aware that if your action doesn't follow the default URL handler pattern `$Action//$ID/$OtherID`, you *must* declare the appropriate url_handler pattern for your action.
This is because the `Director.rules` configuration is *only* used to indentify which *controller* should handle the request, and how to handle parameters. It does *not*
provide enough information on its own for the controller to know which *action* should be used.

For example, the following two routing rules *must* have an appropriate `url_handlers` declaration:

- `teams//$Action/$ID/$AnotherID/$Name` - the `$Action/$ID/$AnotherID/$Name` portion needs to be declared in `url_handlers`
- `teams//$@` - the `$@` portion needs to be declared in `url_handlers`

In both cases, having any more than 3 path segments after `teams/` in the URL will result in the error "I can't handle sub-URLs on class `App\Control\TeamController`". This happens because there are more path segments than the default URL handler pattern knows how to deal with.

Note also that in both cases the first path segment after `teams/` will try to match against an action on the controller. You can also use `url_handlers` to declare a specific action that should handle these patterns regardless of what the parameter values resolve to.

See [URL Handlers](#url-handlers) below for more information about the `url_handlers` configuration array.
[/alert]

Here is what those parameters would look like for certain requests

Accessing the `/teams/` route:

```php
$params = $this->getRequest()->params();

// returns the following array:
$params = [
    'Action' => null,
    'ID' => null,
    'Name' => null,
];
```

Accessing the `/teams/players` route:

```php
$params = $this->getRequest()->params();

// returns the following array:
$params = [
    'Action' => 'players',
    'ID' => null,
    'Name' => null,
];
```

Accessing the `/teams/players/1` route:

```php
$params = $this->getRequest()->params();

// returns the following array:
$params = [
    'Action' => 'players',
    'ID' => 1,
    'Name' => null,
];

// You can also fetch one parameter at a time:
$id = $this->getRequest()->param('ID');
```

[info]
All Controllers have access to `$this->getRequest()` for the request object and `$this->getResponse()` for the response.
Controller actions also accept the current `HTTPRequest` as their first argument.
[/info]

## URL patterns

The [`RequestHandler`](api:SilverStripe\Control\RequestHandler) (of which `Controller` is a subclass) will parse all rules you specify against the following patterns. The most specific rule
will be the one followed for the response.

[alert]
A rule must always start with alphabetical (`[A-Za-z]`) characters or a $Variable declaration
[/alert]

 | Pattern     | Description |
 | ----------- | --------------- |
 | `$`         | **Param Variable** - Starts the name of a parameter variable, it is optional to match this unless ! is used |
 | `!`         | **Require Variable** - Placing this after a parameter variable requires data to be present for the rule to match |
 | `//`        | **Shift Point** - Declares that variables denoted with a $ are only parsed into the $params AFTER this point in the regex |

[notice]
The shift point is an important part of the routing pattern and should immediately follow the hard-coded portion of the URL segment.
This ensures that the request handler knows to only pass through items *after* that point as variable parameters for the controller to check against its `url_handler`
patterns.
[/notice]

The following is a very common URL handler syntax. For any URL that contains 'teams' this rule will match and hand over execution to the
matching controller. The `TeamsController` is passed an optional action, id, and other id parameters to do any more
decision making.

```yml
SilverStripe\Control\Director:
  rules:
    'teams//$Action/$ID/$OtherID': 'App\Control\TeamController'

# /teams/
# /teams/players/
# /teams/players/1
# /teams/players/1/13
```

This next example does the same matching as the previous example, any URL starting with `teams` will look at this rule **but** both
`$Action` and `$ID` are required. Any requests to `teams/` will result in a `404` error (or, if an appropriate looser routing rule exists, will match against that)
rather than being handed off to the `TeamController`.

```yml
SilverStripe\Control\Director:
  rules:
    'teams//$Action!/$ID!': 'App\Control\TeamController'
```

Next we have a route that will any URL starting with `/admin/help/`, but don't include `/help/` as part of the action (the shift point is set to
start parsing variables and the appropriate controller action AFTER the `//`).

```yml
SilverStripe\Control\Director:
  rules:
    'admin/help//$Action/$ID: 'App\Control\AdminHelpController'
```

### Wildcard URL patterns

There are two wildcard patterns that can be used. `$@` and `$*`. These parameters can only be used
at the end of a URL pattern - anything in the pattern after one of these is ignored.

Inspired by [bash variadic variable syntax](https://www.gnu.org/software/bash/manual/html_node/Special-Parameters.html)
there are two ways to capture all URL parameters without having to explicitly
specify them in the URL rule.

Using `$@` will split the URL into numbered parameters (`$1`, `$2`, ..., `$n`). For example:

```yml
SilverStripe\Control\Director:
  rules:
    'staff': 'App\Control\StaffController'
```

```php
namespace App\Control;

use SilverStripe\Control\Controller;
use SilverStripe\Control\HTTPRequest;

class StaffController extends Controller
{
    private static $url_handlers = [
        '$@' => 'index',
    ];

    public function index(HTTPRequest $request)
    {
        // GET /staff/managers/bob
        // "managers"
        $request->latestParam('$1');
        // "bob"
        $request->latestParam('$2');
        // ["managers", "bob"]
        $request->latestParams();
    }
}
```

Alternatively, if access to the parameters is not required in this way then it is possible to use `$*` to match all
URL parameters but not collect them in the same way:

```php
namespace App\Control;

use SilverStripe\Control\Controller;
use SilverStripe\Control\HTTPRequest;

class StaffController extends Controller
{
    private static $url_handlers = [
        '$*' => 'index',
    ];

    public function index(HTTPRequest $request)
    {
        // GET /staff/managers/bob/hobbies
        // "managers/bob/hobbies"
        $request->remaining();

        // returns "managers", and removes that from the list of remaining params
        $nextParam = $request->shift();

        // returns ["bob", "hobbies"] and removes those from the list of remaining params
        $moreParams = $request->shift(2);
    }
}
```

## URL handlers

In previous examples the URLs were configured using the [`Director`](api:SilverStripe\Control\Director) rules in the **routes.yml** file.
Alternatively you can use this to provide just enough information for the `Director` to select your controller to handle the request, and
specify the rest of the routing rules for your actions directly in your Controller class.

[alert]
Don't forget to set your actions in the `allowed_actions` configuration array, or you won't be able to access them via HTTP requests.

See the [Access Control](access_control) documentation for more information.
[/alert]

In this case, the routing rule only needs to provide enough information for the framework to choose the desired controller.

```yml
SilverStripe\Control\Director:
  rules:
    'teams': 'App\Control\TeamController'
```

The rest of the routing rule, which tells your controller which action should handle the request, is entered in the `$url_handlers` configuration array.
This array is processed at runtime once the `Controller` has been matched.

This is useful when you want to provide one action to handle multiple route mappings. Say for instance we want to respond
`teams/coaches`, and `teams/staff` to the one controller action `payroll`.

```php
// app/src/Control/TeamController.php
namespace App\Control;

use SilverStripe\Control\Controller;

class TeamController extends Controller
{
    private static $url_segment = 'teams';

    private static $allowed_actions = [
        'payroll',
    ];

    private static $url_handlers = [
        'staff/$ID/$Name' => 'payroll',
        'coach/$ID/$Name' => 'payroll',
    ];

    // ...
}
```

The `$url_handlers` array uses the same syntax as the `Director.rules` configuration, except the value here is an action on the controller rather than the controller class itself. The patterns are relative to the main path that was used to match the controller in the first place.

Now let’s consider a more complex example, where using
`$url_handlers` is mandatory. In this example, the URLs are of the form
`https://www.example.com/feed/go/`, followed by 5 parameters.

The main routing rule to match the controller is simple:

```yml
SilverStripe\Control\Director:
  rules:
    'feed': 'App\Control\FeedController'
```

The PHP controller class specifies the URL pattern in `$url_handlers`. Notice that it defines 5
parameters.

```php
namespace App\Control;

use SilverStripe\CMS\Controllers\ContentController;
use SilverStripe\Control\HTTPRequest;

class FeedController extends ContentController
{
    private static $url_segment = 'feed';

    private static $allowed_actions = [
        'go',
    ];

    private static $url_handlers = [
        'go/$UserName/$Timestamp/$OutputType/$DeleteMode' => 'go',
    ];

    public function go(HTTPRequest $request)
    {
        $user = $this->getUserByName($this->getRequest()->param('UserName'));
        /* more processing goes here */
    }
}
```

## Root URL handlers

```yml
SilverStripe\Control\Director:
  rules:
    'bread': 'App\Control\BreadAPIController'
```

In some cases, the Director rule covers the entire URL you intend to match, and you simply want the controller to respond to a 'root' request. This request will automatically direct to an `index()` method if it exists on the controller, but you can also set a custom method to use in `$url_handlers` with the `'/'` key:

```php
namespace App\Control;

use SilverStripe\Control\Controller;

class BreadAPIController extends Controller
{
    private static $allowed_actions = [
        'getBreads',
        'createBread',
    ];

    private static $url_handlers = [
        'GET /' => 'getBreads',
        'POST /' => 'createBread',
    ];
}
```

## Related lessons

- [Creating filtered views](https://www.silverstripe.org/learn/lessons/v4/creating-filtered-views-1)
- [Controller actions / DataObjects as pages](https://www.silverstripe.org/learn/lessons/v4/controller-actions-dataobjects-as-pages-1)

## Links

- [Controller](api:SilverStripe\Control\Controller) API documentation
- [Director](api:SilverStripe\Control\Director) API documentation
- [Example routes: framework](https://github.com/silverstripe/silverstripe-framework/blob/5/_config/routes.yml)
- [Example routes: CMS](https://github.com/silverstripe/silverstripe-cms/blob/5/_config/routes.yml)
