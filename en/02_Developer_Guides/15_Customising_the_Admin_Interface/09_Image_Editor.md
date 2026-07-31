---
title: Image editor
summary: Configure and customise the image editor in the "Files" section
icon: crop
---

# Image editor

The CMS includes an image editor for making composition changes to images: crop, rotate in 90 degree steps, flip, and resize. Open it from the "Edit image" action on an image's detail view in the "Files" section.

![Image editor screenshot](../../_images/image-editor.png)

Applying an edit **replaces the original file in place**. The record keeps its **ID**, its folder, and its filename, so every page, block, and field already pointing at that image resolves to the edited pixels with nothing to repoint.

"Apply" stays disabled until a crop, rotate, flip or resize has actually been chosen, so a no-op edit cannot re-encode the image or leave a backup copy behind. Ticking the backup checkbox is not itself an edit.

## Draft only - publishing is the author's job

The replacement is written as a **new draft version** of the file. The editor never publishes anything, so the published version is left exactly as it was: immediately after an edit, the live site still serves the pre-edit pixels while the draft shows the new ones. Someone has to publish the image for the change to reach visitors. This is the same behaviour as the CMS's existing "replace file" action.

## Backing up the original

Because the original's bytes are overwritten, the editor offers a "Back up the original image" checkbox. When it is ticked, the pre-edit bytes are copied into a **new draft file in the same folder** before the replacement is written.

The backup is a genuine copy: the record is duplicated *and* the pre-edit bytes are written into it as its own stored asset, so replacing the original cannot corrupt it. Its name comes from the platform's own de-duplicating name generator - the same one that renames any colliding upload - so `beach.jpg` is backed up as `beach-v2.jpg`, then `beach-v3.jpg`, and so on.

