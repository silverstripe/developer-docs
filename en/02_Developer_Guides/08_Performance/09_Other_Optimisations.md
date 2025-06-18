---
title: Other Optimisations
summary: Other performance optimisations
---

# Other optimisations

Here are some other backend performance optimisations that can be made.

## Increasing available resources

Silverstripe CMS tries to keep its resource usage within the documented limits
(see the [server requirements](../../getting_started/server_requirements)).

These limits are defined through `memory_limit` and `max_execution_time` in the PHP configuration. These can be updated with [`Environment::increaseMemoryLimitTo()`](api:SilverStripe\Core\Environment::increaseMemoryLimitTo()) and [`Environment::increaseTimeLimitTo()`](api:SilverStripe\Core\Environment::increaseTimeLimitTo()).`

```php
// app/src/Services/MyClass.php
namespace App\Services;

use SilverStripe\Core\Environment;

class MyClass
{
    public function increaseLimits(): string
    {
        Environment::increaseMemoryLimitTo('256M');
        Environment::increaseTimeLimitTo(500);
    }
}
```

> [!CAUTION]
> Most shared hosting providers will have maximum values that can't be altered.

For certain tasks like synchronizing a large `assets/` folder with all file and folder entries in the database, more
resources are required temporarily. In general, we recommend running resource intensive tasks through the
[command line](../cli), where configuration defaults for these settings are higher or even unlimited.

## Cache warming

Cache warming involves proactively populating the cache with frequently accessed data before the first request. This reduces cache misses and ensures rapid response speeds from the first outset.

Here are some strategies for cache warming:

- Generate cache entries for the most popular pages or data on deployment.
- Use a cron job to periodically regenerate cache entries.
- Warm the cache whenever data is changed or added, such as by implementing the `onAfterWrite()` extension hook on your `DataObject`.

For example, to use a [`BuildTask`](api:SilverStripe\Dev\BuildTask) to warm the cache for popular pages:

```php
namespace App\BuildTasks;

use GuzzleHttp\Client;
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Dev\BuildTask;
use SilverStripe\PolyExecution\PolyOutput;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;

/**
 * Make HTTP requests to popular pages on the website to warm any caches
 * This would need to be run after a deployment has fully completed to ensure that
 * any new assets such as JavaScript bundles are cached in intermediatory caches such as CDNs.
 */
class CacheWarmerTask extends BuildTask
{
    protected static string $commandName = 'page-cache-warmer';

    protected string $title = 'Cache warmer';

    protected static string $description = 'Warms the cache for the most popular pages.';

    private const POPULAR_PAGES = [
        'home',
        'about-us',
        'contact-us',
    ];

    protected function execute(InputInterface $input, PolyOutput $output): int
    {
        $pages = SiteTree::get()->filter([
            'URLSegment' => CacheWarmerTask::POPULAR_PAGES,
        ]);
        foreach ($pages as $page) {
            $guzzle = Injector::inst()->get(Client::class);
            $url = $page->AbsoluteLink();
            $response = $guzzle->get($url);
            if ($response->getStatusCode() == 200) {
                $output->writeln("Warmed caches for $url");
            } else {
                $output->writeln("<error>Error when trying to warm cache for $url</error>");
            }
        }
        return Command::SUCCESS;
    }
}
```

## Enable opcode cache

Enable an [opcode](https://en.wikipedia.org/wiki/Opcode) cache such as [OPcache for PHP]([OPcache](https://www.php.net/manual/en/book.opcache.php)) to increase the performance of PHP code.

When PHP code is executed, it is first compiled into intermediate bytecode (opcodes). Without an opcode cache, this compilation occurs on every request. An opcode cache stores these compiled opcodes in shared memory, eliminating the need for repeated compilation and significantly reducing execution time for subsequent requests.

## Use a CDN

You can use a third-party Content Delivery Network (CDN) to cache and serve static assets (like images, JavaScript, and CSS) from servers geographically closer to your users. This has a few key benefits:

- Static assets (images, JavaScript, CSS) are delivered from an edge server, speeding up load times.
- Decreases traffic to your main server, improving its performance.
- Can provide additional security features like DDoS protection

CDNs will typically respect existing [HTTP cache headers](http_cache_headers) which you can configure within your application.

## Use a reverse proxy

Similar to a CDN, you can use a reverse proxy as an intermediary server positioned in front of your application. It intercepts client requests and can offer significant performance and security benefits if configured correctly.

Some potential benefits reverse proxies can provide include:

- Caches static assets (images, JavaScript, CSS) to serve them directly, reducing load on your application server and improving response times.
- Can distribute incoming requests across multiple backend servers, ensuring even resource utilization and enhancing scalability.
- Can be used to add an extra layer of defense by filtering malicious traffic.

Popular choices include Nginx, Varnish Cache, and Apache HTTP Server (with mod_proxy).

See [reverse proxies and forwarded hosts](/developer_guides/security/secure_coding/#reverse-proxies-and-forwarded-hosts) for more information.

## Profiling

Profiling is the process of analyzing the performance of your application to identify bottlenecks and areas for optimization. Silverstripe CMS does not include any profiling tools out of the box, though we recommend the use of [xdebug profiler](https://xdebug.org/docs/profiler) for profiling.
