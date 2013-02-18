---
title: Language
tags: ['page']
layout: default
pageOrder: 3
---

Chequer Query Language
======================

Query language is modelled a bit after MongoDB. 
At least the operators start with '$' (use single quotes or escape!) and share the same names where possible.

Chequer uses three syntaxes at the same time:

* basic comparison - very basic, see below
* [key:rule][keyrule] - very fast, based on hashmaps (mongo-like), great for key lookups
* [shorthand][shorthand] - parsed language, based on strings (sql-like), great for complex queries

Every query operation assumes, that you ask if a `value` matches the `rule`.

Whenever there is a reference to `query` it may be:

* `Chequer` - the `Chequer` object with a query
* `scalar` (`string`, `int` etc.) - the value should match the query (with type conversion - 1 == '1')
  * With an exception, that strings starting with `$` are assumed to be in [shorthand syntax][shorthand].<br/>
    To use the string, you have to prefix it with '\' (`\$tring!` will match '$tring!'). You should not
    escape any other character! If you don't use shorthand, you can turn it off entirely.
* `null` - the value should be exactly `null`
* `false` - the value should be exactly `false`
* `true` - the value should be anything `true` in PHP
* `array` - a complex query in [key:rule syntax][keyrule]
* `$string` - strings starting with `$` are complex queries in [shorthand syntax][shorthand]

---------------------------------------------------

Key:rule syntax
===============
[keyrule]: #key-rule-syntax

A complex query with any combination of following **key** => **rule**:

