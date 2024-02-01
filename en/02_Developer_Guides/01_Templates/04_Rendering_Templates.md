---
title: Rendering data to a template
summary: Call and render Silverstripe CMS templates manually.
icon: code
---

# Rendering data to a template

Templates do nothing on their own. Rather, they are used to render a particular object.  All of the `<% if %>`,
`<% loop %>` and other variables are methods or parameters that are called on the current object in
[scope](syntax#scope).  All that is necessary is that the object is an instance of [ViewableData](api:SilverStripe\View\ViewableData) (or one of its
subclasses).

The following will render the given data into a template. Given the template:

```ss
<%-- app/templates/Coach_Message.ss --%>
<strong>$Name</strong> is the $Role on our team.
```

Our application code can render into that view using `renderWith`. This method is called on the [ViewableData](api:SilverStripe\View\ViewableData)
instance with a template name or an array of templates to render.

```php
namespace App\Model;

use SilverStripe\View\ArrayData;

class MyModel extends DataObject
{
    // ...

    public function getRenderedMessage()
    {
        $arrayData = ArrayData::create([
            'Name' => 'John',
            'Role' => 'Head Coach',
        ]);

        // renders "<strong>John</strong> is the Head Coach on our team."
        return $arrayData->renderWith('Coach_Message');
    }
}
```

If your template is a Layout template that needs to be rendered into the main Page template (to include a header and footer, for example), you need to render your Layout template into a string, and pass that as the Layout parameter to the Page template.

```php
namespace App\Model;

class MyModel extends DataObject
{
    // ...

    public function getRenderedMessageAsPage()
    {
        $data = [
            'Title' => 'Message from the Head Coach',
        ];

        return $this->customise([
            'Layout' => $this
                        ->customise($data)
                        ->renderWith(['Template\Path\From\templates\Layout\Coach_Message']),
        ])->renderWith(['Page']);
    }
}
```

> [!NOTE]
> Most classes in Silverstripe CMS you want in your template extend `ViewableData` and allow you to call `renderWith`. This
> includes [Controller](api:SilverStripe\Control\Controller), [FormField](api:SilverStripe\Forms\FormField) and [DataObject](api:SilverStripe\ORM\DataObject) instances.

```php
use SilverStripe\Security\Security;

$controller->renderWith(['MyController', 'MyBaseController']);

Security::getCurrentUser()->renderWith('Member_Profile');
```

`renderWith` can be used to override the default template process. For instance, to provide an ajax version of a
template.

```php
namespace App\PageType;

use PageController;

class MyPageController extends PageController
{
    private static $allowed_actions = [
        'iwantmyajax',
    ];

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

Any data you want to render into the template that does not extend `ViewableData` should be wrapped in an object that
does, such as `ArrayData` or `ArrayList`.

```php
namespace App\PageType;

use PageController;
use SilverStripe\Control\Director;
use SilverStripe\ORM\ArrayList;
use SilverStripe\View\ArrayData;

class MyPageController extends PageController
{
    // ...

    public function iwantmyajax()
    {
        if (Director::is_ajax()) {
            $experience = ArrayList::create();
            $experience->push(ArrayData::create([
                'Title' => 'First Job',
            ]));

            return $this->customise(ArrayData::create([
                'Name' => 'John',
                'Role' => 'Head Coach',
                'Experience' => $experience,
            ]))->renderWith('AjaxTemplate');
        } else {
            return $this->httpError(404);
        }
    }
}
```

## Related lessons

- [Controller actions/DataObjects as pages](https://www.silverstripe.org/learn/lessons/v4/controller-actions-dataobjects-as-pages-1)
- [AJAX behaviour and ViewableData](https://www.silverstripe.org/learn/lessons/v4/ajax-behaviour-and-viewabledata-1)
- [Dealing with arbitrary template data](https://www.silverstripe.org/learn/lessons/v4/dealing-with-arbitrary-template-data-1)
- [Creating filtered views](https://www.silverstripe.org/learn/lessons/v4/creating-filtered-views-1)
