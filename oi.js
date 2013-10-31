/*!
 * oi 0.9.5 standalone DOM ready module
 * @author Ryan Van Etten
 * @link http://github.com/ryanve/oi
 * @license MIT
 */

/*jshint expr:true, sub:true, supernew:true, debug:true, node:true, boss:true, devel:true, evil:true, 
  laxcomma:true, eqnull:true, undef:true, unused:true, browser:true, jquery:true, maxerr:10 */
 
(function(root, name, make) {
    typeof module != 'undefined' && module['exports'] ? module['exports'] = make() : root[name] = make();
}(this, 'oi', function() {

    var win = window
      , doc = document
      , docElem = doc.documentElement
      , isW3C = !!doc.addEventListener
      , addEv = isW3C ? function(node, type, fn) { node.addEventListener(type, fn, false); }
                      : function(node, type, fn) { node.attachEvent('on' + type, fn); }
      , remEv = isW3C ? function(node, type, fn) { node.removeEventListener(type, fn, false); }
                      : function(node, type, fn) { node.detachEvent('on' + type, fn); }

      , readyList = [] // fns to fire when the DOM is ready
      , slice = readyList.slice
      , isReady = /^loade|c/.test(doc.readyState) // initial state
      , complete = /^c/   // regex for testing document.readyState
      , needsHack = !!docElem.doScroll
      , readyType = needsHack ? 'onreadystatechange' : 'DOMContentLoaded'

       /**
        * @param {Function}           fn     function to fire when the DOM is ready
        * @param {Array|Arguments}    args   arguments to pass to `fn` when fired
        * @param {(boolean|number)=}  fire   option to force fire
        */
      , pushOrFire = function(fn, args, fire) {
            // Fire using document as scope (like jQuery) and pass args defined @ remixReady.
            // Or, push an object onto the readyList that includes the fn and arguments.
            isReady || fire ? fn.apply(doc, args) : readyList.push([ fn, args ]);
        }

        /** 
         * @link http://github.com/ded/domready
         * @param {Function} fn to fire when the DOM is ready
         * @param {(Array|Arguments)=} args
         */
      , readyLocal = needsHack ? function(fn, args) {
            if (self != top) {
                pushOrFire(fn, args);
            } else try {
                docElem.doScroll('left'); 
                pushOrFire(fn, args, 1);
            } catch (e) {
                return setTimeout(function() {
                    readyLocal(fn, args); 
                }, 50);
            }
        } : pushOrFire;

    // The handler (readyList[0]) calls/flushes the list.
    addEv(doc, readyType, readyList[0] = function() {
        var data;
        if (!needsHack || complete.test(doc.readyState)) {
            remEv(doc, readyType, readyList.shift()); // Remove/delist handler
            isReady = 1; // Record that the DOM is ready.
            while (data = readyList.shift()) pushOrFire(data[0], data[1]);
        }
    });
    
    /** 
     * oi.domReady.remix() Utility for making the public domReady method(s)
     * @param {...}  args 0 or more args that fns passed to domReady will receive
     *   arguments[0] expects a host $ function when applicable
     * @return {Function}
     */    
    function remixReady(args) {
        // make array for faster firing later
        args = slice.call(arguments);

        function readyPublic(fn) {
            readyLocal(fn, args);
            if (this !== win) {
                return this; // chain instance or parent but not the global scope
            }
        }

        // include relay/remix for further remixing (github.com/ryanve/dj)
        readyPublic['remix'] = remixReady; // for freeform extending
        readyPublic['relay'] = relayReady; // for extending via bridge/relay

        return readyPublic;
    }
    
    /**
     * oi.domReady.relay()
     * @param {*=} $
     * @return {Function}
     */
    function relayReady($) {
        return $ ? remixReady($) : remixReady();
    }
    
    /**
     * oi.bridge() Integrate applicable methods into a host.
     * Uses same signature as submix.bridge (github.com/ryanve/submix)
     * @param {Object|Function} r receiver
     * @param {boolean=} force whether to overwrite existing props (default: false)
     * @param {(Function|boolean)=} $ top-level of the host api (default: `r`)
     */
    function bridge(r, force, $) {
        var key, ready, object;
        if (null == r) { return; }
        ready = relayReady($ || r);
        object = {
            'domReady': ready
          , 'addEvent': addEv
          , 'removeEvent': remEv
        };
        force = true === force; // must be explicit
        for (key in object) {
            (force || null == r[key]) && (r[key] = object[key]);
        }
        (key = r['fn']) && (force || null == key['ready']) && (key['ready'] = ready);
        return r;
    }
    bridge['relay'] = false; // signify that this bridge only applies to this module

    /* == #integration notes =================================================

    Use `oi.bridge(receiver)` to integrate domReady/ready into a receiver. By
    default, the receiver will be passed to fns fired via the ready methods. 
    If you want to have a different arg passed, use the 3rd param of bridge() 
    OR use the default bridge and then use the .remix method. The `document` 
    is is used as the scope for jQuery-compatibility. See remixReady. 
         
    In jQuery, handlers added via .on('ready', handler) receive an eventData
    object as the arg and are fired after ones added by $(document).ready
    The other difference is that handlers added via $(document).ready are 
    retro-fired and ones added by .on() are not. In other words, in jQuery, if
    you add a ready handler via .on() after the DOM ready flush has run, it
    will NOT be fired. But if you use $(document).ready or $(handler) it will.
    
    To properly accomplish full integration of domReady into an event library 
    that wants to have jQuery-compatible .on() and .trigger() methods, do this: 

        oi.bridge(ender).fn.ready(function($) {
            var $doc = $(this);
            $doc.trigger && $doc.trigger('ready');
        });

    ========================================================================= */
    return bridge({ 'fn': {}, 'bridge': bridge }, true);
}));