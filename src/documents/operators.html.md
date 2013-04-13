---
title: Operators
tags: ['page']
layout: default
pageOrder: 40
---

# Operators

Operators start with a `$`, accept a `value`, a `parameter` and return the `result`. Some operators
have short versions (`!`, `+`, `>` ...), but they still have to be used with `$` if outside of the
shorthand syntax.

## $and
```
'$and' | '&&' : [query, query, ...] | scalar
```

  When array is passed, all queries will have to match. Useful in [key:rule syntax][keyrule].

  When a scalar is matched, then both `value` and `scalar` have to be true. Otherwise matching is stopped
  at this level.

  ```php
  Chequer::checkValue(FALSE, [
    '$and' => true, // value is FALSE, next rule won't be evaluated
    '$gt' => 10
  ]);
  ```

  Watch out for passing arrays in `shorthand`! This will essentialy call `operator_and([1,2,3], [1,2,3])`, which means: <br/>
  `value` = [1,2,3] must match `1`, `2` and `3`.
  ```php
  Chequer::checkValue([1,2,3], '$ . && .');
  ```

  But it may be very helpfull too. This will check if `value` = 'foobar' is `"foo"` or `"bar"` or matches
  regular expression `/foo/`!
  ```php
  Chequer::checkValue('foobar', '$ . || "foo", "bar", "$~ foo"');
  ```

## $or  
``` php
'$or' : [query, query, ...] | scalar
```

  When array is passed, only one query will have to match. Useful in [key:rule syntax][keyrule].

  When a scalar is passed, then the `value` or `scalar` have to be true. If they are, matching is stopped
  at this level, and `true` is returned. See examples for `$and`.

## $orvalue  
``` php
'$orvalue' | '||' : operand
```

  Returns `value` or `operand`, whichever is true, or `operand` otherwise. Works the same as
  `value || operand` in JavaScript. If you want the or operator that always returns boolean,
  use `$or` instead.

## $not
``` js 
'$not' | '!' : query
```

  negates the `query`

## $regex  
``` js
'$regex' | '~' : '/regexp/flags' | '#regexp#flags' | '~regexp~flags' | 'regexp'
```

  Matches strings using regular expressions.<br/>
  With third syntax, regular expression is automatically enclosed in '~' character, so it's safe to use
  `/` without escaping.

## $eq  
``` js
'$eq' | '=' | '==' : operand
```

  compares `value` and `operand` for equality with loose type operator (==)

## $same
``` js
'$same' | '===' : operand
```
  compares `value` and `operand` for equality using strict operator (===)

## $nc
``` js
'$nc' : string
```
  not case-sensitive comparison (multibyte)

## $gt $gte $lt $lte
``` js
'$gt' | '$gte' | '$lt' | '$lte' | '>' | '>=' | '<' | '<=' : operand
```
  greater-than | lower-than comparisons

## $between
``` js
'$between' : [lower, upper]
```

  checks if `value` is between lower and upper bounds (inclusive)

## $in
```js  
'$in' : [operand, operand, ...]
```

  checks if `value` is on the list

## $add
``` js 
'$add' | '+' : operand
```

  Addition

  * if both values are numeric, they will be added,
  * if `operand` is an array, it will be merged with `value`,
  * if `value` is an array, but `operand` is not, it will be pushed,
  * otherwise it will concatenate strings

## $sub
``` js
'$sub' | '-' : operand
```

  Substraction

  * if both values are numeric, they will be substracted,
  * if `operand` is an array, it will be substracted from `value`,
  * if `value` is an array, but `operand` is not, it will be removed,
  * otherwise it will remove the `operand` from the string

## $mult
``` js
'$mult' | '*' : operand
```

  Multiplication

  * if both values are numeric, they will be multiplicated

## $div
``` js
'$div' | '/' : operand
```

  Division

  * if both values are numeric, they will be divided

## $check
``` js
'$check' : callable
```

  matches if `callable($value)` returns TRUE

## $abs  
``` js
'$abs' : value
```

  Returns absolute value


## $max
``` js 
'$max' : value | [value1, value2, ...]
```

  Return maximum numeric value

  * if `operand` is an array, maximum value from the array is returned
  * if `operand` is not an array, maximum is calculated from `value` and `operand`


## $min
``` js 
'$min' : value | [value1, value2, ...]
```

  Return minimum numeric value

  * if `operand` is an array, minimum value from the array is returned
  * if `operand` is not an array, minimum is calculated from `value` and `operand`


## $size
``` js
'$size' : query
```

  checks the size of array or string using the `query`

## $rule
``` js
'$rule' : ['rulename1','rulename2'] | 'rulename1 rulename2'
```

  Allows to reuse predefined rules, which you can set with addRules().
  You can specify many rules as an array, or space delimited string. 

  If you want to match any of the rules, place `OR` as one the rule names.

  If you wan't a rule to NOT match, prepend it with '!'

  ```php
  $checker->query(..., '$rule email lowercase');
  $checker->query(..., '$rule email AND lowercase'); // this is equivalent to the former
  $checker->query(..., '$rule email OR lowercase'); // email or lowercase
  $checker->query(..., '$rule "email OR !lowercase"'); // email or not lowercase. We have to quote it because of '!'
  ```
  
## $eval
``` js
'$eval' : [query, query, ...]
```

  Evaluates every query by passing the `result` as the next query's `value`.

  ```php
  // the result is 3:
  Chequer::checkValue(1, [
    ['$eval' => ['$add' => 1, '$add' => 1]]
  ]);
  ```


[keyrule]: language#key:rule-syntax