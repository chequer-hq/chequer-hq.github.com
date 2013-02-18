---
title: Usage
tags: ['page']
layout: default
pageOrder: 2
---


Install
=======

Use [Composer](http://getcomposer.org/) package `stamina/chequer-php` to install.

The minimum required PHP version is 5.3. Because 5.4 introduces the shorthand array syntax - this version is recommended
and used in this documentation.

```
php composer.phar require stamina/chequer-php
```

[![Build Status](https://travis-ci.org/panrafal/chequer-php.png?branch=master)](https://travis-ci.org/panrafal/chequer-php)

---------------------------------------------------------

Usage and examples
==================

For simple checks use 
```php
if (Cheque::checkValue($value, $query)) {}
```

When you want to reuse your query, or pass it somewhere as a callback, create the object and call `check` method,
or invoke the object like this:
```php
$chequer = new Chequer($query);
if ($chequer->check($value)) {}
// or
if ($chequer($value)) {}
// or pass it
array_filter($array, $chequer);
```

Environment variables checking
------------------------------

This example will match all users from *localhost*, plus those with IP starting from *'192'* and having a *'debug'* cookie.

Btw., the `checkEnvironment` function is a neat shortcut for checking _SERVER, _ENV, _COOKIES etc. in one go.
```php
if (Chequer::checkEnvironment([
    ['REMOTE_ADDR' => ['127.0.0.1', 'localhost']],
    ['REMOTE_ADDR' => ['$regex' => '/^192\./'], '_COOKIE' => ['debug' => true]]
], false)) {
    echo 'Debug!';
}
```

Array filtering
---------------

This will leave only values from 2 to 5 in the array.
```php
$array = [1, 2, 3, 4, 5, 6];
$array = array_filter($array, new Chequer(['$between' => [2, 5]]))
```

Iterator filtering
----------------------

This will iterate through files with 'php' or 'html' extensions, that are older than one day.
```php
$files = new FilesystemIterator(dirname(__DIR__));
$files = new CallbackFilterIterator($files, new Chequer('$ @file() => (.extension $in(php, html) && (.mtime < -1 day))'));
foreach($files as $file) {}
```

Data querying
-------------

You can even read and translate the data... This will ouput information about biggest countries
with the highest GDP, and transpose it to another format:
```php
    // data for 10 most populated countries on earth
    $populatedCountries = '[{"gdp":7973000,"name":"China","pop":1330044000},{"gdp":3297000,"name":"India","pop":1173108018},{"gdp":14260000,"name":"United States","pop":310232863},{"gdp":914600,"name":"Indonesia","pop":242968342},{"gdp":1993000,"name":"Brazil","pop":201103330},{"gdp":427300,"name":"Pakistan","pop":184404791},{"gdp":224000,"name":"Bangladesh","pop":156118464},{"gdp":335400,"name":"Nigeria","pop":154000000},{"gdp":2266000,"name":"Russia","pop":140702000},{"gdp":4329000,"name":"Japan","pop":127288000}]';
    $populatedCountries = json_decode($populatedCountries, JSON_OBJECT_AS_ARRAY);

    echo implode("\n", 
        // If gdp is more then 5mln return "#### with #### of GDP". Otherwise return NULL which is filtered out.    
        Chequer::shorthand('(.gdp > 5000000) ? (.name with .gdp of GDP) : NULL')
            ->walk($populatedCountries)
    );
    /* This will output:
       China with 7973000 of GDP
       United States with 14260000 of GDP
    */

    $newFormat = json_encode( 
        // If gdp is more then 5mln add {### : {gdp : ###, pop : ###}} to the results
        Chequer::shorthand('(.gdp > 5000000) ? (.name : (gdp:.gdp, pop:.pop)) : NULL')
            ->merge($populatedCountries)
    );
    /** New format will be:
        {"China":{"gdp":7973000,"pop":1330044000},"United States":{"gdp":14260000,"pop":310232863}}
    */
```

