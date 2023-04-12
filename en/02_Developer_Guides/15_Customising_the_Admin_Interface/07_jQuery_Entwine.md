---
title: jQuery Entwine
iconBrand: js
---

# jQuery Entwine

[notice]
The following documentation regarding jQuery and Entwine does not apply to React components or sections powered by React.
If you're developing new functionality in React powered sections please refer to
[React, Redux, and GraphQL](/developer_guides/customising_the_admin_interface/reactjs_redux_and_graphql/).
[/notice]

jQuery Entwine was originally written by [Hamish Friedlander](https://github.com/hafriedlander/jquery.entwine).

Entwine tries to provide a new model of code organisation - a replacement for Object Oriented programming that is
focused on adding functions to groups of DOM elements based on the structure and contents of those DOM elements. It's a
merging of the model and view layer that initially seems weird, but can give very powerful results.

## Basics

Entwine applies methods, custom properties, and event handlers to elements in the DOM based on jQuery selectors. To attach entwine logic to DOM nodes, call the `entwine` function on a jQuery selector object and pass in an object which details any properties, methods, or event handlers which should apply to DOM nodes which match the selector.

```js
$('div').entwine({
  // properties, methods, and event handlers go here
});
```

[info]
The definitions you provide are _not_ bound to the elements that match at definition time. You can declare behaviour prior to the DOM existing in any form (i.e. prior to DOMReady) and later calls and event handlers will function correctly.
[/info]

### Selector specifity and "inheritance" {#specificity}

When there are two definitions for an event handler, method, or property on a particular DOM node, only the function with the most _specific_ selector is used.

_Specifity_ is calculated as defined by the CSS 2/3 spec. This can be seen as _subclassing_ applied to behaviour. This is determined by the selector used for _defining_ the entwine logic, _not_ the selector used to select the DOM element.

For example, given this DOM structure

```html
<body>
  <div>Internal text</div>
  <div class="attribute_text" rel="Attribute text"></div>
  <div>Nonsense</div>
</body>
```

And this entwine definition

```js
$('div').entwine({
  foo: function() {
    console.log(this.text());
  },
});

$('.attribute_text').entwine({
  foo: function() {
    console.log(this.attr('rel'));
  },
});
```

Then this call, which only matches (and therefore only calls) the method for the element with the `attribute_text` css class

```js
$('.attribute_text').foo();
```

Will log this to the console

```
Attribute text
```

And this call, which matches each of the `div` elements individually

```js
$('div').foo();
```

Will log this to the console

```
Internal text
Attribute text
Nonsense
```

[notice]
For selectors with _the same_ level of specificity, the definition which is declared first takes precedence.
[/notice]

#### Calling less-specific logic from a definition with higher-specificity

There may be times when you want to apply _additional_ logic to a method or event handler for a given DOM element, but still call the logic for the lower-specificity declaration. For example you might want to perform some conditional check before allowing a button click event to occur.

You can call the logic for the declaration with lower-specificity by calling `this._super()`. This special function can take any arguments, and will pass them on to the appropriate method or event handler.

For example, with the following entwine definition

```js
$('a').entwine({
  onclick: function(e) {
    console.log('clicked the link element');
  },
});

$('.btn').entwine({
  onclick: function(e) {
    console.log('clicked the .btn element');
    this._super(e);
  },
});
```

Clicking a `<a class="btn"></a>` element will log this to the console

```
clicked the .btn element
clicked the link element
```

If the `this._super()` call was removed, the event would never be passed on to the handler declared for `a`.

### Limitations

The jQuery object that entwine is called on must be selected using a plain selector, without context. These examples will not work:

```js
$('div', el).entwine(/*...*/)
$([ela, elb, elc]).entwine(/*...*/)
$('<div id="a"></div>').entwine(/*...*/)
```

## Adding methods to DOM elements

To attach methods to DOM nodes, call the `entwine` function on a jQuery selector object, passing an object listing the method names and bodies.

```js
$('div').entwine({
  foo: function(args) {
    // Some logic here
  },

  bar: function(args) {
    // Some logic here
  },
});
```

Those methods belong to every element which matches the selector. You can then call those methods on any jQuery object for the matched elements, even if you're using a different selector to get the element:

```js
$('.my-div-class').foo();
```

Any elements in the jQuery selection that match the selector used during definition ('div' in this example) will have foo called with that element
set as this. Any other objects are skipped. The return value will be the return value of foo() for the last matched DOM object in the set.

### A proper example

Given this DOM structure:

```html
<body>
  <div class="internal_text">Internal text</div>
  <div class="attribute_text" rel="Attribute text"></div>
  <div>Nonsense</div>
</body>
```

And this entwine definition

```js
$('.internal_text').entwine({
  foo: function() {
    console.log(this.text());
  },
});

$('.attribute_text').entwine({
  foo: function() {
    console.log(this.attr('rel'));
  },
});
```

Then this call

```js
$('div').foo();
```

Will log this to the console

```
Internal text
Attribute text
```

Note that it is calling the `foo()` method on _both_ divs, and that each had a different `foo()` method defined based on different selectors.

## Events

If you declare a function with a name starting with 'on', then instead of defining that function as a callable method, it will be bound to an event of that
name. Just like other functions this binding will be live, and only the most specific definition will be used.

```html
<div>Background will turn blue when clicked on</div>
<div>Will also have blue background when clicked on</div>
<div class='green'>Will have green text when clicked on. Background colour will not change</div>
```

```js
/* No need for onready wrapper. Events are bound as needed */
$('div').entwine({
  onclick: function() {
    this.css({backgroundColor: 'blue'});
  },
});

$('.green').entwine({
  onclick: function() {
    this.css({color: 'green'});
  },
});
```

[hint]
Remember, if you wanted the background colour to change for the div with class `green` as well, you can simply call `this._super()` in the click event handler declared for that selector. See [Selector specifity and "inheritance"](#specificity) for more information about how this works.
[/hint]

### Handling events from other elements

Sometimes we want one element to react to events that are occuring on another element. For these situations, the special `from` syntax can be used. This should be used sparingly.

Examples of where this can be useful are if the logic for the element the events are happening on is declared in a different file to the logic for the element you want to perform actions on, or if you have extensive API declared for the element you want to perform actions on that would be cumbersome to call from the element that owns the event.

```html
<a>The click event for this element will be handled by the div!</a>
<div class='green'>Will have green text when the link is clicked on.</div>
```

```js
$('div').entwine({
  'from a': {
    onclick: function() {
      this.css({color: 'green'});
      this._super();
    },
  },
});
```

## Constructors / Destructors

Declaring a function with the name `onmatch` will create a behavior that is called on each object when it matches. Likewise, `onunmatch` will be called when an object that did match this selector stops matching it (because it is removed, or because you've changed its properties).

Note that an onunmatch block must be paired with an onmatch block - an onunmatch without an onmatch _in the same entwine definition block_ is illegal.

You can also declare a function with the name `onadd` which is similar to `onmatch` but is explicitly triggered by the element being added to the DOM. This means if the element already exists when you declare this function, your function will not be called (but `onmatch` would be). Similarly, if you delcare a function called `onremove`, it will be called when an element is _removed_ from the DOM. This does not need an `onadd` function to be declared, unlike `onunmatch`.

[warning]
The `onmatch` and `onadd` events are triggered `asynchronously` - this means that after you add an element to the DOM, it is not guaranteed that functionality in your `onmatch` or `onadd` function for that element will be processed immediately. This is handled using a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).

The `onunmatch` and `onremove` events are triggered synchronously however, so you can rely on the element still existing when these functions are called. The element will not be removed from the DOM until the `onunmatch` and `onremove` functions for the element have been called and finished executing.
[/warning]

## Properties

Entwine has a special concept of properties. You can declare a property for a given selector, and a getter and setter method will be implicitly created for it. Properties are declared by setting and word starting with a capital letter, like so:

```js
$('div').entwine({
  MyProperty: 'some value',
});
```

You can get and set the property by calling a method with `get` and `set` before the property name:

```js
$('div').getMyProperty(); // returns 'some value'
$('div').setMyProperty(32);
$('div').getMyProperty(); // returns 32
```

## Namespaces

[hint]
Most entwine logic defined in core Silverstripe CMS modules uses the `ss` namespace.
[/hint]

To avoid name clashes, to allow multiple bindings to the same event, and to generally seperate a set of functions from other code, you can use namespaces. These are declared by calling the `jQuery.entwine()` function and passing in both the namespace name and a callback, which contains all entwine declarations which belong to that namespace:

```js
$.entwine('foo.bar', function($) {
  $('div').entwine({
    baz: function() {
      // Some logic here
    }
  });
});
```

You can then call these functions like this:

```js
$('div').entwine('foo.bar').baz()
```

[info]
Notice that `$` is passed in as an argument to the callback function. This is a _different object_ than the `$` which the `entwine()` function is being called on, which contains information about the namespace that you have defined. Another way to write the namespace closure, which illustrates this point, would be like so:

```js
jQuery.entwine('foo.bar', function($) {
  $('div').entwine({
    // declarations here
  });
});
```

[/info]

Namespaced functions, properties, and event handlers work just like regular functions (`this` is still set to a matching DOM Node). However, specifity is calculated per namespace. This is particularly useful for events, because given this:

```js
$('div').entwine({
  onclick: function() {
    this.css({backgroundColor: 'blue'});
  },
});

$.entwine('foo', function($) {
  $('div').entwine({
    onclick: function() {
      this.css({color: 'green'});
    },
  });
});
```

Clicking on a div will change the background **and** foreground color.

This is particularly important when writing reusable code, since otherwise you can't know before hand whether your event handler will be called or not

Although a namespace can be any string, best practise is to name them with dotted-identifier notation. For example, the entwine logic for [controlling the preview panel in the CMS](/developer_guides/customising_the_admin_interface/preview/#javascript) uses the `ss.preview` namespace.

### Namespaces and scope (or What the hell's up with that ugly function closure) {#namespaces-and-scope}

Inside a namespace definition, functions remember the namespace they are in, and calls to other functions will be looked up inside that namespace first.
Where they don't exist (see warning below), they will be looked up in the base namespace

```js
$.entwine('foo', function($) {
  $('div').entwine({
    bar: function() {
      this.baz();
      this.qux();
    },
    baz: function() {
      console.log('baz');
    },
  })
})

$('div').entwine({
  qux: function() {
    console.log('qux');
  },
})
```

With the above entwine declarations, calling

```js
$('div').entwine('foo').bar();
```

Will print this to the console:

```
baz
qux
```

[info]
Note that trying to call `$('div').bar();` would throw an uncaught `TypeError` saying something like "$(...).bar is not a function", because the `bar()` function was defined in a namespace, but we are trying to call that function from _outside_ of that namespace.
[/info]

[warning]
Note that 'exists' means that a function is declared in this namespace for _any_ selector, not just a matching one. Given the dom

```html
<div>Internal text</div>
```

And the entwine definitions

```js
$.entwine('foo', function($) {
  $('div').entwine({
    bar: function() {
      this.baz();
    },
  });

  $('span').entwine({
    baz: function() {
      console.log('a');
    },
  });
})

$('div').entwine({
  baz: function() {
    console.log('b');
  },
});
```

Then calling `$('div')entwine('foo').bar();` will _not_ display "b". Even though the `span` rule could never match a `div`, because `baz()` is defined for some rule in the `foo` namespace, the base namespace will never be checked.
[/warning]

### Calling to another namespace (and forcing base)

Inside a namespace, namespace lookups are by default relative to the current namespace.

In some situations (such as the last example) you may want to force using the base namespace. In this case you can call entwine with the first argument being the base namespace code `'.'`. For example, if the first definition in the previous example was

```js
$.entwine('foo', function($) {
  $('div').entwine({
    bar: function() {
      this.entwine('.').baz();
    },
  })
})
```

Then "b" _would_ be output to the console.

### Nesting namespace blocks

You can also nest namespace declarations. In this next example, we're defining the functions `$().entwine('zap').bar()` and `$().entwine('zap.pow').baz()`

```js
$.entwine('zap', function($) {
  $('div').entwine({
    bar: function() {
      // Some logic here
    },
  });

  $.entwine('pow', function($) {
    $('div').entwine({
      baz: function() {
        // Some logic here
      },
    });
  });
});
```

### Using

Sometimes a block outside of a namespace will need to refer to that namespace repeatedly. By passing a _function_ (instead of an object) to the entwine function, you can change the looked-up namespace.

```js
$('div').entwine('foo', function($) {
  this.bar();
  this.bar();
  this.bar();
});
```

would be the equivalent of

```js
const div = $('div').entwine('foo');
div.bar();
div.bar();
div.bar();
```

Both of the above implementations repeatedly call the `bar()` method which was declared in the `foo` entwine namespace on the element matching `div`.

This is equivalent to the (deprecated) [`with` feature in javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with). Care should be taken to only use this construct in situations that merit it.