* `'$operator'` => operator's parameter <br/>
    one of special operators - ([see operators](#operators))
* `'$'` => `bool` | `'AND'` | `'OR'`  <br/>
  `true` and `'AND'` will set this query to `AND` mode, `false` and `'OR'` will set it to `OR`
* `string` => `query`  <br/>
  check the value's `subkey` with the `query` - ([see subkeys](#subkeys))
* `'@typecast'` => `query`<br/>
  get the `typecast` value and check it against the `query` - ([see typecasts](#typecasts))
* `'@typecast()'` => `query`<br/>
  convert current value using the `typecast` and check it against the `query` - ([see typecasts](#typecasts))
* `'.subkey1.subkey2'` => `query`<br/>
  check the value's two (and more) `subkey`s deep with the `query` - ([see subkeys](#subkeys))
* `int` => `query`  <br/>
  check the `value` with the `query`
* `'$ shorthand'` => `query` <br/>
  [shorthand query][shorthand] which will be checked with the `query`

### Match All (AND) / Match Any (OR) in complex queries

By default, every rule in a query should match. This is the `AND` mode. Queries that match a simple
scalar will default to `OR`.

The mode is **not** carried over to subqueries.

When calling `check` you can specify the first level's mode in $matchAll parameter.

You can also use '$' key to change the mode, or use `$or`/`$and` operators.

Consider these examples

```php
AND: ['$regex' => 'foo', '$not' => 'foobar']
OR:  ['foo', 'bar'] // because it's an array of scalars
OR:  ['foo', '$regex' => 'bar'] // because element with index 0 is a scalar
OR:  ['$' => 'OR', '$regex' => 'foo', '$not' => 'foobar'] // because of '$'=>'OR'
OR:  ['$or' => ['$regex' => 'foo', '$not' => 'foobar']] // because of $or
```

Shorthand syntax
================
[shorthand]: #shorthand-syntax

Shorthand syntax is all about doing wild stuff on values, and returning the result of the operation.

This shorthand
```php
Chequer::checkValue('foo.txt', '$ @file().mtime > -1 day');
```
is equivalent to this key:rule:
```php
Chequer::checkValue('foo.txt', ['@file().mtime' => ['$gt' => '-1 day']]);
```

But this:
```php
// check if 'foo.txt' was modified around a week ago
Chequer::checkValue('foo.txt', '$ $abs(@time.now - 1 week - @file().mtime) < 1 day');
```
is doable in key:rule, but rather very hard.

Note, that you can disable this syntax by using setShorthandSyntax(). This way, you will not have to
worry about strings starting with '$'.

### Dollar
Every shorthand should start with a dollar sign `$`. If first element is an operator, you can
  use it immediately. Otherwise you have to put a space:

  ```php
  '$gt 10' // ok!
  '$> 10' // ok!
  '$ .subkey > 20' // ok!
  '$ $gt 10' // ok!
  '$ 1 + 1 = 2' // ok!
  '> 10' // NOT ok!
  '$.key' // NOT ok! 
  ```

### Escaping  
To not use the shorthand, escape the first dollar with backslash `\`. `'\\$tring!'`

### Grouping
* You can group operators and values with round brackets `()`.
  
  To make queries more readable, and to be sure that everything works as you want, you should use
  them a lot :)
  
### Operator precedence (lack of)  
There is __no operator precedence__. Query is evaluated from _left_ to _right_.
  
This is __extremely important__ as every operation is done through operators. Including AND/OR constructs!<br/>
`$ 1 = 1 && 2 = 2` will evaluate like `$ ((1 = 1) && 2) = 2`<br/>
What you would want is rather this: `$ (1 = 1) && (2 = 2)`.

### Quoting
You can **quote** the strings with either single or double quotes. You can escape the quotes
by using backslash `\`. Both are valid: `'this "is" ok' "this 'is' ok two!"`.

There are no special characters - `\n` will become a `n`.

### Numbers
Floating point numbers less than 1 should be prefixed with `0`. This is ok: `$< 0.1`, 
this is **not**: `$< .1`. Moreover, the second example will work, because you will fetch a second
digit from the number (equivalent to `$value[1]`).

### Context value
To use current context `value` use single dot `.`. To access the subkeys use the [dot notation][dotnotation].
  You can also use dot notation on group results in brackets.

  ```php
  '$ .' = value
  '$ .key.subkey' = value['key']['subkey']
  '$ .method().key' = calls value.method()['key']
  '$ (one:1, two:2).two' = ['one' => 1, 'two' => 2]['two']
  ```

### Context switching
To switch the `context value` you can use the `=> ()` operator. Everything inside brackets will refer to
the new value when using dot notation.

```php
'$ foo => ( . = foo )' - uses "foo" as a new context, so . = "foo" is true 
'$ (one:1, two:2) => ( .two )' - passes array as the new context, so the result is 2
'$ @time() => ((.year = 2013) && (.month = 10))' - passes the @time() object - you don't have to cast it twice!

```

### Strings
The strings can be unquoted if they don't contain any special characters. 
These words will be converted into their respectable types:

```php
'$ 123' = 123;
'$ 0.123' = 0.123;
'$ TRUE' = true;
'$ FALSE' = false;
'$ NULL' = null;
```

### Whitespace
Whitespace between values is preserved. It's ignored before first value, after last one
and *before* quoted strings.

```php
'$ some text' = 'some text'
'$ some text  +  more text' = 'some textmore text'
'$ some .subkey text' = 'some SUBKEY text'
'$ some.subkey text' = 'someSUBKEY text'
'$ some(.subkey) text' = 'someSUBKEY text'
'$ "some" .subkey text' = 'some SUBKEY text'
'$ some( .subkey) "te""xt"' = 'someSUBKEYtext'
'$ 1 "+" 1 + "=" 2' = '1+ 1= 2'
```

You generally should separate operators and values with a whitespace. At least for readability sake.
If not, remember to always separate operators themselves.

```php
'1+1=2' // is ok
'1-0.5=0.5' // is ok
'1+-0.5=1.5' // is NOT ok! +- will be treated as one operator
'1+ -0.5=1.5' // this IS ok
```

### Concatenation
Concatenation of types different then strings is undefined. Currently
numbers will be treated as strings, FALSE is not represented, TRUE is 1 and
arrays are changed to '(Array)'. This may change, so don't rely on it

```php
'$    array is (1,2,3) numbers are 1 2 3 false is FALSE true is TRUE null is NULL' 
 = 'array is (Array) numbers are 1 2 3 false is  true is  null is '
```

### Arrays
If two values follow each other with a comma `,`, they will be put into an array:

```php
'$ 1, 2' = [1, 2]
'$ (,)' = []
'$ one, two, three four' = ['one', 'two', 'three four']
'$ one, two, (three, four)' = ['one', 'two', ['three', 'four']]
```

### Hashmaps
If value is immediately followed by a colon `:`, the next value will be put under that key in a hashmap.
```php
'$ 1, two:2' = ['1', 'two' => 2]
'$ (@time.year):"Now!"' = [2013 => 'Now!']
'$ (year @time.year):"Now!"' = ['year 2013' => 'Now!']

```

### Method calls
When calling mathods and typecasts you can follow exactly the same syntax. Remember to put brackets
directly after an identifier - without any whitespace! 

```php
'$ .myMethod()' - calls myMethod()
'$ .myMethod(1, 2, 3)' - calls myMethod(1, 2, 3)
'$ .myMethod((1, 2, 3), 4)' - calls myMethod([1, 2, 3], 4)
'$ @typecast()' - calls typecast([value])
'$ @typecast(1, 2, 3)' - calls typecast([1, 2, 3])
'$ @typecast(., 1, 2, 3)' - calls typecast([value, 1, 2, 3])
'$ .subkey@typecast()' - calls typecast([value['subkey']])
'$ .subkey@typecast(.)' - calls typecast([value])
'$ @typecast(.subkey)' - calls typecast([value['subkey']])
'$ @typecast' - calls typecast()
```

### Conditional queries
For conditional queries you can use conditional operator, a.k.a ternary operator `? :`.
  
Current implementation doesn't understand multiple conditionals, so you have to group them with
brackets. Also, if you want to use arrays inside conditionals, you should put them in brackets too.

```php
'$ (. > 1 ? (. > 2 ? C : B) : A)' = 'A' for value 1
'$ (. > 1 ? (. > 2 ? C : B) : A)' = 'B' for value 2

// it is possible to use arrays in conditional, and even use conditionals for keys!
'$ . > 1 ? (1, 2, 3) : FALSE, (. > 1 ? B:A) : (.> 1 ? 2:1)', 

```

### General logic

The logic behind it, is to collect a `value`, an `operator` and the `parameter`.
Afterwards call the `operator`**(** `value`, `parameter` **)** and use it's result as the `value` of the next `operator`.

* Every query is run under a `context` - which is a `value` you are querying. The `context` stays the same
for the whole query, so no matter how deep you are, `.` will give you the `context`.
* You can skip the `value` at the beginning of the query, group or array index. `context` will be used as `value`.

`$< 10` is thus equivalent to `$ . < 10`.<br/>
`$ .method( < 10, > 10)` is the same as `$ .method( . < 10, . > 10)`
* You can skip the `operator` - the collected `value` will be the result.
* If there is no `parameter` but another `operator` follows, it's result will be used as the `parameter`:

`'$ $not $regex foo'` will first evaluate `'$regex foo'` and using it's result - `'$not'`.

Combining all this you can write `$= 10 || (= 20) || (! ~ "/\d/")` which is equivalent 
to `$ (. = 10) || (. = 10) || (!(~ "/\d/"))`.

Note, that if both `value` and `parameter` are present, they both will be evaluated before passing
them to the operator. This means that in this statement: `$ 1 = 2 && 2 = 3 && 3 = 4` first *TWO*
statements will evaluated, and just the third will be skipped.

### Missing values
If the value you are trying to access is missing, it will return null. It holds true even if
you are trying to access a deep subkey! You can set strict mode to TRUE to throw exceptions instead.

### Execution breaks
Operators may throw `\Chequer\BreakException` - this will exit current level with a return value
set in the exception. This way `$or` and `$and` are made not greedy.


