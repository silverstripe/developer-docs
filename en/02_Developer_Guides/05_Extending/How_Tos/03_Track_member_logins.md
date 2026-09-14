---
title: Track member logins
summary: Keep a log in the database of who logs in and when
icon: user-friends
---
# Howto: track member logins

Sometimes its good to know how active your users are,
and when they last visited the site (and logged on).
A simple `LastVisited` database field on the `Member` record
with some hooks into the login process can achieve this.
In addition, a `NumVisit` database field will tell us how
often the member has visited. Or more specifically,
how often they have started a browser session, either through
explicitly logging in or by invoking the "remember me" functionality.

```php
namespace App\Extension;

use SilverStripe\Core\Extension;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\ReadonlyField;
use SilverStripe\ORM\DB;
use SilverStripe\ORM\DataObject;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;

class MyMemberExtension extends Extension
{
    private static $db = [
        'LastVisited' => 'Datetime',
        'NumVisit' => 'Int',
    ];

    /**
     * This extension hook is called every time a member is logged in
     */
    protected function onAfterMemberLoggedIn()
    {
        $this->logVisit();
    }

    /**
     * This extension hook is called when a member's session is restored from "remember me" cookies
     */
    protected function memberAutoLoggedIn()
    {
        $this->logVisit();
    }

    protected function updateCMSFields(FieldList $fields)
    {
        $fields->addFieldsToTab('Root.Main', [
            ReadonlyField::create('LastVisited', 'Last visited'),
            ReadonlyField::create('NumVisit', 'Number of visits'),
        ]);
    }

    protected function logVisit()
    {
        if (!Security::database_is_ready()) {
            return;
        }

        $lastVisitedTable = DataObject::getSchema()->tableForField(Member::class, 'LastVisited');

        DB::query(sprintf(
            'UPDATE "' . $lastVisitedTable . '" SET "LastVisited" = %s, "NumVisit" = "NumVisit" + 1 WHERE "ID" = %d',
            DB::get_conn()->now(),
            $this->owner->ID
        ));
    }
}
```

Now you just need to apply this extension through your config:

```yml
SilverStripe\Security\Member:
  extensions:
    - App\Extension\MyMemberExtension
```
