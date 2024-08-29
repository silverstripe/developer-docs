---
title: Managing Sessions
summary: Managing user sessions using session manager.
icon: address-book
---

# Managing sessions

A default install of Silverstripe CMS will include the [Session Manager](https://github.com/silverstripe/silverstripe-session-manager/) module which provides a UI for managing a user's own sessions. This allows users to see which devices are currently authenticated and invalidate sessions on those devices.

## Managing permissions for sessions

By default, users can only see and invalidate their own sessions. Not even an administrator can see other users' sessions. This is meant to protect the privacy of all users.

Specific projects may wish to allow some users to view and manage the sessions of other users.

### A note about privacy

Viewing a user's session details can allow you to determine their approximate location at specific times. Before allowing some of your users to manage other users' sessions, it's a good idea to have a conversation with them about the privacy implications.

You should also consider the relevant privacy legislation in the jurisdiction you operate in.

## Compatibility

The module should work independently of the storage mechanism used for PHP sessions (file-based sticky sessions, file-based sessions on a shared file system, [silverstripe/dynamodb](https://github.com/silverstripe/silverstripe-dynamodb), [silverstripe/hybridsessions](https://github.com/silverstripe/silverstripe-hybridsessions)).

It is also compatible with the [Silverstripe MFA module suite](https://github.com/silverstripe/silverstripe-mfa).

## Developer details

The module introduces a new database record type: [`LoginSession`](api:SilverStripe\SessionManager\Models\LoginSession).
On first login, it creates a new record of this type, recording the IP and User-Agent,
and associates it with the member (via [`LogInAuthenticationHandler`](api:SilverStripe\SessionManager\Security\LogInAuthenticationHandler)).
The record identifier is stored in the PHP session, so it can be retrieved on subsequent requests.

On each request, a middleware [`LoginSessionMiddleware`](api:SilverStripe\SessionManager\Middleware\LoginSessionMiddleware) checks if the current
PHP session is pointing to a valid [`LoginSession`](api:SilverStripe\SessionManager\Models\LoginSession) record.
If a valid record is found, it will update the `LastAccessed` date.
Otherwise, it will force a logout, destroying the PHP session.

A periodic process ([`GarbageCollectionService`](api:SilverStripe\SessionManager\Services\GarbageCollectionService) - see [garbage collection](#garbage-collection) below) cleans up expired [`LoginSession`](api:SilverStripe\SessionManager\Models\LoginSession) records.
Due to the way PHP sessions operate, it can not expire those sessions as well.
The PHP sessions will be invalidated on next request through [`LoginSessionMiddleware`](api:SilverStripe\SessionManager\Middleware\LoginSessionMiddleware),
unless they expire independently beforehand (through PHP's own session expiry logic).

Silverstripe allows persisting login state via a "Keep me signed in" feature.
These `RememberLoginHash` records have their own expiry date.
This module associates them to [`LoginSession`](api:SilverStripe\SessionManager\Models\LoginSession) records,
and ensures their expiry is consistent with the new session behaviour
(see "Configuration" below for details).

The [`LoginSession`](api:SilverStripe\SessionManager\Models\LoginSession) tracks the IP address and user agent making the requests
in order to make different sessions easier to identify in the user interface.
It does not use changes to this metadata to invalidate sessions.

Logged in users have the ability to see their own active sessions across all devices
and browsers where they have logged in, and can choose to log out any of those sessions.

Administrators can revoke *all* active sessions for *all* users by triggering the `dev/tasks/InvalidateAllSessions`
task either in the browser or via the CLI. Note that this will also revoke the session
of the user activating the task, so if this is triggered via the browser, that user
will need to log back in to perform further actions.

## Caveats

- Every request with a logged-in member causes a database write (updating [`LoginSession`](api:SilverStripe\SessionManager\Models\LoginSession)), potentially affecting performance
- Restoring a database from an older snapshot will invalidate current sessions.
- PHP sessions can become out of sync with [`LoginSession`](api:SilverStripe\SessionManager\Models\LoginSession) objects. Both can exist beyond their expiry date.
   This is not an issue in practice since the association between the two is checked on each session-based request
   (through [`LoginSessionMiddleware`](api:SilverStripe\SessionManager\Middleware\LoginSessionMiddleware)).

## Configuration

### Customising the permissions for `LoginSession`

[`LoginSession`](api:SilverStripe\SessionManager\Models\LoginSession) is the object that tracks the users' sessions. By altering the permission logic on this object, you can allow some users to manage other users' sessions. The two permissions you'll most likely want to change are `canView()` and `canDelete()`. You can customise `canEdit()` and `canCreate()` as well, but the use case for doing so is less clear.

#### Creating an extension for `LoginSession`

The first step is to create an [`Extension`](api:SilverStripe\Core\Extension) that grant some users the ability to hooks into [`LoginSession`](api:SilverStripe\SessionManager\Models\LoginSession)'s `canView()` and `canDelete()` methods. This example aligns the permissions on the [`LoginSession`](api:SilverStripe\SessionManager\Models\LoginSession) to the permission on the Member who owns the [`LoginSession`](api:SilverStripe\SessionManager\Models\LoginSession).

Alternatively, you could call [`Permission::check()`](api:SilverStripe\Security\Permission::check()) to validate if the member has a predefined CMS permission. If you need even more granular permissions, you can implement a [`PermissionProvider`](/developer_guides/security/permissions/#permissionprovider) to define your own custom permissions.

```php
namespace My\App;

use SilverStripe\Core\Extension;

class LoginSessionExtension extends Extension
{
    /**
     * @param Member $member
     */
    protected function canView($member)
    {
        if ($this->getOwner()->Member()->canView($member)) {
            // If you can view a Member, you can also view their sessions.
            // This does not allow you to terminate their session.
            return true;
        };
    }

    /**
     * @param Member $member
     */
    protected function canDelete($member)
    {
        if ($this->getOwner()->Member()->canEdit($member)) {
            // If you can edit a Member, you can also log them out of a session.
            // This action is aligned to canDelete, because logging a user out is
            // equivalent to deleting the LoginSession.
            return true;
        };
    }
}
```

#### Applying the extension to `LoginSession`

Add this to the project's configuration to enable the extension.

```yml
SilverStripe\SessionManager\Models\LoginSession:
  extensions:
    - My\App\LoginSessionExtension
```

### Removing "remember me" tokens across devices on logout

Session-manager provides an explicit way to terminate individual sessions and their attached "Keep me signed in" tokens. So this module sets `SilverStripe\Security\RememberLoginHash.logout_across_devices` to `false`.

To restore the old behaviour with session manager installed, add the following YML config to your project:

```yml
---
Name: myproject-rememberloginhash
After:
  - '#session-manager-rememberloginhash'
---
SilverStripe\Security\RememberLoginHash:
  logout_across_devices: true
```

Please note, this configuration only removes "remember me" tokens on logout, it does not terminate active sessions across devices on logout.

Read [Saved User Logins](/developer_guides/security/member/#saved-user-logins) to learn how to configure the "Keep me signed in" feature for your members.

### Session timeout

Non-persisted login sessions (those where the member hasn’t ticked "Keep me signed in") should expire after a period of inactivity, so that they’re removed from the list of active sessions even if the member closes their browser without completing the “log out” action. The length of time before expiry matches the `SilverStripe\Control\Session.timeout` value if one is set, otherwise falling back to a default of one hour. This default can be changed via the following config setting:

```yml
SilverStripe\SessionManager\Models\LoginSession:
  default_session_lifetime: 3600 # Default value: 1 hour in seconds
```

Note that if the member’s session expires before this timeout (e.g. a short `session.gc_maxlifetime` PHP ini setting), they **will** still be logged out. There will just be an extra session shown in the list of active sessions, even though no one can access it.

### Garbage collection

Expired sessions need to be cleaned up periodically to avoid bloating the database. There are two methods available to manage this, discussed below.

Regardless of how you manage garbage collection, the `GarbageCollectionService` is ultimately in charge of performing the garbage collection. It tries to remove all of the garbage data in a single run, but if you have particularly large tables it can timeout or run into memory limits and fail part-way through. Running it multiple times will eventually get through all of the data, but it can be annoying to have all of those extra error messages cluttering your logs.

You can optionally limit the number of items it will remove in a single run by setting the following YAML configuration:

```yml
SilverStripe\SessionManager\Services\GarbageCollectionService:
  batch_remove_limit: 1000
```

#### Via `symbiote/silverstripe-queuedjobs` (recommended)

If you have the `symbiote/silverstripe-queuedjobs` module installed and configured, garbage collection will run automatically every 1 day via `GarbageCollectionJob`, and no further action is required.  This job will be automatically created if it does not exist on dev/build.

#### Via `LoginSessionGarbageCollectionTask`

Alternatively, you can create a system cron entry to run the `LoginSessionGarbageCollectionTask` directly on a regular cadence:

```text
`*/5 * * * * /path/to/webroot/vendor/bin/sake dev/tasks/LoginSessionGarbageCollectionTask
```

### Anonymize IP

You can anonymize stored IP addresses by enabling the following option:

```yml
SilverStripe\SessionManager\Models\LoginSession:
  anonymize_ip: true
```
