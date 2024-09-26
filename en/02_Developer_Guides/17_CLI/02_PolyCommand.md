---
title: PolyCommand
summary: Code that can be run both from the command line and via HTTP requests
icon: tasks-alt
---

# `PolyCommand` {#polycommand}

Some code needs to be accessible both via HTTP requests over the web and via CLI in your terminal. Common examples of this are building the database and flushing cache.

The [`PolyCommand`](api:SilverStripe\PolyExecution\PolyCommand) class provides a consistent API for getting input and providing output regardless of the context where the code is run. The API for this class is intentionally similar to the API for the `Command` class provided by `symfony/console`.

> [!TIP]
> See [the symfony/console input documentation](https://symfony.com/doc/current/console/input.html#using-command-options) for more specific details about using `InputInterface` and `InputOption`. Note that we use the [`getOptions()`](api:SilverStripe\PolyExecution\PolyCommand::getOptions()) method instead of `configure()` to return an array of `InputOption` objects. `PolyCommand` does not allow arguments.
>
> See [the symfony/console colouring documentation](https://symfony.com/doc/current/console/coloring.html) for information about styling output. Note that all output (including outputting for HTTP requests) as well as the command description and help info can use the `symfony/console` styling format.

```php
namespace App\Cli\Command;

use SilverStripe\PolyExecution\PolyCommand;
use SilverStripe\PolyExecution\PolyOutput;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;

class MyPolyCommand extends PolyCommand
{
    protected static string $commandName = 'app:my-command';

    protected string $title = 'My command';

    protected static string $description = 'A command that does something';

    public function run(InputInterface $input, PolyOutput $output): int
    {
        if ($input->getOption('do-action')) {
            $output->writeln('Doing something...');
        }
        return Command::SUCCESS;
    }

    public function getOptions(): array
    {
        return [
            new InputOption('do-action', null, InputOption::VALUE_NONE, 'do something specific'),
        ];
    }
}
```

> [!NOTE]
> You can also optionally implement the static [`getHelp()`](api:SilverStripe\PolyExecution\PolyCommand::getHelp()) method to provide additional context about the command. This helps to keep the description short.

Once you've set up your command in PHP, you can add an HTTP route to is using the regular [`Director` routing rules](/developer_guides/controllers/routing/), and add it to Sake with the [`Sake.commands`](api:SilverStripe\Cli\Sake->commands) configuration property. Note that this isn't necessary for the special subclasses mentioned in the sections below.

```yml
---
Name: polycommands
---
SilverStripe\Control\Director:
  rules:
    my-command: 'App\Cli\Command\MyPolyCommand'

SilverStripe\Cli\Sake:
  commands:
    - 'App\Cli\Command\MyPolyCommand'
```

This command could then be used by visiting `https://www.example.com/my-command` in a browser or running `sake app:my-command` in CLI.

## Configuration

For every `PolyCommand` subclass, including the special kinds listed below, you can set the following configuration:

- [`can_run_in_cli`](api:SilverStripe\PolyExecution\PolyCommand->can_run_in_cli): Whether the command can be run in CLI
- [`can_run_in_browser`](api:SilverStripe\PolyExecution\PolyCommand->can_run_in_browser): Whether the command can be run in HTTP requests
- [`permissions_for_browser_execution`](api:SilverStripe\PolyExecution\PolyCommand->permissions_for_browser_execution): An array of permissions a user must have to run the command in an HTTP request. The user must have at least one of these permissions

These can espcially be useful for defining how commands provided by modules can be executed.

## `BuildTask`

`BuildTask` is a `PolyCommand` subclass which is often used for one-off tasks. Common examples include:

- Migrating data from an old database schema after deploying an updated codebase.
- Migrating data from an old database schema after updating a module.
- Updating many values in the database at once after a change in business logic.

You can see the list of available tasks by either navigating to `/dev/tasks` in your browser or running `sake tasks` in a terminal.

You can disable a task completely by setting the [`is_enabled`](api:SilverStripe\Dev\BuildTask->is_enabled) configuration property to `false`. This is useful when third-party modules add tasks that you don't want to use in your project.

You can also set the `can_run_in_cli` and `can_run_in_browser` configuration properties as mentioned in [`PolyCommand`](#polycommand) above.

The API for a `BuildTask` is effectively identical to other `PolyCommand` subclasses. Note that instead of implementing `run()` directly, you should implement the `execute()` method. There is some logic in [`BuildTask::run()`](api:SilverStripe\Dev\BuildTask::run()) which will output the title of your command before calling `execute()`. Once your task has finished, it will also output whether it was successful or not (based on the return value) and how long it took.

> [!WARNING]
> Unlike other `PolyCommand` subclasses, you cannot include a namespace for tasks. This is because the command name is also used as the URL segment for HTTP execution of the task, and in the CLI the `tasks:` namespace is automatically applied.

```php
namespace App\Tasks;

use SilverStripe\Dev\BuildTask;
use SilverStripe\PolyExecution\PolyOutput;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;

class MyCustomTask extends BuildTask
{
    protected static string $commandName = 'my-custom-task';

    protected string $title = 'My custom task';

    protected static string $description = 'A task that does something custom';

    protected function execute(InputInterface $input, PolyOutput $output): int
    {
        if ($input->getOption('do-action')) {
            $output->writeln('Doing something...');
        }
        return Command::SUCCESS;
    }

    public function getOptions(): array
    {
        return [
            new InputOption('do-action', null, InputOption::VALUE_NONE, 'do something specific'),
        ];
    }
}
```

You don't need to do anything to register a `BuildTask` - it will be given an HTTP route and be registered with Sake simply by existing.

The above command would be accessible via the browser at `/dev/tasks/my-custom-task` and via CLI with `sake tasks:my-custom-task`.

### Running regular tasks with cron

On a UNIX machine, you can typically run a scheduled task with a [cron job](https://en.wikipedia.org/wiki/Cron). Run
your task in as a cron job using `sake`.

For example, the following will run `MyTask` every minute.

```bash
* * * * * /your/site/folder/vendor/bin/sake tasks:my-task
```

## `DevCommand` and `/dev/*` {#dev-commands}

There are a set of repeatable actions that developers often need to run which are accessible by browser and in CLI by default, so that developers aren't hindered by restrictions imposed by their hosting provider. These include building the database and viewing the values of all configuration properties.

These commands can be seen by visiting `/dev` in your browser. There is no specific namespace or command to list these in Sake, as their command names vary based on their purpose.

These commands are all subclasses of [`DevCommand`](api:SilverStripe\Dev\Command\DevCommand), which is itself a subclass of `PolyCommand`. The `DevCommand` API is identical to `BuildTask` above, with these exceptions:

- Unlike tasks you can include a namespace in the `commandName` if you want to.
- A description, title, and command name are mandatory for dev commands but are given default values for tasks.
- There is no single configuration property for disabling dev commands.

Like tasks, when a dev command is executed, the title of the command will be executed first. There is no default output for after a dev command has finished executing.

These are registered by adding them to the [`DevelopmentAdmin.commands`](api:SilverStripe\Dev\DevelopmentAdmin->commands) configuration property. The key is the URL segment for the command over HTTP requests.

```yml
SilverStripe\Dev\DevelopmentAdmin:
  commands:
    my-dev-command: 'App\Dev\MyDevCommand'
```

For the above example, the command would be accessible over HTTP by visiting `/dev/my-dev-command`. The CLI command name is based on the `commandName` property for that class.
