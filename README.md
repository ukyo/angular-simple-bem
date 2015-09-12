# angular-simple-bem [![Build Status](https://travis-ci.org/ukyo/angular-simple-bem.svg?branch=master)](https://travis-ci.org/ukyo/angular-simple-bem)

angular-simple-bem is a BEM library that is easy to write and easy to read.

# Install and Setup

```
bower install --save angular-simple-bem
```

```js
angular.module('your-module', ['angular-simple-bem']);
```

or

```
npm install --save angular-simple-bem
```

```js
angular.module('your-module', [require('angular-simple-bem')]);
```


# Usage

## Nest block or element

```html
<div bem="block">
  <div bem="__elem1">
    <div bem="__elem2">nest block or element</div>
  </div>
</div>
```

```html
<div bem="block" class="block">
  <div bem="__elem1" class="block__elem1">
    <div bem="__elem2" class="block__elem1__elem2">nest block or element</div>
  </div>
</div>
```

## Modifier

```html
<div bem="block--mod">
  <div bem="__elem--mod1,mod2">modifier</div>
</div>
```

```html
<div bem="block--mod" class="block block--mod">
  <div bem="__elem--mod1,mod2" class="block__elem block__elem--mod1 block__elem--mod2">modifier</div>
</div>
```

## Modifier with Binding

```html
<div ng-init="foo = true; bar = false;">
  <div bem="block--mod1:foo,mod2:bar">modifier with binding</div>
  <div bem="block--::mod1:foo,mod2:bar">modifier with one time binding</div>
</div>
```

```html
<div ng-init="foo = true; bar = false;">
  <div bem="block--mod1:foo,mod2:bar" class="block block--mod1">modifier with binding</div>
  <div bem="block--::mod1:foo,mod2:bar" class="block block--mod1">modifier with one time binding</div>
</div>
```

## Modifier with Expression

```html
<div ng-init="foo = {mod1: true}; bar = true;">
  <div bem="block--(foo)">modifier with binding</div>
  <div bem="block--::{mod2: bar}">modifier with one time binding</div>
</div>
```

```html
<div ng-init="foo = {mod1: true}; bar = true;">
  <div bem="block--(foo)" class="block block--mod1">modifier with expression</div>
  <div bem="block--::{mod2: bar}" class="block block--mod2">modifier with expression(one time binding)</div>
</div>
```

# License

MIT License
