---
title: How to Create Lightweight Form
summary: Create a simple search form with Silverstripe CMS
iconBrand: wpforms
---

# How to create lightweight form

Out of the box, Silverstripe CMS provides a robust and reusable set of HTML markup for [FormField](api:SilverStripe\Forms\FormField), however this can
sometimes produce markup which is unnecessarily bloated.

For example, a basic search form. We want to use the [Form](api:SilverStripe\Forms\Form) API to handle the form but we may want to provide a
totally custom template to meet our needs. To do this, we'll provide the class with a unique template through
`setTemplate`.

```php
// app/src/PageType/SearchPage.php
namespace App\PageType;

use Page;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FormAction;
use SilverStripe\Forms\TextField;

class SearchPage extends Page
{
    // ...

    public function SearchForm()
    {
        $fields = FieldList::create(
            TextField::create('q')
        );

        $actions = FieldList::create(
            FormAction::create('doSearch', 'Search')
        );

        $form = Form::create($this, 'SearchForm', $fields, $actions);
        $form->setTemplate('SearchForm');

        return $form;
    }
}
```

```ss
<%-- app/templates/Includes/SearchForm.ss --%>
<form $FormAttributes>
    <fieldset>
        $Fields.dataFieldByName(q)
    </fieldset>

    <div class="Actions">
        <% loop $Actions %>$Field<% end_loop %>
    </div>
</form>
```

`SearchForm.ss` will be executed within the scope of the `Form` object so has access to any of the methods and
properties on [Form](api:SilverStripe\Forms\Form) such as `$Fields` and `$Actions`.

[notice]
To understand more about Scope or the syntax for custom templates, read the [Templates](../../templates) guide.
[/notice]
