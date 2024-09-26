---
title: Sake
summary: Run commands against your Silverstripe CMS project on the command line
icon: terminal
---

# Sake

Sake is a CLI application powered by [`symfony/console`](https://symfony.com/doc/current/console.html).

## Installation

Sake can be invoked using `vendor/bin/sake` in your terminal of choice with no additional actions required.

If you only have a single Silverstripe CMS project running on your server (for example in a production environment), you might want to add the `vendor/bin/` directory to your `$PATH` so you can invoke it simply as `sake`. Most documentation will assume you have done this, and will say to run `sake`, rather than `vendor/bin/sake`.

You can get auto completion when typing commands if you are using a supported shell in your terminal. All commands support name and option completion, and some can even complete argument values. Run `sake completion --help` for instructions. You should only need to do this once (per user or per server, depending on how you configure it) and it will work for all projects on that server.

After setting up completion (or if you never intend to set it up) you might want to hide the `completion` command from Sake's command list. You can do that with this YAML configuration:

```yml
SilverStripe\Cli\Sake:
  hide_completion_command: true
```

## Configuration

### Base URL

Sometimes Silverstripe CMS needs to know the URL of your site. For example, when sending an email or generating static
files. When you're visiting the site in a web browser this is easy to work out, but when executing scripts on the
command line, it has no way of knowing.

You can use the `SS_BASE_URL` environment variable to specify this.

```bash
SS_BASE_URL="https://www.example.com"
```

### Showing or hiding tasks from the command list

Projects often end up with a lot of tasks, which can clutter the command list. Sake will automatically hide tasks from the main command list when there are too many tasks.

You can configure the threshold for this behaviour with the [`Sake.max_tasks_to_display`](api:SilverStripe\Cli\Sake->max_tasks_to_display) configuration property:

```yml
SilverStripe\Cli\Sake:
  max_tasks_to_display: 30
```

When there are more than that many tasks, the tasks will be hidden. Run `sake tasks` to see the full list at any time.

You can set the value to `0` to *always* display the tasks in the main command list.

### Adding commands

There are two types of commands that can be added to Sake:

- regular symfony commands
- [`PolyCommand`](api:SilverStripe\PolyExecution\PolyCommand) subclasses

Both of those can be added to Sake with the below configuration, but `PolyCommand` subclasses can also be added in a few other ways depending on their purpose. See [`PolyCommand`](/developer_guides/cli/polycommand) for more information about those.

To add commands to Sake, add them to the [`Sake.commands`](api:SilverStripe\Cli\Sake->commands) configuration property:

```yml
SilverStripe\Cli\Sake:
  commands:
    - 'App\Cli\Command\MyCommand'
```

See [symfony/console documentation](https://symfony.com/doc/current/console.html#creating-a-command) for details about how to create a symfony command (though note the information about "registering the command" and "running the command" in that documentation doesn't apply to Sake).

## Usage

Run `sake help` at any time for information about how to use Sake.

Here are some common commands you can run with Sake:

```bash
# list available commands
sake # or `sake list`

# list available tasks
sake tasks

# build the database
sake db:build

# flush the cache
sake flush # or use the `--flush` flag with any other command

# get help info about a command (including tasks)
sake <command> --help # e.g. `sake db:build --help`
```

> [!CAUTION]
> You should run `sake` with the same system user that runs your web server. Otherwise you will have a separate filesystem cache for CLI and you won't be able to flush or warm your webserver cache using Sake.

Sake doesn't use your project's routing and controllers for normal execution. However if you do specifically need to access an HTTP route in your application from the CLI, you can use the `sake navigate` command.

```bash
sake navigate about-us/teams
```
