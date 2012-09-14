[oi – cross-browser DOM ready module](https://github.com/ryanve/oi)
==

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

**oi** also provides two simple cross-browser event methods:

```js
oi.addEvent(elem, type, handler);
oi.removeEvent(elem, type, handler);
```

### integration

**oi** has a special method called `.bridge()` designed for integration. Integrated methods include the top-level `.domReady`/`.addEvent`/`.removeEvent` methods. If the `receiver` has an `.fn` object, it will also receive `.fn.ready`. Note that `oi.domReady` and `oi.fn.ready` are identical. The latter is provided purely for integration purposes.

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

jQuery-compatible receivers also get `.fn.ready`:

```js
receiver(document).ready(function (receiver) {
    // This function fires when the DOM is ready.
	// `this === document` in here
});
```

The `.domReady` (and `.fn.ready`) methods both contain both a `.remix()` method that can be used for freeform integration. Use this if you want to create a new version of the ready function which sends multiple custom args. The `.remix()` method returns a new version of itself:

```js
receiver.domReady = oi.domReady.remix(customArg0, customArg1 /*, ...*/);
```

See advanced [#integration notes in the source](https://github.com/ryanve/oi/blob/master/oi.js).