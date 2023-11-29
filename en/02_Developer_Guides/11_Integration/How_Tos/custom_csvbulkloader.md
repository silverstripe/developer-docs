---
title: A custom CSVBulkLoader instance
summary: Customise your data importing
icon: upload
---

# How to: a custom `CSVBulkLoader` instance

A an implementation of a custom `CSVBulkLoader` loader. In this example. we're provided with a unique CSV file
containing a list of football players and the team they play for. The file we have is in the format like below.

```text
"SpielerNummer", "Name", "Geburtsdatum", "Gruppe"
11, "John Doe", 1982-05-12,"FC Bayern"
12, "Jane Johnson", 1982-05-12,"FC Bayern"
13, "Jimmy Dole",,"Schalke 04"
```

This data needs to be imported into our application. For this, we have two `DataObjects` setup. `Player` contains
information about the individual player and a relation set up for managing the `Team`.

```php
// app/src/Model/Player.php
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

```php
// app/src/Model/FootballTeam.php
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

Now going back to look at the CSV, we can see that what we're provided with does not match what our data model looks
like, so we have to create a sub class of `CsvBulkLoader` to handle the unique file. Things we need to consider with
the custom importer are:

- Convert property names (e.g. Number to PlayerNumber) through providing a `$columnMap`.
- Split a combined "Name" field into `FirstName` and `LastName` by calling `importFirstAndLastName` on the `Name`
column
- Prevent duplicate imports by a custom `$duplicateChecks` definition.
- Create a `Team` automatically based on the `Gruppe` column and a entry for `$relationCallbacks`

Our final import looks like this.

```php
// app/src/Admin/PlayerCsvBulkLoader.php
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
            'Geburtsdatum' => 'Birthday',
            'Gruppe' => 'Team.Title',
        ];

        $this->duplicateChecks = [
            'SpielerNummer' => 'PlayerNumber',
        ]

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

## Related

- [CsvParser](api:SilverStripe\Dev\CsvParser)
- [ModelAdmin](api:SilverStripe\Admin\ModelAdmin)
