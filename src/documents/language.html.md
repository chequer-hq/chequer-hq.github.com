---
title: Language
tags: ['page']
layout: default
pageOrder: 30
---

<h1>Chequer Query Language</h1>

Chequer uses three syntaxes at the same time. You can mix them together however you please:

```js
[
  null,           // value may be null (basic comparison)
  '$gt' : 20,     // or be bigger than 20 (key:rule)
  '$~ foo.*bar',  // or match this regular expression (shorthand)
  ['foo', 'bar'], // or be any of these (key:rule + comparison)
]
```

Whenever there is a reference to `query` it may be:

* `Chequer` <br/>
  the `Chequer` object with a query

* `$string` <br/>
  strings starting with `$` are complex queries in sql-like [shorthand syntax][shorthand] <br/>
  great for complex queries


* `string` or `number`<br/>
  the value should equal the query (with type conversion: 1 == '1')

* `null`<br/>
  the value should be exactly `null`

* `false`<br/>
  the value should be exactly `false`

* `true`<br/>
  the value should not be `false`

* `hashmap`<br/>
  a complex query in mongodb-like [key:rule syntax][keyrule]<br/>
  great for fast queries, or/and lists, hashmap digging...



---------------------------------------------------

Key:rule syntax
===============
[keyrule]: #key:rule-syntax

Key:rule syntax is modelled a bit after MongoDB. 
At least the operators start with '$' (use single quotes or escape!) and share the same names where possible.

Query is a hashmap with any combination of following `key` `:` `rule` pairs:

* `'$operator'` `:` operator's parameter<br/>
    use [operator](operators.html) on the `value`
    ```php
    ['$gt' : 20] // greater than 20
    ```
* `'$'` `:` `bool` | `'AND'` | `'OR'`  <br/>
  `true` and `'AND'` will set this query to `AND` mode, `false` and `'OR'` will set it to `OR`.<br/> 
  [Read about query mode](#matchall).
  ```js
  [ "$" : 'OR', '$gt' : 10, '$lt' : -10 ] // > 10 OR < -10
  ```
* `string` `:` `query`  <br/>
  check the value's `subkey` with the `query`.
  [Read about subkeys][dotnotation].
  ```js
  [ 'foo' : 'bar' ] // check if value.foo == 'bar'
  ```
* `'.subkey1.subkey2'` `:` `query`<br/>
  check the value's two (and more) `subkey`s deep with the `query`
  ```js
  [ '.foo.bar' : 'baz' ] // check if value.foo.bar == 'baz'
  ```
* `'@typecast'` `:` `query`<br/>
  get the `typecast` value and check it against the `query`. <br/>
  [Read about typecasts](typecasts.html).
  ```js
  [ '@time' : ['$gt' : '2013-01-01'] ] // check if typecast @time is greater than 2013
  ```
* `'@typecast()'` `:` `query`<br/>
  convert current value using the `typecast` and check it against the `query`.<br/>
  [Read about typecasts](typecasts.html).
* `int` `:` `query`  <br/>
  Ignore the `key` and simply check the `value` with the `query`<br/>
  Note, that when using arrays their keys are `int`s.
  ```js
  [ 'foo', 'bar', '$~ foo.*bar' ] // match 'foo', 'bar' or shorthand regexp
  ```
* `'$ shorthand'` `:` `query` <br/>
  Evaluate [shorthand syntax][shorthand] and check it with the `query`
  ```js
  [ '$ + 1' : 2 ] // check if current value + 1 equals 2
  ```


## AND/OR modes

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


## Subkeys, dot notation
[dotnotation]: #subkeys--dot-notation

Subkey can be:

* array's key 
* object's property
* object's method when using `()` brackets <br/>
  `Chequer::checkValue(new SplFileInfo(), ['getSize()' => ['$gt' => 0]])`

You can access multiple subkeys at once by using the `dot notation`. You have to start with a `.` (dot)
and join subkeys with a dot like this: `.subkey.method().another_one`. To reference the value itself,
use the `.` itself. <br/>
If you have a subkey with a dot, use standard notation without the `.` prefix, like this: `subkey.with.a.dot`.

If the subkey does not exist in the value, and the value is an 0-indexed array, Chequer will traverse this
array in search for the first array/object having this key. You can control this behaviour by using
`setDeepArrays()`. Note, that two different queries may match in two different subitems.

Like here:
```php
Chequer::checkValue([
    'foo' => 'bar', 
    ['some' => 'thing'],
    ['hello' => 'world'],
    ['hello' => 'bye']
], ['foo' => true, 'some' => true, 'hello' => true]);
```

We are looking for 'foo', 'some' and 'hello' keys, but the 'hello' and 'some' are defined inside the subitems. 
However, they *will* be discovered, because the array has continuous keys starting from 0. 

Note however, that `['hello' => 'bye']` will not match, because the first element takes the precedence.




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
is doable in key:rule, but rather not very beautiful.

Note, that you can disable this syntax by using setShorthandSyntax(). This way, you will not have to
worry about strings starting with `$`.

### Dollar
Every shorthand should start with a dollar sign `$`. If first element is an operator, you can
  use it immediately. Otherwise you have to put a space:

  ```php
  '$gt 10' // ok!
  '$= 10' // ok!
  '$ = 10' // ok!
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

### Assignment
You can assign values to local typecasts with `:=` operator. The `value` will become the typecast name:

```php
'$ foo := bar' // assign "bar" to @foo
'$ foo := bar; @foo := baz' // assign "bar" to @foo, and then assign "baz" to @bar
'$ foo\.bar := bar' // assign "bar" to @foo.bar
'$ file := bar' // exception will be thrown, because @file is a global typecast
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
them to the operator. This means that in this statement: `$ (1 = 2) && (2 = 3) && (3 = 4)` first *TWO*
statements will evaluated, and just the third will be skipped.

### Missing values
If the value you are trying to access is missing, it will return null. It holds true even if
you are trying to access a deep subkey! You can set strict mode to TRUE to throw exceptions instead.

### Execution breaks
Operators may throw `\Chequer\BreakException` - this will exit current level with a return value
set in the exception. This way `$or` and `$and` are made not greedy.


