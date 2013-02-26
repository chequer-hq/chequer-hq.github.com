---
title: Typecasts
tags: ['page']
layout: default
pageOrder: 45
---

# Typecasts

Typecasts are special objects which you can read data from and convert values into. They act like a
regular subkeys, and can be accessed using dot notation (`@typecast.subkey` or `'.subkey@typecast'`).

There are three ways to use a typecast:

- With `@typecast`, you can use the object itself. For example, `@time` will simply return current time
  as a `Chequer.Time` object.

  For user-provided typecasts, this works by returning the typecast value. So you can use typecasts as
  normal variables.

  For built-in one's, the `typecast_*()` function will be called without any arguments.

- With `@typecast()` you can convert current value into another object, hence the word 'typecast'. 
- 
  For example, `@time()` will try to convert current value into `Chequer.Time` object.

  For user-provided typecasts, this works by calling the value. If it's not callable, exception will be thrown.

  For built-in one's, the `typecast_*()` function will be called with the current value as a first argument.

- With `@typecast(arg1, arg2,...)` you can call the typecast function with whatever arguments you need.
  For example, `@time("-1 week")` will give you `Chequer.Time` object for a date week ago.

Typecasts can be really powerfull:
```php
$chequer = new Chequer();
// store the reference to the myFile
$chequer->addTypecasts([
            'myFile' => 'myfile.txt', 
            'myRandom' => function($file = null) {return rand(0,100);}
        ])
        ->setQuery([
            // convert SplFileinfo into Chequer\File. Note the brackets.
            '@file()' => [ 
                /* File's modification time should be newer then on 'myfile.txt'.
                   Note the lack of brackets on @myFile - we are using myFile's value
                   and then we convert it into a Chequer\File - by using the brackets this time.
                */
                '.mtime' => '$> @file(@myFile).mtime',
                /* This does exactly the same - converts @myFile to @file */
                '.mtime' => '$> @myFile@file().mtime',
                /* File should be modified in the current year. 
                   Note the lack of brackets - we are using the current time's value.
                   We also use a shorthand syntax for $cmp.
                */
                '.mtime.year' => '@time.year',
                /* We call the myRandom typecast. The result should be grater than 50 */
                '@myRandom()' => '$> 50'
                /* As myFunc is a closure, we can skip the brackets. It will be called nevertheless. */
                '@myRandom' => '$> 50'
            ]
        ]);

$files = new CallbackFilterIterator($new FilesystemIterator(dirname(__DIR__)), $chequer);
foreach($files as $file) {
    // only files matching the criteria will be listed here!
    echo $file->getFilepath();
}
```

-------------------------------------------------------------------------

## @file

Treats the value as a file, giving access to additional information. In addition to standard `SplFileinfo`
methods, you can use many nice properties.  This is the same as using `Chequer\File` class.

You can use current value, or provide your own:
```php
    '$ @file().path' = path of the currently checked value
    '$ @file("somefile.txt").mtime > -7 days' = TRUE if somefile.txt was modified in last 7 days ([see @time][typecast-time])
    '$ @file().xpath ~ "somedir/.*\.txt$"' = cross-system safe way to check for paths
```

Properties:

* `size` (`int`) -  File size in bytes
* `atime` (`Time`) -  Access time as Chequer\Time object
* `mtime` (`Time`) -  Mod time as Chequer\Time object
* `ctime` (`Time`) -  Create time as Chequer\Time object
* `extension` (`string`) - 
* `ext` (`string`) -  Alias for extension
* `name` (`string`) -  File name, without directory
* `path` (`string`) -  Full file path
* `dir` (`string`) -  Directory name, without file name
* `realpath` (`string`) -  Absolute file path
* `xpath` (`string`) -  Full file path normalized as unix path (always forward slashed '/', no drive letter)
* `xdir` (`string`) -  Directory name, without file name - normalized as unix path
* `xrealpath` (`string`) -  Absolute file path normalized as unix path
* `type` (`string`) -  Type of the file. Possible values are file, dir and link
* `isdir` (`boolean`) - 
* `isfile` (`boolean`) - 
* `writeable` (`boolean`) - 
* `readable` (`boolean`) - 
* `executable` (`boolean`) - 
* `exists` (`boolean`) -  TRUE if exists

## @time

Treats the value as time, giving you access to time-related information. This is the same as using `Chequer\Time` class.

You can use current value, or provide your own. Supported formats are:

- `60` | `-60` | `57462043` | ... - Unix timestamp in seconds as integer, or integer-like string
- `2010-10-01` | `2010/01/10 15:00` | ... - Full dates. The same format as strtotime()
- `-1 day` | `last thursday` | ... - Relative dates. The same formats as strtotime()
- `1 day` | `20 seconds` | ... - Time intervals. Don't use '+' or '-'! These are reserved for relative dates!

```php
    '$ @time' - current system time
    '$ @time()' - current value converted to time
    '$ @time("2010-05-01")' - specific time
    '$ @time("+1 day")' - tomorrow (note the '+')
    '$ @time("1 minute")' - one day interval (60 seconds)
    '$ @time("+1 day", .)' - relative time to the current value
```

It also overrides some of the operators, so any operation on time will also convert the other
operator to time.

```php
    '$ @time + "1 day"' - tomorrow
    '$ (@time() - @time).abs > 60 seconds' - checks if the absolute difference between value's time and system time is more than 60 seconds
```

Properties:

* `string` (`string`) - Whole date as "YYYY-MM-DD HH:MM:SS" the same as simply `@time()`
* `date` (`string`) - Date portion as YYYY-MM-DD
* `time` (`string`) - Time portion as HH:MM:SS
* `year` (`int`) - 
* `month` (`int`) -  
* `day` (`int`) - 
* `week` (`int`) - year's week number
* `weekday` (`int`) - weekday, 1 is Monday, 7 is Sunday
* `hour` (`int`) - 
* `minute` (`int`) - 
* `second` (`int`) - 
* `unixtime` (`int`) - time in seconds since Unix epoch
* `abs` (`Time`) - absolute time for intervals

Methods:

* `strftime`(`format`) - Formats the time using strftime() format
* `format`(`format`) - Formats the time using date() format

## @string

Treats the value as string, giving access to string-specific functions.

Properties:

* `lower`
* `upper`
* `trim`

Methods:

* `toLowerCase()`
* `toUpperCase()`
* `substr(start, length = null)`
* `substring(offsetA, offsetB = null)`
* `charAt(pos)`
* `match(regexString)` - returns array of matches or NULL. 
    Note that returned matches are NOT typecasted to `@string`!
* `replace(regexOrSearch, replacement)` - regular expression should start with `/` or '~'
