---
title: How to test emails within unit tests
summary: Test email functionality without ever hitting an inbox
icon: envelope
---

# Testing email within unit tests

Silverstripe CMS's test system has built-in support for testing emails sent using the [Email](api:SilverStripe\Control\Email\Email) class. If you are
running a [SapphireTest](api:SilverStripe\Dev\SapphireTest) test, then it holds off actually sending the email, and instead lets you assert that an
email was sent using this method.

```php
use SilverStripe\Control\Email\Email;

public function MyMethod()
{
    $e = new Email();
    $e->To = 'someone@example.com';
    $e->Subject = 'Hi there';
    $e->Body = 'I just really wanted to email you and say hi.';
    $e->send();
}
```

To test that `MyMethod` sends the correct email, use the [SapphireTest::assertEmailSent()](api:SilverStripe\Dev\SapphireTest::assertEmailSent()) method.

```php
$this->assertEmailSent($to, $from, $subject, $body);

// to assert that the email is sent to the correct person
$this->assertEmailSent('someone@example.com', null, '/th.*e$/');
```

Each of the arguments (`$to`, `$from`, `$subject` and `$body`) can be either one of the following.

- A string: match exactly that string
- `null/false`: match anything
- A PERL regular expression (starting with '/')

## Related documentation

- [Email](../../email)

## API documentation

- [Email](api:SilverStripe\Control\Email\Email)
