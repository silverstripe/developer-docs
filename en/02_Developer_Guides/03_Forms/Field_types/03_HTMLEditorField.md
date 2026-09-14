---
title: Rich-text editing (WYSIWYG)
summary: Silverstripe CMS's use and configuration of HTML editors.
icon: file-code
---

# Rich-text editing (WYSIWYG)

Editing and formatting content is the bread and butter of every content management system. New installations of Silverstripe CMS come bundled with the [TinyMCE HTML editor](https://www.tiny.cloud/docs/tinymce/6/) via the [`silverstripe/htmleditor-tinymce`](https://packagist.org/packages/silverstripe/htmleditor-tinymce) module.

> [!TIP]
> See [optional features > TinyMCE HTML editor](/optional_features/htmleditor-tinymce/) for documentation specific to `silverstripe/htmleditor-tinymce`.

On top of the base functionality, we use our own insertion dialogs to ensure you can effectively select and upload
files. We also use [shortcodes](/developer_guides/extending/shortcodes) to store
information about inserted images or media elements.

The framework comes with a [`HTMLEditorField`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorField) form field class which encapsulates most of the required
functionality. It is usually added through the [`DataObject::getCMSFields()`](api:SilverStripe\ORM\DataObject::getCMSFields()) method:

```php
// app/src/Model/MyObject.php
namespace App\Model;

use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\HTMLEditor\HTMLEditorField;
use SilverStripe\ORM\DataObject;

class MyObject extends DataObject
{
    private static $db = [
        'Content' => 'HTMLText',
    ];

    public function getCMSFields()
    {
        $this->beforeUpdateCMSFields(function (FieldList $fields) {
            // Note that this field would be scaffolded automatically,
            // we're only adding it here for demonstration purposes.
            $fields->addFieldToTab('Root.Main', HTMLEditorField::create('Content'));
        });
        return parent::getCMSFields();
    }
}
```

## Configuration

To keep the HTML editor configuration manageable and extensible, we've wrapped it in a PHP class called
[`HTMLEditorConfig`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig). This class comes with its own defaults, which are extended through the [Configuration API](../../configuration)
in various modules.

There can be multiple configs, each with a unique string identifier, which should always be created and accessed using [`HTMLEditorConfig::get()`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig::get()). You can
then set the currently active config using `HTMLEditorConfig::set_active()`.

> [!WARNING]
> The order in which the `_config.php` files are executed depends on the module names. Execution
> order is alphabetical, so if you set an option in the `aardvark/_config.php` (i.e. the module name is simply `aardvark`),
> this will be overridden when setting the same named option for the same named config in `vendor/silverstripe/admin/_config.php` (because the module name is `silverstripe/admin`) and your modification will disappear.

### Defining HTML editor configurations

#### Default rules for all configs

By default, the rules defining which elements and attributes are allowed and how to treat them are defined globally for all HTML editor configs through [`HTMLEditorConfig.default_element_rules`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig->default_element_rules).

This configuration property is an associative array, with element names or patterns as the keys and rules as the values.

Every element that is allowed in the HTML content must be expicitly allowed, either on its own or as part of a pattern.
Patterns can use the following special characters:

- `*` Matches between zero and unlimited characters (equivalent to `.*` in regex).
- `?` Matches between zero and one characters (equivalent to `.?` in regex).
- `+` Matches exactly one character (equivalent to `.+` in regex).

For example the pattern `"s*n"` would be the equivalent of the regex `/^s.*n$/` and would match both "span" and "section".

The special name `"_global"` can be used to define which attributes are allowed for *all* elements.

The value in the array can be:

- `true` which means the element (or elements matching the pattern) are allowed
- `false` or `null` which means the element is explicitly *not* allowed (useful to override previously set configuration)
- an array of rules which means the element is allowed but specific rules apply to it.

> [!TIP]
> If an attribute is allowed in the global rules, you cannot *disallow* it for a specific element.

The array of element rules is associative. The following can be included in the array:

- `"padEmpty"`: Set to `true` to add a non-breaking space to elements which have no child nodes.
- `"removeIfEmpty"`: Set to `true` to remove elements which have no child nodes.
- `"removeIfNoAttributes"`: Set to `true` to remove elements which have no attributes.
- `"convertTo"`: Set to the string name of a specific attrbiute this element should be converted to. For example convert `<b>` to `<strong>`.
- `"attributes"`: An associative array of attributes allowed on this element and rules for them.

Every attribute that is allowed for an element must be explicitly allowed, either on its own or as part of a pattern. Attributes listed against the global element rule apply for all elements.
Patterns work the same way for attribute rules as they do for element rules.

Like with elements, an attribute can have `true` or an associative array to mark it as allowed, or it can be ommitted or have a `false` or `null` value to disallow it.

The array of attribute rules is associative. The following can be included in the array:

- `"isRequired"`: Set to `true` to make this attribute mandatory. If the attribute is missing, the element will be removed.
- `"value"`: If "valueType" is set to `"valid"`, set this to an array of allowed values. Otherwise set it to a string indicating the forced or default value.
- `"valueType"`: If "value" is used, set this to either `"default"` to define the default value, `"forced"` to force a specific value (overriding user-set values), or `"valid"` to define a set of allowed values for this attribute. If an invalid value is used, the attribute will be removed.

```yml
---
After: 'corehtml'
---
SilverStripe\Forms\HTMLEditor\HTMLEditorConfig:
  default_element_rules:
    _global:
      attributes:
        id: true
        class: true
        title: true
    a:
      removeIfEmpty: true
      attributes:
        href:
          isRequired: true
        target:
          value: '_blank'
          valueType: 'default'
        rel: true
    span: false
```

> [!TIP]
> Like all YAML configuration in Silverstripe CMS, any values you set to this configuration will be merged into the existing values.
> This allows you to define additional rules without overriding the existing ones.
>
> You can set any element or attribute in this array to `false` or `null` to disallow it.

By default, Silverstripe CMS will generate valid HTML5 markup even if the HTML in the value you submit is slightly malformed. However it will strip out many HTML5 tags like
`<article>` or `<figure>` by default. If you plan to use those, explicitly add them to the configured allowed elements.

Also, the [`HTMLValue`](api:SilverStripe\View\Parsers\HTMLValue) API underpinning the HTML processing parses the markup into a temporary object tree
which can be traversed and modified before saving. The built-in parser supports HTML5 syntax.

#### Rules for specific pre-defined configs

By default, a config named `cms` is used in any new [`HTMLEditorField`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorField). This is defined through [`HTMLEditorConfig.default_config_definitions`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig->default_config_definitions) and may further customised by a specific HTML editor implementation (e.g. to add necessariy plugins).

> [!TIP]
> Each HTML editor implementation likely has its own options and additional API. You should make sure to read through the documentation for the HTML editor implementation you project uses.

The `HTMLEditorConfig.default_config_definitions` configuration property is an associative array of predefined `HTMLEditorConfig` definitions that can be accessed with the [`get()`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorField::get()) method.

The keys in the array are the identifiers for the configs. The value is another associative array with the following options:

- `'configClass'` is the FCQN of the `HTMLEditorConfig` subclass that is instantiated. This allows you to use different HTML editor implementations for different scenarios, if you want to. Leave this blank to use the default.
- `'options'` can be used to define values to be passed into [`setOptions()`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorField::setOptions()) on instantiation.
- `'elementRules'` can be used to define what elements and attributes are allowed. If this isn't set, `default_element_rules` will be used. See [default rules for all configs](#default-rules-for-all-configs) for syntax.
- `'extraElementRules'` can be used to define additional element and attribute rules. This is useful to add additioanl rules on top of the defaults without having to redefine everything. Uses the same syntax as `elementRules`. Any element or attribute defined here overrides the same named element or attribute from `elementRules`.

To define a new custom HTML editor config, you can update the `HTMLEditorConfig.default_config_definitions` configuration property.

```yml
SilverStripe\Forms\HTMLEditor\HTMLEditorConfig:
  default_config_definitions:
    my-editor:
      elementRules:
        _global:
          attributes:
            id: true
            class: true
        p: true
      options:
        my-option: 'some value'
```

You can also use this to update the `cms` (or any other predefined) config, e.g. to add additional element rules on top of the default set usiong `extraElementRules`.

```yml
SilverStripe\Forms\HTMLEditor\HTMLEditorConfig:
  default_config_definitions:
    cms:
      extraElementRules:
        section:
          removeIfEmpty: true
          attributes:
            dir:
              value: ['ltr', 'rtl']
              valueType: 'valid'
```

#### Additional configuration

Some functionality might not be configuration through YAML, such as setting plugins for a specific HTML editor implementation. This is especially true of any functionality that is unique to a specific HTML editor configuration.

You can define additional options, including element rules, through PHP code. Usually this is done in your project's `_config.php` file so that the same rules can be reused in various `HTMLEditorField` instances across your codebase.

```php
// app/_config.php
use SilverStripe\Forms\HTMLEditor\HTMLEditorConfig;
use SilverStripe\Forms\HTMLEditor\HTMLEditorElementRule;

// If a config was pre-defined, it will be used - otherwise a new one will be instantiated.
$config = HTMLEditorConfig::get('my-editor');
// Set some option that applies for a specific HTML editor implementation
$config->setOption('my-option', 'some value');
$rules = $config->getElementRuleSet();
$rules->addElementRule(new HTMLEditorElementRule('section', removeIfEmpty: true));
$config->setElementRuleSet($rule);
```

### Specify which configuration to use

Each `HTMLEditorField` uses a [`HTMLEditorConfig`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig) instance to define what HTML editor interface to use, which elements are allowed in HTML content, and other configuration.

You can also specify which `HTMLEditorConfig` to use on a per field basis via the construct argument or by calling [`setEditorConfig()`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig::setEditorConfig()).
This is particularly useful if you need different configurations for multiple `HTMLEditorField` on the same page or form.

```php
namespace App\Model;

use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\HTMLEditor\HTMLEditorField;
use SilverStripe\ORM\DataObject;

class MyObject extends DataObject
{
    private static $db = [
        'Content' => 'HTMLText',
        'OtherContent' => 'HTMLText',
    ];

    private static array $scaffold_cms_fields_settings = [
        'ignoreFields' => [
            'OtherContent',
        ],
    ];

    public function getCMSFields()
    {
        $this->beforeUpdateCMSFields(function (FieldList $fields) {
            $fields->addFieldToTab(
                'Root.Main',
                HTMLEditorField::create('OtherContent', 'Other content', $this->OtherContent, 'myConfig'),
                'Content'
            );
        });
        return parent::getCMSFields();
    }
}
```

In the above example, the 'Content' field will use the default 'CMS' config while 'OtherContent' will be using 'myConfig'. An instance of `HTMLEditorConfig` can be passed instead of the string identifer if you haven't yet defined a named configuration to use.

## Image and media insertion

The [`HTMLEditorField`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorField) API also handles inserting images and media files into the managed HTML content. It can be
used both for referencing files on the webserver filesystem (through the [`File`](api:SilverStripe\Assets\File) and [`Image`](api:SilverStripe\Assets\Image) APIs), as well
as hotlinking files from the web.

We use [shortcodes](/developer_guides/extending/shortcodes) to store information about inserted images or media elements. The
[`ShortcodeParser`](api:SilverStripe\View\Parsers\ShortcodeParser) API post-processes the HTML content on rendering, and replaces the shortcodes accordingly. It also
takes care of care of placing the shortcode replacements relative to its surrounding markup (e.g. left/right alignment).

## OEmbed: embedding media through external services

The ["oEmbed" standard](https://www.oembed.com/) is implemented by many media services around the web, allowing easy
representation of files just by referencing a website URL. For example, a content author can insert a playable youtube
video just by knowing its URL, as opposed to dealing with manual HTML code.

oEmbed powers the "Insert from web" feature available through
[`HTMLEditorField`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorField). Internally this service is provided
by the [embed](https://github.com/oscarotero/Embed) library.

To disable oembed you will need to disable the internal service via YAML configuration:

> [!NOTE]
> You may need to disable functionality for a specific HTML editor implmentation as well.
> For example see [disable oembed](/optional_features/htmleditor-tinymce/configuration/#disable-oembed) for disabling this for TinyMCE.

```yml
---
Name: oembed-disable
---
SilverStripe\AssetAdmin\Forms\RemoteFileFormFactory:
  enabled: false
```

Use the following config if you need to send outbound requests through a proxy:

```yml
---
Name: myembed
After: coreoembed
---
SilverStripe\Core\Injector\Injector:
  Psr\Http\Client\ClientInterface.oembed:
    constructor:
      - proxy: '111.222.333.444:55'
```

### Limiting oembed URLs

HTMLEditorField can have whitelists set on both the scheme (default HTTP & HTTPS) and domains allowed when
inserting files for use with oembed.

This is performed through the config variables on the
[RemoteFileFormFactory](api:SilverStripe\AssetAdmin\Forms\RemoteFileFormFactory) class:

```yml
---
Name: oembed-restrictions
---
SilverStripe\AssetAdmin\Forms\RemoteFileFormFactory:
  fileurl_scheme_whitelist:
    - https
    - http
  fileurl_scheme_blacklist:
    - ftp
  fileurl_domain_whitelist:
    - google.com
  fileurl_domain_blacklist:
    - localhost
  fileurl_port_whitelist:
    - 80
    - 443
  fileurl_port_blacklist:
    - 23
```

This allows a white or blacklist to be applied to schema, domain, or port (if provided). Note that
both blacklist and whitelist need to match, and are only ignored if the rules are empty for any
of the above values.

By default live sites (see [environment types](/developer_guides/debugging/environment_types/)) will not attempt to resolve oembed urls that
point to localhost to protect your site from cross site request forgery.

### Sandboxing oembed HTML

In order to prevent any malicious oembed providers from injecting XSS payloads into the current webpage, HTML content that is returned is sandboxed in an `iframe` tag.

With the [`EmbedShortcodeProvider.domains_excluded_from_sandboxing`](api:SilverStripe\View\Shortcodes\EmbedShortcodeProvider->domains_excluded_from_sandboxing) configuration property, you can explicitly declare domains which should be excluded from sandboxing if you find it is interfering with embeds from specific domains. For example if a YouTube embed was not rendering correctly as a result of the sandboxing you could use this YAML configuration:

```yml
SilverStripe\View\Shortcodes\EmbedShortcodeProvider:
  domains_excluded_from_sandboxing:
    - 'youtube.com'
```

Do not include the protocol (i.e. don't include `https://` or `http://`).

You can also change the attributes of the iframe itself with the [`EmbedShortcodeProvider.sandboxed_iframe_attributes`](api:SilverStripe\View\Shortcodes\EmbedShortcodeProvider->sandboxed_iframe_attributes) configuration property:

```yml
SilverStripe\View\Shortcodes\EmbedShortcodeProvider:
  sandboxed_iframe_attributes:
    allow: 'fullscreen'
```

## Security groups with their own editor configuration

Different groups of authors can be assigned their own HTML editor config,
e.g. a more restricted rule set for content reviewers (see [access control](/developer_guides/security/access_control/#the-security-groups-in-silverstripe-cms)).

The config is available on each user record through [`Member::getHTMLEditorConfigForCMS()`](api:SilverStripe\Security\Member::getHTMLEditorConfigForCMS()).
The group assignment is done through the "Security" interface for each [Group](api:SilverStripe\Security\Group) record.

Note: The dropdown is only available if more than one config exists (including the default `cms` config).

## Customising modal forms

With supported HTML editor implementations (other than the textarea one built into `silverstripe/framework`), you can insert links (internal/external/anchor/email),
images as well as flash media files. The forms used for preparing the new content element
are rendered by Silverstripe CMS, but there's some JavaScript involved to transfer
back and forth between a content representation the editor can understand, present and save.

The forms for these actions are created using implementations of the [`FormFactory`](api:SilverStripe\Forms\FormFactory) interface.
For example, the module for embedding remote files gets its form from the [`RemoteFileFormFactory`](api:SilverStripe\AssetAdmin\Forms\RemoteFileFormFactory) class.

All of these forms can be customised by implementing an extension with the appropriate
extension hook method.

Example: Remove field for "Caption" in the embedded image form:

```php
// app/src/Extension/MyToolbarExtension.php
namespace App\Extension;

use SilverStripe\Core\Extension;
use SilverStripe\Forms\Form;

class RemoteFileFormFactoryExtension extends Extension
{
    protected function updateForm(Form $form)
    {
        $form->Fields()->removeByName('CaptionText');
    }
}
```

```yml
# app/_config/extensions.yml
SilverStripe\AssetAdmin\Forms\RemoteFileFormFactory:
  extensions:
    - App\Extension\RemoteFileFormFactoryExtension
```

Adding functionality is a bit more advanced, you'll most likely
need to add some fields to the PHP forms, as well as write some
JavaScript to ensure the values from those fields make it into the content
elements (and back out in case an existing element gets edited).

## Using the `HTMLEditorField` outside of the CMS

The `HTMLEditorField` is configured for use in the CMS interface - but it can be used in other contexts
as well, with some additional configuration. Note however that plugins built with the CMS in mind such as for inserting links and images
are not supported outside of the CMS.

You should to configure a custom `HTMLEditorConfig` for front-end use which doesn't include those plugins.

See documentation for specific HTML editor implementations for any additional JavaScript or configuration that may be required to use them in the front-end.

## Developing a wrapper to use a different HTML editor with `HTMLEditorField`

There are two part to adding a new HTML editor implementation to Silverstripe CMS - a `HTMLEditorConfig` subclass and a JavaScript implementation.

### Adding a custom `HTMLEditorConfig`

The [`HTMLEditorConfig`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig) class gives all the abstraction necessary to add your own HTML editor implementation to Silverstripe CMS. Make a new subclass of `HTMLEditorConfig` and implement all the abstract methods.

You must define the [`protected string $schemaComponent`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig->schemaComponent) property, setting it to the name of the react component that will be used in the CMS.

You must also define the [`protected string $configType`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig->configType) property. Set this to a unique string which will be used to identify this config class in the CMS JavaScript.

In the [`init()`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig::init()) method, use the [Requirements API](/developer_guides/templates/requirements/#php-requirements-api) to add any JavaScript that your implementation needs to function in both the front-end and in the CMS. This should not include JavaScript that is only required in the CMS, which we'll cover in the next section.

If your HTML editor's JavaScript implementation has its own client-side allow list of elements and attributes, you can use the [`getElementRuleSet()`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig::getElementRuleSet()) and [`setElementRuleSet()`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig::setElementRuleSet()) to convert to and from that client-side definition to allow developers to choose whether to use the generic element rulesets or the implementation-specific configuration. This can be usedful if, for example, your JavaScript implementation provides additional configuration options in its rule sets.

Alternatively, you can convert from the ruleset in either `getAttributes()` or `getConfigSchemaData()`, and just set the element rule set as a property in your config.

Use [`getOptions()`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig::getOptions()) and [`setOptions()`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig::setOptions()) for generic options that can be defined for your implementation.

If you want your editor to be the default for all `HTMLEditorConfig`, set it through the injector configuration:

```yml
SilverStripe\Core\Injector\Injector:
  SilverStripe\Forms\HTMLEditor\HTMLEditorConfig:
    class: 'App\Forms\CustomHTMLEditorConfig'
```

If you want your editor to be the default specifically for the `cms` config, set the `HTMLEditorConfig.default_config_definitions` configuration like so:

> [!WARNING]
> This must be done even if you already set the injector configuration above.

```yml
SilverStripe\Forms\HTMLEditor\HTMLEditorConfig:
  default_config_definitions:
    cms:
      configClass: 'App\Forms\CustomHTMLEditorConfig'
```

### Adding the necessary JavaScript

There are two parts of the JavaScript that you need to be aware of.

One is the JavaScript that implements the editor itself. For example if you're using a third-party HTML editor, you need to include the JavaScript that the third-party distributes for that editor. This should be included via the [Requirements API](/developer_guides/templates/requirements/#php-requirements-api) in your custom `HTMLEditorConfig`'s [`init()`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig::init()) method.

The other is a CMS-specfic abstraction that allows the CMS form to interact nicely with your HTML editor, for example to know when values have been changed. It must be set to the `window.ss.editorWrappers` JSON object using the below schema. Swap our `myEditor` with the value you set in the [`configType`](api:SilverStripe\Forms\HTMLEditor\HTMLEditorConfig->configType) variable.

This JavaScript code should be added to the CMS through [`LeftAndMain.extra_requirements_javascript`](api:SilverStripe\Admin\LeftAndMain->extra_requirements_javascript).

```js
const ss = typeof window.ss !== 'undefined' ? window.ss : {};
ss.editorWrappers.myEditor = (function () {
  // ID of the textarea this is assigned to
  let editorID;

  return {
    /**
     * Initialise the editor
     * @param {String} id the textarea in the DOM this editor is for
     */
    init(id) {
      // This is where you interact with the JavaScript distributed by the thirdparty that made the HTML editor you're using
    },

    /**
     * Destroy the editor
     */
    destroy() {
      // Any code needed to remove the editor from the DOM safely
    },

    /**
     * Write the HTML back to the original text area field
     * @param {object} options
     */
    save(options = {}) {
      // Any code needed to store the HTML content from the WYSIWYG back into the value attribute of the underlying textarea
      // The only option right now is `silent` which if present will be boolean. If true, the `change` event should be suppressed if possible.
    },

    /**
     * Return boolean indicating whether there are unsaved changes or not
     */
    isDirty() {
      // Either ask the WYSIWYG if it's dirty, or if that isn't implemented, check the current value against the original value.
    },

    /**
     * Return the current HTML content of the WYSIWYG
     */
    getContent() {
      // Fetch the HTML content of the WYSIWYG. This does not have to match what's currently stored in the value attribute of the textarea.
    },

    /**
     * Get the currently selected content
     */
    getSelection() {
      // Return a string of whatever is currently selected in the WYSIWYG.
    },

    /**
     * Select some content based on a CSS selector
     * @param {String} cssSelector The css selector of the element to select in the WYSIWYG
     */
    selectByCssSelector(cssSelector) {
      // If possible, ask the WYSIWYG implementation to select some specific element.
      // If multiple elements match this selector, select the first one.
    },

    /**
     * Set HTML content into the field, replacing what's currently there
     * @param {String} value the HTML content to set
     */
    setContent(value) {
      // Set the value into the WYSIWYG. It does not have to be set into the value attribute of the textarea.
    },

    /**
     * Append some HTML content into the field
     * @param {String} value the HTML content to set
     */
    insertContent(id) {
      // Append the value onto the end of the existing content in the WYSIWYG. It does not have to be set into the value attribute of the textarea.
    },

    /**
     * Prepare a value for use in the change tracker (e.g. pass it through the editor's sanitiser to strip any disallowed elements)
     * @param {String} value the value to prepare
     */
    prepValueForChangeTracker(value) {
      // Return a string, which is the value after it has been transformed as necessary to match how this value would look if it was saved by the WYSIWYG.
      // This allows the change tracker to accurately match the original value against the current value even if the original value came directly from the database.
    },
  };
});
```
