---
title: How to Create Lightweight Form
summary: Create a simple search form with Silverstripe CMS
iconBrand: wpforms
---

# How to Create Lightweight Form

Out of the box, Silverstripe CMS provides a robust and reusable set of HTML markup for [FormField](api:SilverStripe\Forms\FormField), however this can 
sometimes produce markup which is unnecessarily bloated.

For example, a basic search form. We want to use the [Form](api:SilverStripe\Forms\Form) API to handle the form but we may want to provide a 
totally custom template to meet our needs. To do this, we'll provide the class with a unique template through 
[`setTemplate()`](api:SilverStripe\Forms\Form::setTemplate()).

[info]
If you just want to change the template for a given form field instead, you can call [`setTemplate()`](api:SilverStripe\Forms\FormField::setTemplate()) on the individual field.
[/info]

**app/src/Page.php**

```php
public function SearchForm() 
{
    $fields = new FieldList(
        TextField::create('q')
    );

    $actions = new FieldList(
        FormAction::create('doSearch', 'Search')
    );

    $form = new Form($this, __FUNCTION__, $fields, $actions);
    $form->setTemplate('SearchForm');

    return $form;
}
```

**app/templates/Includes/SearchForm.ss**

```ss
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
