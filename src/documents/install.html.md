---
title: Install
tags: ['page']
layout: default
pageOrder: 10
---

<h1>Install</h1>

Chequer is a Domain Specific Language and a set of functions to allow You to use it. 
It is host-agnostic by design, which makes it easely portable to different languages. Currently
only PHP is available, with JavaScript port soon to follow.

Spread the word and help it grow!

## PHP

Use [Composer](http://getcomposer.org/) package `stamina/chequer-php` to install.

```
php composer.phar require stamina/chequer-php
```

The minimum required PHP version is 5.3. Because 5.4 introduces the shorthand array syntax - this version is recommended
and used in this documentation.

In a more traditional manner, you can add the Chequer library to you include path, or auto loader, as it is
PSR-0 compliant. You can also use a single file `Chequer.php`, as long as you refrain from using typecasts.

<a href="https://github.com/panrafal/chequer-php" class="btn btn-primary"><i class="icon-github"></i> View on GitHub</a>
<a href="https://github.com/panrafal/chequer-php/archive/master.zip" class="btn"><i class="icon-download-alt"></i> Download ZIP</a>

[![Build Status](https://travis-ci.org/panrafal/chequer-php.png?branch=master)](https://travis-ci.org/panrafal/chequer-php)

