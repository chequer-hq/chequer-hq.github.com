---
title: About
tags: ['page']
layout: default
pageOrder: 1
---

<div class="row captions">
    <div class="span3">
        <h2>Check by query</h2>
        <p>
            With Chequer you can query any type of data, for a result. This way you can filter, validate, check and gather information.
        </p>
    </div>
    <div class="span3">
        <h2>FAST &amp; SIMPLE</h2>
        <p>
            What Chequer does differently, is that it doesn't use any additional classes to do it's core work. It's self contained in one file and uses only one simple class. 
        </p>
    </div>
    <div class="span3">
        <h2>Host agnostic</h2>
        <p>
            Chequer is designed to be host agnostic, which means - it can be easily ported to other languages. Currently it is available in PHP flavour only. JavaScript version is coming too.
        </p>
    </div>
</div>


__Chequer is amazingly fast and magicaly simple.__<br/>
__As an added bonus, it matches scalars, arrays, objects and grumpy cats against the query of Your choice!__

It's only one lightweight class with one-but-powerfull function. Ok, there are more functions and classes,
but there is _the one_ that makes all the hustle.

In short - use __queries__ to __match values__. 

What Chequer does differently, is that it doesn't use any additional classes to do it's core work. It's
self contained in one file and uses only one simple class. You don't construct validation rules, 
you just pass a query in of three simple syntaxes - depending on what you need.

It's intentional - Chequer is **fast** and **simple**, and loading additional classes through factories is... well, *not*.
As an added bonus (and by design), you can use plain text (think config files, command line) to setup your validation! 
And you don't have to worry about factories and all the bloat!

But what is most important - Chequer is actually _not designed_ for validation! It simply allows to check
if something matches the query - so you *can* validate. But, it's a lot more than that! You can validate, 
check and filter almost anything - be it user input, environment variables, function results, objects, iterators, 
deep arrays, files and so on. And as the syntax is quite powerful, you can also query objects, 
call methods, convert results... Whoa!

Did I mention it's extensible - you can extend the class with your own operators, you can use
closures as checks, you can create your own value conversions and you can do it all at runtime. 
Plus it's **MIT** licensed, so share the love and contribute!

Why another validation library?
-----------------------------

Simply because - it's not a validation library! There are many others better suited for this purpose, 
but there are none (to my knowledge), which allow you to really quickly (in terms of code and execution) 
check a value - be it simple string, or a complex array.

Wait! There is more!
--------------------

Part of the package is `DynamicObject` class, which lets you __dynamically create classes__,
**modify** object's **methods** on the fly, __extend objects__ and moar! [Go check it out](/panrafal/chequer-php/blob/master/DynaminObject.md)!
It's here to make typecasting easy, but it's pretty awesome on it's own!

---------------------------------------------------------

Install
-------

Use [Composer](http://getcomposer.org/) package `stamina/chequer-php` to install.

The minimum required PHP version is 5.3. Because 5.4 introduces the shorthand array syntax - this version is recommended
and used in this documentation.

```
php composer.phar require stamina/chequer-php
```

[![Build Status](https://travis-ci.org/panrafal/chequer-php.png?branch=master)](https://travis-ci.org/panrafal/chequer-php)

---------------------------------------------------------

Note, that the whole idea is very fresh. I've come up with the concept on January 29th, and made the lib the same day. <br/>
And that means - it *will* change!

&copy;2013 Rafal Lindemann

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/b0780748041204c1d29e52c80d852fa1 "githalytics.com")](http://githalytics.com/panrafal/chequer-php)
