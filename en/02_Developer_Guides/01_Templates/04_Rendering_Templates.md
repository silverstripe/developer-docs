---
title: Rendering data to a template
summary: Call and render Silverstripe CMS templates manually.
icon: code
---

# Rendering data to a template

Templates do nothing on their own. Rather, they are used to generate markup - most typically they are used to generate HTML markup, using variables from some `ViewableData` object.
All of the `<% if %>`, `<% loop %>` and other variables are methods or parameters that are called on the current object in
scope (see [scope](syntax#scope) in the syntax section).

The following will render the given data into a template. Given the template:

**app/templates/Coach_Message.ss**
    
```ss
<strong>$Name</strong> is the $Role on our team.
```

Our application code can render into that view using the [`renderWith()`](api:SilverStripe\View\ViewableData) method provided by `ViewableData`. Call this method on any instance of `ViewableData` or its subclasses, passing in a template name or an array of templates to render.

**app/src/Page.php**

```php
use SilverStripe\View\ArrayData;

$arrayData = new ArrayData([
    'Name' => 'John',
    'Role' => 'Head Coach'
]);

// prints "<strong>John</strong> is the Head Coach on our team."
echo $arrayData->renderWith('Coach_Message');
```

If you want to render an arbitrary template into the `$Layout` section of a page, you need to render your layout template and pass that as the `Layout` parameter to the Page template.

```php
$data = [
    'Title' => 'Message from the Head Coach'
];

return $this->customise([
    'Layout' => $this
                ->customise($data)
                ->renderWith(['Coach_Message']) // If your template was templates/Layout/Coach_Message.ss you could put 'Layout/Coach_Message' here.
])->renderWith(['Page']);
```

However, in this case it may be better to use an explicit `Layout` type template, and rely on template inheritance to figure out which templates to use.

```php
// This assumes you have moved the Coach_Message template to `templates/Layout/Coach_Message.ss`
$this->customise($data)->renderWith(['Coach_Message', 'Page']);
```

This will look for a global `templates/Coach_Message.ss` template, and if it doesn't find one, will use `templates/Page.ss` as the main template. Then, when it encounters `$Layout` in that template, it will find and use the `templates/Layout/Coach_Message.ss` file to substitute that variable.

[hint]
You will often have templates named after specific classes, as discussed in [template types and locations](template_inheritance/#template-types-and-locations). In that case, you can simply use `MyClass::class` syntax here. e.g:

```php
use App\Model\Coach;
use \Page;

$this->customise($data)->renderWith([Coach::class . '_Message', Page::class]);
```

This will search for the following templates:

- `templates/App/Model/Coach_Message.ss`
- `templates/Page.ss`
- `templates/App/Model/Layout/Coach_Message.ss`
- `templates/Layout/Page.ss`
[/hint]

See [template types and locations](template_inheritance/#template-types-and-locations) for more information.

[info]
Most classes in Silverstripe CMS you want in your template extend `ViewableData` and allow you to call `renderWith`. This 
includes [Controller](api:SilverStripe\Control\Controller), [FormField](api:SilverStripe\Forms\FormField) and [DataObject](api:SilverStripe\ORM\DataObject) instances.

```php
$controller->renderWith([MyController::class, MyBaseController::class]);

use SilverStripe\Security\Security;
Security::getCurrentUser()->renderWith('Member_Profile');
```

[/info]

## Advanced use cases

`renderWith()` can be used to override the default template process. For instance, to provide an ajax version of a
template.

```php
use SilverStripe\CMS\Controllers\ContentController;
use SilverStripe\Control\Director;

class PageController extends ContentController
{
    private static $allowed_actions = ['iwantmyajax'];

    public function iwantmyajax()
    {
        if (Director::is_ajax()) {
            return $this->renderWith('AjaxTemplate');
        } else {
            return $this->httpError(404);
        }
    }
}
```

[hint]
`Controller` already has a shortcut for the above scenario. Instead of explicitly calling `renderWith()` above, you can declare a template with the following naming convension: `[modelOrControllerClass]_[action].ss` e.g. `Page_iwantmyajax.ss`, `HomePage_iwantmyajax.ss`, or `PageController_iwantmyajax.ss`.

With a template that follows that naming convention in place, the PHP for the `iwantmyajax()` becomes:

```php
public function iwantmyajax()
{
    if (!Director::is_ajax()) {
        return $this->httpError(400);
    }
    // will feed $this into $this->prepareResponse(), which will render $this using templates defined in $this->getViewer()
    return $this;
}
```

This ultimately uses [`SSViewer::get_templates_by_class()`](api::SilverStripe\View\SSViewer::get_templates_by_class()) to find the templates for the class or its parent classes with the action as a suffix.

If you don't have any logic to add in the action, you can forego implementing a method altogether - all you need is to add the action name in the `$allowed_actions` configuration array and make sure you have an appropriately named template.
[/hint]

## Rendering arbitrary data in templates

Any data you want to render into the template that does not extend `ViewableData` should be wrapped in an object that
does, such as `ArrayData` or `ArrayList`.

```php
use SilverStripe\View\ArrayData;
use SilverStripe\ORM\ArrayList;
use SilverStripe\Control\Director;
use SilverStripe\CMS\Controllers\ContentController;

class PageController extends ContentController
{
    // ..
    public function iwantmyajax()
    {
        if (Director::is_ajax()) {
            return $this->customise([
                'Name' => 'John',
                'Role' => 'Head Coach',
                'Experience' => ArrayList::create([
                    ArrayData::create([
                        'Title' => 'First Job',
                    ])
                    ArrayData::create([
                        'Title' => 'Second Job',
                    ])
                ]),
            ])->renderWith('AjaxTemplate');
        } else {
            return $this->httpError(400);
        }
    }
}
```

[notice]
A common mistake is trying to loop over an array directly in a template - this won't work. You'll need to wrap the array in some `ViewableData` instance as mentioned above.
[/notice]

## Related Lessons
* [Controller actions/DataObjects as pages](https://www.silverstripe.org/learn/lessons/v4/controller-actions-dataobjects-as-pages-1)
* [AJAX behaviour and ViewableData](https://www.silverstripe.org/learn/lessons/v4/ajax-behaviour-and-viewabledata-1)
* [Dealing with arbitrary template data](https://www.silverstripe.org/learn/lessons/v4/dealing-with-arbitrary-template-data-1)
* [Creating filtered views](https://www.silverstripe.org/learn/lessons/v4/creating-filtered-views-1)