When the checkbox is unticked, **no backup is made and the original file is gone**, recoverable only if [`keep_archived_assets`](/developer_guides/files/file_storage/#archived) is enabled - it is off by default.

### Default state of the backup checkbox

The checkbox starts ticked. Set `backup_original_by_default` to change that - a configured `false` genuinely produces an unticked box:

```yml
# app/_config/image-editor.yml
SilverStripe\AssetAdmin\Model\ImageEditor:
  # Start the "Back up the original image" checkbox unticked
  backup_original_by_default: false
```

## Resize

The editor can also resize the output. The aspect ratio is **locked** and there is no option to unlock it: the author types either a width or a height, and the other dimension is derived from the crop output's ratio.

**Upsizing is refused.** The ceiling is the crop output's dimensions - not the source's, since a 90 or 270 degree rotate swaps the axes - and the minimum is 1 pixel. The modal shows an inline message naming the actual ceiling and disables "Apply" while the value is invalid; the endpoint rejects an over-large dimension with a 400 regardless of what the UI did, so a request made outside the editor is refused too.

## Customising what gets saved

An edit makes at most two writes - the backup copy, then the replacement - and each one is bracketed by a pair of extension hooks. [Apply an extension](/developer_guides/extending/extensions/) to [`ImageEditor`](api:SilverStripe\AssetAdmin\Model\ImageEditor) to adjust what is about to be saved, or to react once it has been.

| Hook | Called | Arguments |
| ---- | ------ | --------- |
| `onBeforeCreateBackup` | Once the backup holds the pre-edit bytes, immediately before it is written | The unwritten backup [`Image`](api:SilverStripe\Assets\Image), and the source it was copied from |
| `onAfterCreateBackup` | Once the backup has been written | The written backup [`Image`](api:SilverStripe\Assets\Image), and the source it was copied from |
| `onBeforeReplaceOriginal` | Once the rendered bytes are on the source, immediately before it is written | The unwritten source [`Image`](api:SilverStripe\Assets\Image), and the transforms |
| `onAfterReplaceOriginal` | Once the replacement has been written | The replaced source [`Image`](api:SilverStripe\Assets\Image), and the transforms |

All four are called after the editor's permission and validation checks have passed, so your extension is never handed a request that was going to be rejected. A pair is only called when the write it brackets actually happens - if the author declines the backup, neither backup hook is called.

The `$transforms` argument is the validated edit the render already used: the flip flags, the rotation, the crop ratios, and the resize. It is passed for context, and changing it does not render anything again.

Each `onBefore` hook is handed the record with the bytes it is about to save already on it, so `$source->getString()` returns the render. Put your own bytes back with `setFromString()` and they are what gets written - to add a watermark, for example.

```php
// app/src/Extensions/ImageEditorExtension.php
namespace App\Extensions;

use App\Service\Watermarker;
use SilverStripe\Assets\Image;
use SilverStripe\Core\Extension;

class ImageEditorExtension extends Extension
{
    protected function onBeforeReplaceOriginal(Image $source, array $transforms): void
    {
        $watermarked = Watermarker::create()->apply((string) $source->getString());
        $source->setFromString($watermarked, $source->getFilename());
    }
}
```

```yml
# app/_config/image-editor.yml
SilverStripe\AssetAdmin\Model\ImageEditor:
  extensions:
    - App\Extensions\ImageEditorExtension
```

Use the `onAfter` hooks for anything that should only happen once the write has succeeded, such as logging, notifications, or clearing a cache. They are also the only place the saved record is fully settled: the backup's name is de-duplicated *during* its write, so `onBeforeCreateBackup` still sees `bird.jpg` with an ID of `0`, while `onAfterCreateBackup` sees the `bird-v2.jpg` the author will see, with a real ID.

```php
// app/src/Extensions/ImageEditorExtension.php
namespace App\Extensions;

use Psr\Log\LoggerInterface;
use SilverStripe\Assets\Image;
use SilverStripe\Core\Extension;
use SilverStripe\Core\Injector\Injector;

class ImageEditorExtension extends Extension
{
    protected function onAfterCreateBackup(Image $backup, Image $source): void
    {
        Injector::inst()->get(LoggerInterface::class)->info("Backed up {$source->Name} as {$backup->Name}");
    }
}
```

> [!WARNING]
> Avoid using these hooks to check permissions or to abort an edit. Permissions are checked before any rendering starts (see [permissions](#permissions)), and no hook can cancel a write that is already under way - if the backup has been written, it stays written regardless of what happens next.

## Permissions

The "Edit image" action is only shown, and the API endpoint backing it only succeeds, when all of the following are true:

- The record is a raster [`Image`](api:SilverStripe\Assets\Image) - SVG uploads are plain [`File`](api:SilverStripe\Assets\File) records and are excluded.
- The member can **edit** the original image, because the edit modifies its bytes.
- The member can create files in the folder the original lives in, for the backup copy.

The action on the detail view is a convenience gate only. The endpoint re-checks both permissions itself and is the real security boundary.

The endpoint applies the create check only to an edit that actually writes a backup - an edit that declines the backup asks nothing of the folder. The action on the detail view still demands the create permission unconditionally, so a member who cannot create files in the folder does not get the editor at all: they could otherwise edit an image with no backup to restore from, which the default behaviour would have written for them.

## Configuration

### Maximum source size

Sources above a configurable megapixel bound are refused before they are decoded, and the user is shown an error naming the limit - for example `Exceeds 50 megapixel (width x height) limit`. The default bound is 50 megapixels.

The bound is measured in *pixels*, as `width x height`, not in file size. That is deliberate: rendering an edit decodes the source into an uncompressed bitmap of the full resolution and holds it in memory, and the size of that bitmap is determined by the pixel count alone. File size is not a usable proxy for it, because compression ratios vary enormously - a small file can decode to a bitmap large enough to exhaust the memory available to PHP, so a megabyte-based cap would not protect anything.

```yml
# app/_config/image-editor.yml
SilverStripe\AssetAdmin\Model\ImageEditor:
  # Allow sources up to 100 megapixels - make sure your memory limit can handle it
  max_source_megapixels: 100
```

Set `max_source_megapixels` to `0` to remove the bound entirely. A sufficiently large image can then exhaust the memory available to PHP.

### Output quality

Edited images are encoded in the same format as the source, at the quality configured for the image backend. This is the same setting used for resampled images - see [resampled image quality](/developer_guides/files/images/#resampled-image-quality).

Set `output_quality` to a value between 1 and 100 to give the editor its own quality, leaving resampled images on the backend's:

```yml
# app/_config/image-editor.yml
SilverStripe\AssetAdmin\Model\ImageEditor:
  # Encode edited images at 90, whatever quality the image backend is configured with
  output_quality: 90
```

Leave it unset (or `null`) to follow the backend. The setting only applies to formats where quality is meaningful, such as JPEG and WebP.

### Metadata and animation

The edit re-encodes the image, and what survives that depends on the image backend's driver:

- **Metadata and colour profiles.** The default GD driver strips EXIF, IPTC and XMP metadata and the ICC colour profile; Imagick preserves them.
- **Animation.** The GD driver flattens an animated GIF to its first frame, so the edited file is a still image.

### Duplicate submission lock

While an edit is being rendered, a short-lived lock keyed on the member and the source file rejects a second edit request for the same image, so a double submission cannot apply the edit twice or leave two backup copies behind. The lock is released as soon as the edit finishes, so its time-to-live only bounds how long a crashed or abandoned request keeps the lock held.

```yml
# app/_config/image-editor.yml
SilverStripe\AssetAdmin\Controller\AssetAdmin:
  # Give slow renders more headroom before an abandoned lock expires
  edit_image_lock_ttl: 60
```

The lock is stored in a dedicated cache service, `Psr\SimpleCache\CacheInterface.assetAdminImageEditor`. If you customise that service, it must remain a shared (not in-memory) cache so the lock is visible across requests.
