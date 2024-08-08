---
title: Tabbed Forms
summary: Find out how CMS interfaces use jQuery UI tabs to provide nested FormFields.
---

# Tabbed forms

Silverstripe CMS's [FormScaffolder](api:SilverStripe\Forms\FormScaffolder) can automatically generate [Form](api:SilverStripe\Forms\Form) instances for certain database models. In the
CMS and other scaffolded interfaces, it will output [TabSet](api:SilverStripe\Forms\TabSet) and [Tab](api:SilverStripe\Forms\Tab) objects and use jQuery Tabs to split
parts of the data model.

> [!NOTE]
> All interfaces within the CMS such as [ModelAdmin](api:SilverStripe\Admin\ModelAdmin) and [LeftAndMain](api:SilverStripe\Admin\LeftAndMain) use tabbed interfaces by default.

When dealing with tabbed forms, modifying the fields in the form has a few differences. Each [Tab](api:SilverStripe\Forms\Tab) will be given a
name, and normally they all exist under the `Root` [TabSet](api:SilverStripe\Forms\TabSet).

> [!WARNING]
> [TabSet](api:SilverStripe\Forms\TabSet) instances can contain child [Tab](api:SilverStripe\Forms\Tab) and further [TabSet](api:SilverStripe\Forms\TabSet) instances, however the CMS UI will only
> display up to two levels of tabs in the interface.

## Adding a field to a tab

```php
$fields->addFieldToTab('Root.Main', TextField::create(/* ... */));
```

## Removing a field from a tab

```php
$fields->removeFieldFromTab('Root.Main', 'Content');
```

## Creating a new tab

```php
$fields->addFieldToTab('Root.MyNewTab', TextField::create(/* ... */));
```

## Moving a field between tabs

```php
$content = $fields->dataFieldByName('Content');

$fields->removeFieldFromTab('Root.Main', 'Content');
$fields->addFieldToTab('Root.MyContent', $content);
```

## Add multiple fields at once

```php
$fields->addFieldsToTab('Root.Content', [
    TextField::create('Name'),
    TextField::create('Email'),
]);
```

## Change the order of tabs

If you need to change the order of tabs, for example if the tabs were scaffolded through [`FormScaffolder`](api:SilverStripe\Forms\FormScaffolder),
you can do so by passing the correct order of the tabs into [`TabSet::changeTabOrder()`](api:SilverStripe\Forms\TabSet::changeTabOrder()).

If there are more tabs in the tab set than you include in the tab order, they will be added after the tabs you explicitly included.

```php
$fields->fieldByName('Root')->changeTabOrder(['FirstTab', 'SecondTab']);
```

## API documentation

- [FormScaffolder](api:SilverStripe\Forms\FormScaffolder)
