---
title: File management
summary: Learn how to manage File and Image records
icon: file-signature
---

# File management

See [file manipulation](./file_manipulation/) for information about how to manipulate the contents of files.

## Asset admin

Management of files within the CMS is provided via the [silverstripe/asset-admin](https://github.com/silverstripe/silverstripe-asset-admin)
module. This is a rich and user friendly interface supporting most basic file operations, as well as
control over the publishing and security of files.

![asset admin](../../_images/asset-admin-demo.png)

## `UploadField`

If you have the [silverstripe/asset-admin](https://github.com/silverstripe/silverstripe-asset-admin)
module installed then this provides a powerful component [`UploadField`](api:SilverStripe\AssetAdmin\Forms\UploadField).

![upload field](../../_images/upload-field.png)

You can add it to a page as below:

```php
namespace App\PageType;

use Page;
use SilverStripe\AssetAdmin\Forms\UploadField;
use SilverStripe\Assets\Image;

class LandingPage extends Page
{
    private static $has_one = [
        'Banner' => Image::class,
    ];

    public function getCMSFields()
    {
        $fields = parent::getCMSFields();
        $fields->addFieldToTab('Root.Main', UploadField::create('Banner', 'Page Banner'), 'Content');
        return $fields;
    }
}
```

UploadField options include:

- setIsMultiUpload() - Set to allow many files per field, or one only.
- setAllowedExtensions() - Set list of extensions this field can accept.
- setAllowedFileCategories() - Alternatively specify allowed extensions via category instead.
- setFolderName() - Name of folder to upload into
- getValidator() - Get instance of validator to specify custom validation rules

## File upload limits {#upload-limits}

You can set the default file upload limits by configuring [`Upload_Validator.default_max_file_size`](api:SilverStripe\Assets\Upload_Validator->default_max_file_size).

File sizes can be represented as either integers (which is the file size in bytes) or an INI formatted string (e.g. 1b for 1 byte, 1k for 1 kilobyte, 1m for 1 megabyte, etc).

The configuration property accepts any of the following:

- A single value representing the maximum file size for *all* files
- An array, where the values are the maximum file size and the keys are one of:
  - a category name from [`File.app_categories`](api:SilverStripe\Assets\File->app_categories), with square brackets around it (e.g. `'[images]'`)
  - a file extension (e.g. `'jpg'`)
  - an asterisk, which means "all file types which don't have a more specific configuration"

For example:

```yml
SilverStripe\Assets\Upload_Validator:
  default_max_file_size:
    '[image]': '500k' # Allow images up to 500KB
    'doc': '2m' # Allow .doc files up to 2MB
    '*' : '1m' # Allow everything else up to 1MB
```

You can also set upload limits per field by calling [`setAllowedMaxFileSize()`](api:SilverStripe\Assets\Upload_Validator::setAllowedMaxFileSize()) on the field's validator.

This method takes the same arguments as the `Upload_Validator.default_max_file_size` configuration.

```php
$field = UploadField::create('Banner');
$validator = $field->getValidator();
$validator->setAllowedMaxFileSize('2m');
```

If you want different file upload limits in the asset admin than you have in your upload fields, you can use the [`AssetAdmin.max_upload_size`](api:SilverStripe\AssetAdmin\Controller\AssetAdmin->max_upload_size) configuration property. This accepts values in the same format as `Upload_Validator.default_max_file_size`.

```yml
SilverStripe\AssetAdmin\Controller\AssetAdmin:
  max_upload_size: '2m'
```

## File permissions {#permissions}

See [File Security](file_security).

## File visibility

In order to ensure that assets are made public you should check the following:

- The "Who can view this file?" option is set to "Anyone" or "Inherit" in the asset-admin. This can be checked
   via `File::canView()` or `File::$CanViewType` property.
- The file is published, or is owned by a published record. This can be checked via `File::isPublished()`
- The file exists on disk, and has not been removed. This can be checked by `File::exists()`

## File shortcodes

Shortcodes represent an embedded asset within a block of HTML text. For instance, this is the content
of a page with a shortcode image:

```html
<p>Welcome to Silverstripe CMS! This is the default homepage.</p>
<p>[image src="/assets/12824172.jpeg" id="27" width="400" height="400" class="leftAlone ss-htmleditorfield-file image" title="My Image"]</p>
```

File shortcodes have the following properties:

- canView() will not be checked for the file itself: Instead this will be inherited from the parent record
   this is embedded within.
- The file is automatically "owned", meaning that publishing the page will also publish the embedded file.

Within the CMS shortcodes can be added via either the "Insert Media" modal, or the "Link to a file"
buttons provided via the [silverstripe/asset-admin](https://github.com/silverstripe/silverstripe-asset-admin)
module.

## Adding custom fields to files and images

As with any customisation of a core class, adding fields to the `File` and `Image` classes
is a two-phased approach. First, you have to update the model (i.e. the `$db` array) to include
your new custom field. Second, you need to update the editform to provide a way of editing
that field in the CMS. For most core classes, this can be done in a single extension, with an
update to the `$db` array and definition of an `updateCMSFields` function, but for files
and images, it works a bit differently. The edit form is generated by another class --
`FileFormFactory`. You will therefore need two separate extensions.

In this example, we'll add a `description` field to the `File` object and give it an editable
field in the CMS.

```yml
# app/_config/extensions.yml
SilverStripe\Assets\File:
  extensions:
    - App\Extension\MyFileExtension

SilverStripe\AssetAdmin\Forms\FileFormFactory:
  extensions:
    - App\Extension\MyFormFactoryExtension
```

```php
// app/src/Extension/MyFileExtension.php
namespace App\Extension;

use SilverStripe\ORM\DataExtension;

class MyFileExtension extends DataExtension
{
    private static $db = [
        'Description' => 'Text',
    ];
}
```

```php
// app/src/Extension/MyFormFactoryExtension.php
namespace App\Extension;

use SilverStripe\Core\Extension;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\TextareaField;

class MyFormFactoryExtension extends Extension
{
    public function updateFormFields(FieldList $fields)
    {
        $fields->insertAfter(
            'Title',
            TextareaField::create('Description', 'Description')
        );
    }
}
```

## File versioning

File versioning is extended with the [silverstripe/versioned](https://github.com/silverstripe/silverstripe-versioned/)
module, which provides not only a separate draft and live stages for any file, but also allows a complete file
history of modifications to be tracked.

To support this feature the [`AssetControlExtension`](api:SilverStripe\Assets\AssetControlExtension) provides support for tracking
references to physical files, ensuring published assets are accessible, protecting non-published assets,
and archiving / deleting assets after the final reference has been deleted.

### File ownership {#ownership}

When working with files attached to other versioned dataobjects it is necessary to configure ownership
of these assets from the parent record. This ensures that whenever a Page (or other record type)
is published, all assets that are used by this record are published with it.

For example:

```php
namespace App\PageType;

use Page;
use SilverStripe\Assets\Image;

class LandingPage extends Page
{
    private static $has_one = [
        'Banner' => Image::class,
    ];
    private static $owns = ['Banner'];
}
```

See [Versioned: Ownership](/developer_guides/model/versioning#ownership) for details.

### Avoid exclusive relationships

Due to the shared nature of assets, it is not recommended to assign any one-to-many (or exclusive one-to-one) relationship
between any objects and a File. E.g. a Page `has_many` File, or Page `belongs_to` File.

Instead it is recommended to use either a Page has_one File for many-to-one (or one-to-one) relationships, or
Page `many_many` File for many-to-many relationships.

### Unpublishing assets

Assets can be unpublished on a case by case basis via the asset admin section. Please note that
when unpublishing an asset, this will remove this asset from all live pages which currently link to
or embed those images.

### Configuring file archiving

By default files which do not exist on either the live or draft stage (but do have a version history)
are removed from the filesystem.

In order to permanently keep a record of all past physical files you can set the `File.keep_archived_assets`
config option to true. This will ensure that historic files can always be restored, albeit at a cost to disk
storage.

```yml
SilverStripe\Assets\File:
  keep_archived_assets: true
```

## Related lessons

- [Working with files and images](https://www.silverstripe.org/learn/lessons/v4/working-with-files-and-images-1)
