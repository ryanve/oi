/*!
 * oi           Standalone DOM ready module with jQueryish usage and bloody
 *              ballistic integration capabilities. See #integration notes at
 *              the bottom of this file. Based on github.com/ded/domready
 * @author      Ryan Van Etten (c) 2012
 * @link        http://github.com/ryanve/oi
 * @license     MIT
 * @version     0.9.0
 */

/*jslint browser: true, devel: true, node: true, passfail: false, bitwise: true, continue: true
, debug: true, eqeq: true, es5: true, forin: true, newcap: true, nomen: true, plusplus: true
, regexp: true, undef: true, sloppy: true, stupid: true, sub: true, vars: true, white: true
, indent: 4, maxerr: 180 */

(function (root, name, make) {
    'undefined' != typeof module && module['exports'] ? module['exports'] = make() : root[name] = make();
}(this, 'oi', function () {

    // Array notation is used on property names that we don't want the
    // Google Closure Compiler to rename in advanced optimization mode. 
    // developers.google.com/closure/compiler/docs/api-tutorial3
    // developers.google.com/closure/compiler/docs/js-for-compiler

    var win = window
      , doc = document
      , W3C = !!doc.addEventListener
      , add = W3C ? function (node, type, fn) { node.addEventListener(type, fn, false); }
                  : function (node, type, fn) { node.attachEvent('on' + type, fn); }
      , rem = W3C ? function (node, type, fn) { node.removeEventListener(type, fn, false); }
                  : function (node, type, fn) { node.detachEvent('on' + type, fn); }
      , readyStack = []  // fns to fire when the DOM is ready
      , slice = readyStack.slice
      , docElem = doc.documentElement
      , needsHack = !!docElem.doScroll
      , isReady = /^loade|c/.test(doc.readyState) // initial state
      , readyType = needsHack ? 'onreadystatechange' : 'DOMContentLoaded'
      , domReady;  // internal version

    /* 
     * Push the readyStack or, if the DOM is already ready, fire the `fn`
     * @param {Function}          fn         the function to fire when the DOM is ready
     * @param {Array=}            argsArray  is an array of args to supply to `fn`
     * @param {(boolean|number)=} argsArray  is an array of args to supply to `fn`
     */
    function pushOrFire (fn, argsArray, forceFire) {
        if (isReady || forceFire) {
            // Use document as scope (same as jQuery)
            // Supply args defined @ remixReady
            fn.apply(doc, argsArray || []);
        } else {
            // Push an object onto the readyStack that includes the
            // func to fire and the arguments array so that the 
            // arguments are accessible inside flush().
            readyStack.push({ f: fn, a: argsArray });
        }
    }

    /** 
     * Fire all funcs in the readyStack (clearing stack as it's fired)
     */
    function flush() {
        var ob;
        // When the hack is needed, prevent the flush from
        // running until the readyState regex passes:
        if ( needsHack && !(/^c/).test(doc.readyState) ) { return; }
        
        // Remove the listener: 
        rem(doc, readyType, flush);

        // The flush itself only runs once:
        isReady = 1; // Record that the DOM is ready ( see usage in pushOrFire )
        while (ob = readyStack.shift()) {// each object added via pushOrFire
            pushOrFire(ob.f, ob.a);
        }
        readyStack = null;
    }

    // Add the ready listener:
    add(doc, readyType, flush);

    /* 
     * Private `domReady` method:
     * The `argsArray` parameter is for internal use ( but extendable via oi.bridge(yourLib) )
     * @param {Function}  fn            the function to fire when the DOM is ready
     * @param {Array=}    argsArray     is an array of args to supply to `fn`
     */
    domReady = needsHack ? function(fn, argsArray) {
        if (self != top) {
            pushOrFire(fn, argsArray);
        } else {
            try { 
                docElem.doScroll('left'); 
            } catch (e) {
                return setTimeout(function () { 
                    domReady(fn, argsArray); 
                }, 50); 
            }
            pushOrFire(fn, argsArray, true);
        }
    } : pushOrFire;
    
    /** 
     * oi.domReady.remix()    Utility for making the public domReady method(s)
     * @param  {...}  args    are 0 or more args that fns passed to domReady will receive
     * @return {Function}
     */    
    function remixReady(args) {// arguments[0] expected to be host $ function if applicable
        
        args = slice.call(arguments);  // see pushOrFire

        function ready(fn) {// this becomes the actual domReady/.ready method(s)
            domReady(fn, args); // call the outer local domReady method, which takes args
            if (this !== win) { return this; } // chain instance or parent but not the global scope
        }

        // Include the relay/remix methods for further remixing. 
        // See @link github.com/ryanve/dj
        ready['remix'] = remixReady; // for freeform extending.
        ready['relay'] = relayReady; // for extending via bridge/relay
        return ready;
    }
    
    /**
     * oi.domReady.relay()
     * @param  {*=} $
     * @return {Function}
     */
    function relayReady($) {
        return remixReady($ || void 0);
    }
    
    /**
     * oi.bridge()                     Integrate applicable methods into a host. 
     *                                 This `bridge()` is specific to this module, 
     *                                 however it uses the same signature as the
     *                                 library-agnostic `dj.bridge()`, available 
     *                                 @link github.com/ryanve/dj
     * @this  {Object|Function}              supplier
     * @param {Object|Function}        r     receiver
     * @param {boolean=}               force whether to overwrite existing methods (default: false)
     * @param {(Function|boolean)=}    $     the top-level of the host api. (default: `r`)
     */
    function bridge(r, force, $) {

        var ready, effin;
        if (!r) { return; }
        force = true === force; // require explicit true to force
        $ = typeof $ == 'function' || $ === false ? $ : r; // allow null
        
        if (force || r['domReady'] == null) {
            r['domReady'] = ready = relayReady($);
        }
        
        if (effin = r['fn']) {
            if (force || null == effin['ready']) {
                effin['ready'] = ready || relayReady($);
            }
        }
        
        if (force || null == r['addEvent']) {
            r['addEvent'] = add; 
        }

        if (force || null == r['removeEvent']) { 
            r['removeEvent'] = rem; 
        }
        
        return r; // the receiver - allows for `oi.bridge({fn: {}})`
    }
    bridge['relay'] = false; // signify that this bridge only applies to this module


    /* == #integration notes =================================================
     
    Use `oi.bridge(receiver)` to integrate domReady/ready into the receiver. By
    default, the receiver will become the first arg passed to fns fired via the 
    ready methods. This is probably what you'll want to do. But if you want to have
    a different arg passed, use the 3rd  param of bridge() OR use the default bridge 
    and then use the .remix method. (See remixReady.)
     
    In fns passed to domReady/.ready methods created via bridge/relay
    the scope `this === document` (same as in jQuery) and the first arg 
    can be specified to host the host lib. ( see bridge() && remixReady() ) 
         
    In jQuery, handlers added via .on('ready', handler) receive an eventData
    object as the arg and are fired after ones added by $(document).ready
    The other difference is that handlers added via $(document).ready are 
    retro-fired and ones added by .on() are not. In other words, in jQuery, if
    you add a ready handler via .on() after the DOM ready flush has happened
    it will NOT be fired. But if you use $(document).ready or $(handler) it will.
    
    To properly accomplish full integration of domReady into an event library 
    that wants to have jQuery-compatible .on() and .trigger() methods, do this: 

        oi.bridge(ender);        // integrate domReady/.ready into ender
        ender.fn.ready(function ($) {  // fat/bean, ryanve/elo, and other event libs can do this
            var $doc = $(this);
            $doc.trigger && $doc.trigger('ready');
        });

    ========================================================================= */

    // create the export:
    return bridge({ 'fn': {}, 'bridge': bridge });

}));