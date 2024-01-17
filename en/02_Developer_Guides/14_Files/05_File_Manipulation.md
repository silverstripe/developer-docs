---
title: File manipulation
summary: Learn how to manipulate file records in code
icon: file-medical-alt
---

# File manipulation

Asset storage is provided out of the box via a [Flysystem](https://flysystem.thephpleague.com/docs/) backend store. This abstraction allows for files to be stored in any number of different ways, such as storing them in the cloud, so you cannot rely on having a local file path in order to get and manipulate the contents of any given asset.

Silverstripe CMS provides a well-abstracted API for creating, manipulating, and storing assets.

See [images](./images/) for some image-specific manipulation methods.

## Creating files in PHP

When working with files in PHP you can upload a file into a [`File`](api:SilverStripe\Assets\File) dataobject
using one of the below methods:

| Method                     | Description                             |
| -------------------------- | --------------------------------------- |
| `File::setFromLocalFile`   | Load a local file into the asset store  |
| `File::setFromStream`      | Will store content from a stream        |
| `File::setFromString`      | Will store content from a binary string |

### Upload conflict resolution

When storing files, it's possible to determine the mechanism the backend should use when it encounters
an existing file pattern. The conflict resolution to use can be passed into the third parameter of the
above methods (after content and filename). The available constants are:

| Constant                            | If an existing file is found then:  |
| ----------------------------------- | ----------------------------------- |
| `AssetStore::CONFLICT_EXCEPTION`    | An exception will be thrown         |
| `AssetStore::CONFLICT_OVERWRITE`    | The existing file will be replaced  |
| `AssetStore::CONFLICT_RENAME`       | The backend will choose a new name. |
| `AssetStore::CONFLICT_USE_EXISTING` | The existing file will be used      |

If no conflict resolution scheme is chosen, or an unsupported one is requested, then the backend will choose one.
The default asset store supports each of these.

## Accessing files via PHP

As with storage, there are also different ways of loading the content (or properties) of the file:

| Method                   | Description                                                |
| ------------------------ | ---------------------------------------------------------- |
| `File::getStream`        | Will get an output stream of the file content              |
| `File::getString`        | Gets the binary content                                    |
| `File::getURL`           | Gets the URL for this resource. May or may not be absolute |
| `File::getAbsoluteURL`   | Gets the absolute URL to this resource                     |
| `File::getMimeType`      | Get the mime type of this file                             |
| `File::getMetaData`      | Gets other metadata from the file as an array              |
| `File::getFileType`      | Return the type of file for the given extension            |

### Additional file types

Silverstripe CMS has a pre-defined list of common file types. `File::getFileType` will return "unknown" for files outside that list.

You can add your own file extensions and its description with the following configuration.

```yml
SilverStripe\Assets\File:
  file_types:
    ai: 'Adobe Illustrator'
    psd: 'Adobe Photoshop File'
```

## Renaming and moving files

In order to move or rename a file you can simply update the `Name` property, or assign the `ParentID` to a new
folder. Please note that these modifications are made simply on the draft stage, and will not be copied
to live until a publish is made via the CMS (either on this object, or cascading from a parent).

When files are renamed using the ORM, all file variants are automatically renamed at the same time.

```php
use SilverStripe\Assets\File;

$file = File::get()->filter('Name', 'oldname.jpg')->first();
if ($file) {
  // The below will move 'oldname.jpg' and 'oldname__variant.jpg'
  // to 'newname.jpg' and 'newname__variant.jpg' respectively
    $file->Name = 'newname.jpg';
    $file->write();
}
```

Note that you can cause the file to be moved immediately by [setting the Versioned reading mode](api:SilverStripe\Versioned\Versioned::set_reading_mode()) to draft temporarily.

```php
use SilverStripe\Assets\File;
use SilverStripe\Versioned\Versioned;

$file = File::get()->filter('Name', 'oldname.jpg')->first();
if ($file) {
  // The below will immediately move 'oldname.jpg' and 'oldname__variant.jpg'
  // to 'newname.jpg' and 'newname__variant.jpg' respectively
    $file->Name = 'newname.jpg';
    Versioned::withVersionedMode(function () use ($file) {
        Versioned::set_reading_mode('Stage.' . Versioned::DRAFT);
        $file->write();
        $file->publishSingle();
    });
}
```
