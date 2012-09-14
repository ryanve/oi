[oi](https://github.com/ryanve/oi)
==

cross-browser standalone DOM ready module

**[CDN](http://airve.github.com)**: [dev](http://airve.github.com/js/oi/oi.js) | [min](http://airve.github.com/js/oi/oi.min.js)

```
$ npm install oi
```

Fire a function when the DOM is ready:

```js
oi.domReady(function (oi) {
    // This function fires when the DOM is ready.
	// `this === document` in here
});
```

Note that `oi.domReady` and `oi.fn.ready` are identical. The latter is provided purely for integration purposes.

**oi** also provides two simple cross-browser event methods:

```js
oi.addEvent(elem, type, handler);
oi.removeEvent(elem, type, handler);
```

### integration

Use the `oi.bridge(receiver)` to integrate `oi` into a receiver (or host). Integrated methods include the top-level `.domReady`/`.addEvent`/`.removeEvent` methods. and if the `receiver` has an `.fn` object, it will also receive `.fn.ready`:

```js
oi.bridge(receiver) // integrate `oi`'s public methods into `receiver` (won't overwrite existing props)
oi.bridge(receiver, true) // integrate `oi`'s public methods into `receiver` (overwrites existing props)
```

The default behavior of the `oi.bridge()` makes it so that the `receiver` becomes the first arg passed to fns, like so:

```js
receiver.domReady(function (receiver) {
    // This function fires when the DOM is ready.
	// `this === document` in here
});
```

The `.domReady` (and `.fn.ready`) methods both contain both a `.remix()` method that can be used for freeform integration. Use this if you want to create a new version of the ready function which sends multiple custom args. The `.remix()` method returns a new version of itself:

```js
var customReadyMethod = oi.domReady.remix(customArg0, customArg1 /*, ...*/);
```

See advanced #integration notes in [the source](https://github.com/ryanve/oi/blob/master/oi.js).