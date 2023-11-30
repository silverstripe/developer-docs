---
title: CSV Import
summary: Load data into your Silverstripe CMS database in bulk
icon: upload
---

# Import CSV data

## Introduction

CSV import can be easily achieved through PHP's built-in `fgetcsv()` method,
but this method doesn't know anything about your datamodel. In Silverstripe CMS,
this can be handled through the a specialized CSV importer class that can
be customised to fit your data.

## The `CsvBulkLoader` class

The [CsvBulkLoader](api:SilverStripe\Dev\CsvBulkLoader) class facilitate complex CSV-imports by defining column-mappings and custom converters.
It uses PHP's built-in `fgetcsv()` function to process CSV input, and accepts a file handle as an input.

Feature overview:

- Custom column mapping
- Auto-detection of CSV-header rows
- Duplicate detection based on custom criteria
- Automatic generation of relations based on one or more columns in the CSV-Data
- Definition of custom import methods (e.g. for date conversion or combining multiple columns)
- Optional deletion of existing records if they're not present in the CSV-file
- Results grouped by "imported", "updated" and "deleted"

## Usage

You can use the CsvBulkLoader without subclassing or other customizations, if the column names
in your CSV file match `$db` properties in your dataobject. For example a simple import for the
[Member](api:SilverStripe\Security\Member) class could have this data in a file:

```text
FirstName,LastName,Email
Donald,Duck,donald@disney.com
Daisy,Duck,daisy@disney.com
```

The loader would be triggered through the `load()` method:

```php
use SilverStripe\Dev\CsvBulkLoader;

$loader = CsvBulkLoader::create('Member');
$result = $loader->load('<my-file-path>');
```

By the way, you can import [Member](api:SilverStripe\Security\Member) and [Group](api:SilverStripe\Security\Group) data through `https://www.example.com/admin/security`
interface out of the box.

## Import through `ModelAdmin`

The simplest way to use [CsvBulkLoader](api:SilverStripe\Dev\CsvBulkLoader) is through a [ModelAdmin](api:SilverStripe\Admin\ModelAdmin) interface - you get an upload form out of the box.

```php
namespace App\Admin;

use App\Model\Player;
use SilverStripe\Admin\ModelAdmin;
use SilverStripe\Dev\CsvBulkLoader;

class PlayerAdmin extends ModelAdmin
{
    private static $managed_models = [
      Player::class,
    ];

    private static $model_importers = [
      Player::class => CsvBulkLoader::class,
    ];

    private static $url_segment = 'players';
}
```

The new admin interface will be available under `https://www.example.com/admin/players`, the import form is located
below the search form on the left.

## Import through a custom controller

You can have more customised logic and interface feedback through a custom controller.
Let's create a simple upload form (which is used for `MyDataObject` instances).
You'll need to add a route to your controller to make it accessible via URL
(see [Routing](../../controllers/routing/)).

```php
namespace App\Control;

use App\Model\MyDataObject;
use SilverStripe\Control\Controller;
use SilverStripe\Dev\CsvBulkLoader;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\FileField;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FormAction;

class MyController extends Controller
{
    private static $url_segment = 'my_controller';

    private static $allowed_actions = [
        'getForm',
    ];

    private static $url_handlers = [
        'Form' => 'getForm',
    ];

    protected $template = 'BlankPage';

    public function getForm()
    {
        $form = Form::create(
            $this,
            'Form',
            FieldList::create(
                FileField::create('CsvFile', false)
            ),
            FieldList::create(
                FormAction::create('doUpload', 'Upload')
            )
        );
        return $form;
    }

    public function doUpload($data, $form)
    {
        $loader = CsvBulkLoader::create(MyDataObject::class);
        $results = $loader->load($_FILES['CsvFile']['tmp_name']);
        $messages = [];
        if ($results->CreatedCount()) {
            $messages[] = sprintf('Imported %d items', $results->CreatedCount());
        }
        if ($results->UpdatedCount()) {
            $messages[] = sprintf('Updated %d items', $results->UpdatedCount());
        }
        if ($results->DeletedCount()) {
            $messages[] = sprintf('Deleted %d items', $results->DeletedCount());
        }
        if (!$messages) {
            $messages[] = 'No changes';
        }
        $form->sessionMessage(implode(', ', $messages), 'good');

        return $this->redirectBack();
    }
}
```

Note: This interface is not secured, consider using [Permission::check()](api:SilverStripe\Security\Permission::check()) to limit the controller to users
with certain access rights.

## Column mapping and relation import

We're going to use our knowledge from the previous example to import a more sophisticated CSV file.

Sample CSV Content

```text
"Number","Name","Birthday","Team"
11,"John Doe",1982-05-12,"FC Bayern"
12,"Jane Johnson", 1982-05-12,"FC Bayern"
13,"Jimmy Dole",,"Schalke 04"
```

Datamodel for Player

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Player extends DataObject
{
    private static $db = [
      'PlayerNumber' => 'Int',
      'FirstName' => 'Text',
      'LastName' => 'Text',
      'Birthday' => 'Date',
    ];

    private static $has_one = [
      'Team' => FootballTeam::class,
    ];
}
```

Datamodel for FootballTeam:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class FootballTeam extends DataObject
{
    private static $db = [
      'Title' => 'Text',
    ];

    private static $has_many = [
      'Players' => Player::class,
    ];
}
```

Sample implementation of a custom loader. Assumes a CSV-file in a certain format (see below).

- Converts property names
- Splits a combined "Name" fields from the CSV-data into `FirstName` and `Lastname` by a custom importer method
- Avoids duplicate imports by a custom `$duplicateChecks` definition
- Creates `Team` relations automatically based on the `Gruppe` column in the CSV data

```php
namespace App\Admin;

use App\Model\FootballTeam;
use SilverStripe\Dev\CsvBulkLoader;

class PlayerCsvBulkLoader extends CsvBulkLoader
{
    public function __construct($objectClass)
    {
        $this->columnMap = [
            'Number' => 'PlayerNumber',
            'Name' => '->importFirstAndLastName',
            'Birthday' => 'Birthday',
            'Team' => 'Team.Title',
        ];

        $this->duplicateChecks = [
            'Number' => 'PlayerNumber',
        ];

        $this->relationCallbacks = [
            'Team.Title' => [
                'relationname' => 'Team',
                'callback' => 'getTeamByTitle',
            ],
        ];

        parent::construct($objectClass);
    }

    public static function importFirstAndLastName(&$obj, $val, $record)
    {
        $parts = explode(' ', $val);
        if (count($parts) != 2) {
            return false;
        }
        $obj->FirstName = $parts[0];
        $obj->LastName = $parts[1];
    }

    public static function getTeamByTitle(&$obj, $val, $record)
    {
        return FootballTeam::get()->filter('Title', $val)->First();
    }
}
```

Building off of the ModelAdmin example up top, use a custom loader instead of the default loader by adding it to `$model_importers`. In this example, `CsvBulkLoader` is replaced with `PlayerCsvBulkLoader`.

```php
namespace App\Admin;

use SilverStripe\Admin\ModelAdmin;

class PlayerAdmin extends ModelAdmin
{
    private static $managed_models = [
      'Player',
    ];

    private static $model_importers = [
      'Player' => PlayerCsvBulkLoader::class,
    ];

    private static $url_segment = 'players';
}
```

## Related

- [ModelAdmin](api:SilverStripe\Admin\ModelAdmin)
