(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
//  Ramda v0.22.1
//  https://github.com/ramda/ramda
//  (c) 2013-2016 Scott Sauyet, Michael Hurley, and David Chambers
//  Ramda may be freely distributed under the MIT license.

;(function() {

  'use strict';

  /**
     * A special placeholder value used to specify "gaps" within curried functions,
     * allowing partial application of any combination of arguments, regardless of
     * their positions.
     *
     * If `g` is a curried ternary function and `_` is `R.__`, the following are
     * equivalent:
     *
     *   - `g(1, 2, 3)`
     *   - `g(_, 2, 3)(1)`
     *   - `g(_, _, 3)(1)(2)`
     *   - `g(_, _, 3)(1, 2)`
     *   - `g(_, 2, _)(1, 3)`
     *   - `g(_, 2)(1)(3)`
     *   - `g(_, 2)(1, 3)`
     *   - `g(_, 2)(_, 3)(1)`
     *
     * @constant
     * @memberOf R
     * @since v0.6.0
     * @category Function
     * @example
     *
     *      var greet = R.replace('{name}', R.__, 'Hello, {name}!');
     *      greet('Alice'); //=> 'Hello, Alice!'
     */
    var __ = { '@@functional/placeholder': true };

    /* eslint-disable no-unused-vars */
    var _arity = function _arity(n, fn) {
        /* eslint-disable no-unused-vars */
        switch (n) {
        case 0:
            return function () {
                return fn.apply(this, arguments);
            };
        case 1:
            return function (a0) {
                return fn.apply(this, arguments);
            };
        case 2:
            return function (a0, a1) {
                return fn.apply(this, arguments);
            };
        case 3:
            return function (a0, a1, a2) {
                return fn.apply(this, arguments);
            };
        case 4:
            return function (a0, a1, a2, a3) {
                return fn.apply(this, arguments);
            };
        case 5:
            return function (a0, a1, a2, a3, a4) {
                return fn.apply(this, arguments);
            };
        case 6:
            return function (a0, a1, a2, a3, a4, a5) {
                return fn.apply(this, arguments);
            };
        case 7:
            return function (a0, a1, a2, a3, a4, a5, a6) {
                return fn.apply(this, arguments);
            };
        case 8:
            return function (a0, a1, a2, a3, a4, a5, a6, a7) {
                return fn.apply(this, arguments);
            };
        case 9:
            return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
                return fn.apply(this, arguments);
            };
        case 10:
            return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                return fn.apply(this, arguments);
            };
        default:
            throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
        }
    };

    var _arrayFromIterator = function _arrayFromIterator(iter) {
        var list = [];
        var next;
        while (!(next = iter.next()).done) {
            list.push(next.value);
        }
        return list;
    };

    var _arrayOf = function _arrayOf() {
        return Array.prototype.slice.call(arguments);
    };

    var _cloneRegExp = function _cloneRegExp(pattern) {
        return new RegExp(pattern.source, (pattern.global ? 'g' : '') + (pattern.ignoreCase ? 'i' : '') + (pattern.multiline ? 'm' : '') + (pattern.sticky ? 'y' : '') + (pattern.unicode ? 'u' : ''));
    };

    var _complement = function _complement(f) {
        return function () {
            return !f.apply(this, arguments);
        };
    };

    /**
     * Private `concat` function to merge two array-like objects.
     *
     * @private
     * @param {Array|Arguments} [set1=[]] An array-like object.
     * @param {Array|Arguments} [set2=[]] An array-like object.
     * @return {Array} A new, merged array.
     * @example
     *
     *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
     */
    var _concat = function _concat(set1, set2) {
        set1 = set1 || [];
        set2 = set2 || [];
        var idx;
        var len1 = set1.length;
        var len2 = set2.length;
        var result = [];
        idx = 0;
        while (idx < len1) {
            result[result.length] = set1[idx];
            idx += 1;
        }
        idx = 0;
        while (idx < len2) {
            result[result.length] = set2[idx];
            idx += 1;
        }
        return result;
    };

    var _containsWith = function _containsWith(pred, x, list) {
        var idx = 0;
        var len = list.length;
        while (idx < len) {
            if (pred(x, list[idx])) {
                return true;
            }
            idx += 1;
        }
        return false;
    };

    var _filter = function _filter(fn, list) {
        var idx = 0;
        var len = list.length;
        var result = [];
        while (idx < len) {
            if (fn(list[idx])) {
                result[result.length] = list[idx];
            }
            idx += 1;
        }
        return result;
    };

    var _forceReduced = function _forceReduced(x) {
        return {
            '@@transducer/value': x,
            '@@transducer/reduced': true
        };
    };

    // String(x => x) evaluates to "x => x", so the pattern may not match.
    var _functionName = function _functionName(f) {
        // String(x => x) evaluates to "x => x", so the pattern may not match.
        var match = String(f).match(/^function (\w*)/);
        return match == null ? '' : match[1];
    };

    var _has = function _has(prop, obj) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    var _identity = function _identity(x) {
        return x;
    };

    var _isArguments = function () {
        var toString = Object.prototype.toString;
        return toString.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
            return toString.call(x) === '[object Arguments]';
        } : function _isArguments(x) {
            return _has('callee', x);
        };
    }();

    /**
     * Tests whether or not an object is an array.
     *
     * @private
     * @param {*} val The object to test.
     * @return {Boolean} `true` if `val` is an array, `false` otherwise.
     * @example
     *
     *      _isArray([]); //=> true
     *      _isArray(null); //=> false
     *      _isArray({}); //=> false
     */
    var _isArray = Array.isArray || function _isArray(val) {
        return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
    };

    var _isFunction = function _isFunction(x) {
        return Object.prototype.toString.call(x) === '[object Function]';
    };

    /**
     * Determine if the passed argument is an integer.
     *
     * @private
     * @param {*} n
     * @category Type
     * @return {Boolean}
     */
    var _isInteger = Number.isInteger || function _isInteger(n) {
        return n << 0 === n;
    };

    var _isNumber = function _isNumber(x) {
        return Object.prototype.toString.call(x) === '[object Number]';
    };

    var _isObject = function _isObject(x) {
        return Object.prototype.toString.call(x) === '[object Object]';
    };

    var _isPlaceholder = function _isPlaceholder(a) {
        return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
    };

    var _isRegExp = function _isRegExp(x) {
        return Object.prototype.toString.call(x) === '[object RegExp]';
    };

    var _isString = function _isString(x) {
        return Object.prototype.toString.call(x) === '[object String]';
    };

    var _isTransformer = function _isTransformer(obj) {
        return typeof obj['@@transducer/step'] === 'function';
    };

    var _map = function _map(fn, functor) {
        var idx = 0;
        var len = functor.length;
        var result = Array(len);
        while (idx < len) {
            result[idx] = fn(functor[idx]);
            idx += 1;
        }
        return result;
    };

    // Based on https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    var _objectAssign = function _objectAssign(target) {
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var output = Object(target);
        var idx = 1;
        var length = arguments.length;
        while (idx < length) {
            var source = arguments[idx];
            if (source != null) {
                for (var nextKey in source) {
                    if (_has(nextKey, source)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
            idx += 1;
        }
        return output;
    };

    var _of = function _of(x) {
        return [x];
    };

    var _pipe = function _pipe(f, g) {
        return function () {
            return g.call(this, f.apply(this, arguments));
        };
    };

    var _pipeP = function _pipeP(f, g) {
        return function () {
            var ctx = this;
            return f.apply(ctx, arguments).then(function (x) {
                return g.call(ctx, x);
            });
        };
    };

    // \b matches word boundary; [\b] matches backspace
    var _quote = function _quote(s) {
        var escaped = s.replace(/\\/g, '\\\\').replace(/[\b]/g, '\\b')    // \b matches word boundary; [\b] matches backspace
    .replace(/\f/g, '\\f').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\v/g, '\\v').replace(/\0/g, '\\0');
        return '"' + escaped.replace(/"/g, '\\"') + '"';
    };

    var _reduced = function _reduced(x) {
        return x && x['@@transducer/reduced'] ? x : {
            '@@transducer/value': x,
            '@@transducer/reduced': true
        };
    };

    /**
     * An optimized, private array `slice` implementation.
     *
     * @private
     * @param {Arguments|Array} args The array or arguments object to consider.
     * @param {Number} [from=0] The array index to slice from, inclusive.
     * @param {Number} [to=args.length] The array index to slice to, exclusive.
     * @return {Array} A new, sliced array.
     * @example
     *
     *      _slice([1, 2, 3, 4, 5], 1, 3); //=> [2, 3]
     *
     *      var firstThreeArgs = function(a, b, c, d) {
     *        return _slice(arguments, 0, 3);
     *      };
     *      firstThreeArgs(1, 2, 3, 4); //=> [1, 2, 3]
     */
    var _slice = function _slice(args, from, to) {
        switch (arguments.length) {
        case 1:
            return _slice(args, 0, args.length);
        case 2:
            return _slice(args, from, args.length);
        default:
            var list = [];
            var idx = 0;
            var len = Math.max(0, Math.min(args.length, to) - from);
            while (idx < len) {
                list[idx] = args[from + idx];
                idx += 1;
            }
            return list;
        }
    };

    /**
     * Polyfill from <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString>.
     */
    var _toISOString = function () {
        var pad = function pad(n) {
            return (n < 10 ? '0' : '') + n;
        };
        return typeof Date.prototype.toISOString === 'function' ? function _toISOString(d) {
            return d.toISOString();
        } : function _toISOString(d) {
            return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + '.' + (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';
        };
    }();

    var _xfBase = {
        init: function () {
            return this.xf['@@transducer/init']();
        },
        result: function (result) {
            return this.xf['@@transducer/result'](result);
        }
    };

    var _xwrap = function () {
        function XWrap(fn) {
            this.f = fn;
        }
        XWrap.prototype['@@transducer/init'] = function () {
            throw new Error('init not implemented on XWrap');
        };
        XWrap.prototype['@@transducer/result'] = function (acc) {
            return acc;
        };
        XWrap.prototype['@@transducer/step'] = function (acc, x) {
            return this.f(acc, x);
        };
        return function _xwrap(fn) {
            return new XWrap(fn);
        };
    }();

    var _aperture = function _aperture(n, list) {
        var idx = 0;
        var limit = list.length - (n - 1);
        var acc = new Array(limit >= 0 ? limit : 0);
        while (idx < limit) {
            acc[idx] = _slice(list, idx, idx + n);
            idx += 1;
        }
        return acc;
    };

    var _assign = typeof Object.assign === 'function' ? Object.assign : _objectAssign;

    /**
     * Similar to hasMethod, this checks whether a function has a [methodname]
     * function. If it isn't an array it will execute that function otherwise it
     * will default to the ramda implementation.
     *
     * @private
     * @param {Function} fn ramda implemtation
     * @param {String} methodname property to check for a custom implementation
     * @return {Object} Whatever the return value of the method is.
     */
    var _checkForMethod = function _checkForMethod(methodname, fn) {
        return function () {
            var length = arguments.length;
            if (length === 0) {
                return fn();
            }
            var obj = arguments[length - 1];
            return _isArray(obj) || typeof obj[methodname] !== 'function' ? fn.apply(this, arguments) : obj[methodname].apply(obj, _slice(arguments, 0, length - 1));
        };
    };

    /**
     * Optimized internal one-arity curry function.
     *
     * @private
     * @category Function
     * @param {Function} fn The function to curry.
     * @return {Function} The curried function.
     */
    var _curry1 = function _curry1(fn) {
        return function f1(a) {
            if (arguments.length === 0 || _isPlaceholder(a)) {
                return f1;
            } else {
                return fn.apply(this, arguments);
            }
        };
    };

    /**
     * Optimized internal two-arity curry function.
     *
     * @private
     * @category Function
     * @param {Function} fn The function to curry.
     * @return {Function} The curried function.
     */
    var _curry2 = function _curry2(fn) {
        return function f2(a, b) {
            switch (arguments.length) {
            case 0:
                return f2;
            case 1:
                return _isPlaceholder(a) ? f2 : _curry1(function (_b) {
                    return fn(a, _b);
                });
            default:
                return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {
                    return fn(_a, b);
                }) : _isPlaceholder(b) ? _curry1(function (_b) {
                    return fn(a, _b);
                }) : fn(a, b);
            }
        };
    };

    /**
     * Optimized internal three-arity curry function.
     *
     * @private
     * @category Function
     * @param {Function} fn The function to curry.
     * @return {Function} The curried function.
     */
    var _curry3 = function _curry3(fn) {
        return function f3(a, b, c) {
            switch (arguments.length) {
            case 0:
                return f3;
            case 1:
                return _isPlaceholder(a) ? f3 : _curry2(function (_b, _c) {
                    return fn(a, _b, _c);
                });
            case 2:
                return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function (_a, _c) {
                    return fn(_a, b, _c);
                }) : _isPlaceholder(b) ? _curry2(function (_b, _c) {
                    return fn(a, _b, _c);
                }) : _curry1(function (_c) {
                    return fn(a, b, _c);
                });
            default:
                return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function (_a, _b) {
                    return fn(_a, _b, c);
                }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function (_a, _c) {
                    return fn(_a, b, _c);
                }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function (_b, _c) {
                    return fn(a, _b, _c);
                }) : _isPlaceholder(a) ? _curry1(function (_a) {
                    return fn(_a, b, c);
                }) : _isPlaceholder(b) ? _curry1(function (_b) {
                    return fn(a, _b, c);
                }) : _isPlaceholder(c) ? _curry1(function (_c) {
                    return fn(a, b, _c);
                }) : fn(a, b, c);
            }
        };
    };

    /**
     * Internal curryN function.
     *
     * @private
     * @category Function
     * @param {Number} length The arity of the curried function.
     * @param {Array} received An array of arguments received thus far.
     * @param {Function} fn The function to curry.
     * @return {Function} The curried function.
     */
    var _curryN = function _curryN(length, received, fn) {
        return function () {
            var combined = [];
            var argsIdx = 0;
            var left = length;
            var combinedIdx = 0;
            while (combinedIdx < received.length || argsIdx < arguments.length) {
                var result;
                if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
                    result = received[combinedIdx];
                } else {
                    result = arguments[argsIdx];
                    argsIdx += 1;
                }
                combined[combinedIdx] = result;
                if (!_isPlaceholder(result)) {
                    left -= 1;
                }
                combinedIdx += 1;
            }
            return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
        };
    };

    /**
     * Returns a function that dispatches with different strategies based on the
     * object in list position (last argument). If it is an array, executes [fn].
     * Otherwise, if it has a function with [methodname], it will execute that
     * function (functor case). Otherwise, if it is a transformer, uses transducer
     * [xf] to return a new transformer (transducer case). Otherwise, it will
     * default to executing [fn].
     *
     * @private
     * @param {String} methodname property to check for a custom implementation
     * @param {Function} xf transducer to initialize if object is transformer
     * @param {Function} fn default ramda implementation
     * @return {Function} A function that dispatches on object in list position
     */
    var _dispatchable = function _dispatchable(methodname, xf, fn) {
        return function () {
            var length = arguments.length;
            if (length === 0) {
                return fn();
            }
            var obj = arguments[length - 1];
            if (!_isArray(obj)) {
                var args = _slice(arguments, 0, length - 1);
                if (typeof obj[methodname] === 'function') {
                    return obj[methodname].apply(obj, args);
                }
                if (_isTransformer(obj)) {
                    var transducer = xf.apply(null, args);
                    return transducer(obj);
                }
            }
            return fn.apply(this, arguments);
        };
    };

    var _dropLastWhile = function dropLastWhile(pred, list) {
        var idx = list.length - 1;
        while (idx >= 0 && pred(list[idx])) {
            idx -= 1;
        }
        return _slice(list, 0, idx + 1);
    };

    var _xall = function () {
        function XAll(f, xf) {
            this.xf = xf;
            this.f = f;
            this.all = true;
        }
        XAll.prototype['@@transducer/init'] = _xfBase.init;
        XAll.prototype['@@transducer/result'] = function (result) {
            if (this.all) {
                result = this.xf['@@transducer/step'](result, true);
            }
            return this.xf['@@transducer/result'](result);
        };
        XAll.prototype['@@transducer/step'] = function (result, input) {
            if (!this.f(input)) {
                this.all = false;
                result = _reduced(this.xf['@@transducer/step'](result, false));
            }
            return result;
        };
        return _curry2(function _xall(f, xf) {
            return new XAll(f, xf);
        });
    }();

    var _xany = function () {
        function XAny(f, xf) {
            this.xf = xf;
            this.f = f;
            this.any = false;
        }
        XAny.prototype['@@transducer/init'] = _xfBase.init;
        XAny.prototype['@@transducer/result'] = function (result) {
            if (!this.any) {
                result = this.xf['@@transducer/step'](result, false);
            }
            return this.xf['@@transducer/result'](result);
        };
        XAny.prototype['@@transducer/step'] = function (result, input) {
            if (this.f(input)) {
                this.any = true;
                result = _reduced(this.xf['@@transducer/step'](result, true));
            }
            return result;
        };
        return _curry2(function _xany(f, xf) {
            return new XAny(f, xf);
        });
    }();

    var _xaperture = function () {
        function XAperture(n, xf) {
            this.xf = xf;
            this.pos = 0;
            this.full = false;
            this.acc = new Array(n);
        }
        XAperture.prototype['@@transducer/init'] = _xfBase.init;
        XAperture.prototype['@@transducer/result'] = function (result) {
            this.acc = null;
            return this.xf['@@transducer/result'](result);
        };
        XAperture.prototype['@@transducer/step'] = function (result, input) {
            this.store(input);
            return this.full ? this.xf['@@transducer/step'](result, this.getCopy()) : result;
        };
        XAperture.prototype.store = function (input) {
            this.acc[this.pos] = input;
            this.pos += 1;
            if (this.pos === this.acc.length) {
                this.pos = 0;
                this.full = true;
            }
        };
        XAperture.prototype.getCopy = function () {
            return _concat(_slice(this.acc, this.pos), _slice(this.acc, 0, this.pos));
        };
        return _curry2(function _xaperture(n, xf) {
            return new XAperture(n, xf);
        });
    }();

    var _xdrop = function () {
        function XDrop(n, xf) {
            this.xf = xf;
            this.n = n;
        }
        XDrop.prototype['@@transducer/init'] = _xfBase.init;
        XDrop.prototype['@@transducer/result'] = _xfBase.result;
        XDrop.prototype['@@transducer/step'] = function (result, input) {
            if (this.n > 0) {
                this.n -= 1;
                return result;
            }
            return this.xf['@@transducer/step'](result, input);
        };
        return _curry2(function _xdrop(n, xf) {
            return new XDrop(n, xf);
        });
    }();

    var _xdropLast = function () {
        function XDropLast(n, xf) {
            this.xf = xf;
            this.pos = 0;
            this.full = false;
            this.acc = new Array(n);
        }
        XDropLast.prototype['@@transducer/init'] = _xfBase.init;
        XDropLast.prototype['@@transducer/result'] = function (result) {
            this.acc = null;
            return this.xf['@@transducer/result'](result);
        };
        XDropLast.prototype['@@transducer/step'] = function (result, input) {
            if (this.full) {
                result = this.xf['@@transducer/step'](result, this.acc[this.pos]);
            }
            this.store(input);
            return result;
        };
        XDropLast.prototype.store = function (input) {
            this.acc[this.pos] = input;
            this.pos += 1;
            if (this.pos === this.acc.length) {
                this.pos = 0;
                this.full = true;
            }
        };
        return _curry2(function _xdropLast(n, xf) {
            return new XDropLast(n, xf);
        });
    }();

    var _xdropRepeatsWith = function () {
        function XDropRepeatsWith(pred, xf) {
            this.xf = xf;
            this.pred = pred;
            this.lastValue = undefined;
            this.seenFirstValue = false;
        }
        XDropRepeatsWith.prototype['@@transducer/init'] = function () {
            return this.xf['@@transducer/init']();
        };
        XDropRepeatsWith.prototype['@@transducer/result'] = function (result) {
            return this.xf['@@transducer/result'](result);
        };
        XDropRepeatsWith.prototype['@@transducer/step'] = function (result, input) {
            var sameAsLast = false;
            if (!this.seenFirstValue) {
                this.seenFirstValue = true;
            } else if (this.pred(this.lastValue, input)) {
                sameAsLast = true;
            }
            this.lastValue = input;
            return sameAsLast ? result : this.xf['@@transducer/step'](result, input);
        };
        return _curry2(function _xdropRepeatsWith(pred, xf) {
            return new XDropRepeatsWith(pred, xf);
        });
    }();

    var _xdropWhile = function () {
        function XDropWhile(f, xf) {
            this.xf = xf;
            this.f = f;
        }
        XDropWhile.prototype['@@transducer/init'] = _xfBase.init;
        XDropWhile.prototype['@@transducer/result'] = _xfBase.result;
        XDropWhile.prototype['@@transducer/step'] = function (result, input) {
            if (this.f) {
                if (this.f(input)) {
                    return result;
                }
                this.f = null;
            }
            return this.xf['@@transducer/step'](result, input);
        };
        return _curry2(function _xdropWhile(f, xf) {
            return new XDropWhile(f, xf);
        });
    }();

    var _xfilter = function () {
        function XFilter(f, xf) {
            this.xf = xf;
            this.f = f;
        }
        XFilter.prototype['@@transducer/init'] = _xfBase.init;
        XFilter.prototype['@@transducer/result'] = _xfBase.result;
        XFilter.prototype['@@transducer/step'] = function (result, input) {
            return this.f(input) ? this.xf['@@transducer/step'](result, input) : result;
        };
        return _curry2(function _xfilter(f, xf) {
            return new XFilter(f, xf);
        });
    }();

    var _xfind = function () {
        function XFind(f, xf) {
            this.xf = xf;
            this.f = f;
            this.found = false;
        }
        XFind.prototype['@@transducer/init'] = _xfBase.init;
        XFind.prototype['@@transducer/result'] = function (result) {
            if (!this.found) {
                result = this.xf['@@transducer/step'](result, void 0);
            }
            return this.xf['@@transducer/result'](result);
        };
        XFind.prototype['@@transducer/step'] = function (result, input) {
            if (this.f(input)) {
                this.found = true;
                result = _reduced(this.xf['@@transducer/step'](result, input));
            }
            return result;
        };
        return _curry2(function _xfind(f, xf) {
            return new XFind(f, xf);
        });
    }();

    var _xfindIndex = function () {
        function XFindIndex(f, xf) {
            this.xf = xf;
            this.f = f;
            this.idx = -1;
            this.found = false;
        }
        XFindIndex.prototype['@@transducer/init'] = _xfBase.init;
        XFindIndex.prototype['@@transducer/result'] = function (result) {
            if (!this.found) {
                result = this.xf['@@transducer/step'](result, -1);
            }
            return this.xf['@@transducer/result'](result);
        };
        XFindIndex.prototype['@@transducer/step'] = function (result, input) {
            this.idx += 1;
            if (this.f(input)) {
                this.found = true;
                result = _reduced(this.xf['@@transducer/step'](result, this.idx));
            }
            return result;
        };
        return _curry2(function _xfindIndex(f, xf) {
            return new XFindIndex(f, xf);
        });
    }();

    var _xfindLast = function () {
        function XFindLast(f, xf) {
            this.xf = xf;
            this.f = f;
        }
        XFindLast.prototype['@@transducer/init'] = _xfBase.init;
        XFindLast.prototype['@@transducer/result'] = function (result) {
            return this.xf['@@transducer/result'](this.xf['@@transducer/step'](result, this.last));
        };
        XFindLast.prototype['@@transducer/step'] = function (result, input) {
            if (this.f(input)) {
                this.last = input;
            }
            return result;
        };
        return _curry2(function _xfindLast(f, xf) {
            return new XFindLast(f, xf);
        });
    }();

    var _xfindLastIndex = function () {
        function XFindLastIndex(f, xf) {
            this.xf = xf;
            this.f = f;
            this.idx = -1;
            this.lastIdx = -1;
        }
        XFindLastIndex.prototype['@@transducer/init'] = _xfBase.init;
        XFindLastIndex.prototype['@@transducer/result'] = function (result) {
            return this.xf['@@transducer/result'](this.xf['@@transducer/step'](result, this.lastIdx));
        };
        XFindLastIndex.prototype['@@transducer/step'] = function (result, input) {
            this.idx += 1;
            if (this.f(input)) {
                this.lastIdx = this.idx;
            }
            return result;
        };
        return _curry2(function _xfindLastIndex(f, xf) {
            return new XFindLastIndex(f, xf);
        });
    }();

    var _xmap = function () {
        function XMap(f, xf) {
            this.xf = xf;
            this.f = f;
        }
        XMap.prototype['@@transducer/init'] = _xfBase.init;
        XMap.prototype['@@transducer/result'] = _xfBase.result;
        XMap.prototype['@@transducer/step'] = function (result, input) {
            return this.xf['@@transducer/step'](result, this.f(input));
        };
        return _curry2(function _xmap(f, xf) {
            return new XMap(f, xf);
        });
    }();

    var _xreduceBy = function () {
        function XReduceBy(valueFn, valueAcc, keyFn, xf) {
            this.valueFn = valueFn;
            this.valueAcc = valueAcc;
            this.keyFn = keyFn;
            this.xf = xf;
            this.inputs = {};
        }
        XReduceBy.prototype['@@transducer/init'] = _xfBase.init;
        XReduceBy.prototype['@@transducer/result'] = function (result) {
            var key;
            for (key in this.inputs) {
                if (_has(key, this.inputs)) {
                    result = this.xf['@@transducer/step'](result, this.inputs[key]);
                    if (result['@@transducer/reduced']) {
                        result = result['@@transducer/value'];
                        break;
                    }
                }
            }
            this.inputs = null;
            return this.xf['@@transducer/result'](result);
        };
        XReduceBy.prototype['@@transducer/step'] = function (result, input) {
            var key = this.keyFn(input);
            this.inputs[key] = this.inputs[key] || [
                key,
                this.valueAcc
            ];
            this.inputs[key][1] = this.valueFn(this.inputs[key][1], input);
            return result;
        };
        return _curryN(4, [], function _xreduceBy(valueFn, valueAcc, keyFn, xf) {
            return new XReduceBy(valueFn, valueAcc, keyFn, xf);
        });
    }();

    var _xtake = function () {
        function XTake(n, xf) {
            this.xf = xf;
            this.n = n;
            this.i = 0;
        }
        XTake.prototype['@@transducer/init'] = _xfBase.init;
        XTake.prototype['@@transducer/result'] = _xfBase.result;
        XTake.prototype['@@transducer/step'] = function (result, input) {
            this.i += 1;
            var ret = this.n === 0 ? result : this.xf['@@transducer/step'](result, input);
            return this.i >= this.n ? _reduced(ret) : ret;
        };
        return _curry2(function _xtake(n, xf) {
            return new XTake(n, xf);
        });
    }();

    var _xtakeWhile = function () {
        function XTakeWhile(f, xf) {
            this.xf = xf;
            this.f = f;
        }
        XTakeWhile.prototype['@@transducer/init'] = _xfBase.init;
        XTakeWhile.prototype['@@transducer/result'] = _xfBase.result;
        XTakeWhile.prototype['@@transducer/step'] = function (result, input) {
            return this.f(input) ? this.xf['@@transducer/step'](result, input) : _reduced(result);
        };
        return _curry2(function _xtakeWhile(f, xf) {
            return new XTakeWhile(f, xf);
        });
    }();

    /**
     * Adds two values.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Math
     * @sig Number -> Number -> Number
     * @param {Number} a
     * @param {Number} b
     * @return {Number}
     * @see R.subtract
     * @example
     *
     *      R.add(2, 3);       //=>  5
     *      R.add(7)(10);      //=> 17
     */
    var add = _curry2(function add(a, b) {
        return Number(a) + Number(b);
    });

    /**
     * Applies a function to the value at the given index of an array, returning a
     * new copy of the array with the element at the given index replaced with the
     * result of the function application.
     *
     * @func
     * @memberOf R
     * @since v0.14.0
     * @category List
     * @sig (a -> a) -> Number -> [a] -> [a]
     * @param {Function} fn The function to apply.
     * @param {Number} idx The index.
     * @param {Array|Arguments} list An array-like object whose value
     *        at the supplied index will be replaced.
     * @return {Array} A copy of the supplied array-like object with
     *         the element at index `idx` replaced with the value
     *         returned by applying `fn` to the existing element.
     * @see R.update
     * @example
     *
     *      R.adjust(R.add(10), 1, [0, 1, 2]);     //=> [0, 11, 2]
     *      R.adjust(R.add(10))(1)([0, 1, 2]);     //=> [0, 11, 2]
     */
    var adjust = _curry3(function adjust(fn, idx, list) {
        if (idx >= list.length || idx < -list.length) {
            return list;
        }
        var start = idx < 0 ? list.length : 0;
        var _idx = start + idx;
        var _list = _concat(list);
        _list[_idx] = fn(list[_idx]);
        return _list;
    });

    /**
     * Returns `true` if all elements of the list match the predicate, `false` if
     * there are any that don't.
     *
     * Dispatches to the `all` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig (a -> Boolean) -> [a] -> Boolean
     * @param {Function} fn The predicate function.
     * @param {Array} list The array to consider.
     * @return {Boolean} `true` if the predicate is satisfied by every element, `false`
     *         otherwise.
     * @see R.any, R.none, R.transduce
     * @example
     *
     *      var lessThan2 = R.flip(R.lt)(2);
     *      var lessThan3 = R.flip(R.lt)(3);
     *      R.all(lessThan2)([1, 2]); //=> false
     *      R.all(lessThan3)([1, 2]); //=> true
     */
    var all = _curry2(_dispatchable('all', _xall, function all(fn, list) {
        var idx = 0;
        while (idx < list.length) {
            if (!fn(list[idx])) {
                return false;
            }
            idx += 1;
        }
        return true;
    }));

    /**
     * Returns a function that always returns the given value. Note that for
     * non-primitives the value returned is a reference to the original value.
     *
     * This function is known as `const`, `constant`, or `K` (for K combinator) in
     * other languages and libraries.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig a -> (* -> a)
     * @param {*} val The value to wrap in a function
     * @return {Function} A Function :: * -> val.
     * @example
     *
     *      var t = R.always('Tee');
     *      t(); //=> 'Tee'
     */
    var always = _curry1(function always(val) {
        return function () {
            return val;
        };
    });

    /**
     * Returns `true` if both arguments are `true`; `false` otherwise.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Logic
     * @sig * -> * -> *
     * @param {Boolean} a A boolean value
     * @param {Boolean} b A boolean value
     * @return {Boolean} `true` if both arguments are `true`, `false` otherwise
     * @see R.both
     * @example
     *
     *      R.and(true, true); //=> true
     *      R.and(true, false); //=> false
     *      R.and(false, true); //=> false
     *      R.and(false, false); //=> false
     */
    var and = _curry2(function and(a, b) {
        return a && b;
    });

    /**
     * Returns `true` if at least one of elements of the list match the predicate,
     * `false` otherwise.
     *
     * Dispatches to the `any` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig (a -> Boolean) -> [a] -> Boolean
     * @param {Function} fn The predicate function.
     * @param {Array} list The array to consider.
     * @return {Boolean} `true` if the predicate is satisfied by at least one element, `false`
     *         otherwise.
     * @see R.all, R.none, R.transduce
     * @example
     *
     *      var lessThan0 = R.flip(R.lt)(0);
     *      var lessThan2 = R.flip(R.lt)(2);
     *      R.any(lessThan0)([1, 2]); //=> false
     *      R.any(lessThan2)([1, 2]); //=> true
     */
    var any = _curry2(_dispatchable('any', _xany, function any(fn, list) {
        var idx = 0;
        while (idx < list.length) {
            if (fn(list[idx])) {
                return true;
            }
            idx += 1;
        }
        return false;
    }));

    /**
     * Returns a new list, composed of n-tuples of consecutive elements If `n` is
     * greater than the length of the list, an empty list is returned.
     *
     * Dispatches to the `aperture` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.12.0
     * @category List
     * @sig Number -> [a] -> [[a]]
     * @param {Number} n The size of the tuples to create
     * @param {Array} list The list to split into `n`-tuples
     * @return {Array} The new list.
     * @see R.transduce
     * @example
     *
     *      R.aperture(2, [1, 2, 3, 4, 5]); //=> [[1, 2], [2, 3], [3, 4], [4, 5]]
     *      R.aperture(3, [1, 2, 3, 4, 5]); //=> [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
     *      R.aperture(7, [1, 2, 3, 4, 5]); //=> []
     */
    var aperture = _curry2(_dispatchable('aperture', _xaperture, _aperture));

    /**
     * Returns a new list containing the contents of the given list, followed by
     * the given element.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig a -> [a] -> [a]
     * @param {*} el The element to add to the end of the new list.
     * @param {Array} list The list whose contents will be added to the beginning of the output
     *        list.
     * @return {Array} A new list containing the contents of the old list followed by `el`.
     * @see R.prepend
     * @example
     *
     *      R.append('tests', ['write', 'more']); //=> ['write', 'more', 'tests']
     *      R.append('tests', []); //=> ['tests']
     *      R.append(['tests'], ['write', 'more']); //=> ['write', 'more', ['tests']]
     */
    var append = _curry2(function append(el, list) {
        return _concat(list, [el]);
    });

    /**
     * Applies function `fn` to the argument list `args`. This is useful for
     * creating a fixed-arity function from a variadic function. `fn` should be a
     * bound function if context is significant.
     *
     * @func
     * @memberOf R
     * @since v0.7.0
     * @category Function
     * @sig (*... -> a) -> [*] -> a
     * @param {Function} fn
     * @param {Array} args
     * @return {*}
     * @see R.call, R.unapply
     * @example
     *
     *      var nums = [1, 2, 3, -99, 42, 6, 7];
     *      R.apply(Math.max, nums); //=> 42
     */
    var apply = _curry2(function apply(fn, args) {
        return fn.apply(this, args);
    });

    /**
     * Makes a shallow clone of an object, setting or overriding the specified
     * property with the given value. Note that this copies and flattens prototype
     * properties onto the new object as well. All non-primitive properties are
     * copied by reference.
     *
     * @func
     * @memberOf R
     * @since v0.8.0
     * @category Object
     * @sig String -> a -> {k: v} -> {k: v}
     * @param {String} prop the property name to set
     * @param {*} val the new value
     * @param {Object} obj the object to clone
     * @return {Object} a new object similar to the original except for the specified property.
     * @see R.dissoc
     * @example
     *
     *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}
     */
    var assoc = _curry3(function assoc(prop, val, obj) {
        var result = {};
        for (var p in obj) {
            result[p] = obj[p];
        }
        result[prop] = val;
        return result;
    });

    /**
     * Makes a shallow clone of an object, setting or overriding the nodes required
     * to create the given path, and placing the specific value at the tail end of
     * that path. Note that this copies and flattens prototype properties onto the
     * new object as well. All non-primitive properties are copied by reference.
     *
     * @func
     * @memberOf R
     * @since v0.8.0
     * @category Object
     * @sig [String] -> a -> {k: v} -> {k: v}
     * @param {Array} path the path to set
     * @param {*} val the new value
     * @param {Object} obj the object to clone
     * @return {Object} a new object similar to the original except along the specified path.
     * @see R.dissocPath
     * @example
     *
     *      R.assocPath(['a', 'b', 'c'], 42, {a: {b: {c: 0}}}); //=> {a: {b: {c: 42}}}
     */
    var assocPath = _curry3(function assocPath(path, val, obj) {
        switch (path.length) {
        case 0:
            return val;
        case 1:
            return assoc(path[0], val, obj);
        default:
            return assoc(path[0], assocPath(_slice(path, 1), val, Object(obj[path[0]])), obj);
        }
    });

    /**
     * Creates a function that is bound to a context.
     * Note: `R.bind` does not provide the additional argument-binding capabilities of
     * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
     *
     * @func
     * @memberOf R
     * @since v0.6.0
     * @category Function
     * @category Object
     * @sig (* -> *) -> {*} -> (* -> *)
     * @param {Function} fn The function to bind to context
     * @param {Object} thisObj The context to bind `fn` to
     * @return {Function} A function that will execute in the context of `thisObj`.
     * @see R.partial
     * @example
     *
     *      var log = R.bind(console.log, console);
     *      R.pipe(R.assoc('a', 2), R.tap(log), R.assoc('a', 3))({a: 1}); //=> {a: 3}
     *      // logs {a: 2}
     */
    var bind = _curry2(function bind(fn, thisObj) {
        return _arity(fn.length, function () {
            return fn.apply(thisObj, arguments);
        });
    });

    /**
     * Restricts a number to be within a range.
     *
     * Also works for other ordered types such as Strings and Dates.
     *
     * @func
     * @memberOf R
     * @since v0.20.0
     * @category Relation
     * @sig Ord a => a -> a -> a -> a
     * @param {Number} minimum number
     * @param {Number} maximum number
     * @param {Number} value to be clamped
     * @return {Number} Returns the clamped value
     * @example
     *
     *      R.clamp(1, 10, -1) // => 1
     *      R.clamp(1, 10, 11) // => 10
     *      R.clamp(1, 10, 4)  // => 4
     */
    var clamp = _curry3(function clamp(min, max, value) {
        if (min > max) {
            throw new Error('min must not be greater than max in clamp(min, max, value)');
        }
        return value < min ? min : value > max ? max : value;
    });

    /**
     * Makes a comparator function out of a function that reports whether the first
     * element is less than the second.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig (a, b -> Boolean) -> (a, b -> Number)
     * @param {Function} pred A predicate function of arity two.
     * @return {Function} A Function :: a -> b -> Int that returns `-1` if a < b, `1` if b < a, otherwise `0`.
     * @example
     *
     *      var cmp = R.comparator((a, b) => a.age < b.age);
     *      var people = [
     *        // ...
     *      ];
     *      R.sort(cmp, people);
     */
    var comparator = _curry1(function comparator(pred) {
        return function (a, b) {
            return pred(a, b) ? -1 : pred(b, a) ? 1 : 0;
        };
    });

    /**
     * Returns a curried equivalent of the provided function, with the specified
     * arity. The curried function has two unusual capabilities. First, its
     * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
     * following are equivalent:
     *
     *   - `g(1)(2)(3)`
     *   - `g(1)(2, 3)`
     *   - `g(1, 2)(3)`
     *   - `g(1, 2, 3)`
     *
     * Secondly, the special placeholder value `R.__` may be used to specify
     * "gaps", allowing partial application of any combination of arguments,
     * regardless of their positions. If `g` is as above and `_` is `R.__`, the
     * following are equivalent:
     *
     *   - `g(1, 2, 3)`
     *   - `g(_, 2, 3)(1)`
     *   - `g(_, _, 3)(1)(2)`
     *   - `g(_, _, 3)(1, 2)`
     *   - `g(_, 2)(1)(3)`
     *   - `g(_, 2)(1, 3)`
     *   - `g(_, 2)(_, 3)(1)`
     *
     * @func
     * @memberOf R
     * @since v0.5.0
     * @category Function
     * @sig Number -> (* -> a) -> (* -> a)
     * @param {Number} length The arity for the returned function.
     * @param {Function} fn The function to curry.
     * @return {Function} A new, curried function.
     * @see R.curry
     * @example
     *
     *      var sumArgs = (...args) => R.sum(args);
     *
     *      var curriedAddFourNumbers = R.curryN(4, sumArgs);
     *      var f = curriedAddFourNumbers(1, 2);
     *      var g = f(3);
     *      g(4); //=> 10
     */
    var curryN = _curry2(function curryN(length, fn) {
        if (length === 1) {
            return _curry1(fn);
        }
        return _arity(length, _curryN(length, [], fn));
    });

    /**
     * Decrements its argument.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category Math
     * @sig Number -> Number
     * @param {Number} n
     * @return {Number}
     * @see R.inc
     * @example
     *
     *      R.dec(42); //=> 41
     */
    var dec = add(-1);

    /**
     * Returns the second argument if it is not `null`, `undefined` or `NaN`
     * otherwise the first argument is returned.
     *
     * @func
     * @memberOf R
     * @since v0.10.0
     * @category Logic
     * @sig a -> b -> a | b
     * @param {a} val The default value.
     * @param {b} val The value to return if it is not null or undefined
     * @return {*} The the second value or the default value
     * @example
     *
     *      var defaultTo42 = R.defaultTo(42);
     *
     *      defaultTo42(null);  //=> 42
     *      defaultTo42(undefined);  //=> 42
     *      defaultTo42('Ramda');  //=> 'Ramda'
     *      defaultTo42(parseInt('string')); //=> 42
     */
    var defaultTo = _curry2(function defaultTo(d, v) {
        return v == null || v !== v ? d : v;
    });

    /**
     * Finds the set (i.e. no duplicates) of all elements in the first list not
     * contained in the second list. Duplication is determined according to the
     * value returned by applying the supplied predicate to two list elements.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig (a -> a -> Boolean) -> [*] -> [*] -> [*]
     * @param {Function} pred A predicate used to test whether two items are equal.
     * @param {Array} list1 The first list.
     * @param {Array} list2 The second list.
     * @return {Array} The elements in `list1` that are not in `list2`.
     * @see R.difference, R.symmetricDifference, R.symmetricDifferenceWith
     * @example
     *
     *      var cmp = (x, y) => x.a === y.a;
     *      var l1 = [{a: 1}, {a: 2}, {a: 3}];
     *      var l2 = [{a: 3}, {a: 4}];
     *      R.differenceWith(cmp, l1, l2); //=> [{a: 1}, {a: 2}]
     */
    var differenceWith = _curry3(function differenceWith(pred, first, second) {
        var out = [];
        var idx = 0;
        var firstLen = first.length;
        while (idx < firstLen) {
            if (!_containsWith(pred, first[idx], second) && !_containsWith(pred, first[idx], out)) {
                out.push(first[idx]);
            }
            idx += 1;
        }
        return out;
    });

    /**
     * Returns a new object that does not contain a `prop` property.
     *
     * @func
     * @memberOf R
     * @since v0.10.0
     * @category Object
     * @sig String -> {k: v} -> {k: v}
     * @param {String} prop the name of the property to dissociate
     * @param {Object} obj the object to clone
     * @return {Object} a new object similar to the original but without the specified property
     * @see R.assoc
     * @example
     *
     *      R.dissoc('b', {a: 1, b: 2, c: 3}); //=> {a: 1, c: 3}
     */
    var dissoc = _curry2(function dissoc(prop, obj) {
        var result = {};
        for (var p in obj) {
            if (p !== prop) {
                result[p] = obj[p];
            }
        }
        return result;
    });

    /**
     * Makes a shallow clone of an object, omitting the property at the given path.
     * Note that this copies and flattens prototype properties onto the new object
     * as well. All non-primitive properties are copied by reference.
     *
     * @func
     * @memberOf R
     * @since v0.11.0
     * @category Object
     * @sig [String] -> {k: v} -> {k: v}
     * @param {Array} path the path to set
     * @param {Object} obj the object to clone
     * @return {Object} a new object without the property at path
     * @see R.assocPath
     * @example
     *
     *      R.dissocPath(['a', 'b', 'c'], {a: {b: {c: 42}}}); //=> {a: {b: {}}}
     */
    var dissocPath = _curry2(function dissocPath(path, obj) {
        switch (path.length) {
        case 0:
            return obj;
        case 1:
            return dissoc(path[0], obj);
        default:
            var head = path[0];
            var tail = _slice(path, 1);
            return obj[head] == null ? obj : assoc(head, dissocPath(tail, obj[head]), obj);
        }
    });

    /**
     * Divides two numbers. Equivalent to `a / b`.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Math
     * @sig Number -> Number -> Number
     * @param {Number} a The first value.
     * @param {Number} b The second value.
     * @return {Number} The result of `a / b`.
     * @see R.multiply
     * @example
     *
     *      R.divide(71, 100); //=> 0.71
     *
     *      var half = R.divide(R.__, 2);
     *      half(42); //=> 21
     *
     *      var reciprocal = R.divide(1);
     *      reciprocal(4);   //=> 0.25
     */
    var divide = _curry2(function divide(a, b) {
        return a / b;
    });

    /**
     * Returns a new list excluding the leading elements of a given list which
     * satisfy the supplied predicate function. It passes each value to the supplied
     * predicate function, skipping elements while the predicate function returns
     * `true`. The predicate function is applied to one argument: *(value)*.
     *
     * Dispatches to the `dropWhile` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category List
     * @sig (a -> Boolean) -> [a] -> [a]
     * @param {Function} fn The function called per iteration.
     * @param {Array} list The collection to iterate over.
     * @return {Array} A new array.
     * @see R.takeWhile, R.transduce, R.addIndex
     * @example
     *
     *      var lteTwo = x => x <= 2;
     *
     *      R.dropWhile(lteTwo, [1, 2, 3, 4, 3, 2, 1]); //=> [3, 4, 3, 2, 1]
     */
    var dropWhile = _curry2(_dispatchable('dropWhile', _xdropWhile, function dropWhile(pred, list) {
        var idx = 0;
        var len = list.length;
        while (idx < len && pred(list[idx])) {
            idx += 1;
        }
        return _slice(list, idx);
    }));

    /**
     * Returns the empty value of its argument's type. Ramda defines the empty
     * value of Array (`[]`), Object (`{}`), String (`''`), and Arguments. Other
     * types are supported if they define `<Type>.empty` and/or
     * `<Type>.prototype.empty`.
     *
     * Dispatches to the `empty` method of the first argument, if present.
     *
     * @func
     * @memberOf R
     * @since v0.3.0
     * @category Function
     * @sig a -> a
     * @param {*} x
     * @return {*}
     * @example
     *
     *      R.empty(Just(42));      //=> Nothing()
     *      R.empty([1, 2, 3]);     //=> []
     *      R.empty('unicorns');    //=> ''
     *      R.empty({x: 1, y: 2});  //=> {}
     */
    // else
    var empty = _curry1(function empty(x) {
        return x != null && typeof x.empty === 'function' ? x.empty() : x != null && x.constructor != null && typeof x.constructor.empty === 'function' ? x.constructor.empty() : _isArray(x) ? [] : _isString(x) ? '' : _isObject(x) ? {} : _isArguments(x) ? function () {
            return arguments;
        }() : // else
        void 0;
    });

    /**
     * Creates a new object by recursively evolving a shallow copy of `object`,
     * according to the `transformation` functions. All non-primitive properties
     * are copied by reference.
     *
     * A `transformation` function will not be invoked if its corresponding key
     * does not exist in the evolved object.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category Object
     * @sig {k: (v -> v)} -> {k: v} -> {k: v}
     * @param {Object} transformations The object specifying transformation functions to apply
     *        to the object.
     * @param {Object} object The object to be transformed.
     * @return {Object} The transformed object.
     * @example
     *
     *      var tomato  = {firstName: '  Tomato ', data: {elapsed: 100, remaining: 1400}, id:123};
     *      var transformations = {
     *        firstName: R.trim,
     *        lastName: R.trim, // Will not get invoked.
     *        data: {elapsed: R.add(1), remaining: R.add(-1)}
     *      };
     *      R.evolve(transformations, tomato); //=> {firstName: 'Tomato', data: {elapsed: 101, remaining: 1399}, id:123}
     */
    var evolve = _curry2(function evolve(transformations, object) {
        var result = {};
        var transformation, key, type;
        for (key in object) {
            transformation = transformations[key];
            type = typeof transformation;
            result[key] = type === 'function' ? transformation(object[key]) : type === 'object' ? evolve(transformations[key], object[key]) : object[key];
        }
        return result;
    });

    /**
     * Returns the first element of the list which matches the predicate, or
     * `undefined` if no element matches.
     *
     * Dispatches to the `find` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig (a -> Boolean) -> [a] -> a | undefined
     * @param {Function} fn The predicate function used to determine if the element is the
     *        desired one.
     * @param {Array} list The array to consider.
     * @return {Object} The element found, or `undefined`.
     * @see R.transduce
     * @example
     *
     *      var xs = [{a: 1}, {a: 2}, {a: 3}];
     *      R.find(R.propEq('a', 2))(xs); //=> {a: 2}
     *      R.find(R.propEq('a', 4))(xs); //=> undefined
     */
    var find = _curry2(_dispatchable('find', _xfind, function find(fn, list) {
        var idx = 0;
        var len = list.length;
        while (idx < len) {
            if (fn(list[idx])) {
                return list[idx];
            }
            idx += 1;
        }
    }));

    /**
     * Returns the index of the first element of the list which matches the
     * predicate, or `-1` if no element matches.
     *
     * Dispatches to the `findIndex` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.1.1
     * @category List
     * @sig (a -> Boolean) -> [a] -> Number
     * @param {Function} fn The predicate function used to determine if the element is the
     * desired one.
     * @param {Array} list The array to consider.
     * @return {Number} The index of the element found, or `-1`.
     * @see R.transduce
     * @example
     *
     *      var xs = [{a: 1}, {a: 2}, {a: 3}];
     *      R.findIndex(R.propEq('a', 2))(xs); //=> 1
     *      R.findIndex(R.propEq('a', 4))(xs); //=> -1
     */
    var findIndex = _curry2(_dispatchable('findIndex', _xfindIndex, function findIndex(fn, list) {
        var idx = 0;
        var len = list.length;
        while (idx < len) {
            if (fn(list[idx])) {
                return idx;
            }
            idx += 1;
        }
        return -1;
    }));

    /**
     * Returns the last element of the list which matches the predicate, or
     * `undefined` if no element matches.
     *
     * Dispatches to the `findLast` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.1.1
     * @category List
     * @sig (a -> Boolean) -> [a] -> a | undefined
     * @param {Function} fn The predicate function used to determine if the element is the
     * desired one.
     * @param {Array} list The array to consider.
     * @return {Object} The element found, or `undefined`.
     * @see R.transduce
     * @example
     *
     *      var xs = [{a: 1, b: 0}, {a:1, b: 1}];
     *      R.findLast(R.propEq('a', 1))(xs); //=> {a: 1, b: 1}
     *      R.findLast(R.propEq('a', 4))(xs); //=> undefined
     */
    var findLast = _curry2(_dispatchable('findLast', _xfindLast, function findLast(fn, list) {
        var idx = list.length - 1;
        while (idx >= 0) {
            if (fn(list[idx])) {
                return list[idx];
            }
            idx -= 1;
        }
    }));

    /**
     * Returns the index of the last element of the list which matches the
     * predicate, or `-1` if no element matches.
     *
     * Dispatches to the `findLastIndex` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.1.1
     * @category List
     * @sig (a -> Boolean) -> [a] -> Number
     * @param {Function} fn The predicate function used to determine if the element is the
     * desired one.
     * @param {Array} list The array to consider.
     * @return {Number} The index of the element found, or `-1`.
     * @see R.transduce
     * @example
     *
     *      var xs = [{a: 1, b: 0}, {a:1, b: 1}];
     *      R.findLastIndex(R.propEq('a', 1))(xs); //=> 1
     *      R.findLastIndex(R.propEq('a', 4))(xs); //=> -1
     */
    var findLastIndex = _curry2(_dispatchable('findLastIndex', _xfindLastIndex, function findLastIndex(fn, list) {
        var idx = list.length - 1;
        while (idx >= 0) {
            if (fn(list[idx])) {
                return idx;
            }
            idx -= 1;
        }
        return -1;
    }));

    /**
     * Iterate over an input `list`, calling a provided function `fn` for each
     * element in the list.
     *
     * `fn` receives one argument: *(value)*.
     *
     * Note: `R.forEach` does not skip deleted or unassigned indices (sparse
     * arrays), unlike the native `Array.prototype.forEach` method. For more
     * details on this behavior, see:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Description
     *
     * Also note that, unlike `Array.prototype.forEach`, Ramda's `forEach` returns
     * the original array. In some libraries this function is named `each`.
     *
     * Dispatches to the `forEach` method of the second argument, if present.
     *
     * @func
     * @memberOf R
     * @since v0.1.1
     * @category List
     * @sig (a -> *) -> [a] -> [a]
     * @param {Function} fn The function to invoke. Receives one argument, `value`.
     * @param {Array} list The list to iterate over.
     * @return {Array} The original list.
     * @see R.addIndex
     * @example
     *
     *      var printXPlusFive = x => console.log(x + 5);
     *      R.forEach(printXPlusFive, [1, 2, 3]); //=> [1, 2, 3]
     *      // logs 6
     *      // logs 7
     *      // logs 8
     */
    var forEach = _curry2(_checkForMethod('forEach', function forEach(fn, list) {
        var len = list.length;
        var idx = 0;
        while (idx < len) {
            fn(list[idx]);
            idx += 1;
        }
        return list;
    }));

    /**
     * Creates a new object from a list key-value pairs. If a key appears in
     * multiple pairs, the rightmost pair is included in the object.
     *
     * @func
     * @memberOf R
     * @since v0.3.0
     * @category List
     * @sig [[k,v]] -> {k: v}
     * @param {Array} pairs An array of two-element arrays that will be the keys and values of the output object.
     * @return {Object} The object made by pairing up `keys` and `values`.
     * @see R.toPairs, R.pair
     * @example
     *
     *      R.fromPairs([['a', 1], ['b', 2], ['c', 3]]); //=> {a: 1, b: 2, c: 3}
     */
    var fromPairs = _curry1(function fromPairs(pairs) {
        var result = {};
        var idx = 0;
        while (idx < pairs.length) {
            result[pairs[idx][0]] = pairs[idx][1];
            idx += 1;
        }
        return result;
    });

    /**
     * Takes a list and returns a list of lists where each sublist's elements are
     * all "equal" according to the provided equality function.
     *
     * @func
     * @memberOf R
     * @since v0.21.0
     * @category List
     * @sig ((a, a) → Boolean) → [a] → [[a]]
     * @param {Function} fn Function for determining whether two given (adjacent)
     *        elements should be in the same group
     * @param {Array} list The array to group. Also accepts a string, which will be
     *        treated as a list of characters.
     * @return {List} A list that contains sublists of equal elements,
     *         whose concatenations are equal to the original list.
     * @example
     *
     * R.groupWith(R.equals, [0, 1, 1, 2, 3, 5, 8, 13, 21])
     * //=> [[0], [1, 1], [2], [3], [5], [8], [13], [21]]
     *
     * R.groupWith((a, b) => a % 2 === b % 2, [0, 1, 1, 2, 3, 5, 8, 13, 21])
     * //=> [[0], [1, 1], [2], [3, 5], [8], [13, 21]]
     *
     * R.groupWith(R.eqBy(isVowel), 'aestiou')
     * //=> ['ae', 'st', 'iou']
     */
    var groupWith = _curry2(function (fn, list) {
        var res = [];
        var idx = 0;
        var len = list.length;
        while (idx < len) {
            var nextidx = idx + 1;
            while (nextidx < len && fn(list[idx], list[nextidx])) {
                nextidx += 1;
            }
            res.push(list.slice(idx, nextidx));
            idx = nextidx;
        }
        return res;
    });

    /**
     * Returns `true` if the first argument is greater than the second; `false`
     * otherwise.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig Ord a => a -> a -> Boolean
     * @param {*} a
     * @param {*} b
     * @return {Boolean}
     * @see R.lt
     * @example
     *
     *      R.gt(2, 1); //=> true
     *      R.gt(2, 2); //=> false
     *      R.gt(2, 3); //=> false
     *      R.gt('a', 'z'); //=> false
     *      R.gt('z', 'a'); //=> true
     */
    var gt = _curry2(function gt(a, b) {
        return a > b;
    });

    /**
     * Returns `true` if the first argument is greater than or equal to the second;
     * `false` otherwise.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig Ord a => a -> a -> Boolean
     * @param {Number} a
     * @param {Number} b
     * @return {Boolean}
     * @see R.lte
     * @example
     *
     *      R.gte(2, 1); //=> true
     *      R.gte(2, 2); //=> true
     *      R.gte(2, 3); //=> false
     *      R.gte('a', 'z'); //=> false
     *      R.gte('z', 'a'); //=> true
     */
    var gte = _curry2(function gte(a, b) {
        return a >= b;
    });

    /**
     * Returns whether or not an object has an own property with the specified name
     *
     * @func
     * @memberOf R
     * @since v0.7.0
     * @category Object
     * @sig s -> {s: x} -> Boolean
     * @param {String} prop The name of the property to check for.
     * @param {Object} obj The object to query.
     * @return {Boolean} Whether the property exists.
     * @example
     *
     *      var hasName = R.has('name');
     *      hasName({name: 'alice'});   //=> true
     *      hasName({name: 'bob'});     //=> true
     *      hasName({});                //=> false
     *
     *      var point = {x: 0, y: 0};
     *      var pointHas = R.has(R.__, point);
     *      pointHas('x');  //=> true
     *      pointHas('y');  //=> true
     *      pointHas('z');  //=> false
     */
    var has = _curry2(_has);

    /**
     * Returns whether or not an object or its prototype chain has a property with
     * the specified name
     *
     * @func
     * @memberOf R
     * @since v0.7.0
     * @category Object
     * @sig s -> {s: x} -> Boolean
     * @param {String} prop The name of the property to check for.
     * @param {Object} obj The object to query.
     * @return {Boolean} Whether the property exists.
     * @example
     *
     *      function Rectangle(width, height) {
     *        this.width = width;
     *        this.height = height;
     *      }
     *      Rectangle.prototype.area = function() {
     *        return this.width * this.height;
     *      };
     *
     *      var square = new Rectangle(2, 2);
     *      R.hasIn('width', square);  //=> true
     *      R.hasIn('area', square);  //=> true
     */
    var hasIn = _curry2(function hasIn(prop, obj) {
        return prop in obj;
    });

    /**
     * Returns true if its arguments are identical, false otherwise. Values are
     * identical if they reference the same memory. `NaN` is identical to `NaN`;
     * `0` and `-0` are not identical.
     *
     * @func
     * @memberOf R
     * @since v0.15.0
     * @category Relation
     * @sig a -> a -> Boolean
     * @param {*} a
     * @param {*} b
     * @return {Boolean}
     * @example
     *
     *      var o = {};
     *      R.identical(o, o); //=> true
     *      R.identical(1, 1); //=> true
     *      R.identical(1, '1'); //=> false
     *      R.identical([], []); //=> false
     *      R.identical(0, -0); //=> false
     *      R.identical(NaN, NaN); //=> true
     */
    // SameValue algorithm
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    // Step 6.a: NaN == NaN
    var identical = _curry2(function identical(a, b) {
        // SameValue algorithm
        if (a === b) {
            // Steps 1-5, 7-10
            // Steps 6.b-6.e: +0 != -0
            return a !== 0 || 1 / a === 1 / b;
        } else {
            // Step 6.a: NaN == NaN
            return a !== a && b !== b;
        }
    });

    /**
     * A function that does nothing but return the parameter supplied to it. Good
     * as a default or placeholder function.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig a -> a
     * @param {*} x The value to return.
     * @return {*} The input value, `x`.
     * @example
     *
     *      R.identity(1); //=> 1
     *
     *      var obj = {};
     *      R.identity(obj) === obj; //=> true
     */
    var identity = _curry1(_identity);

    /**
     * Creates a function that will process either the `onTrue` or the `onFalse`
     * function depending upon the result of the `condition` predicate.
     *
     * @func
     * @memberOf R
     * @since v0.8.0
     * @category Logic
     * @sig (*... -> Boolean) -> (*... -> *) -> (*... -> *) -> (*... -> *)
     * @param {Function} condition A predicate function
     * @param {Function} onTrue A function to invoke when the `condition` evaluates to a truthy value.
     * @param {Function} onFalse A function to invoke when the `condition` evaluates to a falsy value.
     * @return {Function} A new unary function that will process either the `onTrue` or the `onFalse`
     *                    function depending upon the result of the `condition` predicate.
     * @see R.unless, R.when
     * @example
     *
     *      var incCount = R.ifElse(
     *        R.has('count'),
     *        R.over(R.lensProp('count'), R.inc),
     *        R.assoc('count', 1)
     *      );
     *      incCount({});           //=> { count: 1 }
     *      incCount({ count: 1 }); //=> { count: 2 }
     */
    var ifElse = _curry3(function ifElse(condition, onTrue, onFalse) {
        return curryN(Math.max(condition.length, onTrue.length, onFalse.length), function _ifElse() {
            return condition.apply(this, arguments) ? onTrue.apply(this, arguments) : onFalse.apply(this, arguments);
        });
    });

    /**
     * Increments its argument.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category Math
     * @sig Number -> Number
     * @param {Number} n
     * @return {Number}
     * @see R.dec
     * @example
     *
     *      R.inc(42); //=> 43
     */
    var inc = add(1);

    /**
     * Inserts the supplied element into the list, at index `index`. _Note that
     * this is not destructive_: it returns a copy of the list with the changes.
     * <small>No lists have been harmed in the application of this function.</small>
     *
     * @func
     * @memberOf R
     * @since v0.2.2
     * @category List
     * @sig Number -> a -> [a] -> [a]
     * @param {Number} index The position to insert the element
     * @param {*} elt The element to insert into the Array
     * @param {Array} list The list to insert into
     * @return {Array} A new Array with `elt` inserted at `index`.
     * @example
     *
     *      R.insert(2, 'x', [1,2,3,4]); //=> [1,2,'x',3,4]
     */
    var insert = _curry3(function insert(idx, elt, list) {
        idx = idx < list.length && idx >= 0 ? idx : list.length;
        var result = _slice(list);
        result.splice(idx, 0, elt);
        return result;
    });

    /**
     * Inserts the sub-list into the list, at index `index`. _Note that this is not
     * destructive_: it returns a copy of the list with the changes.
     * <small>No lists have been harmed in the application of this function.</small>
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category List
     * @sig Number -> [a] -> [a] -> [a]
     * @param {Number} index The position to insert the sub-list
     * @param {Array} elts The sub-list to insert into the Array
     * @param {Array} list The list to insert the sub-list into
     * @return {Array} A new Array with `elts` inserted starting at `index`.
     * @example
     *
     *      R.insertAll(2, ['x','y','z'], [1,2,3,4]); //=> [1,2,'x','y','z',3,4]
     */
    var insertAll = _curry3(function insertAll(idx, elts, list) {
        idx = idx < list.length && idx >= 0 ? idx : list.length;
        return _concat(_concat(_slice(list, 0, idx), elts), _slice(list, idx));
    });

    /**
     * Creates a new list with the separator interposed between elements.
     *
     * Dispatches to the `intersperse` method of the second argument, if present.
     *
     * @func
     * @memberOf R
     * @since v0.14.0
     * @category List
     * @sig a -> [a] -> [a]
     * @param {*} separator The element to add to the list.
     * @param {Array} list The list to be interposed.
     * @return {Array} The new list.
     * @example
     *
     *      R.intersperse('n', ['ba', 'a', 'a']); //=> ['ba', 'n', 'a', 'n', 'a']
     */
    var intersperse = _curry2(_checkForMethod('intersperse', function intersperse(separator, list) {
        var out = [];
        var idx = 0;
        var length = list.length;
        while (idx < length) {
            if (idx === length - 1) {
                out.push(list[idx]);
            } else {
                out.push(list[idx], separator);
            }
            idx += 1;
        }
        return out;
    }));

    /**
     * See if an object (`val`) is an instance of the supplied constructor. This
     * function will check up the inheritance chain, if any.
     *
     * @func
     * @memberOf R
     * @since v0.3.0
     * @category Type
     * @sig (* -> {*}) -> a -> Boolean
     * @param {Object} ctor A constructor
     * @param {*} val The value to test
     * @return {Boolean}
     * @example
     *
     *      R.is(Object, {}); //=> true
     *      R.is(Number, 1); //=> true
     *      R.is(Object, 1); //=> false
     *      R.is(String, 's'); //=> true
     *      R.is(String, new String('')); //=> true
     *      R.is(Object, new String('')); //=> true
     *      R.is(Object, 's'); //=> false
     *      R.is(Number, {}); //=> false
     */
    var is = _curry2(function is(Ctor, val) {
        return val != null && val.constructor === Ctor || val instanceof Ctor;
    });

    /**
     * Tests whether or not an object is similar to an array.
     *
     * @func
     * @memberOf R
     * @since v0.5.0
     * @category Type
     * @category List
     * @sig * -> Boolean
     * @param {*} x The object to test.
     * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
     * @example
     *
     *      R.isArrayLike([]); //=> true
     *      R.isArrayLike(true); //=> false
     *      R.isArrayLike({}); //=> false
     *      R.isArrayLike({length: 10}); //=> false
     *      R.isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
     */
    var isArrayLike = _curry1(function isArrayLike(x) {
        if (_isArray(x)) {
            return true;
        }
        if (!x) {
            return false;
        }
        if (typeof x !== 'object') {
            return false;
        }
        if (_isString(x)) {
            return false;
        }
        if (x.nodeType === 1) {
            return !!x.length;
        }
        if (x.length === 0) {
            return true;
        }
        if (x.length > 0) {
            return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
        }
        return false;
    });

    /**
     * Checks if the input value is `null` or `undefined`.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category Type
     * @sig * -> Boolean
     * @param {*} x The value to test.
     * @return {Boolean} `true` if `x` is `undefined` or `null`, otherwise `false`.
     * @example
     *
     *      R.isNil(null); //=> true
     *      R.isNil(undefined); //=> true
     *      R.isNil(0); //=> false
     *      R.isNil([]); //=> false
     */
    var isNil = _curry1(function isNil(x) {
        return x == null;
    });

    /**
     * Returns a list containing the names of all the enumerable own properties of
     * the supplied object.
     * Note that the order of the output array is not guaranteed to be consistent
     * across different JS platforms.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Object
     * @sig {k: v} -> [k]
     * @param {Object} obj The object to extract properties from
     * @return {Array} An array of the object's own properties.
     * @example
     *
     *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
     */
    // cover IE < 9 keys issues
    // Safari bug
    var keys = function () {
        // cover IE < 9 keys issues
        var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
        var nonEnumerableProps = [
            'constructor',
            'valueOf',
            'isPrototypeOf',
            'toString',
            'propertyIsEnumerable',
            'hasOwnProperty',
            'toLocaleString'
        ];
        // Safari bug
        var hasArgsEnumBug = function () {
            'use strict';
            return arguments.propertyIsEnumerable('length');
        }();
        var contains = function contains(list, item) {
            var idx = 0;
            while (idx < list.length) {
                if (list[idx] === item) {
                    return true;
                }
                idx += 1;
            }
            return false;
        };
        return typeof Object.keys === 'function' && !hasArgsEnumBug ? _curry1(function keys(obj) {
            return Object(obj) !== obj ? [] : Object.keys(obj);
        }) : _curry1(function keys(obj) {
            if (Object(obj) !== obj) {
                return [];
            }
            var prop, nIdx;
            var ks = [];
            var checkArgsLength = hasArgsEnumBug && _isArguments(obj);
            for (prop in obj) {
                if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
                    ks[ks.length] = prop;
                }
            }
            if (hasEnumBug) {
                nIdx = nonEnumerableProps.length - 1;
                while (nIdx >= 0) {
                    prop = nonEnumerableProps[nIdx];
                    if (_has(prop, obj) && !contains(ks, prop)) {
                        ks[ks.length] = prop;
                    }
                    nIdx -= 1;
                }
            }
            return ks;
        });
    }();

    /**
     * Returns a list containing the names of all the properties of the supplied
     * object, including prototype properties.
     * Note that the order of the output array is not guaranteed to be consistent
     * across different JS platforms.
     *
     * @func
     * @memberOf R
     * @since v0.2.0
     * @category Object
     * @sig {k: v} -> [k]
     * @param {Object} obj The object to extract properties from
     * @return {Array} An array of the object's own and prototype properties.
     * @example
     *
     *      var F = function() { this.x = 'X'; };
     *      F.prototype.y = 'Y';
     *      var f = new F();
     *      R.keysIn(f); //=> ['x', 'y']
     */
    var keysIn = _curry1(function keysIn(obj) {
        var prop;
        var ks = [];
        for (prop in obj) {
            ks[ks.length] = prop;
        }
        return ks;
    });

    /**
     * Returns the number of elements in the array by returning `list.length`.
     *
     * @func
     * @memberOf R
     * @since v0.3.0
     * @category List
     * @sig [a] -> Number
     * @param {Array} list The array to inspect.
     * @return {Number} The length of the array.
     * @example
     *
     *      R.length([]); //=> 0
     *      R.length([1, 2, 3]); //=> 3
     */
    var length = _curry1(function length(list) {
        return list != null && _isNumber(list.length) ? list.length : NaN;
    });

    /**
     * Returns `true` if the first argument is less than the second; `false`
     * otherwise.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig Ord a => a -> a -> Boolean
     * @param {*} a
     * @param {*} b
     * @return {Boolean}
     * @see R.gt
     * @example
     *
     *      R.lt(2, 1); //=> false
     *      R.lt(2, 2); //=> false
     *      R.lt(2, 3); //=> true
     *      R.lt('a', 'z'); //=> true
     *      R.lt('z', 'a'); //=> false
     */
    var lt = _curry2(function lt(a, b) {
        return a < b;
    });

    /**
     * Returns `true` if the first argument is less than or equal to the second;
     * `false` otherwise.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig Ord a => a -> a -> Boolean
     * @param {Number} a
     * @param {Number} b
     * @return {Boolean}
     * @see R.gte
     * @example
     *
     *      R.lte(2, 1); //=> false
     *      R.lte(2, 2); //=> true
     *      R.lte(2, 3); //=> true
     *      R.lte('a', 'z'); //=> true
     *      R.lte('z', 'a'); //=> false
     */
    var lte = _curry2(function lte(a, b) {
        return a <= b;
    });

    /**
     * The mapAccum function behaves like a combination of map and reduce; it
     * applies a function to each element of a list, passing an accumulating
     * parameter from left to right, and returning a final value of this
     * accumulator together with the new list.
     *
     * The iterator function receives two arguments, *acc* and *value*, and should
     * return a tuple *[acc, value]*.
     *
     * @func
     * @memberOf R
     * @since v0.10.0
     * @category List
     * @sig (acc -> x -> (acc, y)) -> acc -> [x] -> (acc, [y])
     * @param {Function} fn The function to be called on every element of the input `list`.
     * @param {*} acc The accumulator value.
     * @param {Array} list The list to iterate over.
     * @return {*} The final, accumulated value.
     * @see R.addIndex
     * @example
     *
     *      var digits = ['1', '2', '3', '4'];
     *      var appender = (a, b) => [a + b, a + b];
     *
     *      R.mapAccum(appender, 0, digits); //=> ['01234', ['01', '012', '0123', '01234']]
     */
    var mapAccum = _curry3(function mapAccum(fn, acc, list) {
        var idx = 0;
        var len = list.length;
        var result = [];
        var tuple = [acc];
        while (idx < len) {
            tuple = fn(tuple[0], list[idx]);
            result[idx] = tuple[1];
            idx += 1;
        }
        return [
            tuple[0],
            result
        ];
    });

    /**
     * The mapAccumRight function behaves like a combination of map and reduce; it
     * applies a function to each element of a list, passing an accumulating
     * parameter from right to left, and returning a final value of this
     * accumulator together with the new list.
     *
     * Similar to `mapAccum`, except moves through the input list from the right to
     * the left.
     *
     * The iterator function receives two arguments, *acc* and *value*, and should
     * return a tuple *[acc, value]*.
     *
     * @func
     * @memberOf R
     * @since v0.10.0
     * @category List
     * @sig (acc -> x -> (acc, y)) -> acc -> [x] -> (acc, [y])
     * @param {Function} fn The function to be called on every element of the input `list`.
     * @param {*} acc The accumulator value.
     * @param {Array} list The list to iterate over.
     * @return {*} The final, accumulated value.
     * @see R.addIndex
     * @example
     *
     *      var digits = ['1', '2', '3', '4'];
     *      var append = (a, b) => [a + b, a + b];
     *
     *      R.mapAccumRight(append, 0, digits); //=> ['04321', ['04321', '0432', '043', '04']]
     */
    var mapAccumRight = _curry3(function mapAccumRight(fn, acc, list) {
        var idx = list.length - 1;
        var result = [];
        var tuple = [acc];
        while (idx >= 0) {
            tuple = fn(tuple[0], list[idx]);
            result[idx] = tuple[1];
            idx -= 1;
        }
        return [
            tuple[0],
            result
        ];
    });

    /**
     * Tests a regular expression against a String. Note that this function will
     * return an empty array when there are no matches. This differs from
     * [`String.prototype.match`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match)
     * which returns `null` when there are no matches.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category String
     * @sig RegExp -> String -> [String | Undefined]
     * @param {RegExp} rx A regular expression.
     * @param {String} str The string to match against
     * @return {Array} The list of matches or empty array.
     * @see R.test
     * @example
     *
     *      R.match(/([a-z]a)/g, 'bananas'); //=> ['ba', 'na', 'na']
     *      R.match(/a/, 'b'); //=> []
     *      R.match(/a/, null); //=> TypeError: null does not have a method named "match"
     */
    var match = _curry2(function match(rx, str) {
        return str.match(rx) || [];
    });

    /**
     * mathMod behaves like the modulo operator should mathematically, unlike the
     * `%` operator (and by extension, R.modulo). So while "-17 % 5" is -2,
     * mathMod(-17, 5) is 3. mathMod requires Integer arguments, and returns NaN
     * when the modulus is zero or negative.
     *
     * @func
     * @memberOf R
     * @since v0.3.0
     * @category Math
     * @sig Number -> Number -> Number
     * @param {Number} m The dividend.
     * @param {Number} p the modulus.
     * @return {Number} The result of `b mod a`.
     * @example
     *
     *      R.mathMod(-17, 5);  //=> 3
     *      R.mathMod(17, 5);   //=> 2
     *      R.mathMod(17, -5);  //=> NaN
     *      R.mathMod(17, 0);   //=> NaN
     *      R.mathMod(17.2, 5); //=> NaN
     *      R.mathMod(17, 5.3); //=> NaN
     *
     *      var clock = R.mathMod(R.__, 12);
     *      clock(15); //=> 3
     *      clock(24); //=> 0
     *
     *      var seventeenMod = R.mathMod(17);
     *      seventeenMod(3);  //=> 2
     *      seventeenMod(4);  //=> 1
     *      seventeenMod(10); //=> 7
     */
    var mathMod = _curry2(function mathMod(m, p) {
        if (!_isInteger(m)) {
            return NaN;
        }
        if (!_isInteger(p) || p < 1) {
            return NaN;
        }
        return (m % p + p) % p;
    });

    /**
     * Returns the larger of its two arguments.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig Ord a => a -> a -> a
     * @param {*} a
     * @param {*} b
     * @return {*}
     * @see R.maxBy, R.min
     * @example
     *
     *      R.max(789, 123); //=> 789
     *      R.max('a', 'b'); //=> 'b'
     */
    var max = _curry2(function max(a, b) {
        return b > a ? b : a;
    });

    /**
     * Takes a function and two values, and returns whichever value produces the
     * larger result when passed to the provided function.
     *
     * @func
     * @memberOf R
     * @since v0.8.0
     * @category Relation
     * @sig Ord b => (a -> b) -> a -> a -> a
     * @param {Function} f
     * @param {*} a
     * @param {*} b
     * @return {*}
     * @see R.max, R.minBy
     * @example
     *
     *      //  square :: Number -> Number
     *      var square = n => n * n;
     *
     *      R.maxBy(square, -3, 2); //=> -3
     *
     *      R.reduce(R.maxBy(square), 0, [3, -5, 4, 1, -2]); //=> -5
     *      R.reduce(R.maxBy(square), 0, []); //=> 0
     */
    var maxBy = _curry3(function maxBy(f, a, b) {
        return f(b) > f(a) ? b : a;
    });

    /**
     * Create a new object with the own properties of the first object merged with
     * the own properties of the second object. If a key exists in both objects,
     * the value from the second object will be used.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Object
     * @sig {k: v} -> {k: v} -> {k: v}
     * @param {Object} l
     * @param {Object} r
     * @return {Object}
     * @see R.mergeWith, R.mergeWithKey
     * @example
     *
     *      R.merge({ 'name': 'fred', 'age': 10 }, { 'age': 40 });
     *      //=> { 'name': 'fred', 'age': 40 }
     *
     *      var resetToDefault = R.merge(R.__, {x: 0});
     *      resetToDefault({x: 5, y: 2}); //=> {x: 0, y: 2}
     */
    var merge = _curry2(function merge(l, r) {
        return _assign({}, l, r);
    });

    /**
     * Merges a list of objects together into one object.
     *
     * @func
     * @memberOf R
     * @since v0.10.0
     * @category List
     * @sig [{k: v}] -> {k: v}
     * @param {Array} list An array of objects
     * @return {Object} A merged object.
     * @see R.reduce
     * @example
     *
     *      R.mergeAll([{foo:1},{bar:2},{baz:3}]); //=> {foo:1,bar:2,baz:3}
     *      R.mergeAll([{foo:1},{foo:2},{bar:2}]); //=> {foo:2,bar:2}
     */
    var mergeAll = _curry1(function mergeAll(list) {
        return _assign.apply(null, [{}].concat(list));
    });

    /**
     * Creates a new object with the own properties of the two provided objects. If
     * a key exists in both objects, the provided function is applied to the key
     * and the values associated with the key in each object, with the result being
     * used as the value associated with the key in the returned object. The key
     * will be excluded from the returned object if the resulting value is
     * `undefined`.
     *
     * @func
     * @memberOf R
     * @since v0.19.0
     * @category Object
     * @sig (String -> a -> a -> a) -> {a} -> {a} -> {a}
     * @param {Function} fn
     * @param {Object} l
     * @param {Object} r
     * @return {Object}
     * @see R.merge, R.mergeWith
     * @example
     *
     *      let concatValues = (k, l, r) => k == 'values' ? R.concat(l, r) : r
     *      R.mergeWithKey(concatValues,
     *                     { a: true, thing: 'foo', values: [10, 20] },
     *                     { b: true, thing: 'bar', values: [15, 35] });
     *      //=> { a: true, b: true, thing: 'bar', values: [10, 20, 15, 35] }
     */
    var mergeWithKey = _curry3(function mergeWithKey(fn, l, r) {
        var result = {};
        var k;
        for (k in l) {
            if (_has(k, l)) {
                result[k] = _has(k, r) ? fn(k, l[k], r[k]) : l[k];
            }
        }
        for (k in r) {
            if (_has(k, r) && !_has(k, result)) {
                result[k] = r[k];
            }
        }
        return result;
    });

    /**
     * Returns the smaller of its two arguments.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig Ord a => a -> a -> a
     * @param {*} a
     * @param {*} b
     * @return {*}
     * @see R.minBy, R.max
     * @example
     *
     *      R.min(789, 123); //=> 123
     *      R.min('a', 'b'); //=> 'a'
     */
    var min = _curry2(function min(a, b) {
        return b < a ? b : a;
    });

    /**
     * Takes a function and two values, and returns whichever value produces the
     * smaller result when passed to the provided function.
     *
     * @func
     * @memberOf R
     * @since v0.8.0
     * @category Relation
     * @sig Ord b => (a -> b) -> a -> a -> a
     * @param {Function} f
     * @param {*} a
     * @param {*} b
     * @return {*}
     * @see R.min, R.maxBy
     * @example
     *
     *      //  square :: Number -> Number
     *      var square = n => n * n;
     *
     *      R.minBy(square, -3, 2); //=> 2
     *
     *      R.reduce(R.minBy(square), Infinity, [3, -5, 4, 1, -2]); //=> 1
     *      R.reduce(R.minBy(square), Infinity, []); //=> Infinity
     */
    var minBy = _curry3(function minBy(f, a, b) {
        return f(b) < f(a) ? b : a;
    });

    /**
     * Divides the first parameter by the second and returns the remainder. Note
     * that this function preserves the JavaScript-style behavior for modulo. For
     * mathematical modulo see `mathMod`.
     *
     * @func
     * @memberOf R
     * @since v0.1.1
     * @category Math
     * @sig Number -> Number -> Number
     * @param {Number} a The value to the divide.
     * @param {Number} b The pseudo-modulus
     * @return {Number} The result of `b % a`.
     * @see R.mathMod
     * @example
     *
     *      R.modulo(17, 3); //=> 2
     *      // JS behavior:
     *      R.modulo(-17, 3); //=> -2
     *      R.modulo(17, -3); //=> 2
     *
     *      var isOdd = R.modulo(R.__, 2);
     *      isOdd(42); //=> 0
     *      isOdd(21); //=> 1
     */
    var modulo = _curry2(function modulo(a, b) {
        return a % b;
    });

    /**
     * Multiplies two numbers. Equivalent to `a * b` but curried.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Math
     * @sig Number -> Number -> Number
     * @param {Number} a The first value.
     * @param {Number} b The second value.
     * @return {Number} The result of `a * b`.
     * @see R.divide
     * @example
     *
     *      var double = R.multiply(2);
     *      var triple = R.multiply(3);
     *      double(3);       //=>  6
     *      triple(4);       //=> 12
     *      R.multiply(2, 5);  //=> 10
     */
    var multiply = _curry2(function multiply(a, b) {
        return a * b;
    });

    /**
     * Wraps a function of any arity (including nullary) in a function that accepts
     * exactly `n` parameters. Any extraneous parameters will not be passed to the
     * supplied function.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig Number -> (* -> a) -> (* -> a)
     * @param {Number} n The desired arity of the new function.
     * @param {Function} fn The function to wrap.
     * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
     *         arity `n`.
     * @example
     *
     *      var takesTwoArgs = (a, b) => [a, b];
     *
     *      takesTwoArgs.length; //=> 2
     *      takesTwoArgs(1, 2); //=> [1, 2]
     *
     *      var takesOneArg = R.nAry(1, takesTwoArgs);
     *      takesOneArg.length; //=> 1
     *      // Only `n` arguments are passed to the wrapped function
     *      takesOneArg(1, 2); //=> [1, undefined]
     */
    var nAry = _curry2(function nAry(n, fn) {
        switch (n) {
        case 0:
            return function () {
                return fn.call(this);
            };
        case 1:
            return function (a0) {
                return fn.call(this, a0);
            };
        case 2:
            return function (a0, a1) {
                return fn.call(this, a0, a1);
            };
        case 3:
            return function (a0, a1, a2) {
                return fn.call(this, a0, a1, a2);
            };
        case 4:
            return function (a0, a1, a2, a3) {
                return fn.call(this, a0, a1, a2, a3);
            };
        case 5:
            return function (a0, a1, a2, a3, a4) {
                return fn.call(this, a0, a1, a2, a3, a4);
            };
        case 6:
            return function (a0, a1, a2, a3, a4, a5) {
                return fn.call(this, a0, a1, a2, a3, a4, a5);
            };
        case 7:
            return function (a0, a1, a2, a3, a4, a5, a6) {
                return fn.call(this, a0, a1, a2, a3, a4, a5, a6);
            };
        case 8:
            return function (a0, a1, a2, a3, a4, a5, a6, a7) {
                return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7);
            };
        case 9:
            return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
                return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8);
            };
        case 10:
            return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            };
        default:
            throw new Error('First argument to nAry must be a non-negative integer no greater than ten');
        }
    });

    /**
     * Negates its argument.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category Math
     * @sig Number -> Number
     * @param {Number} n
     * @return {Number}
     * @example
     *
     *      R.negate(42); //=> -42
     */
    var negate = _curry1(function negate(n) {
        return -n;
    });

    /**
     * Returns `true` if no elements of the list match the predicate, `false`
     * otherwise.
     *
     * Dispatches to the `any` method of the second argument, if present.
     *
     * @func
     * @memberOf R
     * @since v0.12.0
     * @category List
     * @sig (a -> Boolean) -> [a] -> Boolean
     * @param {Function} fn The predicate function.
     * @param {Array} list The array to consider.
     * @return {Boolean} `true` if the predicate is not satisfied by every element, `false` otherwise.
     * @see R.all, R.any
     * @example
     *
     *      var isEven = n => n % 2 === 0;
     *
     *      R.none(isEven, [1, 3, 5, 7, 9, 11]); //=> true
     *      R.none(isEven, [1, 3, 5, 7, 8, 11]); //=> false
     */
    var none = _curry2(_complement(_dispatchable('any', _xany, any)));

    /**
     * A function that returns the `!` of its argument. It will return `true` when
     * passed false-y value, and `false` when passed a truth-y one.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Logic
     * @sig * -> Boolean
     * @param {*} a any value
     * @return {Boolean} the logical inverse of passed argument.
     * @see R.complement
     * @example
     *
     *      R.not(true); //=> false
     *      R.not(false); //=> true
     *      R.not(0); //=> true
     *      R.not(1); //=> false
     */
    var not = _curry1(function not(a) {
        return !a;
    });

    /**
     * Returns the nth element of the given list or string. If n is negative the
     * element at index length + n is returned.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig Number -> [a] -> a | Undefined
     * @sig Number -> String -> String
     * @param {Number} offset
     * @param {*} list
     * @return {*}
     * @example
     *
     *      var list = ['foo', 'bar', 'baz', 'quux'];
     *      R.nth(1, list); //=> 'bar'
     *      R.nth(-1, list); //=> 'quux'
     *      R.nth(-99, list); //=> undefined
     *
     *      R.nth(2, 'abc'); //=> 'c'
     *      R.nth(3, 'abc'); //=> ''
     */
    var nth = _curry2(function nth(offset, list) {
        var idx = offset < 0 ? list.length + offset : offset;
        return _isString(list) ? list.charAt(idx) : list[idx];
    });

    /**
     * Returns a function which returns its nth argument.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category Function
     * @sig Number -> *... -> *
     * @param {Number} n
     * @return {Function}
     * @example
     *
     *      R.nthArg(1)('a', 'b', 'c'); //=> 'b'
     *      R.nthArg(-1)('a', 'b', 'c'); //=> 'c'
     */
    var nthArg = _curry1(function nthArg(n) {
        var arity = n < 0 ? 1 : n + 1;
        return curryN(arity, function () {
            return nth(n, arguments);
        });
    });

    /**
     * Creates an object containing a single key:value pair.
     *
     * @func
     * @memberOf R
     * @since v0.18.0
     * @category Object
     * @sig String -> a -> {String:a}
     * @param {String} key
     * @param {*} val
     * @return {Object}
     * @see R.pair
     * @example
     *
     *      var matchPhrases = R.compose(
     *        R.objOf('must'),
     *        R.map(R.objOf('match_phrase'))
     *      );
     *      matchPhrases(['foo', 'bar', 'baz']); //=> {must: [{match_phrase: 'foo'}, {match_phrase: 'bar'}, {match_phrase: 'baz'}]}
     */
    var objOf = _curry2(function objOf(key, val) {
        var obj = {};
        obj[key] = val;
        return obj;
    });

    /**
     * Returns a singleton array containing the value provided.
     *
     * Note this `of` is different from the ES6 `of`; See
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of
     *
     * @func
     * @memberOf R
     * @since v0.3.0
     * @category Function
     * @sig a -> [a]
     * @param {*} x any value
     * @return {Array} An array wrapping `x`.
     * @example
     *
     *      R.of(null); //=> [null]
     *      R.of([42]); //=> [[42]]
     */
    var of = _curry1(_of);

    /**
     * Accepts a function `fn` and returns a function that guards invocation of
     * `fn` such that `fn` can only ever be called once, no matter how many times
     * the returned function is invoked. The first value calculated is returned in
     * subsequent invocations.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig (a... -> b) -> (a... -> b)
     * @param {Function} fn The function to wrap in a call-only-once wrapper.
     * @return {Function} The wrapped function.
     * @example
     *
     *      var addOneOnce = R.once(x => x + 1);
     *      addOneOnce(10); //=> 11
     *      addOneOnce(addOneOnce(50)); //=> 11
     */
    var once = _curry1(function once(fn) {
        var called = false;
        var result;
        return _arity(fn.length, function () {
            if (called) {
                return result;
            }
            called = true;
            result = fn.apply(this, arguments);
            return result;
        });
    });

    /**
     * Returns `true` if one or both of its arguments are `true`. Returns `false`
     * if both arguments are `false`.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Logic
     * @sig * -> * -> *
     * @param {Boolean} a A boolean value
     * @param {Boolean} b A boolean value
     * @return {Boolean} `true` if one or both arguments are `true`, `false` otherwise
     * @see R.either
     * @example
     *
     *      R.or(true, true); //=> true
     *      R.or(true, false); //=> true
     *      R.or(false, true); //=> true
     *      R.or(false, false); //=> false
     */
    var or = _curry2(function or(a, b) {
        return a || b;
    });

    /**
     * Returns the result of "setting" the portion of the given data structure
     * focused by the given lens to the result of applying the given function to
     * the focused value.
     *
     * @func
     * @memberOf R
     * @since v0.16.0
     * @category Object
     * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
     * @sig Lens s a -> (a -> a) -> s -> s
     * @param {Lens} lens
     * @param {*} v
     * @param {*} x
     * @return {*}
     * @see R.prop, R.lensIndex, R.lensProp
     * @example
     *
     *      var headLens = R.lensIndex(0);
     *
     *      R.over(headLens, R.toUpper, ['foo', 'bar', 'baz']); //=> ['FOO', 'bar', 'baz']
     */
    // `Identity` is a functor that holds a single value, where `map` simply
    // transforms the held value with the provided function.
    // The value returned by the getter function is first transformed with `f`,
    // then set as the value of an `Identity`. This is then mapped over with the
    // setter function of the lens.
    var over = function () {
        // `Identity` is a functor that holds a single value, where `map` simply
        // transforms the held value with the provided function.
        var Identity = function (x) {
            return {
                value: x,
                map: function (f) {
                    return Identity(f(x));
                }
            };
        };
        return _curry3(function over(lens, f, x) {
            // The value returned by the getter function is first transformed with `f`,
            // then set as the value of an `Identity`. This is then mapped over with the
            // setter function of the lens.
            return lens(function (y) {
                return Identity(f(y));
            })(x).value;
        });
    }();

    /**
     * Takes two arguments, `fst` and `snd`, and returns `[fst, snd]`.
     *
     * @func
     * @memberOf R
     * @since v0.18.0
     * @category List
     * @sig a -> b -> (a,b)
     * @param {*} fst
     * @param {*} snd
     * @return {Array}
     * @see R.objOf, R.of
     * @example
     *
     *      R.pair('foo', 'bar'); //=> ['foo', 'bar']
     */
    var pair = _curry2(function pair(fst, snd) {
        return [
            fst,
            snd
        ];
    });

    /**
     * Retrieve the value at a given path.
     *
     * @func
     * @memberOf R
     * @since v0.2.0
     * @category Object
     * @sig [String] -> {k: v} -> v | Undefined
     * @param {Array} path The path to use.
     * @param {Object} obj The object to retrieve the nested property from.
     * @return {*} The data at `path`.
     * @see R.prop
     * @example
     *
     *      R.path(['a', 'b'], {a: {b: 2}}); //=> 2
     *      R.path(['a', 'b'], {c: {b: 2}}); //=> undefined
     */
    var path = _curry2(function path(paths, obj) {
        var val = obj;
        var idx = 0;
        while (idx < paths.length) {
            if (val == null) {
                return;
            }
            val = val[paths[idx]];
            idx += 1;
        }
        return val;
    });

    /**
     * If the given, non-null object has a value at the given path, returns the
     * value at that path. Otherwise returns the provided default value.
     *
     * @func
     * @memberOf R
     * @since v0.18.0
     * @category Object
     * @sig a -> [String] -> Object -> a
     * @param {*} d The default value.
     * @param {Array} p The path to use.
     * @param {Object} obj The object to retrieve the nested property from.
     * @return {*} The data at `path` of the supplied object or the default value.
     * @example
     *
     *      R.pathOr('N/A', ['a', 'b'], {a: {b: 2}}); //=> 2
     *      R.pathOr('N/A', ['a', 'b'], {c: {b: 2}}); //=> "N/A"
     */
    var pathOr = _curry3(function pathOr(d, p, obj) {
        return defaultTo(d, path(p, obj));
    });

    /**
     * Returns `true` if the specified object property at given path satisfies the
     * given predicate; `false` otherwise.
     *
     * @func
     * @memberOf R
     * @since v0.19.0
     * @category Logic
     * @sig (a -> Boolean) -> [String] -> Object -> Boolean
     * @param {Function} pred
     * @param {Array} propPath
     * @param {*} obj
     * @return {Boolean}
     * @see R.propSatisfies, R.path
     * @example
     *
     *      R.pathSatisfies(y => y > 0, ['x', 'y'], {x: {y: 2}}); //=> true
     */
    var pathSatisfies = _curry3(function pathSatisfies(pred, propPath, obj) {
        return propPath.length > 0 && pred(path(propPath, obj));
    });

    /**
     * Returns a partial copy of an object containing only the keys specified. If
     * the key does not exist, the property is ignored.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Object
     * @sig [k] -> {k: v} -> {k: v}
     * @param {Array} names an array of String property names to copy onto a new object
     * @param {Object} obj The object to copy from
     * @return {Object} A new object with only properties from `names` on it.
     * @see R.omit, R.props
     * @example
     *
     *      R.pick(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
     *      R.pick(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1}
     */
    var pick = _curry2(function pick(names, obj) {
        var result = {};
        var idx = 0;
        while (idx < names.length) {
            if (names[idx] in obj) {
                result[names[idx]] = obj[names[idx]];
            }
            idx += 1;
        }
        return result;
    });

    /**
     * Similar to `pick` except that this one includes a `key: undefined` pair for
     * properties that don't exist.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Object
     * @sig [k] -> {k: v} -> {k: v}
     * @param {Array} names an array of String property names to copy onto a new object
     * @param {Object} obj The object to copy from
     * @return {Object} A new object with only properties from `names` on it.
     * @see R.pick
     * @example
     *
     *      R.pickAll(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
     *      R.pickAll(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, e: undefined, f: undefined}
     */
    var pickAll = _curry2(function pickAll(names, obj) {
        var result = {};
        var idx = 0;
        var len = names.length;
        while (idx < len) {
            var name = names[idx];
            result[name] = obj[name];
            idx += 1;
        }
        return result;
    });

    /**
     * Returns a partial copy of an object containing only the keys that satisfy
     * the supplied predicate.
     *
     * @func
     * @memberOf R
     * @since v0.8.0
     * @category Object
     * @sig (v, k -> Boolean) -> {k: v} -> {k: v}
     * @param {Function} pred A predicate to determine whether or not a key
     *        should be included on the output object.
     * @param {Object} obj The object to copy from
     * @return {Object} A new object with only properties that satisfy `pred`
     *         on it.
     * @see R.pick, R.filter
     * @example
     *
     *      var isUpperCase = (val, key) => key.toUpperCase() === key;
     *      R.pickBy(isUpperCase, {a: 1, b: 2, A: 3, B: 4}); //=> {A: 3, B: 4}
     */
    var pickBy = _curry2(function pickBy(test, obj) {
        var result = {};
        for (var prop in obj) {
            if (test(obj[prop], prop, obj)) {
                result[prop] = obj[prop];
            }
        }
        return result;
    });

    /**
     * Returns a new list with the given element at the front, followed by the
     * contents of the list.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig a -> [a] -> [a]
     * @param {*} el The item to add to the head of the output list.
     * @param {Array} list The array to add to the tail of the output list.
     * @return {Array} A new array.
     * @see R.append
     * @example
     *
     *      R.prepend('fee', ['fi', 'fo', 'fum']); //=> ['fee', 'fi', 'fo', 'fum']
     */
    var prepend = _curry2(function prepend(el, list) {
        return _concat([el], list);
    });

    /**
     * Returns a function that when supplied an object returns the indicated
     * property of that object, if it exists.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Object
     * @sig s -> {s: a} -> a | Undefined
     * @param {String} p The property name
     * @param {Object} obj The object to query
     * @return {*} The value at `obj.p`.
     * @see R.path
     * @example
     *
     *      R.prop('x', {x: 100}); //=> 100
     *      R.prop('x', {}); //=> undefined
     */
    var prop = _curry2(function prop(p, obj) {
        return obj[p];
    });

    /**
     * Returns `true` if the specified object property is of the given type;
     * `false` otherwise.
     *
     * @func
     * @memberOf R
     * @since v0.16.0
     * @category Type
     * @sig Type -> String -> Object -> Boolean
     * @param {Function} type
     * @param {String} name
     * @param {*} obj
     * @return {Boolean}
     * @see R.is, R.propSatisfies
     * @example
     *
     *      R.propIs(Number, 'x', {x: 1, y: 2});  //=> true
     *      R.propIs(Number, 'x', {x: 'foo'});    //=> false
     *      R.propIs(Number, 'x', {});            //=> false
     */
    var propIs = _curry3(function propIs(type, name, obj) {
        return is(type, obj[name]);
    });

    /**
     * If the given, non-null object has an own property with the specified name,
     * returns the value of that property. Otherwise returns the provided default
     * value.
     *
     * @func
     * @memberOf R
     * @since v0.6.0
     * @category Object
     * @sig a -> String -> Object -> a
     * @param {*} val The default value.
     * @param {String} p The name of the property to return.
     * @param {Object} obj The object to query.
     * @return {*} The value of given property of the supplied object or the default value.
     * @example
     *
     *      var alice = {
     *        name: 'ALICE',
     *        age: 101
     *      };
     *      var favorite = R.prop('favoriteLibrary');
     *      var favoriteWithDefault = R.propOr('Ramda', 'favoriteLibrary');
     *
     *      favorite(alice);  //=> undefined
     *      favoriteWithDefault(alice);  //=> 'Ramda'
     */
    var propOr = _curry3(function propOr(val, p, obj) {
        return obj != null && _has(p, obj) ? obj[p] : val;
    });

    /**
     * Returns `true` if the specified object property satisfies the given
     * predicate; `false` otherwise.
     *
     * @func
     * @memberOf R
     * @since v0.16.0
     * @category Logic
     * @sig (a -> Boolean) -> String -> {String: a} -> Boolean
     * @param {Function} pred
     * @param {String} name
     * @param {*} obj
     * @return {Boolean}
     * @see R.propEq, R.propIs
     * @example
     *
     *      R.propSatisfies(x => x > 0, 'x', {x: 1, y: 2}); //=> true
     */
    var propSatisfies = _curry3(function propSatisfies(pred, name, obj) {
        return pred(obj[name]);
    });

    /**
     * Acts as multiple `prop`: array of keys in, array of values out. Preserves
     * order.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Object
     * @sig [k] -> {k: v} -> [v]
     * @param {Array} ps The property names to fetch
     * @param {Object} obj The object to query
     * @return {Array} The corresponding values or partially applied function.
     * @example
     *
     *      R.props(['x', 'y'], {x: 1, y: 2}); //=> [1, 2]
     *      R.props(['c', 'a', 'b'], {b: 2, a: 1}); //=> [undefined, 1, 2]
     *
     *      var fullName = R.compose(R.join(' '), R.props(['first', 'last']));
     *      fullName({last: 'Bullet-Tooth', age: 33, first: 'Tony'}); //=> 'Tony Bullet-Tooth'
     */
    var props = _curry2(function props(ps, obj) {
        var len = ps.length;
        var out = [];
        var idx = 0;
        while (idx < len) {
            out[idx] = obj[ps[idx]];
            idx += 1;
        }
        return out;
    });

    /**
     * Returns a list of numbers from `from` (inclusive) to `to` (exclusive).
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig Number -> Number -> [Number]
     * @param {Number} from The first number in the list.
     * @param {Number} to One more than the last number in the list.
     * @return {Array} The list of numbers in tthe set `[a, b)`.
     * @example
     *
     *      R.range(1, 5);    //=> [1, 2, 3, 4]
     *      R.range(50, 53);  //=> [50, 51, 52]
     */
    var range = _curry2(function range(from, to) {
        if (!(_isNumber(from) && _isNumber(to))) {
            throw new TypeError('Both arguments to range must be numbers');
        }
        var result = [];
        var n = from;
        while (n < to) {
            result.push(n);
            n += 1;
        }
        return result;
    });

    /**
     * Returns a single item by iterating through the list, successively calling
     * the iterator function and passing it an accumulator value and the current
     * value from the array, and then passing the result to the next call.
     *
     * Similar to `reduce`, except moves through the input list from the right to
     * the left.
     *
     * The iterator function receives two values: *(acc, value)*
     *
     * Note: `R.reduceRight` does not skip deleted or unassigned indices (sparse
     * arrays), unlike the native `Array.prototype.reduce` method. For more details
     * on this behavior, see:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight#Description
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig (a,b -> a) -> a -> [b] -> a
     * @param {Function} fn The iterator function. Receives two values, the accumulator and the
     *        current element from the array.
     * @param {*} acc The accumulator value.
     * @param {Array} list The list to iterate over.
     * @return {*} The final, accumulated value.
     * @see R.addIndex
     * @example
     *
     *      var pairs = [ ['a', 1], ['b', 2], ['c', 3] ];
     *      var flattenPairs = (acc, pair) => acc.concat(pair);
     *
     *      R.reduceRight(flattenPairs, [], pairs); //=> [ 'c', 3, 'b', 2, 'a', 1 ]
     */
    var reduceRight = _curry3(function reduceRight(fn, acc, list) {
        var idx = list.length - 1;
        while (idx >= 0) {
            acc = fn(acc, list[idx]);
            idx -= 1;
        }
        return acc;
    });

    /**
     * Returns a value wrapped to indicate that it is the final value of the reduce
     * and transduce functions. The returned value should be considered a black
     * box: the internal structure is not guaranteed to be stable.
     *
     * Note: this optimization is unavailable to functions not explicitly listed
     * above. For instance, it is not currently supported by reduceRight.
     *
     * @func
     * @memberOf R
     * @since v0.15.0
     * @category List
     * @sig a -> *
     * @param {*} x The final value of the reduce.
     * @return {*} The wrapped value.
     * @see R.reduce, R.transduce
     * @example
     *
     *      R.reduce(
     *        R.pipe(R.add, R.when(R.gte(R.__, 10), R.reduced)),
     *        0,
     *        [1, 2, 3, 4, 5]) // 10
     */
    var reduced = _curry1(_reduced);

    /**
     * Removes the sub-list of `list` starting at index `start` and containing
     * `count` elements. _Note that this is not destructive_: it returns a copy of
     * the list with the changes.
     * <small>No lists have been harmed in the application of this function.</small>
     *
     * @func
     * @memberOf R
     * @since v0.2.2
     * @category List
     * @sig Number -> Number -> [a] -> [a]
     * @param {Number} start The position to start removing elements
     * @param {Number} count The number of elements to remove
     * @param {Array} list The list to remove from
     * @return {Array} A new Array with `count` elements from `start` removed.
     * @example
     *
     *      R.remove(2, 3, [1,2,3,4,5,6,7,8]); //=> [1,2,6,7,8]
     */
    var remove = _curry3(function remove(start, count, list) {
        return _concat(_slice(list, 0, Math.min(start, list.length)), _slice(list, Math.min(list.length, start + count)));
    });

    /**
     * Replace a substring or regex match in a string with a replacement.
     *
     * @func
     * @memberOf R
     * @since v0.7.0
     * @category String
     * @sig RegExp|String -> String -> String -> String
     * @param {RegExp|String} pattern A regular expression or a substring to match.
     * @param {String} replacement The string to replace the matches with.
     * @param {String} str The String to do the search and replacement in.
     * @return {String} The result.
     * @example
     *
     *      R.replace('foo', 'bar', 'foo foo foo'); //=> 'bar foo foo'
     *      R.replace(/foo/, 'bar', 'foo foo foo'); //=> 'bar foo foo'
     *
     *      // Use the "g" (global) flag to replace all occurrences:
     *      R.replace(/foo/g, 'bar', 'foo foo foo'); //=> 'bar bar bar'
     */
    var replace = _curry3(function replace(regex, replacement, str) {
        return str.replace(regex, replacement);
    });

    /**
     * Returns a new list or string with the elements or characters in reverse
     * order.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig [a] -> [a]
     * @sig String -> String
     * @param {Array|String} list
     * @return {Array|String}
     * @example
     *
     *      R.reverse([1, 2, 3]);  //=> [3, 2, 1]
     *      R.reverse([1, 2]);     //=> [2, 1]
     *      R.reverse([1]);        //=> [1]
     *      R.reverse([]);         //=> []
     *
     *      R.reverse('abc');      //=> 'cba'
     *      R.reverse('ab');       //=> 'ba'
     *      R.reverse('a');        //=> 'a'
     *      R.reverse('');         //=> ''
     */
    var reverse = _curry1(function reverse(list) {
        return _isString(list) ? list.split('').reverse().join('') : _slice(list).reverse();
    });

    /**
     * Scan is similar to reduce, but returns a list of successively reduced values
     * from the left
     *
     * @func
     * @memberOf R
     * @since v0.10.0
     * @category List
     * @sig (a,b -> a) -> a -> [b] -> [a]
     * @param {Function} fn The iterator function. Receives two values, the accumulator and the
     *        current element from the array
     * @param {*} acc The accumulator value.
     * @param {Array} list The list to iterate over.
     * @return {Array} A list of all intermediately reduced values.
     * @example
     *
     *      var numbers = [1, 2, 3, 4];
     *      var factorials = R.scan(R.multiply, 1, numbers); //=> [1, 1, 2, 6, 24]
     */
    var scan = _curry3(function scan(fn, acc, list) {
        var idx = 0;
        var len = list.length;
        var result = [acc];
        while (idx < len) {
            acc = fn(acc, list[idx]);
            result[idx + 1] = acc;
            idx += 1;
        }
        return result;
    });

    /**
     * Returns the result of "setting" the portion of the given data structure
     * focused by the given lens to the given value.
     *
     * @func
     * @memberOf R
     * @since v0.16.0
     * @category Object
     * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
     * @sig Lens s a -> a -> s -> s
     * @param {Lens} lens
     * @param {*} v
     * @param {*} x
     * @return {*}
     * @see R.prop, R.lensIndex, R.lensProp
     * @example
     *
     *      var xLens = R.lensProp('x');
     *
     *      R.set(xLens, 4, {x: 1, y: 2});  //=> {x: 4, y: 2}
     *      R.set(xLens, 8, {x: 1, y: 2});  //=> {x: 8, y: 2}
     */
    var set = _curry3(function set(lens, v, x) {
        return over(lens, always(v), x);
    });

    /**
     * Returns the elements of the given list or string (or object with a `slice`
     * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
     *
     * Dispatches to the `slice` method of the third argument, if present.
     *
     * @func
     * @memberOf R
     * @since v0.1.4
     * @category List
     * @sig Number -> Number -> [a] -> [a]
     * @sig Number -> Number -> String -> String
     * @param {Number} fromIndex The start index (inclusive).
     * @param {Number} toIndex The end index (exclusive).
     * @param {*} list
     * @return {*}
     * @example
     *
     *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
     *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
     *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
     *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
     *      R.slice(0, 3, 'ramda');                     //=> 'ram'
     */
    var slice = _curry3(_checkForMethod('slice', function slice(fromIndex, toIndex, list) {
        return Array.prototype.slice.call(list, fromIndex, toIndex);
    }));

    /**
     * Returns a copy of the list, sorted according to the comparator function,
     * which should accept two values at a time and return a negative number if the
     * first value is smaller, a positive number if it's larger, and zero if they
     * are equal. Please note that this is a **copy** of the list. It does not
     * modify the original.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig (a,a -> Number) -> [a] -> [a]
     * @param {Function} comparator A sorting function :: a -> b -> Int
     * @param {Array} list The list to sort
     * @return {Array} a new array with its elements sorted by the comparator function.
     * @example
     *
     *      var diff = function(a, b) { return a - b; };
     *      R.sort(diff, [4,2,7,5]); //=> [2, 4, 5, 7]
     */
    var sort = _curry2(function sort(comparator, list) {
        return _slice(list).sort(comparator);
    });

    /**
     * Sorts the list according to the supplied function.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig Ord b => (a -> b) -> [a] -> [a]
     * @param {Function} fn
     * @param {Array} list The list to sort.
     * @return {Array} A new list sorted by the keys generated by `fn`.
     * @example
     *
     *      var sortByFirstItem = R.sortBy(R.prop(0));
     *      var sortByNameCaseInsensitive = R.sortBy(R.compose(R.toLower, R.prop('name')));
     *      var pairs = [[-1, 1], [-2, 2], [-3, 3]];
     *      sortByFirstItem(pairs); //=> [[-3, 3], [-2, 2], [-1, 1]]
     *      var alice = {
     *        name: 'ALICE',
     *        age: 101
     *      };
     *      var bob = {
     *        name: 'Bob',
     *        age: -10
     *      };
     *      var clara = {
     *        name: 'clara',
     *        age: 314.159
     *      };
     *      var people = [clara, bob, alice];
     *      sortByNameCaseInsensitive(people); //=> [alice, bob, clara]
     */
    var sortBy = _curry2(function sortBy(fn, list) {
        return _slice(list).sort(function (a, b) {
            var aa = fn(a);
            var bb = fn(b);
            return aa < bb ? -1 : aa > bb ? 1 : 0;
        });
    });

    /**
     * Splits a given list or string at a given index.
     *
     * @func
     * @memberOf R
     * @since v0.19.0
     * @category List
     * @sig Number -> [a] -> [[a], [a]]
     * @sig Number -> String -> [String, String]
     * @param {Number} index The index where the array/string is split.
     * @param {Array|String} array The array/string to be split.
     * @return {Array}
     * @example
     *
     *      R.splitAt(1, [1, 2, 3]);          //=> [[1], [2, 3]]
     *      R.splitAt(5, 'hello world');      //=> ['hello', ' world']
     *      R.splitAt(-1, 'foobar');          //=> ['fooba', 'r']
     */
    var splitAt = _curry2(function splitAt(index, array) {
        return [
            slice(0, index, array),
            slice(index, length(array), array)
        ];
    });

    /**
     * Splits a collection into slices of the specified length.
     *
     * @func
     * @memberOf R
     * @since v0.16.0
     * @category List
     * @sig Number -> [a] -> [[a]]
     * @sig Number -> String -> [String]
     * @param {Number} n
     * @param {Array} list
     * @return {Array}
     * @example
     *
     *      R.splitEvery(3, [1, 2, 3, 4, 5, 6, 7]); //=> [[1, 2, 3], [4, 5, 6], [7]]
     *      R.splitEvery(3, 'foobarbaz'); //=> ['foo', 'bar', 'baz']
     */
    var splitEvery = _curry2(function splitEvery(n, list) {
        if (n <= 0) {
            throw new Error('First argument to splitEvery must be a positive integer');
        }
        var result = [];
        var idx = 0;
        while (idx < list.length) {
            result.push(slice(idx, idx += n, list));
        }
        return result;
    });

    /**
     * Takes a list and a predicate and returns a pair of lists with the following properties:
     *
     *  - the result of concatenating the two output lists is equivalent to the input list;
     *  - none of the elements of the first output list satisfies the predicate; and
     *  - if the second output list is non-empty, its first element satisfies the predicate.
     *
     * @func
     * @memberOf R
     * @since v0.19.0
     * @category List
     * @sig (a -> Boolean) -> [a] -> [[a], [a]]
     * @param {Function} pred The predicate that determines where the array is split.
     * @param {Array} list The array to be split.
     * @return {Array}
     * @example
     *
     *      R.splitWhen(R.equals(2), [1, 2, 3, 1, 2, 3]);   //=> [[1], [2, 3, 1, 2, 3]]
     */
    var splitWhen = _curry2(function splitWhen(pred, list) {
        var idx = 0;
        var len = list.length;
        var prefix = [];
        while (idx < len && !pred(list[idx])) {
            prefix.push(list[idx]);
            idx += 1;
        }
        return [
            prefix,
            _slice(list, idx)
        ];
    });

    /**
     * Subtracts its second argument from its first argument.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Math
     * @sig Number -> Number -> Number
     * @param {Number} a The first value.
     * @param {Number} b The second value.
     * @return {Number} The result of `a - b`.
     * @see R.add
     * @example
     *
     *      R.subtract(10, 8); //=> 2
     *
     *      var minus5 = R.subtract(R.__, 5);
     *      minus5(17); //=> 12
     *
     *      var complementaryAngle = R.subtract(90);
     *      complementaryAngle(30); //=> 60
     *      complementaryAngle(72); //=> 18
     */
    var subtract = _curry2(function subtract(a, b) {
        return Number(a) - Number(b);
    });

    /**
     * Returns all but the first element of the given list or string (or object
     * with a `tail` method).
     *
     * Dispatches to the `slice` method of the first argument, if present.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig [a] -> [a]
     * @sig String -> String
     * @param {*} list
     * @return {*}
     * @see R.head, R.init, R.last
     * @example
     *
     *      R.tail([1, 2, 3]);  //=> [2, 3]
     *      R.tail([1, 2]);     //=> [2]
     *      R.tail([1]);        //=> []
     *      R.tail([]);         //=> []
     *
     *      R.tail('abc');  //=> 'bc'
     *      R.tail('ab');   //=> 'b'
     *      R.tail('a');    //=> ''
     *      R.tail('');     //=> ''
     */
    var tail = _checkForMethod('tail', slice(1, Infinity));

    /**
     * Returns the first `n` elements of the given list, string, or
     * transducer/transformer (or object with a `take` method).
     *
     * Dispatches to the `take` method of the second argument, if present.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig Number -> [a] -> [a]
     * @sig Number -> String -> String
     * @param {Number} n
     * @param {*} list
     * @return {*}
     * @see R.drop
     * @example
     *
     *      R.take(1, ['foo', 'bar', 'baz']); //=> ['foo']
     *      R.take(2, ['foo', 'bar', 'baz']); //=> ['foo', 'bar']
     *      R.take(3, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
     *      R.take(4, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
     *      R.take(3, 'ramda');               //=> 'ram'
     *
     *      var personnel = [
     *        'Dave Brubeck',
     *        'Paul Desmond',
     *        'Eugene Wright',
     *        'Joe Morello',
     *        'Gerry Mulligan',
     *        'Bob Bates',
     *        'Joe Dodge',
     *        'Ron Crotty'
     *      ];
     *
     *      var takeFive = R.take(5);
     *      takeFive(personnel);
     *      //=> ['Dave Brubeck', 'Paul Desmond', 'Eugene Wright', 'Joe Morello', 'Gerry Mulligan']
     */
    var take = _curry2(_dispatchable('take', _xtake, function take(n, xs) {
        return slice(0, n < 0 ? Infinity : n, xs);
    }));

    /**
     * Returns a new list containing the last `n` elements of a given list, passing
     * each value to the supplied predicate function, and terminating when the
     * predicate function returns `false`. Excludes the element that caused the
     * predicate function to fail. The predicate function is passed one argument:
     * *(value)*.
     *
     * @func
     * @memberOf R
     * @since v0.16.0
     * @category List
     * @sig (a -> Boolean) -> [a] -> [a]
     * @param {Function} fn The function called per iteration.
     * @param {Array} list The collection to iterate over.
     * @return {Array} A new array.
     * @see R.dropLastWhile, R.addIndex
     * @example
     *
     *      var isNotOne = x => x !== 1;
     *
     *      R.takeLastWhile(isNotOne, [1, 2, 3, 4]); //=> [2, 3, 4]
     */
    var takeLastWhile = _curry2(function takeLastWhile(fn, list) {
        var idx = list.length - 1;
        while (idx >= 0 && fn(list[idx])) {
            idx -= 1;
        }
        return _slice(list, idx + 1, Infinity);
    });

    /**
     * Returns a new list containing the first `n` elements of a given list,
     * passing each value to the supplied predicate function, and terminating when
     * the predicate function returns `false`. Excludes the element that caused the
     * predicate function to fail. The predicate function is passed one argument:
     * *(value)*.
     *
     * Dispatches to the `takeWhile` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig (a -> Boolean) -> [a] -> [a]
     * @param {Function} fn The function called per iteration.
     * @param {Array} list The collection to iterate over.
     * @return {Array} A new array.
     * @see R.dropWhile, R.transduce, R.addIndex
     * @example
     *
     *      var isNotFour = x => x !== 4;
     *
     *      R.takeWhile(isNotFour, [1, 2, 3, 4, 3, 2, 1]); //=> [1, 2, 3]
     */
    var takeWhile = _curry2(_dispatchable('takeWhile', _xtakeWhile, function takeWhile(fn, list) {
        var idx = 0;
        var len = list.length;
        while (idx < len && fn(list[idx])) {
            idx += 1;
        }
        return _slice(list, 0, idx);
    }));

    /**
     * Runs the given function with the supplied object, then returns the object.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig (a -> *) -> a -> a
     * @param {Function} fn The function to call with `x`. The return value of `fn` will be thrown away.
     * @param {*} x
     * @return {*} `x`.
     * @example
     *
     *      var sayX = x => console.log('x is ' + x);
     *      R.tap(sayX, 100); //=> 100
     *      // logs 'x is 100'
     */
    var tap = _curry2(function tap(fn, x) {
        fn(x);
        return x;
    });

    /**
     * Calls an input function `n` times, returning an array containing the results
     * of those function calls.
     *
     * `fn` is passed one argument: The current value of `n`, which begins at `0`
     * and is gradually incremented to `n - 1`.
     *
     * @func
     * @memberOf R
     * @since v0.2.3
     * @category List
     * @sig (Number -> a) -> Number -> [a]
     * @param {Function} fn The function to invoke. Passed one argument, the current value of `n`.
     * @param {Number} n A value between `0` and `n - 1`. Increments after each function call.
     * @return {Array} An array containing the return values of all calls to `fn`.
     * @example
     *
     *      R.times(R.identity, 5); //=> [0, 1, 2, 3, 4]
     */
    var times = _curry2(function times(fn, n) {
        var len = Number(n);
        var idx = 0;
        var list;
        if (len < 0 || isNaN(len)) {
            throw new RangeError('n must be a non-negative number');
        }
        list = new Array(len);
        while (idx < len) {
            list[idx] = fn(idx);
            idx += 1;
        }
        return list;
    });

    /**
     * Converts an object into an array of key, value arrays. Only the object's
     * own properties are used.
     * Note that the order of the output array is not guaranteed to be consistent
     * across different JS platforms.
     *
     * @func
     * @memberOf R
     * @since v0.4.0
     * @category Object
     * @sig {String: *} -> [[String,*]]
     * @param {Object} obj The object to extract from
     * @return {Array} An array of key, value arrays from the object's own properties.
     * @see R.fromPairs
     * @example
     *
     *      R.toPairs({a: 1, b: 2, c: 3}); //=> [['a', 1], ['b', 2], ['c', 3]]
     */
    var toPairs = _curry1(function toPairs(obj) {
        var pairs = [];
        for (var prop in obj) {
            if (_has(prop, obj)) {
                pairs[pairs.length] = [
                    prop,
                    obj[prop]
                ];
            }
        }
        return pairs;
    });

    /**
     * Converts an object into an array of key, value arrays. The object's own
     * properties and prototype properties are used. Note that the order of the
     * output array is not guaranteed to be consistent across different JS
     * platforms.
     *
     * @func
     * @memberOf R
     * @since v0.4.0
     * @category Object
     * @sig {String: *} -> [[String,*]]
     * @param {Object} obj The object to extract from
     * @return {Array} An array of key, value arrays from the object's own
     *         and prototype properties.
     * @example
     *
     *      var F = function() { this.x = 'X'; };
     *      F.prototype.y = 'Y';
     *      var f = new F();
     *      R.toPairsIn(f); //=> [['x','X'], ['y','Y']]
     */
    var toPairsIn = _curry1(function toPairsIn(obj) {
        var pairs = [];
        for (var prop in obj) {
            pairs[pairs.length] = [
                prop,
                obj[prop]
            ];
        }
        return pairs;
    });

    /**
     * Transposes the rows and columns of a 2D list.
     * When passed a list of `n` lists of length `x`,
     * returns a list of `x` lists of length `n`.
     *
     *
     * @func
     * @memberOf R
     * @since v0.19.0
     * @category List
     * @sig [[a]] -> [[a]]
     * @param {Array} list A 2D list
     * @return {Array} A 2D list
     * @example
     *
     *      R.transpose([[1, 'a'], [2, 'b'], [3, 'c']]) //=> [[1, 2, 3], ['a', 'b', 'c']]
     *      R.transpose([[1, 2, 3], ['a', 'b', 'c']]) //=> [[1, 'a'], [2, 'b'], [3, 'c']]
     *
     * If some of the rows are shorter than the following rows, their elements are skipped:
     *
     *      R.transpose([[10, 11], [20], [], [30, 31, 32]]) //=> [[10, 20, 30], [11, 31], [32]]
     */
    var transpose = _curry1(function transpose(outerlist) {
        var i = 0;
        var result = [];
        while (i < outerlist.length) {
            var innerlist = outerlist[i];
            var j = 0;
            while (j < innerlist.length) {
                if (typeof result[j] === 'undefined') {
                    result[j] = [];
                }
                result[j].push(innerlist[j]);
                j += 1;
            }
            i += 1;
        }
        return result;
    });

    /**
     * Removes (strips) whitespace from both ends of the string.
     *
     * @func
     * @memberOf R
     * @since v0.6.0
     * @category String
     * @sig String -> String
     * @param {String} str The string to trim.
     * @return {String} Trimmed version of `str`.
     * @example
     *
     *      R.trim('   xyz  '); //=> 'xyz'
     *      R.map(R.trim, R.split(',', 'x, y, z')); //=> ['x', 'y', 'z']
     */
    var trim = function () {
        var ws = '\t\n\x0B\f\r \xA0\u1680\u180E\u2000\u2001\u2002\u2003' + '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' + '\u2029\uFEFF';
        var zeroWidth = '\u200B';
        var hasProtoTrim = typeof String.prototype.trim === 'function';
        if (!hasProtoTrim || (ws.trim() || !zeroWidth.trim())) {
            return _curry1(function trim(str) {
                var beginRx = new RegExp('^[' + ws + '][' + ws + ']*');
                var endRx = new RegExp('[' + ws + '][' + ws + ']*$');
                return str.replace(beginRx, '').replace(endRx, '');
            });
        } else {
            return _curry1(function trim(str) {
                return str.trim();
            });
        }
    }();

    /**
     * `tryCatch` takes two functions, a `tryer` and a `catcher`. The returned
     * function evaluates the `tryer`; if it does not throw, it simply returns the
     * result. If the `tryer` *does* throw, the returned function evaluates the
     * `catcher` function and returns its result. Note that for effective
     * composition with this function, both the `tryer` and `catcher` functions
     * must return the same type of results.
     *
     * @func
     * @memberOf R
     * @since v0.20.0
     * @category Function
     * @sig (...x -> a) -> ((e, ...x) -> a) -> (...x -> a)
     * @param {Function} tryer The function that may throw.
     * @param {Function} catcher The function that will be evaluated if `tryer` throws.
     * @return {Function} A new function that will catch exceptions and send then to the catcher.
     * @example
     *
     *      R.tryCatch(R.prop('x'), R.F)({x: true}); //=> true
     *      R.tryCatch(R.prop('x'), R.F)(null);      //=> false
     */
    var tryCatch = _curry2(function _tryCatch(tryer, catcher) {
        return _arity(tryer.length, function () {
            try {
                return tryer.apply(this, arguments);
            } catch (e) {
                return catcher.apply(this, _concat([e], arguments));
            }
        });
    });

    /**
     * Gives a single-word string description of the (native) type of a value,
     * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
     * attempt to distinguish user Object types any further, reporting them all as
     * 'Object'.
     *
     * @func
     * @memberOf R
     * @since v0.8.0
     * @category Type
     * @sig (* -> {*}) -> String
     * @param {*} val The value to test
     * @return {String}
     * @example
     *
     *      R.type({}); //=> "Object"
     *      R.type(1); //=> "Number"
     *      R.type(false); //=> "Boolean"
     *      R.type('s'); //=> "String"
     *      R.type(null); //=> "Null"
     *      R.type([]); //=> "Array"
     *      R.type(/[A-z]/); //=> "RegExp"
     */
    var type = _curry1(function type(val) {
        return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);
    });

    /**
     * Takes a function `fn`, which takes a single array argument, and returns a
     * function which:
     *
     *   - takes any number of positional arguments;
     *   - passes these arguments to `fn` as an array; and
     *   - returns the result.
     *
     * In other words, R.unapply derives a variadic function from a function which
     * takes an array. R.unapply is the inverse of R.apply.
     *
     * @func
     * @memberOf R
     * @since v0.8.0
     * @category Function
     * @sig ([*...] -> a) -> (*... -> a)
     * @param {Function} fn
     * @return {Function}
     * @see R.apply
     * @example
     *
     *      R.unapply(JSON.stringify)(1, 2, 3); //=> '[1,2,3]'
     */
    var unapply = _curry1(function unapply(fn) {
        return function () {
            return fn(_slice(arguments));
        };
    });

    /**
     * Wraps a function of any arity (including nullary) in a function that accepts
     * exactly 1 parameter. Any extraneous parameters will not be passed to the
     * supplied function.
     *
     * @func
     * @memberOf R
     * @since v0.2.0
     * @category Function
     * @sig (* -> b) -> (a -> b)
     * @param {Function} fn The function to wrap.
     * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
     *         arity 1.
     * @example
     *
     *      var takesTwoArgs = function(a, b) {
     *        return [a, b];
     *      };
     *      takesTwoArgs.length; //=> 2
     *      takesTwoArgs(1, 2); //=> [1, 2]
     *
     *      var takesOneArg = R.unary(takesTwoArgs);
     *      takesOneArg.length; //=> 1
     *      // Only 1 argument is passed to the wrapped function
     *      takesOneArg(1, 2); //=> [1, undefined]
     */
    var unary = _curry1(function unary(fn) {
        return nAry(1, fn);
    });

    /**
     * Returns a function of arity `n` from a (manually) curried function.
     *
     * @func
     * @memberOf R
     * @since v0.14.0
     * @category Function
     * @sig Number -> (a -> b) -> (a -> c)
     * @param {Number} length The arity for the returned function.
     * @param {Function} fn The function to uncurry.
     * @return {Function} A new function.
     * @see R.curry
     * @example
     *
     *      var addFour = a => b => c => d => a + b + c + d;
     *
     *      var uncurriedAddFour = R.uncurryN(4, addFour);
     *      uncurriedAddFour(1, 2, 3, 4); //=> 10
     */
    var uncurryN = _curry2(function uncurryN(depth, fn) {
        return curryN(depth, function () {
            var currentDepth = 1;
            var value = fn;
            var idx = 0;
            var endIdx;
            while (currentDepth <= depth && typeof value === 'function') {
                endIdx = currentDepth === depth ? arguments.length : idx + value.length;
                value = value.apply(this, _slice(arguments, idx, endIdx));
                currentDepth += 1;
                idx = endIdx;
            }
            return value;
        });
    });

    /**
     * Builds a list from a seed value. Accepts an iterator function, which returns
     * either false to stop iteration or an array of length 2 containing the value
     * to add to the resulting list and the seed to be used in the next call to the
     * iterator function.
     *
     * The iterator function receives one argument: *(seed)*.
     *
     * @func
     * @memberOf R
     * @since v0.10.0
     * @category List
     * @sig (a -> [b]) -> * -> [b]
     * @param {Function} fn The iterator function. receives one argument, `seed`, and returns
     *        either false to quit iteration or an array of length two to proceed. The element
     *        at index 0 of this array will be added to the resulting array, and the element
     *        at index 1 will be passed to the next call to `fn`.
     * @param {*} seed The seed value.
     * @return {Array} The final list.
     * @example
     *
     *      var f = n => n > 50 ? false : [-n, n + 10];
     *      R.unfold(f, 10); //=> [-10, -20, -30, -40, -50]
     */
    var unfold = _curry2(function unfold(fn, seed) {
        var pair = fn(seed);
        var result = [];
        while (pair && pair.length) {
            result[result.length] = pair[0];
            pair = fn(pair[1]);
        }
        return result;
    });

    /**
     * Returns a new list containing only one copy of each element in the original
     * list, based upon the value returned by applying the supplied predicate to
     * two list elements. Prefers the first item if two items compare equal based
     * on the predicate.
     *
     * @func
     * @memberOf R
     * @since v0.2.0
     * @category List
     * @sig (a, a -> Boolean) -> [a] -> [a]
     * @param {Function} pred A predicate used to test whether two items are equal.
     * @param {Array} list The array to consider.
     * @return {Array} The list of unique items.
     * @example
     *
     *      var strEq = R.eqBy(String);
     *      R.uniqWith(strEq)([1, '1', 2, 1]); //=> [1, 2]
     *      R.uniqWith(strEq)([{}, {}]);       //=> [{}]
     *      R.uniqWith(strEq)([1, '1', 1]);    //=> [1]
     *      R.uniqWith(strEq)(['1', 1, 1]);    //=> ['1']
     */
    var uniqWith = _curry2(function uniqWith(pred, list) {
        var idx = 0;
        var len = list.length;
        var result = [];
        var item;
        while (idx < len) {
            item = list[idx];
            if (!_containsWith(pred, item, result)) {
                result[result.length] = item;
            }
            idx += 1;
        }
        return result;
    });

    /**
     * Tests the final argument by passing it to the given predicate function. If
     * the predicate is not satisfied, the function will return the result of
     * calling the `whenFalseFn` function with the same argument. If the predicate
     * is satisfied, the argument is returned as is.
     *
     * @func
     * @memberOf R
     * @since v0.18.0
     * @category Logic
     * @sig (a -> Boolean) -> (a -> a) -> a -> a
     * @param {Function} pred        A predicate function
     * @param {Function} whenFalseFn A function to invoke when the `pred` evaluates
     *                               to a falsy value.
     * @param {*}        x           An object to test with the `pred` function and
     *                               pass to `whenFalseFn` if necessary.
     * @return {*} Either `x` or the result of applying `x` to `whenFalseFn`.
     * @see R.ifElse, R.when
     * @example
     *
     *      // coerceArray :: (a|[a]) -> [a]
     *      var coerceArray = R.unless(R.isArrayLike, R.of);
     *      coerceArray([1, 2, 3]); //=> [1, 2, 3]
     *      coerceArray(1);         //=> [1]
     */
    var unless = _curry3(function unless(pred, whenFalseFn, x) {
        return pred(x) ? x : whenFalseFn(x);
    });

    /**
     * Takes a predicate, a transformation function, and an initial value,
     * and returns a value of the same type as the initial value.
     * It does so by applying the transformation until the predicate is satisfied,
     * at which point it returns the satisfactory value.
     *
     * @func
     * @memberOf R
     * @since v0.20.0
     * @category Logic
     * @sig (a -> Boolean) -> (a -> a) -> a -> a
     * @param {Function} pred A predicate function
     * @param {Function} fn The iterator function
     * @param {*} init Initial value
     * @return {*} Final value that satisfies predicate
     * @example
     *
     *      R.until(R.gt(R.__, 100), R.multiply(2))(1) // => 128
     */
    var until = _curry3(function until(pred, fn, init) {
        var val = init;
        while (!pred(val)) {
            val = fn(val);
        }
        return val;
    });

    /**
     * Returns a new copy of the array with the element at the provided index
     * replaced with the given value.
     *
     * @func
     * @memberOf R
     * @since v0.14.0
     * @category List
     * @sig Number -> a -> [a] -> [a]
     * @param {Number} idx The index to update.
     * @param {*} x The value to exist at the given index of the returned array.
     * @param {Array|Arguments} list The source array-like object to be updated.
     * @return {Array} A copy of `list` with the value at index `idx` replaced with `x`.
     * @see R.adjust
     * @example
     *
     *      R.update(1, 11, [0, 1, 2]);     //=> [0, 11, 2]
     *      R.update(1)(11)([0, 1, 2]);     //=> [0, 11, 2]
     */
    var update = _curry3(function update(idx, x, list) {
        return adjust(always(x), idx, list);
    });

    /**
     * Accepts a function `fn` and a list of transformer functions and returns a
     * new curried function. When the new function is invoked, it calls the
     * function `fn` with parameters consisting of the result of calling each
     * supplied handler on successive arguments to the new function.
     *
     * If more arguments are passed to the returned function than transformer
     * functions, those arguments are passed directly to `fn` as additional
     * parameters. If you expect additional arguments that don't need to be
     * transformed, although you can ignore them, it's best to pass an identity
     * function so that the new function reports the correct arity.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig (x1 -> x2 -> ... -> z) -> [(a -> x1), (b -> x2), ...] -> (a -> b -> ... -> z)
     * @param {Function} fn The function to wrap.
     * @param {Array} transformers A list of transformer functions
     * @return {Function} The wrapped function.
     * @example
     *
     *      R.useWith(Math.pow, [R.identity, R.identity])(3, 4); //=> 81
     *      R.useWith(Math.pow, [R.identity, R.identity])(3)(4); //=> 81
     *      R.useWith(Math.pow, [R.dec, R.inc])(3, 4); //=> 32
     *      R.useWith(Math.pow, [R.dec, R.inc])(3)(4); //=> 32
     */
    var useWith = _curry2(function useWith(fn, transformers) {
        return curryN(transformers.length, function () {
            var args = [];
            var idx = 0;
            while (idx < transformers.length) {
                args.push(transformers[idx].call(this, arguments[idx]));
                idx += 1;
            }
            return fn.apply(this, args.concat(_slice(arguments, transformers.length)));
        });
    });

    /**
     * Returns a list of all the enumerable own properties of the supplied object.
     * Note that the order of the output array is not guaranteed across different
     * JS platforms.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Object
     * @sig {k: v} -> [v]
     * @param {Object} obj The object to extract values from
     * @return {Array} An array of the values of the object's own properties.
     * @example
     *
     *      R.values({a: 1, b: 2, c: 3}); //=> [1, 2, 3]
     */
    var values = _curry1(function values(obj) {
        var props = keys(obj);
        var len = props.length;
        var vals = [];
        var idx = 0;
        while (idx < len) {
            vals[idx] = obj[props[idx]];
            idx += 1;
        }
        return vals;
    });

    /**
     * Returns a list of all the properties, including prototype properties, of the
     * supplied object.
     * Note that the order of the output array is not guaranteed to be consistent
     * across different JS platforms.
     *
     * @func
     * @memberOf R
     * @since v0.2.0
     * @category Object
     * @sig {k: v} -> [v]
     * @param {Object} obj The object to extract values from
     * @return {Array} An array of the values of the object's own and prototype properties.
     * @example
     *
     *      var F = function() { this.x = 'X'; };
     *      F.prototype.y = 'Y';
     *      var f = new F();
     *      R.valuesIn(f); //=> ['X', 'Y']
     */
    var valuesIn = _curry1(function valuesIn(obj) {
        var prop;
        var vs = [];
        for (prop in obj) {
            vs[vs.length] = obj[prop];
        }
        return vs;
    });

    /**
     * Returns a "view" of the given data structure, determined by the given lens.
     * The lens's focus determines which portion of the data structure is visible.
     *
     * @func
     * @memberOf R
     * @since v0.16.0
     * @category Object
     * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
     * @sig Lens s a -> s -> a
     * @param {Lens} lens
     * @param {*} x
     * @return {*}
     * @see R.prop, R.lensIndex, R.lensProp
     * @example
     *
     *      var xLens = R.lensProp('x');
     *
     *      R.view(xLens, {x: 1, y: 2});  //=> 1
     *      R.view(xLens, {x: 4, y: 2});  //=> 4
     */
    // `Const` is a functor that effectively ignores the function given to `map`.
    // Using `Const` effectively ignores the setter function of the `lens`,
    // leaving the value returned by the getter function unmodified.
    var view = function () {
        // `Const` is a functor that effectively ignores the function given to `map`.
        var Const = function (x) {
            return {
                value: x,
                map: function () {
                    return this;
                }
            };
        };
        return _curry2(function view(lens, x) {
            // Using `Const` effectively ignores the setter function of the `lens`,
            // leaving the value returned by the getter function unmodified.
            return lens(Const)(x).value;
        });
    }();

    /**
     * Tests the final argument by passing it to the given predicate function. If
     * the predicate is satisfied, the function will return the result of calling
     * the `whenTrueFn` function with the same argument. If the predicate is not
     * satisfied, the argument is returned as is.
     *
     * @func
     * @memberOf R
     * @since v0.18.0
     * @category Logic
     * @sig (a -> Boolean) -> (a -> a) -> a -> a
     * @param {Function} pred       A predicate function
     * @param {Function} whenTrueFn A function to invoke when the `condition`
     *                              evaluates to a truthy value.
     * @param {*}        x          An object to test with the `pred` function and
     *                              pass to `whenTrueFn` if necessary.
     * @return {*} Either `x` or the result of applying `x` to `whenTrueFn`.
     * @see R.ifElse, R.unless
     * @example
     *
     *      // truncate :: String -> String
     *      var truncate = R.when(
     *        R.propSatisfies(R.gt(R.__, 10), 'length'),
     *        R.pipe(R.take(10), R.append('…'), R.join(''))
     *      );
     *      truncate('12345');         //=> '12345'
     *      truncate('0123456789ABC'); //=> '0123456789…'
     */
    var when = _curry3(function when(pred, whenTrueFn, x) {
        return pred(x) ? whenTrueFn(x) : x;
    });

    /**
     * Takes a spec object and a test object; returns true if the test satisfies
     * the spec. Each of the spec's own properties must be a predicate function.
     * Each predicate is applied to the value of the corresponding property of the
     * test object. `where` returns true if all the predicates return true, false
     * otherwise.
     *
     * `where` is well suited to declaratively expressing constraints for other
     * functions such as `filter` and `find`.
     *
     * @func
     * @memberOf R
     * @since v0.1.1
     * @category Object
     * @sig {String: (* -> Boolean)} -> {String: *} -> Boolean
     * @param {Object} spec
     * @param {Object} testObj
     * @return {Boolean}
     * @example
     *
     *      // pred :: Object -> Boolean
     *      var pred = where({
     *        a: equals('foo'),
     *        b: complement(equals('bar')),
     *        x: gt(__, 10),
     *        y: lt(__, 20)
     *      });
     *
     *      pred({a: 'foo', b: 'xxx', x: 11, y: 19}); //=> true
     *      pred({a: 'xxx', b: 'xxx', x: 11, y: 19}); //=> false
     *      pred({a: 'foo', b: 'bar', x: 11, y: 19}); //=> false
     *      pred({a: 'foo', b: 'xxx', x: 10, y: 19}); //=> false
     *      pred({a: 'foo', b: 'xxx', x: 11, y: 20}); //=> false
     */
    var where = _curry2(function where(spec, testObj) {
        for (var prop in spec) {
            if (_has(prop, spec) && !spec[prop](testObj[prop])) {
                return false;
            }
        }
        return true;
    });

    /**
     * Wrap a function inside another to allow you to make adjustments to the
     * parameters, or do other processing either before the internal function is
     * called or with its results.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig (a... -> b) -> ((a... -> b) -> a... -> c) -> (a... -> c)
     * @param {Function} fn The function to wrap.
     * @param {Function} wrapper The wrapper function.
     * @return {Function} The wrapped function.
     * @deprecated since v0.22.0
     * @example
     *
     *      var greet = name => 'Hello ' + name;
     *
     *      var shoutedGreet = R.wrap(greet, (gr, name) => gr(name).toUpperCase());
     *
     *      shoutedGreet("Kathy"); //=> "HELLO KATHY"
     *
     *      var shortenedGreet = R.wrap(greet, function(gr, name) {
     *        return gr(name.substring(0, 3));
     *      });
     *      shortenedGreet("Robert"); //=> "Hello Rob"
     */
    var wrap = _curry2(function wrap(fn, wrapper) {
        return curryN(fn.length, function () {
            return wrapper.apply(this, _concat([fn], arguments));
        });
    });

    /**
     * Creates a new list out of the two supplied by creating each possible pair
     * from the lists.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig [a] -> [b] -> [[a,b]]
     * @param {Array} as The first list.
     * @param {Array} bs The second list.
     * @return {Array} The list made by combining each possible pair from
     *         `as` and `bs` into pairs (`[a, b]`).
     * @example
     *
     *      R.xprod([1, 2], ['a', 'b']); //=> [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
     */
    // = xprodWith(prepend); (takes about 3 times as long...)
    var xprod = _curry2(function xprod(a, b) {
        // = xprodWith(prepend); (takes about 3 times as long...)
        var idx = 0;
        var ilen = a.length;
        var j;
        var jlen = b.length;
        var result = [];
        while (idx < ilen) {
            j = 0;
            while (j < jlen) {
                result[result.length] = [
                    a[idx],
                    b[j]
                ];
                j += 1;
            }
            idx += 1;
        }
        return result;
    });

    /**
     * Creates a new list out of the two supplied by pairing up equally-positioned
     * items from both lists. The returned list is truncated to the length of the
     * shorter of the two input lists.
     * Note: `zip` is equivalent to `zipWith(function(a, b) { return [a, b] })`.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig [a] -> [b] -> [[a,b]]
     * @param {Array} list1 The first array to consider.
     * @param {Array} list2 The second array to consider.
     * @return {Array} The list made by pairing up same-indexed elements of `list1` and `list2`.
     * @example
     *
     *      R.zip([1, 2, 3], ['a', 'b', 'c']); //=> [[1, 'a'], [2, 'b'], [3, 'c']]
     */
    var zip = _curry2(function zip(a, b) {
        var rv = [];
        var idx = 0;
        var len = Math.min(a.length, b.length);
        while (idx < len) {
            rv[idx] = [
                a[idx],
                b[idx]
            ];
            idx += 1;
        }
        return rv;
    });

    /**
     * Creates a new object out of a list of keys and a list of values.
     * Key/value pairing is truncated to the length of the shorter of the two lists.
     * Note: `zipObj` is equivalent to `pipe(zipWith(pair), fromPairs)`.
     *
     * @func
     * @memberOf R
     * @since v0.3.0
     * @category List
     * @sig [String] -> [*] -> {String: *}
     * @param {Array} keys The array that will be properties on the output object.
     * @param {Array} values The list of values on the output object.
     * @return {Object} The object made by pairing up same-indexed elements of `keys` and `values`.
     * @example
     *
     *      R.zipObj(['a', 'b', 'c'], [1, 2, 3]); //=> {a: 1, b: 2, c: 3}
     */
    var zipObj = _curry2(function zipObj(keys, values) {
        var idx = 0;
        var len = Math.min(keys.length, values.length);
        var out = {};
        while (idx < len) {
            out[keys[idx]] = values[idx];
            idx += 1;
        }
        return out;
    });

    /**
     * Creates a new list out of the two supplied by applying the function to each
     * equally-positioned pair in the lists. The returned list is truncated to the
     * length of the shorter of the two input lists.
     *
     * @function
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig (a,b -> c) -> [a] -> [b] -> [c]
     * @param {Function} fn The function used to combine the two elements into one value.
     * @param {Array} list1 The first array to consider.
     * @param {Array} list2 The second array to consider.
     * @return {Array} The list made by combining same-indexed elements of `list1` and `list2`
     *         using `fn`.
     * @example
     *
     *      var f = (x, y) => {
     *        // ...
     *      };
     *      R.zipWith(f, [1, 2, 3], ['a', 'b', 'c']);
     *      //=> [f(1, 'a'), f(2, 'b'), f(3, 'c')]
     */
    var zipWith = _curry3(function zipWith(fn, a, b) {
        var rv = [];
        var idx = 0;
        var len = Math.min(a.length, b.length);
        while (idx < len) {
            rv[idx] = fn(a[idx], b[idx]);
            idx += 1;
        }
        return rv;
    });

    /**
     * A function that always returns `false`. Any passed in parameters are ignored.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category Function
     * @sig * -> Boolean
     * @param {*}
     * @return {Boolean}
     * @see R.always, R.T
     * @example
     *
     *      R.F(); //=> false
     */
    var F = always(false);

    /**
     * A function that always returns `true`. Any passed in parameters are ignored.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category Function
     * @sig * -> Boolean
     * @param {*}
     * @return {Boolean}
     * @see R.always, R.F
     * @example
     *
     *      R.T(); //=> true
     */
    var T = always(true);

    /**
     * Copies an object.
     *
     * @private
     * @param {*} value The value to be copied
     * @param {Array} refFrom Array containing the source references
     * @param {Array} refTo Array containing the copied source references
     * @param {Boolean} deep Whether or not to perform deep cloning.
     * @return {*} The copied value.
     */
    var _clone = function _clone(value, refFrom, refTo, deep) {
        var copy = function copy(copiedValue) {
            var len = refFrom.length;
            var idx = 0;
            while (idx < len) {
                if (value === refFrom[idx]) {
                    return refTo[idx];
                }
                idx += 1;
            }
            refFrom[idx + 1] = value;
            refTo[idx + 1] = copiedValue;
            for (var key in value) {
                copiedValue[key] = deep ? _clone(value[key], refFrom, refTo, true) : value[key];
            }
            return copiedValue;
        };
        switch (type(value)) {
        case 'Object':
            return copy({});
        case 'Array':
            return copy([]);
        case 'Date':
            return new Date(value.valueOf());
        case 'RegExp':
            return _cloneRegExp(value);
        default:
            return value;
        }
    };

    var _createPartialApplicator = function _createPartialApplicator(concat) {
        return _curry2(function (fn, args) {
            return _arity(Math.max(0, fn.length - args.length), function () {
                return fn.apply(this, concat(args, arguments));
            });
        });
    };

    var _dropLast = function dropLast(n, xs) {
        return take(n < xs.length ? xs.length - n : 0, xs);
    };

    // Values of other types are only equal if identical.
    var _equals = function _equals(a, b, stackA, stackB) {
        if (identical(a, b)) {
            return true;
        }
        if (type(a) !== type(b)) {
            return false;
        }
        if (a == null || b == null) {
            return false;
        }
        if (typeof a.equals === 'function' || typeof b.equals === 'function') {
            return typeof a.equals === 'function' && a.equals(b) && typeof b.equals === 'function' && b.equals(a);
        }
        switch (type(a)) {
        case 'Arguments':
        case 'Array':
        case 'Object':
            if (typeof a.constructor === 'function' && _functionName(a.constructor) === 'Promise') {
                return a === b;
            }
            break;
        case 'Boolean':
        case 'Number':
        case 'String':
            if (!(typeof a === typeof b && identical(a.valueOf(), b.valueOf()))) {
                return false;
            }
            break;
        case 'Date':
            if (!identical(a.valueOf(), b.valueOf())) {
                return false;
            }
            break;
        case 'Error':
            return a.name === b.name && a.message === b.message;
        case 'RegExp':
            if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
                return false;
            }
            break;
        case 'Map':
        case 'Set':
            if (!_equals(_arrayFromIterator(a.entries()), _arrayFromIterator(b.entries()), stackA, stackB)) {
                return false;
            }
            break;
        case 'Int8Array':
        case 'Uint8Array':
        case 'Uint8ClampedArray':
        case 'Int16Array':
        case 'Uint16Array':
        case 'Int32Array':
        case 'Uint32Array':
        case 'Float32Array':
        case 'Float64Array':
            break;
        case 'ArrayBuffer':
            break;
        default:
            // Values of other types are only equal if identical.
            return false;
        }
        var keysA = keys(a);
        if (keysA.length !== keys(b).length) {
            return false;
        }
        var idx = stackA.length - 1;
        while (idx >= 0) {
            if (stackA[idx] === a) {
                return stackB[idx] === b;
            }
            idx -= 1;
        }
        stackA.push(a);
        stackB.push(b);
        idx = keysA.length - 1;
        while (idx >= 0) {
            var key = keysA[idx];
            if (!(_has(key, b) && _equals(b[key], a[key], stackA, stackB))) {
                return false;
            }
            idx -= 1;
        }
        stackA.pop();
        stackB.pop();
        return true;
    };

    /**
     * `_makeFlat` is a helper function that returns a one-level or fully recursive
     * function based on the flag passed in.
     *
     * @private
     */
    var _makeFlat = function _makeFlat(recursive) {
        return function flatt(list) {
            var value, jlen, j;
            var result = [];
            var idx = 0;
            var ilen = list.length;
            while (idx < ilen) {
                if (isArrayLike(list[idx])) {
                    value = recursive ? flatt(list[idx]) : list[idx];
                    j = 0;
                    jlen = value.length;
                    while (j < jlen) {
                        result[result.length] = value[j];
                        j += 1;
                    }
                } else {
                    result[result.length] = list[idx];
                }
                idx += 1;
            }
            return result;
        };
    };

    var _reduce = function () {
        function _arrayReduce(xf, acc, list) {
            var idx = 0;
            var len = list.length;
            while (idx < len) {
                acc = xf['@@transducer/step'](acc, list[idx]);
                if (acc && acc['@@transducer/reduced']) {
                    acc = acc['@@transducer/value'];
                    break;
                }
                idx += 1;
            }
            return xf['@@transducer/result'](acc);
        }
        function _iterableReduce(xf, acc, iter) {
            var step = iter.next();
            while (!step.done) {
                acc = xf['@@transducer/step'](acc, step.value);
                if (acc && acc['@@transducer/reduced']) {
                    acc = acc['@@transducer/value'];
                    break;
                }
                step = iter.next();
            }
            return xf['@@transducer/result'](acc);
        }
        function _methodReduce(xf, acc, obj) {
            return xf['@@transducer/result'](obj.reduce(bind(xf['@@transducer/step'], xf), acc));
        }
        var symIterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';
        return function _reduce(fn, acc, list) {
            if (typeof fn === 'function') {
                fn = _xwrap(fn);
            }
            if (isArrayLike(list)) {
                return _arrayReduce(fn, acc, list);
            }
            if (typeof list.reduce === 'function') {
                return _methodReduce(fn, acc, list);
            }
            if (list[symIterator] != null) {
                return _iterableReduce(fn, acc, list[symIterator]());
            }
            if (typeof list.next === 'function') {
                return _iterableReduce(fn, acc, list);
            }
            throw new TypeError('reduce: list must be array or iterable');
        };
    }();

    var _stepCat = function () {
        var _stepCatArray = {
            '@@transducer/init': Array,
            '@@transducer/step': function (xs, x) {
                xs.push(x);
                return xs;
            },
            '@@transducer/result': _identity
        };
        var _stepCatString = {
            '@@transducer/init': String,
            '@@transducer/step': function (a, b) {
                return a + b;
            },
            '@@transducer/result': _identity
        };
        var _stepCatObject = {
            '@@transducer/init': Object,
            '@@transducer/step': function (result, input) {
                return _assign(result, isArrayLike(input) ? objOf(input[0], input[1]) : input);
            },
            '@@transducer/result': _identity
        };
        return function _stepCat(obj) {
            if (_isTransformer(obj)) {
                return obj;
            }
            if (isArrayLike(obj)) {
                return _stepCatArray;
            }
            if (typeof obj === 'string') {
                return _stepCatString;
            }
            if (typeof obj === 'object') {
                return _stepCatObject;
            }
            throw new Error('Cannot create transformer for ' + obj);
        };
    }();

    var _xdropLastWhile = function () {
        function XDropLastWhile(fn, xf) {
            this.f = fn;
            this.retained = [];
            this.xf = xf;
        }
        XDropLastWhile.prototype['@@transducer/init'] = _xfBase.init;
        XDropLastWhile.prototype['@@transducer/result'] = function (result) {
            this.retained = null;
            return this.xf['@@transducer/result'](result);
        };
        XDropLastWhile.prototype['@@transducer/step'] = function (result, input) {
            return this.f(input) ? this.retain(result, input) : this.flush(result, input);
        };
        XDropLastWhile.prototype.flush = function (result, input) {
            result = _reduce(this.xf['@@transducer/step'], result, this.retained);
            this.retained = [];
            return this.xf['@@transducer/step'](result, input);
        };
        XDropLastWhile.prototype.retain = function (result, input) {
            this.retained.push(input);
            return result;
        };
        return _curry2(function _xdropLastWhile(fn, xf) {
            return new XDropLastWhile(fn, xf);
        });
    }();

    /**
     * Creates a new list iteration function from an existing one by adding two new
     * parameters to its callback function: the current index, and the entire list.
     *
     * This would turn, for instance, Ramda's simple `map` function into one that
     * more closely resembles `Array.prototype.map`. Note that this will only work
     * for functions in which the iteration callback function is the first
     * parameter, and where the list is the last parameter. (This latter might be
     * unimportant if the list parameter is not used.)
     *
     * @func
     * @memberOf R
     * @since v0.15.0
     * @category Function
     * @category List
     * @sig ((a ... -> b) ... -> [a] -> *) -> (a ..., Int, [a] -> b) ... -> [a] -> *)
     * @param {Function} fn A list iteration function that does not pass index or list to its callback
     * @return {Function} An altered list iteration function that passes (item, index, list) to its callback
     * @example
     *
     *      var mapIndexed = R.addIndex(R.map);
     *      mapIndexed((val, idx) => idx + '-' + val, ['f', 'o', 'o', 'b', 'a', 'r']);
     *      //=> ['0-f', '1-o', '2-o', '3-b', '4-a', '5-r']
     */
    var addIndex = _curry1(function addIndex(fn) {
        return curryN(fn.length, function () {
            var idx = 0;
            var origFn = arguments[0];
            var list = arguments[arguments.length - 1];
            var args = _slice(arguments);
            args[0] = function () {
                var result = origFn.apply(this, _concat(arguments, [
                    idx,
                    list
                ]));
                idx += 1;
                return result;
            };
            return fn.apply(this, args);
        });
    });

    /**
     * Wraps a function of any arity (including nullary) in a function that accepts
     * exactly 2 parameters. Any extraneous parameters will not be passed to the
     * supplied function.
     *
     * @func
     * @memberOf R
     * @since v0.2.0
     * @category Function
     * @sig (* -> c) -> (a, b -> c)
     * @param {Function} fn The function to wrap.
     * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
     *         arity 2.
     * @example
     *
     *      var takesThreeArgs = function(a, b, c) {
     *        return [a, b, c];
     *      };
     *      takesThreeArgs.length; //=> 3
     *      takesThreeArgs(1, 2, 3); //=> [1, 2, 3]
     *
     *      var takesTwoArgs = R.binary(takesThreeArgs);
     *      takesTwoArgs.length; //=> 2
     *      // Only 2 arguments are passed to the wrapped function
     *      takesTwoArgs(1, 2, 3); //=> [1, 2, undefined]
     */
    var binary = _curry1(function binary(fn) {
        return nAry(2, fn);
    });

    /**
     * Creates a deep copy of the value which may contain (nested) `Array`s and
     * `Object`s, `Number`s, `String`s, `Boolean`s and `Date`s. `Function`s are not
     * copied, but assigned by their reference.
     *
     * Dispatches to a `clone` method if present.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Object
     * @sig {*} -> {*}
     * @param {*} value The object or array to clone
     * @return {*} A new object or array.
     * @example
     *
     *      var objects = [{}, {}, {}];
     *      var objectsClone = R.clone(objects);
     *      objects[0] === objectsClone[0]; //=> false
     */
    var clone = _curry1(function clone(value) {
        return value != null && typeof value.clone === 'function' ? value.clone() : _clone(value, [], [], true);
    });

    /**
     * Returns a curried equivalent of the provided function. The curried function
     * has two unusual capabilities. First, its arguments needn't be provided one
     * at a time. If `f` is a ternary function and `g` is `R.curry(f)`, the
     * following are equivalent:
     *
     *   - `g(1)(2)(3)`
     *   - `g(1)(2, 3)`
     *   - `g(1, 2)(3)`
     *   - `g(1, 2, 3)`
     *
     * Secondly, the special placeholder value `R.__` may be used to specify
     * "gaps", allowing partial application of any combination of arguments,
     * regardless of their positions. If `g` is as above and `_` is `R.__`, the
     * following are equivalent:
     *
     *   - `g(1, 2, 3)`
     *   - `g(_, 2, 3)(1)`
     *   - `g(_, _, 3)(1)(2)`
     *   - `g(_, _, 3)(1, 2)`
     *   - `g(_, 2)(1)(3)`
     *   - `g(_, 2)(1, 3)`
     *   - `g(_, 2)(_, 3)(1)`
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig (* -> a) -> (* -> a)
     * @param {Function} fn The function to curry.
     * @return {Function} A new, curried function.
     * @see R.curryN
     * @example
     *
     *      var addFourNumbers = (a, b, c, d) => a + b + c + d;
     *
     *      var curriedAddFourNumbers = R.curry(addFourNumbers);
     *      var f = curriedAddFourNumbers(1, 2);
     *      var g = f(3);
     *      g(4); //=> 10
     */
    var curry = _curry1(function curry(fn) {
        return curryN(fn.length, fn);
    });

    /**
     * Returns all but the first `n` elements of the given list, string, or
     * transducer/transformer (or object with a `drop` method).
     *
     * Dispatches to the `drop` method of the second argument, if present.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig Number -> [a] -> [a]
     * @sig Number -> String -> String
     * @param {Number} n
     * @param {*} list
     * @return {*}
     * @see R.take, R.transduce
     * @example
     *
     *      R.drop(1, ['foo', 'bar', 'baz']); //=> ['bar', 'baz']
     *      R.drop(2, ['foo', 'bar', 'baz']); //=> ['baz']
     *      R.drop(3, ['foo', 'bar', 'baz']); //=> []
     *      R.drop(4, ['foo', 'bar', 'baz']); //=> []
     *      R.drop(3, 'ramda');               //=> 'da'
     */
    var drop = _curry2(_dispatchable('drop', _xdrop, function drop(n, xs) {
        return slice(Math.max(0, n), Infinity, xs);
    }));

    /**
     * Returns a list containing all but the last `n` elements of the given `list`.
     *
     * @func
     * @memberOf R
     * @since v0.16.0
     * @category List
     * @sig Number -> [a] -> [a]
     * @sig Number -> String -> String
     * @param {Number} n The number of elements of `xs` to skip.
     * @param {Array} xs The collection to consider.
     * @return {Array}
     * @see R.takeLast
     * @example
     *
     *      R.dropLast(1, ['foo', 'bar', 'baz']); //=> ['foo', 'bar']
     *      R.dropLast(2, ['foo', 'bar', 'baz']); //=> ['foo']
     *      R.dropLast(3, ['foo', 'bar', 'baz']); //=> []
     *      R.dropLast(4, ['foo', 'bar', 'baz']); //=> []
     *      R.dropLast(3, 'ramda');               //=> 'ra'
     */
    var dropLast = _curry2(_dispatchable('dropLast', _xdropLast, _dropLast));

    /**
     * Returns a new list excluding all the tailing elements of a given list which
     * satisfy the supplied predicate function. It passes each value from the right
     * to the supplied predicate function, skipping elements while the predicate
     * function returns `true`. The predicate function is applied to one argument:
     * *(value)*.
     *
     * @func
     * @memberOf R
     * @since v0.16.0
     * @category List
     * @sig (a -> Boolean) -> [a] -> [a]
     * @param {Function} fn The function called per iteration.
     * @param {Array} list The collection to iterate over.
     * @return {Array} A new array.
     * @see R.takeLastWhile, R.addIndex
     * @example
     *
     *      var lteThree = x => x <= 3;
     *
     *      R.dropLastWhile(lteThree, [1, 2, 3, 4, 3, 2, 1]); //=> [1, 2, 3, 4]
     */
    var dropLastWhile = _curry2(_dispatchable('dropLastWhile', _xdropLastWhile, _dropLastWhile));

    /**
     * Returns `true` if its arguments are equivalent, `false` otherwise. Handles
     * cyclical data structures.
     *
     * Dispatches symmetrically to the `equals` methods of both arguments, if
     * present.
     *
     * @func
     * @memberOf R
     * @since v0.15.0
     * @category Relation
     * @sig a -> b -> Boolean
     * @param {*} a
     * @param {*} b
     * @return {Boolean}
     * @example
     *
     *      R.equals(1, 1); //=> true
     *      R.equals(1, '1'); //=> false
     *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
     *
     *      var a = {}; a.v = a;
     *      var b = {}; b.v = b;
     *      R.equals(a, b); //=> true
     */
    var equals = _curry2(function equals(a, b) {
        return _equals(a, b, [], []);
    });

    /**
     * Takes a predicate and a "filterable", and returns a new filterable of the
     * same type containing the members of the given filterable which satisfy the
     * given predicate.
     *
     * Dispatches to the `filter` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig Filterable f => (a -> Boolean) -> f a -> f a
     * @param {Function} pred
     * @param {Array} filterable
     * @return {Array}
     * @see R.reject, R.transduce, R.addIndex
     * @example
     *
     *      var isEven = n => n % 2 === 0;
     *
     *      R.filter(isEven, [1, 2, 3, 4]); //=> [2, 4]
     *
     *      R.filter(isEven, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
     */
    // else
    var filter = _curry2(_dispatchable('filter', _xfilter, function (pred, filterable) {
        return _isObject(filterable) ? _reduce(function (acc, key) {
            if (pred(filterable[key])) {
                acc[key] = filterable[key];
            }
            return acc;
        }, {}, keys(filterable)) : // else
        _filter(pred, filterable);
    }));

    /**
     * Returns a new list by pulling every item out of it (and all its sub-arrays)
     * and putting them in a new array, depth-first.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig [a] -> [b]
     * @param {Array} list The array to consider.
     * @return {Array} The flattened list.
     * @see R.unnest
     * @example
     *
     *      R.flatten([1, 2, [3, 4], 5, [6, [7, 8, [9, [10, 11], 12]]]]);
     *      //=> [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
     */
    var flatten = _curry1(_makeFlat(true));

    /**
     * Returns a new function much like the supplied one, except that the first two
     * arguments' order is reversed.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig (a -> b -> c -> ... -> z) -> (b -> a -> c -> ... -> z)
     * @param {Function} fn The function to invoke with its first two parameters reversed.
     * @return {*} The result of invoking `fn` with its first two parameters' order reversed.
     * @example
     *
     *      var mergeThree = (a, b, c) => [].concat(a, b, c);
     *
     *      mergeThree(1, 2, 3); //=> [1, 2, 3]
     *
     *      R.flip(mergeThree)(1, 2, 3); //=> [2, 1, 3]
     */
    var flip = _curry1(function flip(fn) {
        return curry(function (a, b) {
            var args = _slice(arguments);
            args[0] = b;
            args[1] = a;
            return fn.apply(this, args);
        });
    });

    /**
     * Returns the first element of the given list or string. In some libraries
     * this function is named `first`.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig [a] -> a | Undefined
     * @sig String -> String
     * @param {Array|String} list
     * @return {*}
     * @see R.tail, R.init, R.last
     * @example
     *
     *      R.head(['fi', 'fo', 'fum']); //=> 'fi'
     *      R.head([]); //=> undefined
     *
     *      R.head('abc'); //=> 'a'
     *      R.head(''); //=> ''
     */
    var head = nth(0);

    /**
     * Returns all but the last element of the given list or string.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category List
     * @sig [a] -> [a]
     * @sig String -> String
     * @param {*} list
     * @return {*}
     * @see R.last, R.head, R.tail
     * @example
     *
     *      R.init([1, 2, 3]);  //=> [1, 2]
     *      R.init([1, 2]);     //=> [1]
     *      R.init([1]);        //=> []
     *      R.init([]);         //=> []
     *
     *      R.init('abc');  //=> 'ab'
     *      R.init('ab');   //=> 'a'
     *      R.init('a');    //=> ''
     *      R.init('');     //=> ''
     */
    var init = slice(0, -1);

    /**
     * Combines two lists into a set (i.e. no duplicates) composed of those
     * elements common to both lists. Duplication is determined according to the
     * value returned by applying the supplied predicate to two list elements.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig (a -> a -> Boolean) -> [*] -> [*] -> [*]
     * @param {Function} pred A predicate function that determines whether
     *        the two supplied elements are equal.
     * @param {Array} list1 One list of items to compare
     * @param {Array} list2 A second list of items to compare
     * @return {Array} A new list containing those elements common to both lists.
     * @see R.intersection
     * @example
     *
     *      var buffaloSpringfield = [
     *        {id: 824, name: 'Richie Furay'},
     *        {id: 956, name: 'Dewey Martin'},
     *        {id: 313, name: 'Bruce Palmer'},
     *        {id: 456, name: 'Stephen Stills'},
     *        {id: 177, name: 'Neil Young'}
     *      ];
     *      var csny = [
     *        {id: 204, name: 'David Crosby'},
     *        {id: 456, name: 'Stephen Stills'},
     *        {id: 539, name: 'Graham Nash'},
     *        {id: 177, name: 'Neil Young'}
     *      ];
     *
     *      R.intersectionWith(R.eqBy(R.prop('id')), buffaloSpringfield, csny);
     *      //=> [{id: 456, name: 'Stephen Stills'}, {id: 177, name: 'Neil Young'}]
     */
    var intersectionWith = _curry3(function intersectionWith(pred, list1, list2) {
        var lookupList, filteredList;
        if (list1.length > list2.length) {
            lookupList = list1;
            filteredList = list2;
        } else {
            lookupList = list2;
            filteredList = list1;
        }
        var results = [];
        var idx = 0;
        while (idx < filteredList.length) {
            if (_containsWith(pred, filteredList[idx], lookupList)) {
                results[results.length] = filteredList[idx];
            }
            idx += 1;
        }
        return uniqWith(pred, results);
    });

    /**
     * Transforms the items of the list with the transducer and appends the
     * transformed items to the accumulator using an appropriate iterator function
     * based on the accumulator type.
     *
     * The accumulator can be an array, string, object or a transformer. Iterated
     * items will be appended to arrays and concatenated to strings. Objects will
     * be merged directly or 2-item arrays will be merged as key, value pairs.
     *
     * The accumulator can also be a transformer object that provides a 2-arity
     * reducing iterator function, step, 0-arity initial value function, init, and
     * 1-arity result extraction function result. The step function is used as the
     * iterator function in reduce. The result function is used to convert the
     * final accumulator into the return type and in most cases is R.identity. The
     * init function is used to provide the initial accumulator.
     *
     * The iteration is performed with R.reduce after initializing the transducer.
     *
     * @func
     * @memberOf R
     * @since v0.12.0
     * @category List
     * @sig a -> (b -> b) -> [c] -> a
     * @param {*} acc The initial accumulator value.
     * @param {Function} xf The transducer function. Receives a transformer and returns a transformer.
     * @param {Array} list The list to iterate over.
     * @return {*} The final, accumulated value.
     * @example
     *
     *      var numbers = [1, 2, 3, 4];
     *      var transducer = R.compose(R.map(R.add(1)), R.take(2));
     *
     *      R.into([], transducer, numbers); //=> [2, 3]
     *
     *      var intoArray = R.into([]);
     *      intoArray(transducer, numbers); //=> [2, 3]
     */
    var into = _curry3(function into(acc, xf, list) {
        return _isTransformer(acc) ? _reduce(xf(acc), acc['@@transducer/init'](), list) : _reduce(xf(_stepCat(acc)), _clone(acc, [], [], false), list);
    });

    /**
     * Same as R.invertObj, however this accounts for objects with duplicate values
     * by putting the values into an array.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category Object
     * @sig {s: x} -> {x: [ s, ... ]}
     * @param {Object} obj The object or array to invert
     * @return {Object} out A new object with keys
     * in an array.
     * @example
     *
     *      var raceResultsByFirstName = {
     *        first: 'alice',
     *        second: 'jake',
     *        third: 'alice',
     *      };
     *      R.invert(raceResultsByFirstName);
     *      //=> { 'alice': ['first', 'third'], 'jake':['second'] }
     */
    var invert = _curry1(function invert(obj) {
        var props = keys(obj);
        var len = props.length;
        var idx = 0;
        var out = {};
        while (idx < len) {
            var key = props[idx];
            var val = obj[key];
            var list = _has(val, out) ? out[val] : out[val] = [];
            list[list.length] = key;
            idx += 1;
        }
        return out;
    });

    /**
     * Returns a new object with the keys of the given object as values, and the
     * values of the given object, which are coerced to strings, as keys. Note
     * that the last key found is preferred when handling the same value.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category Object
     * @sig {s: x} -> {x: s}
     * @param {Object} obj The object or array to invert
     * @return {Object} out A new object
     * @example
     *
     *      var raceResults = {
     *        first: 'alice',
     *        second: 'jake'
     *      };
     *      R.invertObj(raceResults);
     *      //=> { 'alice': 'first', 'jake':'second' }
     *
     *      // Alternatively:
     *      var raceResults = ['alice', 'jake'];
     *      R.invertObj(raceResults);
     *      //=> { 'alice': '0', 'jake':'1' }
     */
    var invertObj = _curry1(function invertObj(obj) {
        var props = keys(obj);
        var len = props.length;
        var idx = 0;
        var out = {};
        while (idx < len) {
            var key = props[idx];
            out[obj[key]] = key;
            idx += 1;
        }
        return out;
    });

    /**
     * Returns `true` if the given value is its type's empty value; `false`
     * otherwise.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Logic
     * @sig a -> Boolean
     * @param {*} x
     * @return {Boolean}
     * @see R.empty
     * @example
     *
     *      R.isEmpty([1, 2, 3]);   //=> false
     *      R.isEmpty([]);          //=> true
     *      R.isEmpty('');          //=> true
     *      R.isEmpty(null);        //=> false
     *      R.isEmpty({});          //=> true
     *      R.isEmpty({length: 0}); //=> false
     */
    var isEmpty = _curry1(function isEmpty(x) {
        return x != null && equals(x, empty(x));
    });

    /**
     * Returns the last element of the given list or string.
     *
     * @func
     * @memberOf R
     * @since v0.1.4
     * @category List
     * @sig [a] -> a | Undefined
     * @sig String -> String
     * @param {*} list
     * @return {*}
     * @see R.init, R.head, R.tail
     * @example
     *
     *      R.last(['fi', 'fo', 'fum']); //=> 'fum'
     *      R.last([]); //=> undefined
     *
     *      R.last('abc'); //=> 'c'
     *      R.last(''); //=> ''
     */
    var last = nth(-1);

    /**
     * Returns the position of the last occurrence of an item in an array, or -1 if
     * the item is not included in the array. `R.equals` is used to determine
     * equality.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig a -> [a] -> Number
     * @param {*} target The item to find.
     * @param {Array} xs The array to search in.
     * @return {Number} the index of the target, or -1 if the target is not found.
     * @see R.indexOf
     * @example
     *
     *      R.lastIndexOf(3, [-1,3,3,0,1,2,3,4]); //=> 6
     *      R.lastIndexOf(10, [1,2,3,4]); //=> -1
     */
    var lastIndexOf = _curry2(function lastIndexOf(target, xs) {
        if (typeof xs.lastIndexOf === 'function' && !_isArray(xs)) {
            return xs.lastIndexOf(target);
        } else {
            var idx = xs.length - 1;
            while (idx >= 0) {
                if (equals(xs[idx], target)) {
                    return idx;
                }
                idx -= 1;
            }
            return -1;
        }
    });

    /**
     * Takes a function and
     * a [functor](https://github.com/fantasyland/fantasy-land#functor),
     * applies the function to each of the functor's values, and returns
     * a functor of the same shape.
     *
     * Ramda provides suitable `map` implementations for `Array` and `Object`,
     * so this function may be applied to `[1, 2, 3]` or `{x: 1, y: 2, z: 3}`.
     *
     * Dispatches to the `map` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * Also treats functions as functors and will compose them together.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig Functor f => (a -> b) -> f a -> f b
     * @param {Function} fn The function to be called on every element of the input `list`.
     * @param {Array} list The list to be iterated over.
     * @return {Array} The new list.
     * @see R.transduce, R.addIndex
     * @example
     *
     *      var double = x => x * 2;
     *
     *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]
     *
     *      R.map(double, {x: 1, y: 2, z: 3}); //=> {x: 2, y: 4, z: 6}
     */
    var map = _curry2(_dispatchable('map', _xmap, function map(fn, functor) {
        switch (Object.prototype.toString.call(functor)) {
        case '[object Function]':
            return curryN(functor.length, function () {
                return fn.call(this, functor.apply(this, arguments));
            });
        case '[object Object]':
            return _reduce(function (acc, key) {
                acc[key] = fn(functor[key]);
                return acc;
            }, {}, keys(functor));
        default:
            return _map(fn, functor);
        }
    }));

    /**
     * An Object-specific version of `map`. The function is applied to three
     * arguments: *(value, key, obj)*. If only the value is significant, use
     * `map` instead.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category Object
     * @sig ((*, String, Object) -> *) -> Object -> Object
     * @param {Function} fn
     * @param {Object} obj
     * @return {Object}
     * @see R.map
     * @example
     *
     *      var values = { x: 1, y: 2, z: 3 };
     *      var prependKeyAndDouble = (num, key, obj) => key + (num * 2);
     *
     *      R.mapObjIndexed(prependKeyAndDouble, values); //=> { x: 'x2', y: 'y4', z: 'z6' }
     */
    var mapObjIndexed = _curry2(function mapObjIndexed(fn, obj) {
        return _reduce(function (acc, key) {
            acc[key] = fn(obj[key], key, obj);
            return acc;
        }, {}, keys(obj));
    });

    /**
     * Creates a new object with the own properties of the two provided objects. If
     * a key exists in both objects, the provided function is applied to the values
     * associated with the key in each object, with the result being used as the
     * value associated with the key in the returned object. The key will be
     * excluded from the returned object if the resulting value is `undefined`.
     *
     * @func
     * @memberOf R
     * @since v0.19.0
     * @category Object
     * @sig (a -> a -> a) -> {a} -> {a} -> {a}
     * @param {Function} fn
     * @param {Object} l
     * @param {Object} r
     * @return {Object}
     * @see R.merge, R.mergeWithKey
     * @example
     *
     *      R.mergeWith(R.concat,
     *                  { a: true, values: [10, 20] },
     *                  { b: true, values: [15, 35] });
     *      //=> { a: true, b: true, values: [10, 20, 15, 35] }
     */
    var mergeWith = _curry3(function mergeWith(fn, l, r) {
        return mergeWithKey(function (_, _l, _r) {
            return fn(_l, _r);
        }, l, r);
    });

    /**
     * Takes a function `f` and a list of arguments, and returns a function `g`.
     * When applied, `g` returns the result of applying `f` to the arguments
     * provided initially followed by the arguments provided to `g`.
     *
     * @func
     * @memberOf R
     * @since v0.10.0
     * @category Function
     * @sig ((a, b, c, ..., n) -> x) -> [a, b, c, ...] -> ((d, e, f, ..., n) -> x)
     * @param {Function} f
     * @param {Array} args
     * @return {Function}
     * @see R.partialRight
     * @example
     *
     *      var multiply = (a, b) => a * b;
     *      var double = R.partial(multiply, [2]);
     *      double(2); //=> 4
     *
     *      var greet = (salutation, title, firstName, lastName) =>
     *        salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
     *
     *      var sayHello = R.partial(greet, ['Hello']);
     *      var sayHelloToMs = R.partial(sayHello, ['Ms.']);
     *      sayHelloToMs('Jane', 'Jones'); //=> 'Hello, Ms. Jane Jones!'
     */
    var partial = _createPartialApplicator(_concat);

    /**
     * Takes a function `f` and a list of arguments, and returns a function `g`.
     * When applied, `g` returns the result of applying `f` to the arguments
     * provided to `g` followed by the arguments provided initially.
     *
     * @func
     * @memberOf R
     * @since v0.10.0
     * @category Function
     * @sig ((a, b, c, ..., n) -> x) -> [d, e, f, ..., n] -> ((a, b, c, ...) -> x)
     * @param {Function} f
     * @param {Array} args
     * @return {Function}
     * @see R.partial
     * @example
     *
     *      var greet = (salutation, title, firstName, lastName) =>
     *        salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
     *
     *      var greetMsJaneJones = R.partialRight(greet, ['Ms.', 'Jane', 'Jones']);
     *
     *      greetMsJaneJones('Hello'); //=> 'Hello, Ms. Jane Jones!'
     */
    var partialRight = _createPartialApplicator(flip(_concat));

    /**
     * Determines whether a nested path on an object has a specific value, in
     * `R.equals` terms. Most likely used to filter a list.
     *
     * @func
     * @memberOf R
     * @since v0.7.0
     * @category Relation
     * @sig [String] -> * -> {String: *} -> Boolean
     * @param {Array} path The path of the nested property to use
     * @param {*} val The value to compare the nested property with
     * @param {Object} obj The object to check the nested property in
     * @return {Boolean} `true` if the value equals the nested object property,
     *         `false` otherwise.
     * @example
     *
     *      var user1 = { address: { zipCode: 90210 } };
     *      var user2 = { address: { zipCode: 55555 } };
     *      var user3 = { name: 'Bob' };
     *      var users = [ user1, user2, user3 ];
     *      var isFamous = R.pathEq(['address', 'zipCode'], 90210);
     *      R.filter(isFamous, users); //=> [ user1 ]
     */
    var pathEq = _curry3(function pathEq(_path, val, obj) {
        return equals(path(_path, obj), val);
    });

    /**
     * Returns a new list by plucking the same named property off all objects in
     * the list supplied.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig k -> [{k: v}] -> [v]
     * @param {Number|String} key The key name to pluck off of each object.
     * @param {Array} list The array to consider.
     * @return {Array} The list of values for the given key.
     * @see R.props
     * @example
     *
     *      R.pluck('a')([{a: 1}, {a: 2}]); //=> [1, 2]
     *      R.pluck(0)([[1, 2], [3, 4]]);   //=> [1, 3]
     */
    var pluck = _curry2(function pluck(p, list) {
        return map(prop(p), list);
    });

    /**
     * Reasonable analog to SQL `select` statement.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Object
     * @category Relation
     * @sig [k] -> [{k: v}] -> [{k: v}]
     * @param {Array} props The property names to project
     * @param {Array} objs The objects to query
     * @return {Array} An array of objects with just the `props` properties.
     * @example
     *
     *      var abby = {name: 'Abby', age: 7, hair: 'blond', grade: 2};
     *      var fred = {name: 'Fred', age: 12, hair: 'brown', grade: 7};
     *      var kids = [abby, fred];
     *      R.project(['name', 'grade'], kids); //=> [{name: 'Abby', grade: 2}, {name: 'Fred', grade: 7}]
     */
    // passing `identity` gives correct arity
    var project = useWith(_map, [
        pickAll,
        identity
    ]);

    /**
     * Returns `true` if the specified object property is equal, in `R.equals`
     * terms, to the given value; `false` otherwise.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig String -> a -> Object -> Boolean
     * @param {String} name
     * @param {*} val
     * @param {*} obj
     * @return {Boolean}
     * @see R.equals, R.propSatisfies
     * @example
     *
     *      var abby = {name: 'Abby', age: 7, hair: 'blond'};
     *      var fred = {name: 'Fred', age: 12, hair: 'brown'};
     *      var rusty = {name: 'Rusty', age: 10, hair: 'brown'};
     *      var alois = {name: 'Alois', age: 15, disposition: 'surly'};
     *      var kids = [abby, fred, rusty, alois];
     *      var hasBrownHair = R.propEq('hair', 'brown');
     *      R.filter(hasBrownHair, kids); //=> [fred, rusty]
     */
    var propEq = _curry3(function propEq(name, val, obj) {
        return equals(val, obj[name]);
    });

    /**
     * Returns a single item by iterating through the list, successively calling
     * the iterator function and passing it an accumulator value and the current
     * value from the array, and then passing the result to the next call.
     *
     * The iterator function receives two values: *(acc, value)*. It may use
     * `R.reduced` to shortcut the iteration.
     *
     * Note: `R.reduce` does not skip deleted or unassigned indices (sparse
     * arrays), unlike the native `Array.prototype.reduce` method. For more details
     * on this behavior, see:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
     *
     * Dispatches to the `reduce` method of the third argument, if present.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig ((a, b) -> a) -> a -> [b] -> a
     * @param {Function} fn The iterator function. Receives two values, the accumulator and the
     *        current element from the array.
     * @param {*} acc The accumulator value.
     * @param {Array} list The list to iterate over.
     * @return {*} The final, accumulated value.
     * @see R.reduced, R.addIndex
     * @example
     *
     *      var numbers = [1, 2, 3];
     *      var plus = (a, b) => a + b;
     *
     *      R.reduce(plus, 10, numbers); //=> 16
     */
    var reduce = _curry3(_reduce);

    /**
     * Groups the elements of the list according to the result of calling
     * the String-returning function `keyFn` on each element and reduces the elements
     * of each group to a single value via the reducer function `valueFn`.
     *
     * This function is basically a more general `groupBy` function.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.20.0
     * @category List
     * @sig ((a, b) -> a) -> a -> (b -> String) -> [b] -> {String: a}
     * @param {Function} valueFn The function that reduces the elements of each group to a single
     *        value. Receives two values, accumulator for a particular group and the current element.
     * @param {*} acc The (initial) accumulator value for each group.
     * @param {Function} keyFn The function that maps the list's element into a key.
     * @param {Array} list The array to group.
     * @return {Object} An object with the output of `keyFn` for keys, mapped to the output of
     *         `valueFn` for elements which produced that key when passed to `keyFn`.
     * @see R.groupBy, R.reduce
     * @example
     *
     *      var reduceToNamesBy = R.reduceBy((acc, student) => acc.concat(student.name), []);
     *      var namesByGrade = reduceToNamesBy(function(student) {
     *        var score = student.score;
     *        return score < 65 ? 'F' :
     *               score < 70 ? 'D' :
     *               score < 80 ? 'C' :
     *               score < 90 ? 'B' : 'A';
     *      });
     *      var students = [{name: 'Lucy', score: 92},
     *                      {name: 'Drew', score: 85},
     *                      // ...
     *                      {name: 'Bart', score: 62}];
     *      namesByGrade(students);
     *      // {
     *      //   'A': ['Lucy'],
     *      //   'B': ['Drew']
     *      //   // ...,
     *      //   'F': ['Bart']
     *      // }
     */
    var reduceBy = _curryN(4, [], _dispatchable('reduceBy', _xreduceBy, function reduceBy(valueFn, valueAcc, keyFn, list) {
        return _reduce(function (acc, elt) {
            var key = keyFn(elt);
            acc[key] = valueFn(_has(key, acc) ? acc[key] : valueAcc, elt);
            return acc;
        }, {}, list);
    }));

    /**
     * Like `reduce`, `reduceWhile` returns a single item by iterating through
     * the list, successively calling the iterator function. `reduceWhile` also
     * takes a predicate that is evaluated before each step. If the predicate returns
     * `false`, it "short-circuits" the iteration and returns the current value
     * of the accumulator.
     *
     * @func
     * @memberOf R
     * @since v0.22.0
     * @category List
     * @sig ((a, b) -> Boolean) -> ((a, b) -> a) -> a -> [b] -> a
     * @param {Function} pred The predicate. It is passed the accumulator and the
     *        current element.
     * @param {Function} fn The iterator function. Receives two values, the
     *        accumulator and the current element.
     * @param {*} a The accumulator value.
     * @param {Array} list The list to iterate over.
     * @return {*} The final, accumulated value.
     * @see R.reduce, R.reduced
     * @example
     *
     *      var isOdd = (acc, x) => x % 2 === 1;
     *      var xs = [1, 3, 5, 60, 777, 800];
     *      R.reduceWhile(isOdd, R.add, 0, xs); //=> 9
     *
     *      var ys = [2, 4, 6]
     *      R.reduceWhile(isOdd, R.add, 111, ys); //=> 111
     */
    var reduceWhile = _curryN(4, [], function _reduceWhile(pred, fn, a, list) {
        return _reduce(function (acc, x) {
            return pred(acc, x) ? fn(acc, x) : _reduced(acc);
        }, a, list);
    });

    /**
     * The complement of `filter`.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig Filterable f => (a -> Boolean) -> f a -> f a
     * @param {Function} pred
     * @param {Array} filterable
     * @return {Array}
     * @see R.filter, R.transduce, R.addIndex
     * @example
     *
     *      var isOdd = (n) => n % 2 === 1;
     *
     *      R.reject(isOdd, [1, 2, 3, 4]); //=> [2, 4]
     *
     *      R.reject(isOdd, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
     */
    var reject = _curry2(function reject(pred, filterable) {
        return filter(_complement(pred), filterable);
    });

    /**
     * Returns a fixed list of size `n` containing a specified identical value.
     *
     * @func
     * @memberOf R
     * @since v0.1.1
     * @category List
     * @sig a -> n -> [a]
     * @param {*} value The value to repeat.
     * @param {Number} n The desired size of the output list.
     * @return {Array} A new array containing `n` `value`s.
     * @example
     *
     *      R.repeat('hi', 5); //=> ['hi', 'hi', 'hi', 'hi', 'hi']
     *
     *      var obj = {};
     *      var repeatedObjs = R.repeat(obj, 5); //=> [{}, {}, {}, {}, {}]
     *      repeatedObjs[0] === repeatedObjs[1]; //=> true
     */
    var repeat = _curry2(function repeat(value, n) {
        return times(always(value), n);
    });

    /**
     * Adds together all the elements of a list.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Math
     * @sig [Number] -> Number
     * @param {Array} list An array of numbers
     * @return {Number} The sum of all the numbers in the list.
     * @see R.reduce
     * @example
     *
     *      R.sum([2,4,6,8,100,1]); //=> 121
     */
    var sum = reduce(add, 0);

    /**
     * Returns a new list containing the last `n` elements of the given list.
     * If `n > list.length`, returns a list of `list.length` elements.
     *
     * @func
     * @memberOf R
     * @since v0.16.0
     * @category List
     * @sig Number -> [a] -> [a]
     * @sig Number -> String -> String
     * @param {Number} n The number of elements to return.
     * @param {Array} xs The collection to consider.
     * @return {Array}
     * @see R.dropLast
     * @example
     *
     *      R.takeLast(1, ['foo', 'bar', 'baz']); //=> ['baz']
     *      R.takeLast(2, ['foo', 'bar', 'baz']); //=> ['bar', 'baz']
     *      R.takeLast(3, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
     *      R.takeLast(4, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
     *      R.takeLast(3, 'ramda');               //=> 'mda'
     */
    var takeLast = _curry2(function takeLast(n, xs) {
        return drop(n >= 0 ? xs.length - n : 0, xs);
    });

    /**
     * Initializes a transducer using supplied iterator function. Returns a single
     * item by iterating through the list, successively calling the transformed
     * iterator function and passing it an accumulator value and the current value
     * from the array, and then passing the result to the next call.
     *
     * The iterator function receives two values: *(acc, value)*. It will be
     * wrapped as a transformer to initialize the transducer. A transformer can be
     * passed directly in place of an iterator function. In both cases, iteration
     * may be stopped early with the `R.reduced` function.
     *
     * A transducer is a function that accepts a transformer and returns a
     * transformer and can be composed directly.
     *
     * A transformer is an an object that provides a 2-arity reducing iterator
     * function, step, 0-arity initial value function, init, and 1-arity result
     * extraction function, result. The step function is used as the iterator
     * function in reduce. The result function is used to convert the final
     * accumulator into the return type and in most cases is R.identity. The init
     * function can be used to provide an initial accumulator, but is ignored by
     * transduce.
     *
     * The iteration is performed with R.reduce after initializing the transducer.
     *
     * @func
     * @memberOf R
     * @since v0.12.0
     * @category List
     * @sig (c -> c) -> (a,b -> a) -> a -> [b] -> a
     * @param {Function} xf The transducer function. Receives a transformer and returns a transformer.
     * @param {Function} fn The iterator function. Receives two values, the accumulator and the
     *        current element from the array. Wrapped as transformer, if necessary, and used to
     *        initialize the transducer
     * @param {*} acc The initial accumulator value.
     * @param {Array} list The list to iterate over.
     * @return {*} The final, accumulated value.
     * @see R.reduce, R.reduced, R.into
     * @example
     *
     *      var numbers = [1, 2, 3, 4];
     *      var transducer = R.compose(R.map(R.add(1)), R.take(2));
     *
     *      R.transduce(transducer, R.flip(R.append), [], numbers); //=> [2, 3]
     */
    var transduce = curryN(4, function transduce(xf, fn, acc, list) {
        return _reduce(xf(typeof fn === 'function' ? _xwrap(fn) : fn), acc, list);
    });

    /**
     * Combines two lists into a set (i.e. no duplicates) composed of the elements
     * of each list. Duplication is determined according to the value returned by
     * applying the supplied predicate to two list elements.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig (a -> a -> Boolean) -> [*] -> [*] -> [*]
     * @param {Function} pred A predicate used to test whether two items are equal.
     * @param {Array} list1 The first list.
     * @param {Array} list2 The second list.
     * @return {Array} The first and second lists concatenated, with
     *         duplicates removed.
     * @see R.union
     * @example
     *
     *      var l1 = [{a: 1}, {a: 2}];
     *      var l2 = [{a: 1}, {a: 4}];
     *      R.unionWith(R.eqBy(R.prop('a')), l1, l2); //=> [{a: 1}, {a: 2}, {a: 4}]
     */
    var unionWith = _curry3(function unionWith(pred, list1, list2) {
        return uniqWith(pred, _concat(list1, list2));
    });

    /**
     * Takes a spec object and a test object; returns true if the test satisfies
     * the spec, false otherwise. An object satisfies the spec if, for each of the
     * spec's own properties, accessing that property of the object gives the same
     * value (in `R.equals` terms) as accessing that property of the spec.
     *
     * `whereEq` is a specialization of [`where`](#where).
     *
     * @func
     * @memberOf R
     * @since v0.14.0
     * @category Object
     * @sig {String: *} -> {String: *} -> Boolean
     * @param {Object} spec
     * @param {Object} testObj
     * @return {Boolean}
     * @see R.where
     * @example
     *
     *      // pred :: Object -> Boolean
     *      var pred = R.whereEq({a: 1, b: 2});
     *
     *      pred({a: 1});              //=> false
     *      pred({a: 1, b: 2});        //=> true
     *      pred({a: 1, b: 2, c: 3});  //=> true
     *      pred({a: 1, b: 1});        //=> false
     */
    var whereEq = _curry2(function whereEq(spec, testObj) {
        return where(map(equals, spec), testObj);
    });

    var _flatCat = function () {
        var preservingReduced = function (xf) {
            return {
                '@@transducer/init': _xfBase.init,
                '@@transducer/result': function (result) {
                    return xf['@@transducer/result'](result);
                },
                '@@transducer/step': function (result, input) {
                    var ret = xf['@@transducer/step'](result, input);
                    return ret['@@transducer/reduced'] ? _forceReduced(ret) : ret;
                }
            };
        };
        return function _xcat(xf) {
            var rxf = preservingReduced(xf);
            return {
                '@@transducer/init': _xfBase.init,
                '@@transducer/result': function (result) {
                    return rxf['@@transducer/result'](result);
                },
                '@@transducer/step': function (result, input) {
                    return !isArrayLike(input) ? _reduce(rxf, result, [input]) : _reduce(rxf, result, input);
                }
            };
        };
    }();

    // Array.prototype.indexOf doesn't exist below IE9
    // manually crawl the list to distinguish between +0 and -0
    // NaN
    // non-zero numbers can utilise Set
    // all these types can utilise Set
    // null can utilise Set
    // anything else not covered above, defer to R.equals
    var _indexOf = function _indexOf(list, a, idx) {
        var inf, item;
        // Array.prototype.indexOf doesn't exist below IE9
        if (typeof list.indexOf === 'function') {
            switch (typeof a) {
            case 'number':
                if (a === 0) {
                    // manually crawl the list to distinguish between +0 and -0
                    inf = 1 / a;
                    while (idx < list.length) {
                        item = list[idx];
                        if (item === 0 && 1 / item === inf) {
                            return idx;
                        }
                        idx += 1;
                    }
                    return -1;
                } else if (a !== a) {
                    // NaN
                    while (idx < list.length) {
                        item = list[idx];
                        if (typeof item === 'number' && item !== item) {
                            return idx;
                        }
                        idx += 1;
                    }
                    return -1;
                }
                // non-zero numbers can utilise Set
                return list.indexOf(a, idx);
            // all these types can utilise Set
            case 'string':
            case 'boolean':
            case 'function':
            case 'undefined':
                return list.indexOf(a, idx);
            case 'object':
                if (a === null) {
                    // null can utilise Set
                    return list.indexOf(a, idx);
                }
            }
        }
        // anything else not covered above, defer to R.equals
        while (idx < list.length) {
            if (equals(list[idx], a)) {
                return idx;
            }
            idx += 1;
        }
        return -1;
    };

    var _xchain = _curry2(function _xchain(f, xf) {
        return map(f, _flatCat(xf));
    });

    /**
     * Takes a list of predicates and returns a predicate that returns true for a
     * given list of arguments if every one of the provided predicates is satisfied
     * by those arguments.
     *
     * The function returned is a curried function whose arity matches that of the
     * highest-arity predicate.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category Logic
     * @sig [(*... -> Boolean)] -> (*... -> Boolean)
     * @param {Array} preds
     * @return {Function}
     * @see R.anyPass
     * @example
     *
     *      var isQueen = R.propEq('rank', 'Q');
     *      var isSpade = R.propEq('suit', '♠︎');
     *      var isQueenOfSpades = R.allPass([isQueen, isSpade]);
     *
     *      isQueenOfSpades({rank: 'Q', suit: '♣︎'}); //=> false
     *      isQueenOfSpades({rank: 'Q', suit: '♠︎'}); //=> true
     */
    var allPass = _curry1(function allPass(preds) {
        return curryN(reduce(max, 0, pluck('length', preds)), function () {
            var idx = 0;
            var len = preds.length;
            while (idx < len) {
                if (!preds[idx].apply(this, arguments)) {
                    return false;
                }
                idx += 1;
            }
            return true;
        });
    });

    /**
     * Takes a list of predicates and returns a predicate that returns true for a
     * given list of arguments if at least one of the provided predicates is
     * satisfied by those arguments.
     *
     * The function returned is a curried function whose arity matches that of the
     * highest-arity predicate.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category Logic
     * @sig [(*... -> Boolean)] -> (*... -> Boolean)
     * @param {Array} preds
     * @return {Function}
     * @see R.allPass
     * @example
     *
     *      var gte = R.anyPass([R.gt, R.equals]);
     *
     *      gte(3, 2); //=> true
     *      gte(2, 2); //=> true
     *      gte(2, 3); //=> false
     */
    var anyPass = _curry1(function anyPass(preds) {
        return curryN(reduce(max, 0, pluck('length', preds)), function () {
            var idx = 0;
            var len = preds.length;
            while (idx < len) {
                if (preds[idx].apply(this, arguments)) {
                    return true;
                }
                idx += 1;
            }
            return false;
        });
    });

    /**
     * ap applies a list of functions to a list of values.
     *
     * Dispatches to the `ap` method of the second argument, if present. Also
     * treats curried functions as applicatives.
     *
     * @func
     * @memberOf R
     * @since v0.3.0
     * @category Function
     * @sig [a -> b] -> [a] -> [b]
     * @sig Apply f => f (a -> b) -> f a -> f b
     * @param {Array} fns An array of functions
     * @param {Array} vs An array of values
     * @return {Array} An array of results of applying each of `fns` to all of `vs` in turn.
     * @example
     *
     *      R.ap([R.multiply(2), R.add(3)], [1,2,3]); //=> [2, 4, 6, 4, 5, 6]
     */
    // else
    var ap = _curry2(function ap(applicative, fn) {
        return typeof applicative.ap === 'function' ? applicative.ap(fn) : typeof applicative === 'function' ? function (x) {
            return applicative(x)(fn(x));
        } : // else
        _reduce(function (acc, f) {
            return _concat(acc, map(f, fn));
        }, [], applicative);
    });

    /**
     * Given a spec object recursively mapping properties to functions, creates a
     * function producing an object of the same structure, by mapping each property
     * to the result of calling its associated function with the supplied arguments.
     *
     * @func
     * @memberOf R
     * @since v0.20.0
     * @category Function
     * @sig {k: ((a, b, ..., m) -> v)} -> ((a, b, ..., m) -> {k: v})
     * @param {Object} spec an object recursively mapping properties to functions for
     *        producing the values for these properties.
     * @return {Function} A function that returns an object of the same structure
     * as `spec', with each property set to the value returned by calling its
     * associated function with the supplied arguments.
     * @see R.converge, R.juxt
     * @example
     *
     *      var getMetrics = R.applySpec({
     *                                      sum: R.add,
     *                                      nested: { mul: R.multiply }
     *                                   });
     *      getMetrics(2, 4); // => { sum: 6, nested: { mul: 8 } }
     */
    var applySpec = _curry1(function applySpec(spec) {
        spec = map(function (v) {
            return typeof v == 'function' ? v : applySpec(v);
        }, spec);
        return curryN(reduce(max, 0, pluck('length', values(spec))), function () {
            var args = arguments;
            return map(function (f) {
                return apply(f, args);
            }, spec);
        });
    });

    /**
     * Returns the result of calling its first argument with the remaining
     * arguments. This is occasionally useful as a converging function for
     * `R.converge`: the left branch can produce a function while the right branch
     * produces a value to be passed to that function as an argument.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category Function
     * @sig (*... -> a),*... -> a
     * @param {Function} fn The function to apply to the remaining arguments.
     * @param {...*} args Any number of positional arguments.
     * @return {*}
     * @see R.apply
     * @example
     *
     *      var indentN = R.pipe(R.times(R.always(' ')),
     *                           R.join(''),
     *                           R.replace(/^(?!$)/gm));
     *
     *      var format = R.converge(R.call, [
     *                                  R.pipe(R.prop('indent'), indentN),
     *                                  R.prop('value')
     *                              ]);
     *
     *      format({indent: 2, value: 'foo\nbar\nbaz\n'}); //=> '  foo\n  bar\n  baz\n'
     */
    var call = curry(function call(fn) {
        return fn.apply(this, _slice(arguments, 1));
    });

    /**
     * `chain` maps a function over a list and concatenates the results. `chain`
     * is also known as `flatMap` in some libraries
     *
     * Dispatches to the `chain` method of the second argument, if present,
     * according to the [FantasyLand Chain spec](https://github.com/fantasyland/fantasy-land#chain).
     *
     * @func
     * @memberOf R
     * @since v0.3.0
     * @category List
     * @sig Chain m => (a -> m b) -> m a -> m b
     * @param {Function} fn
     * @param {Array} list
     * @return {Array}
     * @example
     *
     *      var duplicate = n => [n, n];
     *      R.chain(duplicate, [1, 2, 3]); //=> [1, 1, 2, 2, 3, 3]
     */
    var chain = _curry2(_dispatchable('chain', _xchain, function chain(fn, monad) {
        if (typeof monad === 'function') {
            return function () {
                return monad.call(this, fn.apply(this, arguments)).apply(this, arguments);
            };
        }
        return _makeFlat(false)(map(fn, monad));
    }));

    /**
     * Returns a function, `fn`, which encapsulates if/else-if/else logic.
     * `R.cond` takes a list of [predicate, transform] pairs. All of the arguments
     * to `fn` are applied to each of the predicates in turn until one returns a
     * "truthy" value, at which point `fn` returns the result of applying its
     * arguments to the corresponding transformer. If none of the predicates
     * matches, `fn` returns undefined.
     *
     * @func
     * @memberOf R
     * @since v0.6.0
     * @category Logic
     * @sig [[(*... -> Boolean),(*... -> *)]] -> (*... -> *)
     * @param {Array} pairs
     * @return {Function}
     * @example
     *
     *      var fn = R.cond([
     *        [R.equals(0),   R.always('water freezes at 0°C')],
     *        [R.equals(100), R.always('water boils at 100°C')],
     *        [R.T,           temp => 'nothing special happens at ' + temp + '°C']
     *      ]);
     *      fn(0); //=> 'water freezes at 0°C'
     *      fn(50); //=> 'nothing special happens at 50°C'
     *      fn(100); //=> 'water boils at 100°C'
     */
    var cond = _curry1(function cond(pairs) {
        var arity = reduce(max, 0, map(function (pair) {
            return pair[0].length;
        }, pairs));
        return _arity(arity, function () {
            var idx = 0;
            while (idx < pairs.length) {
                if (pairs[idx][0].apply(this, arguments)) {
                    return pairs[idx][1].apply(this, arguments);
                }
                idx += 1;
            }
        });
    });

    /**
     * Wraps a constructor function inside a curried function that can be called
     * with the same arguments and returns the same type. The arity of the function
     * returned is specified to allow using variadic constructor functions.
     *
     * @func
     * @memberOf R
     * @since v0.4.0
     * @category Function
     * @sig Number -> (* -> {*}) -> (* -> {*})
     * @param {Number} n The arity of the constructor function.
     * @param {Function} Fn The constructor function to wrap.
     * @return {Function} A wrapped, curried constructor function.
     * @example
     *
     *      // Variadic constructor function
     *      var Widget = () => {
     *        this.children = Array.prototype.slice.call(arguments);
     *        // ...
     *      };
     *      Widget.prototype = {
     *        // ...
     *      };
     *      var allConfigs = [
     *        // ...
     *      ];
     *      R.map(R.constructN(1, Widget), allConfigs); // a list of Widgets
     */
    var constructN = _curry2(function constructN(n, Fn) {
        if (n > 10) {
            throw new Error('Constructor with greater than ten arguments');
        }
        if (n === 0) {
            return function () {
                return new Fn();
            };
        }
        return curry(nAry(n, function ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) {
            switch (arguments.length) {
            case 1:
                return new Fn($0);
            case 2:
                return new Fn($0, $1);
            case 3:
                return new Fn($0, $1, $2);
            case 4:
                return new Fn($0, $1, $2, $3);
            case 5:
                return new Fn($0, $1, $2, $3, $4);
            case 6:
                return new Fn($0, $1, $2, $3, $4, $5);
            case 7:
                return new Fn($0, $1, $2, $3, $4, $5, $6);
            case 8:
                return new Fn($0, $1, $2, $3, $4, $5, $6, $7);
            case 9:
                return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8);
            case 10:
                return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8, $9);
            }
        }));
    });

    /**
     * Accepts a converging function and a list of branching functions and returns
     * a new function. When invoked, this new function is applied to some
     * arguments, each branching function is applied to those same arguments. The
     * results of each branching function are passed as arguments to the converging
     * function to produce the return value.
     *
     * @func
     * @memberOf R
     * @since v0.4.2
     * @category Function
     * @sig (x1 -> x2 -> ... -> z) -> [(a -> b -> ... -> x1), (a -> b -> ... -> x2), ...] -> (a -> b -> ... -> z)
     * @param {Function} after A function. `after` will be invoked with the return values of
     *        `fn1` and `fn2` as its arguments.
     * @param {Array} functions A list of functions.
     * @return {Function} A new function.
     * @example
     *
     *      var add = (a, b) => a + b;
     *      var multiply = (a, b) => a * b;
     *      var subtract = (a, b) => a - b;
     *
     *      //≅ multiply( add(1, 2), subtract(1, 2) );
     *      R.converge(multiply, [add, subtract])(1, 2); //=> -3
     *
     *      var add3 = (a, b, c) => a + b + c;
     *      R.converge(add3, [multiply, add, subtract])(1, 2); //=> 4
     */
    var converge = _curry2(function converge(after, fns) {
        return curryN(reduce(max, 0, pluck('length', fns)), function () {
            var args = arguments;
            var context = this;
            return after.apply(context, _map(function (fn) {
                return fn.apply(context, args);
            }, fns));
        });
    });

    /**
     * Counts the elements of a list according to how many match each value of a
     * key generated by the supplied function. Returns an object mapping the keys
     * produced by `fn` to the number of occurrences in the list. Note that all
     * keys are coerced to strings because of how JavaScript objects work.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig (a -> String) -> [a] -> {*}
     * @param {Function} fn The function used to map values to keys.
     * @param {Array} list The list to count elements from.
     * @return {Object} An object mapping keys to number of occurrences in the list.
     * @example
     *
     *      var numbers = [1.0, 1.1, 1.2, 2.0, 3.0, 2.2];
     *      var letters = R.split('', 'abcABCaaaBBc');
     *      R.countBy(Math.floor)(numbers);    //=> {'1': 3, '2': 2, '3': 1}
     *      R.countBy(R.toLower)(letters);   //=> {'a': 5, 'b': 4, 'c': 3}
     */
    var countBy = reduceBy(function (acc, elem) {
        return acc + 1;
    }, 0);

    /**
     * Returns a new list without any consecutively repeating elements. Equality is
     * determined by applying the supplied predicate two consecutive elements. The
     * first element in a series of equal element is the one being preserved.
     *
     * Dispatches to the `dropRepeatsWith` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.14.0
     * @category List
     * @sig (a, a -> Boolean) -> [a] -> [a]
     * @param {Function} pred A predicate used to test whether two items are equal.
     * @param {Array} list The array to consider.
     * @return {Array} `list` without repeating elements.
     * @see R.transduce
     * @example
     *
     *      var l = [1, -1, 1, 3, 4, -4, -4, -5, 5, 3, 3];
     *      R.dropRepeatsWith(R.eqBy(Math.abs), l); //=> [1, 3, 4, -5, 3]
     */
    var dropRepeatsWith = _curry2(_dispatchable('dropRepeatsWith', _xdropRepeatsWith, function dropRepeatsWith(pred, list) {
        var result = [];
        var idx = 1;
        var len = list.length;
        if (len !== 0) {
            result[0] = list[0];
            while (idx < len) {
                if (!pred(last(result), list[idx])) {
                    result[result.length] = list[idx];
                }
                idx += 1;
            }
        }
        return result;
    }));

    /**
     * Takes a function and two values in its domain and returns `true` if the
     * values map to the same value in the codomain; `false` otherwise.
     *
     * @func
     * @memberOf R
     * @since v0.18.0
     * @category Relation
     * @sig (a -> b) -> a -> a -> Boolean
     * @param {Function} f
     * @param {*} x
     * @param {*} y
     * @return {Boolean}
     * @example
     *
     *      R.eqBy(Math.abs, 5, -5); //=> true
     */
    var eqBy = _curry3(function eqBy(f, x, y) {
        return equals(f(x), f(y));
    });

    /**
     * Reports whether two objects have the same value, in `R.equals` terms, for
     * the specified property. Useful as a curried predicate.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Object
     * @sig k -> {k: v} -> {k: v} -> Boolean
     * @param {String} prop The name of the property to compare
     * @param {Object} obj1
     * @param {Object} obj2
     * @return {Boolean}
     *
     * @example
     *
     *      var o1 = { a: 1, b: 2, c: 3, d: 4 };
     *      var o2 = { a: 10, b: 20, c: 3, d: 40 };
     *      R.eqProps('a', o1, o2); //=> false
     *      R.eqProps('c', o1, o2); //=> true
     */
    var eqProps = _curry3(function eqProps(prop, obj1, obj2) {
        return equals(obj1[prop], obj2[prop]);
    });

    /**
     * Splits a list into sub-lists stored in an object, based on the result of
     * calling a String-returning function on each element, and grouping the
     * results according to values returned.
     *
     * Dispatches to the `groupBy` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig (a -> String) -> [a] -> {String: [a]}
     * @param {Function} fn Function :: a -> String
     * @param {Array} list The array to group
     * @return {Object} An object with the output of `fn` for keys, mapped to arrays of elements
     *         that produced that key when passed to `fn`.
     * @see R.transduce
     * @example
     *
     *      var byGrade = R.groupBy(function(student) {
     *        var score = student.score;
     *        return score < 65 ? 'F' :
     *               score < 70 ? 'D' :
     *               score < 80 ? 'C' :
     *               score < 90 ? 'B' : 'A';
     *      });
     *      var students = [{name: 'Abby', score: 84},
     *                      {name: 'Eddy', score: 58},
     *                      // ...
     *                      {name: 'Jack', score: 69}];
     *      byGrade(students);
     *      // {
     *      //   'A': [{name: 'Dianne', score: 99}],
     *      //   'B': [{name: 'Abby', score: 84}]
     *      //   // ...,
     *      //   'F': [{name: 'Eddy', score: 58}]
     *      // }
     */
    var groupBy = _curry2(_checkForMethod('groupBy', reduceBy(function (acc, item) {
        if (acc == null) {
            acc = [];
        }
        acc.push(item);
        return acc;
    }, null)));

    /**
     * Given a function that generates a key, turns a list of objects into an
     * object indexing the objects by the given key. Note that if multiple
     * objects generate the same value for the indexing key only the last value
     * will be included in the generated object.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.19.0
     * @category List
     * @sig (a -> String) -> [{k: v}] -> {k: {k: v}}
     * @param {Function} fn Function :: a -> String
     * @param {Array} array The array of objects to index
     * @return {Object} An object indexing each array element by the given property.
     * @example
     *
     *      var list = [{id: 'xyz', title: 'A'}, {id: 'abc', title: 'B'}];
     *      R.indexBy(R.prop('id'), list);
     *      //=> {abc: {id: 'abc', title: 'B'}, xyz: {id: 'xyz', title: 'A'}}
     */
    var indexBy = reduceBy(function (acc, elem) {
        return elem;
    }, null);

    /**
     * Returns the position of the first occurrence of an item in an array, or -1
     * if the item is not included in the array. `R.equals` is used to determine
     * equality.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig a -> [a] -> Number
     * @param {*} target The item to find.
     * @param {Array} xs The array to search in.
     * @return {Number} the index of the target, or -1 if the target is not found.
     * @see R.lastIndexOf
     * @example
     *
     *      R.indexOf(3, [1,2,3,4]); //=> 2
     *      R.indexOf(10, [1,2,3,4]); //=> -1
     */
    var indexOf = _curry2(function indexOf(target, xs) {
        return typeof xs.indexOf === 'function' && !_isArray(xs) ? xs.indexOf(target) : _indexOf(xs, target, 0);
    });

    /**
     * juxt applies a list of functions to a list of values.
     *
     * @func
     * @memberOf R
     * @since v0.19.0
     * @category Function
     * @sig [(a, b, ..., m) -> n] -> ((a, b, ..., m) -> [n])
     * @param {Array} fns An array of functions
     * @return {Function} A function that returns a list of values after applying each of the original `fns` to its parameters.
     * @see R.applySpec
     * @example
     *
     *      var getRange = R.juxt([Math.min, Math.max]);
     *      getRange(3, 4, 9, -3); //=> [-3, 9]
     */
    var juxt = _curry1(function juxt(fns) {
        return converge(_arrayOf, fns);
    });

    /**
     * Returns a lens for the given getter and setter functions. The getter "gets"
     * the value of the focus; the setter "sets" the value of the focus. The setter
     * should not mutate the data structure.
     *
     * @func
     * @memberOf R
     * @since v0.8.0
     * @category Object
     * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
     * @sig (s -> a) -> ((a, s) -> s) -> Lens s a
     * @param {Function} getter
     * @param {Function} setter
     * @return {Lens}
     * @see R.view, R.set, R.over, R.lensIndex, R.lensProp
     * @example
     *
     *      var xLens = R.lens(R.prop('x'), R.assoc('x'));
     *
     *      R.view(xLens, {x: 1, y: 2});            //=> 1
     *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
     *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
     */
    var lens = _curry2(function lens(getter, setter) {
        return function (toFunctorFn) {
            return function (target) {
                return map(function (focus) {
                    return setter(focus, target);
                }, toFunctorFn(getter(target)));
            };
        };
    });

    /**
     * Returns a lens whose focus is the specified index.
     *
     * @func
     * @memberOf R
     * @since v0.14.0
     * @category Object
     * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
     * @sig Number -> Lens s a
     * @param {Number} n
     * @return {Lens}
     * @see R.view, R.set, R.over
     * @example
     *
     *      var headLens = R.lensIndex(0);
     *
     *      R.view(headLens, ['a', 'b', 'c']);            //=> 'a'
     *      R.set(headLens, 'x', ['a', 'b', 'c']);        //=> ['x', 'b', 'c']
     *      R.over(headLens, R.toUpper, ['a', 'b', 'c']); //=> ['A', 'b', 'c']
     */
    var lensIndex = _curry1(function lensIndex(n) {
        return lens(nth(n), update(n));
    });

    /**
     * Returns a lens whose focus is the specified path.
     *
     * @func
     * @memberOf R
     * @since v0.19.0
     * @category Object
     * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
     * @sig [String] -> Lens s a
     * @param {Array} path The path to use.
     * @return {Lens}
     * @see R.view, R.set, R.over
     * @example
     *
     *      var xyLens = R.lensPath(['x', 'y']);
     *
     *      R.view(xyLens, {x: {y: 2, z: 3}});            //=> 2
     *      R.set(xyLens, 4, {x: {y: 2, z: 3}});          //=> {x: {y: 4, z: 3}}
     *      R.over(xyLens, R.negate, {x: {y: 2, z: 3}});  //=> {x: {y: -2, z: 3}}
     */
    var lensPath = _curry1(function lensPath(p) {
        return lens(path(p), assocPath(p));
    });

    /**
     * Returns a lens whose focus is the specified property.
     *
     * @func
     * @memberOf R
     * @since v0.14.0
     * @category Object
     * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
     * @sig String -> Lens s a
     * @param {String} k
     * @return {Lens}
     * @see R.view, R.set, R.over
     * @example
     *
     *      var xLens = R.lensProp('x');
     *
     *      R.view(xLens, {x: 1, y: 2});            //=> 1
     *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
     *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
     */
    var lensProp = _curry1(function lensProp(k) {
        return lens(prop(k), assoc(k));
    });

    /**
     * "lifts" a function to be the specified arity, so that it may "map over" that
     * many lists, Functions or other objects that satisfy the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
     *
     * @func
     * @memberOf R
     * @since v0.7.0
     * @category Function
     * @sig Number -> (*... -> *) -> ([*]... -> [*])
     * @param {Function} fn The function to lift into higher context
     * @return {Function} The lifted function.
     * @see R.lift, R.ap
     * @example
     *
     *      var madd3 = R.liftN(3, R.curryN(3, (...args) => R.sum(args)));
     *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
     */
    var liftN = _curry2(function liftN(arity, fn) {
        var lifted = curryN(arity, fn);
        return curryN(arity, function () {
            return _reduce(ap, map(lifted, arguments[0]), _slice(arguments, 1));
        });
    });

    /**
     * Returns the mean of the given list of numbers.
     *
     * @func
     * @memberOf R
     * @since v0.14.0
     * @category Math
     * @sig [Number] -> Number
     * @param {Array} list
     * @return {Number}
     * @example
     *
     *      R.mean([2, 7, 9]); //=> 6
     *      R.mean([]); //=> NaN
     */
    var mean = _curry1(function mean(list) {
        return sum(list) / list.length;
    });

    /**
     * Returns the median of the given list of numbers.
     *
     * @func
     * @memberOf R
     * @since v0.14.0
     * @category Math
     * @sig [Number] -> Number
     * @param {Array} list
     * @return {Number}
     * @example
     *
     *      R.median([2, 9, 7]); //=> 7
     *      R.median([7, 2, 10, 9]); //=> 8
     *      R.median([]); //=> NaN
     */
    var median = _curry1(function median(list) {
        var len = list.length;
        if (len === 0) {
            return NaN;
        }
        var width = 2 - len % 2;
        var idx = (len - width) / 2;
        return mean(_slice(list).sort(function (a, b) {
            return a < b ? -1 : a > b ? 1 : 0;
        }).slice(idx, idx + width));
    });

    /**
     * Takes a predicate and a list or other "filterable" object and returns the
     * pair of filterable objects of the same type of elements which do and do not
     * satisfy, the predicate, respectively.
     *
     * @func
     * @memberOf R
     * @since v0.1.4
     * @category List
     * @sig Filterable f => (a -> Boolean) -> f a -> [f a, f a]
     * @param {Function} pred A predicate to determine which side the element belongs to.
     * @param {Array} filterable the list (or other filterable) to partition.
     * @return {Array} An array, containing first the subset of elements that satisfy the
     *         predicate, and second the subset of elements that do not satisfy.
     * @see R.filter, R.reject
     * @example
     *
     *      R.partition(R.contains('s'), ['sss', 'ttt', 'foo', 'bars']);
     *      // => [ [ 'sss', 'bars' ],  [ 'ttt', 'foo' ] ]
     *
     *      R.partition(R.contains('s'), { a: 'sss', b: 'ttt', foo: 'bars' });
     *      // => [ { a: 'sss', foo: 'bars' }, { b: 'ttt' }  ]
     */
    var partition = juxt([
        filter,
        reject
    ]);

    /**
     * Performs left-to-right function composition. The leftmost function may have
     * any arity; the remaining functions must be unary.
     *
     * In some libraries this function is named `sequence`.
     *
     * **Note:** The result of pipe is not automatically curried.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)
     * @param {...Function} functions
     * @return {Function}
     * @see R.compose
     * @example
     *
     *      var f = R.pipe(Math.pow, R.negate, R.inc);
     *
     *      f(3, 4); // -(3^4) + 1
     */
    var pipe = function pipe() {
        if (arguments.length === 0) {
            throw new Error('pipe requires at least one argument');
        }
        return _arity(arguments[0].length, reduce(_pipe, arguments[0], tail(arguments)));
    };

    /**
     * Performs left-to-right composition of one or more Promise-returning
     * functions. The leftmost function may have any arity; the remaining functions
     * must be unary.
     *
     * @func
     * @memberOf R
     * @since v0.10.0
     * @category Function
     * @sig ((a -> Promise b), (b -> Promise c), ..., (y -> Promise z)) -> (a -> Promise z)
     * @param {...Function} functions
     * @return {Function}
     * @see R.composeP
     * @example
     *
     *      //  followersForUser :: String -> Promise [User]
     *      var followersForUser = R.pipeP(db.getUserById, db.getFollowers);
     */
    var pipeP = function pipeP() {
        if (arguments.length === 0) {
            throw new Error('pipeP requires at least one argument');
        }
        return _arity(arguments[0].length, reduce(_pipeP, arguments[0], tail(arguments)));
    };

    /**
     * Multiplies together all the elements of a list.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Math
     * @sig [Number] -> Number
     * @param {Array} list An array of numbers
     * @return {Number} The product of all the numbers in the list.
     * @see R.reduce
     * @example
     *
     *      R.product([2,4,6,8,100,1]); //=> 38400
     */
    var product = reduce(multiply, 1);

    /**
     * Transforms a [Traversable](https://github.com/fantasyland/fantasy-land#traversable)
     * of [Applicative](https://github.com/fantasyland/fantasy-land#applicative) into an
     * Applicative of Traversable.
     *
     * Dispatches to the `sequence` method of the second argument, if present.
     *
     * @func
     * @memberOf R
     * @since v0.19.0
     * @category List
     * @sig (Applicative f, Traversable t) => (a -> f a) -> t (f a) -> f (t a)
     * @param {Function} of
     * @param {*} traversable
     * @return {*}
     * @see R.traverse
     * @example
     *
     *      R.sequence(Maybe.of, [Just(1), Just(2), Just(3)]);   //=> Just([1, 2, 3])
     *      R.sequence(Maybe.of, [Just(1), Just(2), Nothing()]); //=> Nothing()
     *
     *      R.sequence(R.of, Just([1, 2, 3])); //=> [Just(1), Just(2), Just(3)]
     *      R.sequence(R.of, Nothing());       //=> [Nothing()]
     */
    var sequence = _curry2(function sequence(of, traversable) {
        return typeof traversable.sequence === 'function' ? traversable.sequence(of) : reduceRight(function (acc, x) {
            return ap(map(prepend, x), acc);
        }, of([]), traversable);
    });

    /**
     * Maps an [Applicative](https://github.com/fantasyland/fantasy-land#applicative)-returning
     * function over a [Traversable](https://github.com/fantasyland/fantasy-land#traversable),
     * then uses [`sequence`](#sequence) to transform the resulting Traversable of Applicative
     * into an Applicative of Traversable.
     *
     * Dispatches to the `sequence` method of the third argument, if present.
     *
     * @func
     * @memberOf R
     * @since v0.19.0
     * @category List
     * @sig (Applicative f, Traversable t) => (a -> f a) -> (a -> f b) -> t a -> f (t b)
     * @param {Function} of
     * @param {Function} f
     * @param {*} traversable
     * @return {*}
     * @see R.sequence
     * @example
     *
     *      // Returns `Nothing` if the given divisor is `0`
     *      safeDiv = n => d => d === 0 ? Nothing() : Just(n / d)
     *
     *      R.traverse(Maybe.of, safeDiv(10), [2, 4, 5]); //=> Just([5, 2.5, 2])
     *      R.traverse(Maybe.of, safeDiv(10), [2, 0, 5]); //=> Nothing
     */
    var traverse = _curry3(function traverse(of, f, traversable) {
        return sequence(of, map(f, traversable));
    });

    /**
     * Shorthand for `R.chain(R.identity)`, which removes one level of nesting from
     * any [Chain](https://github.com/fantasyland/fantasy-land#chain).
     *
     * @func
     * @memberOf R
     * @since v0.3.0
     * @category List
     * @sig Chain c => c (c a) -> c a
     * @param {*} list
     * @return {*}
     * @see R.flatten, R.chain
     * @example
     *
     *      R.unnest([1, [2], [[3]]]); //=> [1, 2, [3]]
     *      R.unnest([[1, 2], [3, 4], [5, 6]]); //=> [1, 2, 3, 4, 5, 6]
     */
    var unnest = chain(_identity);

    var _contains = function _contains(a, list) {
        return _indexOf(list, a, 0) >= 0;
    };

    //  mapPairs :: (Object, [String]) -> [String]
    var _toString = function _toString(x, seen) {
        var recur = function recur(y) {
            var xs = seen.concat([x]);
            return _contains(y, xs) ? '<Circular>' : _toString(y, xs);
        };
        //  mapPairs :: (Object, [String]) -> [String]
        var mapPairs = function (obj, keys) {
            return _map(function (k) {
                return _quote(k) + ': ' + recur(obj[k]);
            }, keys.slice().sort());
        };
        switch (Object.prototype.toString.call(x)) {
        case '[object Arguments]':
            return '(function() { return arguments; }(' + _map(recur, x).join(', ') + '))';
        case '[object Array]':
            return '[' + _map(recur, x).concat(mapPairs(x, reject(function (k) {
                return /^\d+$/.test(k);
            }, keys(x)))).join(', ') + ']';
        case '[object Boolean]':
            return typeof x === 'object' ? 'new Boolean(' + recur(x.valueOf()) + ')' : x.toString();
        case '[object Date]':
            return 'new Date(' + (isNaN(x.valueOf()) ? recur(NaN) : _quote(_toISOString(x))) + ')';
        case '[object Null]':
            return 'null';
        case '[object Number]':
            return typeof x === 'object' ? 'new Number(' + recur(x.valueOf()) + ')' : 1 / x === -Infinity ? '-0' : x.toString(10);
        case '[object String]':
            return typeof x === 'object' ? 'new String(' + recur(x.valueOf()) + ')' : _quote(x);
        case '[object Undefined]':
            return 'undefined';
        default:
            if (typeof x.toString === 'function') {
                var repr = x.toString();
                if (repr !== '[object Object]') {
                    return repr;
                }
            }
            return '{' + mapPairs(x, keys(x)).join(', ') + '}';
        }
    };

    /**
     * Performs right-to-left function composition. The rightmost function may have
     * any arity; the remaining functions must be unary.
     *
     * **Note:** The result of compose is not automatically curried.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig ((y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)) -> ((a, b, ..., n) -> z)
     * @param {...Function} functions
     * @return {Function}
     * @see R.pipe
     * @example
     *
     *      var f = R.compose(R.inc, R.negate, Math.pow);
     *
     *      f(3, 4); // -(3^4) + 1
     */
    var compose = function compose() {
        if (arguments.length === 0) {
            throw new Error('compose requires at least one argument');
        }
        return pipe.apply(this, reverse(arguments));
    };

    /**
     * Returns the right-to-left Kleisli composition of the provided functions,
     * each of which must return a value of a type supported by [`chain`](#chain).
     *
     * `R.composeK(h, g, f)` is equivalent to `R.compose(R.chain(h), R.chain(g), R.chain(f))`.
     *
     * @func
     * @memberOf R
     * @since v0.16.0
     * @category Function
     * @sig Chain m => ((y -> m z), (x -> m y), ..., (a -> m b)) -> (m a -> m z)
     * @param {...Function}
     * @return {Function}
     * @see R.pipeK
     * @example
     *
     *      //  parseJson :: String -> Maybe *
     *      //  get :: String -> Object -> Maybe *
     *
     *      //  getStateCode :: Maybe String -> Maybe String
     *      var getStateCode = R.composeK(
     *        R.compose(Maybe.of, R.toUpper),
     *        get('state'),
     *        get('address'),
     *        get('user'),
     *        parseJson
     *      );
     *
     *      getStateCode(Maybe.of('{"user":{"address":{"state":"ny"}}}'));
     *      //=> Just('NY')
     *      getStateCode(Maybe.of('[Invalid JSON]'));
     *      //=> Nothing()
     */
    var composeK = function composeK() {
        return compose.apply(this, prepend(identity, map(chain, arguments)));
    };

    /**
     * Performs right-to-left composition of one or more Promise-returning
     * functions. The rightmost function may have any arity; the remaining
     * functions must be unary.
     *
     * @func
     * @memberOf R
     * @since v0.10.0
     * @category Function
     * @sig ((y -> Promise z), (x -> Promise y), ..., (a -> Promise b)) -> (a -> Promise z)
     * @param {...Function} functions
     * @return {Function}
     * @see R.pipeP
     * @example
     *
     *      //  followersForUser :: String -> Promise [User]
     *      var followersForUser = R.composeP(db.getFollowers, db.getUserById);
     */
    var composeP = function composeP() {
        if (arguments.length === 0) {
            throw new Error('composeP requires at least one argument');
        }
        return pipeP.apply(this, reverse(arguments));
    };

    /**
     * Wraps a constructor function inside a curried function that can be called
     * with the same arguments and returns the same type.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig (* -> {*}) -> (* -> {*})
     * @param {Function} Fn The constructor function to wrap.
     * @return {Function} A wrapped, curried constructor function.
     * @example
     *
     *      // Constructor function
     *      var Widget = config => {
     *        // ...
     *      };
     *      Widget.prototype = {
     *        // ...
     *      };
     *      var allConfigs = [
     *        // ...
     *      ];
     *      R.map(R.construct(Widget), allConfigs); // a list of Widgets
     */
    var construct = _curry1(function construct(Fn) {
        return constructN(Fn.length, Fn);
    });

    /**
     * Returns `true` if the specified value is equal, in `R.equals` terms, to at
     * least one element of the given list; `false` otherwise.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig a -> [a] -> Boolean
     * @param {Object} a The item to compare against.
     * @param {Array} list The array to consider.
     * @return {Boolean} `true` if the item is in the list, `false` otherwise.
     * @see R.any
     * @example
     *
     *      R.contains(3, [1, 2, 3]); //=> true
     *      R.contains(4, [1, 2, 3]); //=> false
     *      R.contains([42], [[42]]); //=> true
     */
    var contains = _curry2(_contains);

    /**
     * Finds the set (i.e. no duplicates) of all elements in the first list not
     * contained in the second list.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig [*] -> [*] -> [*]
     * @param {Array} list1 The first list.
     * @param {Array} list2 The second list.
     * @return {Array} The elements in `list1` that are not in `list2`.
     * @see R.differenceWith, R.symmetricDifference, R.symmetricDifferenceWith
     * @example
     *
     *      R.difference([1,2,3,4], [7,6,5,4,3]); //=> [1,2]
     *      R.difference([7,6,5,4,3], [1,2,3,4]); //=> [7,6,5]
     */
    var difference = _curry2(function difference(first, second) {
        var out = [];
        var idx = 0;
        var firstLen = first.length;
        while (idx < firstLen) {
            if (!_contains(first[idx], second) && !_contains(first[idx], out)) {
                out[out.length] = first[idx];
            }
            idx += 1;
        }
        return out;
    });

    /**
     * Returns a new list without any consecutively repeating elements. `R.equals`
     * is used to determine equality.
     *
     * Dispatches to the `dropRepeats` method of the first argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.14.0
     * @category List
     * @sig [a] -> [a]
     * @param {Array} list The array to consider.
     * @return {Array} `list` without repeating elements.
     * @see R.transduce
     * @example
     *
     *     R.dropRepeats([1, 1, 1, 2, 3, 4, 4, 2, 2]); //=> [1, 2, 3, 4, 2]
     */
    var dropRepeats = _curry1(_dispatchable('dropRepeats', _xdropRepeatsWith(equals), dropRepeatsWith(equals)));

    /**
     * "lifts" a function of arity > 1 so that it may "map over" a list, Function or other
     * object that satisfies the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
     *
     * @func
     * @memberOf R
     * @since v0.7.0
     * @category Function
     * @sig (*... -> *) -> ([*]... -> [*])
     * @param {Function} fn The function to lift into higher context
     * @return {Function} The lifted function.
     * @see R.liftN
     * @example
     *
     *      var madd3 = R.lift(R.curry((a, b, c) => a + b + c));
     *
     *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
     *
     *      var madd5 = R.lift(R.curry((a, b, c, d, e) => a + b + c + d + e));
     *
     *      madd5([1,2], [3], [4, 5], [6], [7, 8]); //=> [21, 22, 22, 23, 22, 23, 23, 24]
     */
    var lift = _curry1(function lift(fn) {
        return liftN(fn.length, fn);
    });

    /**
     * Returns a partial copy of an object omitting the keys specified.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Object
     * @sig [String] -> {String: *} -> {String: *}
     * @param {Array} names an array of String property names to omit from the new object
     * @param {Object} obj The object to copy from
     * @return {Object} A new object with properties from `names` not on it.
     * @see R.pick
     * @example
     *
     *      R.omit(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, c: 3}
     */
    var omit = _curry2(function omit(names, obj) {
        var result = {};
        for (var prop in obj) {
            if (!_contains(prop, names)) {
                result[prop] = obj[prop];
            }
        }
        return result;
    });

    /**
     * Returns the left-to-right Kleisli composition of the provided functions,
     * each of which must return a value of a type supported by [`chain`](#chain).
     *
     * `R.pipeK(f, g, h)` is equivalent to `R.pipe(R.chain(f), R.chain(g), R.chain(h))`.
     *
     * @func
     * @memberOf R
     * @since v0.16.0
     * @category Function
     * @sig Chain m => ((a -> m b), (b -> m c), ..., (y -> m z)) -> (m a -> m z)
     * @param {...Function}
     * @return {Function}
     * @see R.composeK
     * @example
     *
     *      //  parseJson :: String -> Maybe *
     *      //  get :: String -> Object -> Maybe *
     *
     *      //  getStateCode :: Maybe String -> Maybe String
     *      var getStateCode = R.pipeK(
     *        parseJson,
     *        get('user'),
     *        get('address'),
     *        get('state'),
     *        R.compose(Maybe.of, R.toUpper)
     *      );
     *
     *      getStateCode(Maybe.of('{"user":{"address":{"state":"ny"}}}'));
     *      //=> Just('NY')
     *      getStateCode(Maybe.of('[Invalid JSON]'));
     *      //=> Nothing()
     */
    var pipeK = function pipeK() {
        return composeK.apply(this, reverse(arguments));
    };

    /**
     * Returns the string representation of the given value. `eval`'ing the output
     * should result in a value equivalent to the input value. Many of the built-in
     * `toString` methods do not satisfy this requirement.
     *
     * If the given value is an `[object Object]` with a `toString` method other
     * than `Object.prototype.toString`, this method is invoked with no arguments
     * to produce the return value. This means user-defined constructor functions
     * can provide a suitable `toString` method. For example:
     *
     *     function Point(x, y) {
     *       this.x = x;
     *       this.y = y;
     *     }
     *
     *     Point.prototype.toString = function() {
     *       return 'new Point(' + this.x + ', ' + this.y + ')';
     *     };
     *
     *     R.toString(new Point(1, 2)); //=> 'new Point(1, 2)'
     *
     * @func
     * @memberOf R
     * @since v0.14.0
     * @category String
     * @sig * -> String
     * @param {*} val
     * @return {String}
     * @example
     *
     *      R.toString(42); //=> '42'
     *      R.toString('abc'); //=> '"abc"'
     *      R.toString([1, 2, 3]); //=> '[1, 2, 3]'
     *      R.toString({foo: 1, bar: 2, baz: 3}); //=> '{"bar": 2, "baz": 3, "foo": 1}'
     *      R.toString(new Date('2001-02-03T04:05:06Z')); //=> 'new Date("2001-02-03T04:05:06.000Z")'
     */
    var toString = _curry1(function toString(val) {
        return _toString(val, []);
    });

    /**
     * Returns a new list without values in the first argument.
     * `R.equals` is used to determine equality.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @func
     * @memberOf R
     * @since v0.19.0
     * @category List
     * @sig [a] -> [a] -> [a]
     * @param {Array} list1 The values to be removed from `list2`.
     * @param {Array} list2 The array to remove values from.
     * @return {Array} The new array without values in `list1`.
     * @see R.transduce
     * @example
     *
     *      R.without([1, 2], [1, 2, 1, 3, 4]); //=> [3, 4]
     */
    var without = _curry2(function (xs, list) {
        return reject(flip(_contains)(xs), list);
    });

    // A simple Set type that honours R.equals semantics
    /* globals Set */
    // until we figure out why jsdoc chokes on this
    // @param item The item to add to the Set
    // @returns {boolean} true if the item did not exist prior, otherwise false
    //
    //
    // @param item The item to check for existence in the Set
    // @returns {boolean} true if the item exists in the Set, otherwise false
    //
    //
    // Combines the logic for checking whether an item is a member of the set and
    // for adding a new item to the set.
    //
    // @param item       The item to check or add to the Set instance.
    // @param shouldAdd  If true, the item will be added to the set if it doesn't
    //                   already exist.
    // @param set        The set instance to check or add to.
    // @return {boolean} true if the item already existed, otherwise false.
    //
    // distinguish between +0 and -0
    // these types can all utilise the native Set
    // set._items['boolean'] holds a two element array
    // representing [ falseExists, trueExists ]
    // compare functions for reference equality
    /* falls through */
    // reduce the search size of heterogeneous sets by creating buckets
    // for each type.
    // scan through all previously applied items
    var _Set = function () {
        function _Set() {
            /* globals Set */
            this._nativeSet = typeof Set === 'function' ? new Set() : null;
            this._items = {};
        }
        // until we figure out why jsdoc chokes on this
        // @param item The item to add to the Set
        // @returns {boolean} true if the item did not exist prior, otherwise false
        //
        _Set.prototype.add = function (item) {
            return !hasOrAdd(item, true, this);
        };
        //
        // @param item The item to check for existence in the Set
        // @returns {boolean} true if the item exists in the Set, otherwise false
        //
        _Set.prototype.has = function (item) {
            return hasOrAdd(item, false, this);
        };
        //
        // Combines the logic for checking whether an item is a member of the set and
        // for adding a new item to the set.
        //
        // @param item       The item to check or add to the Set instance.
        // @param shouldAdd  If true, the item will be added to the set if it doesn't
        //                   already exist.
        // @param set        The set instance to check or add to.
        // @return {boolean} true if the item already existed, otherwise false.
        //
        function hasOrAdd(item, shouldAdd, set) {
            var type = typeof item;
            var prevSize, newSize;
            switch (type) {
            case 'string':
            case 'number':
                // distinguish between +0 and -0
                if (item === 0 && 1 / item === -Infinity) {
                    if (set._items['-0']) {
                        return true;
                    } else {
                        if (shouldAdd) {
                            set._items['-0'] = true;
                        }
                        return false;
                    }
                }
                // these types can all utilise the native Set
                if (set._nativeSet !== null) {
                    if (shouldAdd) {
                        prevSize = set._nativeSet.size;
                        set._nativeSet.add(item);
                        newSize = set._nativeSet.size;
                        return newSize === prevSize;
                    } else {
                        return set._nativeSet.has(item);
                    }
                } else {
                    if (!(type in set._items)) {
                        if (shouldAdd) {
                            set._items[type] = {};
                            set._items[type][item] = true;
                        }
                        return false;
                    } else if (item in set._items[type]) {
                        return true;
                    } else {
                        if (shouldAdd) {
                            set._items[type][item] = true;
                        }
                        return false;
                    }
                }
            case 'boolean':
                // set._items['boolean'] holds a two element array
                // representing [ falseExists, trueExists ]
                if (type in set._items) {
                    var bIdx = item ? 1 : 0;
                    if (set._items[type][bIdx]) {
                        return true;
                    } else {
                        if (shouldAdd) {
                            set._items[type][bIdx] = true;
                        }
                        return false;
                    }
                } else {
                    if (shouldAdd) {
                        set._items[type] = item ? [
                            false,
                            true
                        ] : [
                            true,
                            false
                        ];
                    }
                    return false;
                }
            case 'function':
                // compare functions for reference equality
                if (set._nativeSet !== null) {
                    if (shouldAdd) {
                        prevSize = set._nativeSet.size;
                        set._nativeSet.add(item);
                        newSize = set._nativeSet.size;
                        return newSize > prevSize;
                    } else {
                        return set._nativeSet.has(item);
                    }
                } else {
                    if (!(type in set._items)) {
                        if (shouldAdd) {
                            set._items[type] = [item];
                        }
                        return false;
                    }
                    if (!_contains(item, set._items[type])) {
                        if (shouldAdd) {
                            set._items[type].push(item);
                        }
                        return false;
                    }
                    return true;
                }
            case 'undefined':
                if (set._items[type]) {
                    return true;
                } else {
                    if (shouldAdd) {
                        set._items[type] = true;
                    }
                    return false;
                }
            case 'object':
                if (item === null) {
                    if (!set._items['null']) {
                        if (shouldAdd) {
                            set._items['null'] = true;
                        }
                        return false;
                    }
                    return true;
                }
            /* falls through */
            default:
                // reduce the search size of heterogeneous sets by creating buckets
                // for each type.
                type = Object.prototype.toString.call(item);
                if (!(type in set._items)) {
                    if (shouldAdd) {
                        set._items[type] = [item];
                    }
                    return false;
                }
                // scan through all previously applied items
                if (!_contains(item, set._items[type])) {
                    if (shouldAdd) {
                        set._items[type].push(item);
                    }
                    return false;
                }
                return true;
            }
        }
        return _Set;
    }();

    /**
     * A function wrapping calls to the two functions in an `&&` operation,
     * returning the result of the first function if it is false-y and the result
     * of the second function otherwise. Note that this is short-circuited,
     * meaning that the second function will not be invoked if the first returns a
     * false-y value.
     *
     * In addition to functions, `R.both` also accepts any fantasy-land compatible
     * applicative functor.
     *
     * @func
     * @memberOf R
     * @since v0.12.0
     * @category Logic
     * @sig (*... -> Boolean) -> (*... -> Boolean) -> (*... -> Boolean)
     * @param {Function} f a predicate
     * @param {Function} g another predicate
     * @return {Function} a function that applies its arguments to `f` and `g` and `&&`s their outputs together.
     * @see R.and
     * @example
     *
     *      var gt10 = x => x > 10;
     *      var even = x => x % 2 === 0;
     *      var f = R.both(gt10, even);
     *      f(100); //=> true
     *      f(101); //=> false
     */
    var both = _curry2(function both(f, g) {
        return _isFunction(f) ? function _both() {
            return f.apply(this, arguments) && g.apply(this, arguments);
        } : lift(and)(f, g);
    });

    /**
     * Takes a function `f` and returns a function `g` such that:
     *
     *   - applying `g` to zero or more arguments will give __true__ if applying
     *     the same arguments to `f` gives a logical __false__ value; and
     *
     *   - applying `g` to zero or more arguments will give __false__ if applying
     *     the same arguments to `f` gives a logical __true__ value.
     *
     * `R.complement` will work on all other functors as well.
     *
     * @func
     * @memberOf R
     * @since v0.12.0
     * @category Logic
     * @sig (*... -> *) -> (*... -> Boolean)
     * @param {Function} f
     * @return {Function}
     * @see R.not
     * @example
     *
     *      var isEven = n => n % 2 === 0;
     *      var isOdd = R.complement(isEven);
     *      isOdd(21); //=> true
     *      isOdd(42); //=> false
     */
    var complement = lift(not);

    /**
     * Returns the result of concatenating the given lists or strings.
     *
     * Note: `R.concat` expects both arguments to be of the same type,
     * unlike the native `Array.prototype.concat` method. It will throw
     * an error if you `concat` an Array with a non-Array value.
     *
     * Dispatches to the `concat` method of the first argument, if present.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig [a] -> [a] -> [a]
     * @sig String -> String -> String
     * @param {Array|String} a
     * @param {Array|String} b
     * @return {Array|String}
     *
     * @example
     *
     *      R.concat([], []); //=> []
     *      R.concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
     *      R.concat('ABC', 'DEF'); // 'ABCDEF'
     */
    var concat = _curry2(function concat(a, b) {
        if (a == null || !_isFunction(a.concat)) {
            throw new TypeError(toString(a) + ' does not have a method named "concat"');
        }
        if (_isArray(a) && !_isArray(b)) {
            throw new TypeError(toString(b) + ' is not an array');
        }
        return a.concat(b);
    });

    /**
     * A function wrapping calls to the two functions in an `||` operation,
     * returning the result of the first function if it is truth-y and the result
     * of the second function otherwise. Note that this is short-circuited,
     * meaning that the second function will not be invoked if the first returns a
     * truth-y value.
     *
     * In addition to functions, `R.either` also accepts any fantasy-land compatible
     * applicative functor.
     *
     * @func
     * @memberOf R
     * @since v0.12.0
     * @category Logic
     * @sig (*... -> Boolean) -> (*... -> Boolean) -> (*... -> Boolean)
     * @param {Function} f a predicate
     * @param {Function} g another predicate
     * @return {Function} a function that applies its arguments to `f` and `g` and `||`s their outputs together.
     * @see R.or
     * @example
     *
     *      var gt10 = x => x > 10;
     *      var even = x => x % 2 === 0;
     *      var f = R.either(gt10, even);
     *      f(101); //=> true
     *      f(8); //=> true
     */
    var either = _curry2(function either(f, g) {
        return _isFunction(f) ? function _either() {
            return f.apply(this, arguments) || g.apply(this, arguments);
        } : lift(or)(f, g);
    });

    /**
     * Turns a named method with a specified arity into a function that can be
     * called directly supplied with arguments and a target object.
     *
     * The returned function is curried and accepts `arity + 1` parameters where
     * the final parameter is the target object.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig Number -> String -> (a -> b -> ... -> n -> Object -> *)
     * @param {Number} arity Number of arguments the returned function should take
     *        before the target object.
     * @param {String} method Name of the method to call.
     * @return {Function} A new curried function.
     * @example
     *
     *      var sliceFrom = R.invoker(1, 'slice');
     *      sliceFrom(6, 'abcdefghijklm'); //=> 'ghijklm'
     *      var sliceFrom6 = R.invoker(2, 'slice')(6);
     *      sliceFrom6(8, 'abcdefghijklm'); //=> 'gh'
     */
    var invoker = _curry2(function invoker(arity, method) {
        return curryN(arity + 1, function () {
            var target = arguments[arity];
            if (target != null && _isFunction(target[method])) {
                return target[method].apply(target, _slice(arguments, 0, arity));
            }
            throw new TypeError(toString(target) + ' does not have a method named "' + method + '"');
        });
    });

    /**
     * Returns a string made by inserting the `separator` between each element and
     * concatenating all the elements into a single string.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig String -> [a] -> String
     * @param {Number|String} separator The string used to separate the elements.
     * @param {Array} xs The elements to join into a string.
     * @return {String} str The string made by concatenating `xs` with `separator`.
     * @see R.split
     * @example
     *
     *      var spacer = R.join(' ');
     *      spacer(['a', 2, 3.4]);   //=> 'a 2 3.4'
     *      R.join('|', [1, 2, 3]);    //=> '1|2|3'
     */
    var join = invoker(1, 'join');

    /**
     * Creates a new function that, when invoked, caches the result of calling `fn`
     * for a given argument set and returns the result. Subsequent calls to the
     * memoized `fn` with the same argument set will not result in an additional
     * call to `fn`; instead, the cached result for that set of arguments will be
     * returned.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Function
     * @sig (*... -> a) -> (*... -> a)
     * @param {Function} fn The function to memoize.
     * @return {Function} Memoized version of `fn`.
     * @example
     *
     *      var count = 0;
     *      var factorial = R.memoize(n => {
     *        count += 1;
     *        return R.product(R.range(1, n + 1));
     *      });
     *      factorial(5); //=> 120
     *      factorial(5); //=> 120
     *      factorial(5); //=> 120
     *      count; //=> 1
     */
    var memoize = _curry1(function memoize(fn) {
        var cache = {};
        return _arity(fn.length, function () {
            var key = toString(arguments);
            if (!_has(key, cache)) {
                cache[key] = fn.apply(this, arguments);
            }
            return cache[key];
        });
    });

    /**
     * Splits a string into an array of strings based on the given
     * separator.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category String
     * @sig (String | RegExp) -> String -> [String]
     * @param {String|RegExp} sep The pattern.
     * @param {String} str The string to separate into an array.
     * @return {Array} The array of strings from `str` separated by `str`.
     * @see R.join
     * @example
     *
     *      var pathComponents = R.split('/');
     *      R.tail(pathComponents('/usr/local/bin/node')); //=> ['usr', 'local', 'bin', 'node']
     *
     *      R.split('.', 'a.b.c.xyz.d'); //=> ['a', 'b', 'c', 'xyz', 'd']
     */
    var split = invoker(1, 'split');

    /**
     * Finds the set (i.e. no duplicates) of all elements contained in the first or
     * second list, but not both.
     *
     * @func
     * @memberOf R
     * @since v0.19.0
     * @category Relation
     * @sig [*] -> [*] -> [*]
     * @param {Array} list1 The first list.
     * @param {Array} list2 The second list.
     * @return {Array} The elements in `list1` or `list2`, but not both.
     * @see R.symmetricDifferenceWith, R.difference, R.differenceWith
     * @example
     *
     *      R.symmetricDifference([1,2,3,4], [7,6,5,4,3]); //=> [1,2,7,6,5]
     *      R.symmetricDifference([7,6,5,4,3], [1,2,3,4]); //=> [7,6,5,1,2]
     */
    var symmetricDifference = _curry2(function symmetricDifference(list1, list2) {
        return concat(difference(list1, list2), difference(list2, list1));
    });

    /**
     * Finds the set (i.e. no duplicates) of all elements contained in the first or
     * second list, but not both. Duplication is determined according to the value
     * returned by applying the supplied predicate to two list elements.
     *
     * @func
     * @memberOf R
     * @since v0.19.0
     * @category Relation
     * @sig (a -> a -> Boolean) -> [a] -> [a] -> [a]
     * @param {Function} pred A predicate used to test whether two items are equal.
     * @param {Array} list1 The first list.
     * @param {Array} list2 The second list.
     * @return {Array} The elements in `list1` or `list2`, but not both.
     * @see R.symmetricDifference, R.difference, R.differenceWith
     * @example
     *
     *      var eqA = R.eqBy(R.prop('a'));
     *      var l1 = [{a: 1}, {a: 2}, {a: 3}, {a: 4}];
     *      var l2 = [{a: 3}, {a: 4}, {a: 5}, {a: 6}];
     *      R.symmetricDifferenceWith(eqA, l1, l2); //=> [{a: 1}, {a: 2}, {a: 5}, {a: 6}]
     */
    var symmetricDifferenceWith = _curry3(function symmetricDifferenceWith(pred, list1, list2) {
        return concat(differenceWith(pred, list1, list2), differenceWith(pred, list2, list1));
    });

    /**
     * Determines whether a given string matches a given regular expression.
     *
     * @func
     * @memberOf R
     * @since v0.12.0
     * @category String
     * @sig RegExp -> String -> Boolean
     * @param {RegExp} pattern
     * @param {String} str
     * @return {Boolean}
     * @see R.match
     * @example
     *
     *      R.test(/^x/, 'xyz'); //=> true
     *      R.test(/^y/, 'xyz'); //=> false
     */
    var test = _curry2(function test(pattern, str) {
        if (!_isRegExp(pattern)) {
            throw new TypeError('\u2018test\u2019 requires a value of type RegExp as its first argument; received ' + toString(pattern));
        }
        return _cloneRegExp(pattern).test(str);
    });

    /**
     * The lower case version of a string.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category String
     * @sig String -> String
     * @param {String} str The string to lower case.
     * @return {String} The lower case version of `str`.
     * @see R.toUpper
     * @example
     *
     *      R.toLower('XYZ'); //=> 'xyz'
     */
    var toLower = invoker(0, 'toLowerCase');

    /**
     * The upper case version of a string.
     *
     * @func
     * @memberOf R
     * @since v0.9.0
     * @category String
     * @sig String -> String
     * @param {String} str The string to upper case.
     * @return {String} The upper case version of `str`.
     * @see R.toLower
     * @example
     *
     *      R.toUpper('abc'); //=> 'ABC'
     */
    var toUpper = invoker(0, 'toUpperCase');

    /**
     * Returns a new list containing only one copy of each element in the original
     * list, based upon the value returned by applying the supplied function to
     * each list element. Prefers the first item if the supplied function produces
     * the same value on two items. `R.equals` is used for comparison.
     *
     * @func
     * @memberOf R
     * @since v0.16.0
     * @category List
     * @sig (a -> b) -> [a] -> [a]
     * @param {Function} fn A function used to produce a value to use during comparisons.
     * @param {Array} list The array to consider.
     * @return {Array} The list of unique items.
     * @example
     *
     *      R.uniqBy(Math.abs, [-1, -5, 2, 10, 1, 2]); //=> [-1, -5, 2, 10]
     */
    var uniqBy = _curry2(function uniqBy(fn, list) {
        var set = new _Set();
        var result = [];
        var idx = 0;
        var appliedItem, item;
        while (idx < list.length) {
            item = list[idx];
            appliedItem = fn(item);
            if (set.add(appliedItem)) {
                result.push(item);
            }
            idx += 1;
        }
        return result;
    });

    /**
     * Returns a new list containing only one copy of each element in the original
     * list. `R.equals` is used to determine equality.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category List
     * @sig [a] -> [a]
     * @param {Array} list The array to consider.
     * @return {Array} The list of unique items.
     * @example
     *
     *      R.uniq([1, 1, 2, 1]); //=> [1, 2]
     *      R.uniq([1, '1']);     //=> [1, '1']
     *      R.uniq([[42], [42]]); //=> [[42]]
     */
    var uniq = uniqBy(identity);

    /**
     * Combines two lists into a set (i.e. no duplicates) composed of those
     * elements common to both lists.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig [*] -> [*] -> [*]
     * @param {Array} list1 The first list.
     * @param {Array} list2 The second list.
     * @return {Array} The list of elements found in both `list1` and `list2`.
     * @see R.intersectionWith
     * @example
     *
     *      R.intersection([1,2,3,4], [7,6,5,4,3]); //=> [4, 3]
     */
    var intersection = _curry2(function intersection(list1, list2) {
        var lookupList, filteredList;
        if (list1.length > list2.length) {
            lookupList = list1;
            filteredList = list2;
        } else {
            lookupList = list2;
            filteredList = list1;
        }
        return uniq(_filter(flip(_contains)(lookupList), filteredList));
    });

    /**
     * Combines two lists into a set (i.e. no duplicates) composed of the elements
     * of each list.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Relation
     * @sig [*] -> [*] -> [*]
     * @param {Array} as The first list.
     * @param {Array} bs The second list.
     * @return {Array} The first and second lists concatenated, with
     *         duplicates removed.
     * @example
     *
     *      R.union([1, 2, 3], [2, 3, 4]); //=> [1, 2, 3, 4]
     */
    var union = _curry2(compose(uniq, _concat));

    var R = {
        F: F,
        T: T,
        __: __,
        add: add,
        addIndex: addIndex,
        adjust: adjust,
        all: all,
        allPass: allPass,
        always: always,
        and: and,
        any: any,
        anyPass: anyPass,
        ap: ap,
        aperture: aperture,
        append: append,
        apply: apply,
        applySpec: applySpec,
        assoc: assoc,
        assocPath: assocPath,
        binary: binary,
        bind: bind,
        both: both,
        call: call,
        chain: chain,
        clamp: clamp,
        clone: clone,
        comparator: comparator,
        complement: complement,
        compose: compose,
        composeK: composeK,
        composeP: composeP,
        concat: concat,
        cond: cond,
        construct: construct,
        constructN: constructN,
        contains: contains,
        converge: converge,
        countBy: countBy,
        curry: curry,
        curryN: curryN,
        dec: dec,
        defaultTo: defaultTo,
        difference: difference,
        differenceWith: differenceWith,
        dissoc: dissoc,
        dissocPath: dissocPath,
        divide: divide,
        drop: drop,
        dropLast: dropLast,
        dropLastWhile: dropLastWhile,
        dropRepeats: dropRepeats,
        dropRepeatsWith: dropRepeatsWith,
        dropWhile: dropWhile,
        either: either,
        empty: empty,
        eqBy: eqBy,
        eqProps: eqProps,
        equals: equals,
        evolve: evolve,
        filter: filter,
        find: find,
        findIndex: findIndex,
        findLast: findLast,
        findLastIndex: findLastIndex,
        flatten: flatten,
        flip: flip,
        forEach: forEach,
        fromPairs: fromPairs,
        groupBy: groupBy,
        groupWith: groupWith,
        gt: gt,
        gte: gte,
        has: has,
        hasIn: hasIn,
        head: head,
        identical: identical,
        identity: identity,
        ifElse: ifElse,
        inc: inc,
        indexBy: indexBy,
        indexOf: indexOf,
        init: init,
        insert: insert,
        insertAll: insertAll,
        intersection: intersection,
        intersectionWith: intersectionWith,
        intersperse: intersperse,
        into: into,
        invert: invert,
        invertObj: invertObj,
        invoker: invoker,
        is: is,
        isArrayLike: isArrayLike,
        isEmpty: isEmpty,
        isNil: isNil,
        join: join,
        juxt: juxt,
        keys: keys,
        keysIn: keysIn,
        last: last,
        lastIndexOf: lastIndexOf,
        length: length,
        lens: lens,
        lensIndex: lensIndex,
        lensPath: lensPath,
        lensProp: lensProp,
        lift: lift,
        liftN: liftN,
        lt: lt,
        lte: lte,
        map: map,
        mapAccum: mapAccum,
        mapAccumRight: mapAccumRight,
        mapObjIndexed: mapObjIndexed,
        match: match,
        mathMod: mathMod,
        max: max,
        maxBy: maxBy,
        mean: mean,
        median: median,
        memoize: memoize,
        merge: merge,
        mergeAll: mergeAll,
        mergeWith: mergeWith,
        mergeWithKey: mergeWithKey,
        min: min,
        minBy: minBy,
        modulo: modulo,
        multiply: multiply,
        nAry: nAry,
        negate: negate,
        none: none,
        not: not,
        nth: nth,
        nthArg: nthArg,
        objOf: objOf,
        of: of,
        omit: omit,
        once: once,
        or: or,
        over: over,
        pair: pair,
        partial: partial,
        partialRight: partialRight,
        partition: partition,
        path: path,
        pathEq: pathEq,
        pathOr: pathOr,
        pathSatisfies: pathSatisfies,
        pick: pick,
        pickAll: pickAll,
        pickBy: pickBy,
        pipe: pipe,
        pipeK: pipeK,
        pipeP: pipeP,
        pluck: pluck,
        prepend: prepend,
        product: product,
        project: project,
        prop: prop,
        propEq: propEq,
        propIs: propIs,
        propOr: propOr,
        propSatisfies: propSatisfies,
        props: props,
        range: range,
        reduce: reduce,
        reduceBy: reduceBy,
        reduceRight: reduceRight,
        reduceWhile: reduceWhile,
        reduced: reduced,
        reject: reject,
        remove: remove,
        repeat: repeat,
        replace: replace,
        reverse: reverse,
        scan: scan,
        sequence: sequence,
        set: set,
        slice: slice,
        sort: sort,
        sortBy: sortBy,
        split: split,
        splitAt: splitAt,
        splitEvery: splitEvery,
        splitWhen: splitWhen,
        subtract: subtract,
        sum: sum,
        symmetricDifference: symmetricDifference,
        symmetricDifferenceWith: symmetricDifferenceWith,
        tail: tail,
        take: take,
        takeLast: takeLast,
        takeLastWhile: takeLastWhile,
        takeWhile: takeWhile,
        tap: tap,
        test: test,
        times: times,
        toLower: toLower,
        toPairs: toPairs,
        toPairsIn: toPairsIn,
        toString: toString,
        toUpper: toUpper,
        transduce: transduce,
        transpose: transpose,
        traverse: traverse,
        trim: trim,
        tryCatch: tryCatch,
        type: type,
        unapply: unapply,
        unary: unary,
        uncurryN: uncurryN,
        unfold: unfold,
        union: union,
        unionWith: unionWith,
        uniq: uniq,
        uniqBy: uniqBy,
        uniqWith: uniqWith,
        unless: unless,
        unnest: unnest,
        until: until,
        update: update,
        useWith: useWith,
        values: values,
        valuesIn: valuesIn,
        view: view,
        when: when,
        where: where,
        whereEq: whereEq,
        without: without,
        wrap: wrap,
        xprod: xprod,
        zip: zip,
        zipObj: zipObj,
        zipWith: zipWith
    };
  /* eslint-env amd */

  /* TEST_ENTRY_POINT */

  if (typeof exports === 'object') {
    module.exports = R;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return R; });
  } else {
    this.R = R;
  }

}.call(this));

},{}],3:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule KeyEscapeUtils
 * 
 */

'use strict';

/**
 * Escape and wrap key so it is safe to use as a reactid
 *
 * @param {string} key to be escaped.
 * @return {string} the escaped key.
 */

function escape(key) {
  var escapeRegex = /[=:]/g;
  var escaperLookup = {
    '=': '=0',
    ':': '=2'
  };
  var escapedString = ('' + key).replace(escapeRegex, function (match) {
    return escaperLookup[match];
  });

  return '$' + escapedString;
}

/**
 * Unescape and unwrap key for human-readable display
 *
 * @param {string} key to unescape.
 * @return {string} the unescaped key.
 */
function unescape(key) {
  var unescapeRegex = /(=0|=2)/g;
  var unescaperLookup = {
    '=0': '=',
    '=2': ':'
  };
  var keySubstring = key[0] === '.' && key[1] === '$' ? key.substring(2) : key.substring(1);

  return ('' + keySubstring).replace(unescapeRegex, function (match) {
    return unescaperLookup[match];
  });
}

var KeyEscapeUtils = {
  escape: escape,
  unescape: unescape
};

module.exports = KeyEscapeUtils;
},{}],4:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule PooledClass
 */

'use strict';

var _prodInvariant = require('./reactProdInvariant');

var invariant = require('fbjs/lib/invariant');

/**
 * Static poolers. Several custom versions for each potential number of
 * arguments. A completely generic pooler is easy to implement, but would
 * require accessing the `arguments` object. In each of these, `this` refers to
 * the Class itself, not an instance. If any others are needed, simply add them
 * here, or in their own files.
 */
var oneArgumentPooler = function (copyFieldsFrom) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, copyFieldsFrom);
    return instance;
  } else {
    return new Klass(copyFieldsFrom);
  }
};

var twoArgumentPooler = function (a1, a2) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2);
    return instance;
  } else {
    return new Klass(a1, a2);
  }
};

var threeArgumentPooler = function (a1, a2, a3) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3);
    return instance;
  } else {
    return new Klass(a1, a2, a3);
  }
};

var fourArgumentPooler = function (a1, a2, a3, a4) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3, a4);
    return instance;
  } else {
    return new Klass(a1, a2, a3, a4);
  }
};

var fiveArgumentPooler = function (a1, a2, a3, a4, a5) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3, a4, a5);
    return instance;
  } else {
    return new Klass(a1, a2, a3, a4, a5);
  }
};

var standardReleaser = function (instance) {
  var Klass = this;
  !(instance instanceof Klass) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Trying to release an instance into a pool of a different type.') : _prodInvariant('25') : void 0;
  instance.destructor();
  if (Klass.instancePool.length < Klass.poolSize) {
    Klass.instancePool.push(instance);
  }
};

var DEFAULT_POOL_SIZE = 10;
var DEFAULT_POOLER = oneArgumentPooler;

/**
 * Augments `CopyConstructor` to be a poolable class, augmenting only the class
 * itself (statically) not adding any prototypical fields. Any CopyConstructor
 * you give this may have a `poolSize` property, and will look for a
 * prototypical `destructor` on instances.
 *
 * @param {Function} CopyConstructor Constructor that can be used to reset.
 * @param {Function} pooler Customizable pooler.
 */
var addPoolingTo = function (CopyConstructor, pooler) {
  var NewKlass = CopyConstructor;
  NewKlass.instancePool = [];
  NewKlass.getPooled = pooler || DEFAULT_POOLER;
  if (!NewKlass.poolSize) {
    NewKlass.poolSize = DEFAULT_POOL_SIZE;
  }
  NewKlass.release = standardReleaser;
  return NewKlass;
};

var PooledClass = {
  addPoolingTo: addPoolingTo,
  oneArgumentPooler: oneArgumentPooler,
  twoArgumentPooler: twoArgumentPooler,
  threeArgumentPooler: threeArgumentPooler,
  fourArgumentPooler: fourArgumentPooler,
  fiveArgumentPooler: fiveArgumentPooler
};

module.exports = PooledClass;
}).call(this,require('_process'))
},{"./reactProdInvariant":25,"_process":1,"fbjs/lib/invariant":29}],5:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule React
 */

'use strict';

var _assign = require('object-assign');

var ReactChildren = require('./ReactChildren');
var ReactComponent = require('./ReactComponent');
var ReactPureComponent = require('./ReactPureComponent');
var ReactClass = require('./ReactClass');
var ReactDOMFactories = require('./ReactDOMFactories');
var ReactElement = require('./ReactElement');
var ReactPropTypes = require('./ReactPropTypes');
var ReactVersion = require('./ReactVersion');

var onlyChild = require('./onlyChild');
var warning = require('fbjs/lib/warning');

var createElement = ReactElement.createElement;
var createFactory = ReactElement.createFactory;
var cloneElement = ReactElement.cloneElement;

if (process.env.NODE_ENV !== 'production') {
  var ReactElementValidator = require('./ReactElementValidator');
  createElement = ReactElementValidator.createElement;
  createFactory = ReactElementValidator.createFactory;
  cloneElement = ReactElementValidator.cloneElement;
}

var __spread = _assign;

if (process.env.NODE_ENV !== 'production') {
  var warned = false;
  __spread = function () {
    process.env.NODE_ENV !== 'production' ? warning(warned, 'React.__spread is deprecated and should not be used. Use ' + 'Object.assign directly or another helper function with similar ' + 'semantics. You may be seeing this warning due to your compiler. ' + 'See https://fb.me/react-spread-deprecation for more details.') : void 0;
    warned = true;
    return _assign.apply(null, arguments);
  };
}

var React = {

  // Modern

  Children: {
    map: ReactChildren.map,
    forEach: ReactChildren.forEach,
    count: ReactChildren.count,
    toArray: ReactChildren.toArray,
    only: onlyChild
  },

  Component: ReactComponent,
  PureComponent: ReactPureComponent,

  createElement: createElement,
  cloneElement: cloneElement,
  isValidElement: ReactElement.isValidElement,

  // Classic

  PropTypes: ReactPropTypes,
  createClass: ReactClass.createClass,
  createFactory: createFactory,
  createMixin: function (mixin) {
    // Currently a noop. Will be used to validate and trace mixins.
    return mixin;
  },

  // This looks DOM specific but these are actually isomorphic helpers
  // since they are just generating DOM strings.
  DOM: ReactDOMFactories,

  version: ReactVersion,

  // Deprecated hook for JSX spread, don't use this for anything.
  __spread: __spread
};

module.exports = React;
}).call(this,require('_process'))
},{"./ReactChildren":6,"./ReactClass":7,"./ReactComponent":8,"./ReactDOMFactories":11,"./ReactElement":12,"./ReactElementValidator":13,"./ReactPropTypes":17,"./ReactPureComponent":19,"./ReactVersion":20,"./onlyChild":24,"_process":1,"fbjs/lib/warning":32,"object-assign":33}],6:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactChildren
 */

'use strict';

var PooledClass = require('./PooledClass');
var ReactElement = require('./ReactElement');

var emptyFunction = require('fbjs/lib/emptyFunction');
var traverseAllChildren = require('./traverseAllChildren');

var twoArgumentPooler = PooledClass.twoArgumentPooler;
var fourArgumentPooler = PooledClass.fourArgumentPooler;

var userProvidedKeyEscapeRegex = /\/+/g;
function escapeUserProvidedKey(text) {
  return ('' + text).replace(userProvidedKeyEscapeRegex, '$&/');
}

/**
 * PooledClass representing the bookkeeping associated with performing a child
 * traversal. Allows avoiding binding callbacks.
 *
 * @constructor ForEachBookKeeping
 * @param {!function} forEachFunction Function to perform traversal with.
 * @param {?*} forEachContext Context to perform context with.
 */
function ForEachBookKeeping(forEachFunction, forEachContext) {
  this.func = forEachFunction;
  this.context = forEachContext;
  this.count = 0;
}
ForEachBookKeeping.prototype.destructor = function () {
  this.func = null;
  this.context = null;
  this.count = 0;
};
PooledClass.addPoolingTo(ForEachBookKeeping, twoArgumentPooler);

function forEachSingleChild(bookKeeping, child, name) {
  var func = bookKeeping.func;
  var context = bookKeeping.context;

  func.call(context, child, bookKeeping.count++);
}

/**
 * Iterates through children that are typically specified as `props.children`.
 *
 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.foreach
 *
 * The provided forEachFunc(child, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} forEachFunc
 * @param {*} forEachContext Context for forEachContext.
 */
function forEachChildren(children, forEachFunc, forEachContext) {
  if (children == null) {
    return children;
  }
  var traverseContext = ForEachBookKeeping.getPooled(forEachFunc, forEachContext);
  traverseAllChildren(children, forEachSingleChild, traverseContext);
  ForEachBookKeeping.release(traverseContext);
}

/**
 * PooledClass representing the bookkeeping associated with performing a child
 * mapping. Allows avoiding binding callbacks.
 *
 * @constructor MapBookKeeping
 * @param {!*} mapResult Object containing the ordered map of results.
 * @param {!function} mapFunction Function to perform mapping with.
 * @param {?*} mapContext Context to perform mapping with.
 */
function MapBookKeeping(mapResult, keyPrefix, mapFunction, mapContext) {
  this.result = mapResult;
  this.keyPrefix = keyPrefix;
  this.func = mapFunction;
  this.context = mapContext;
  this.count = 0;
}
MapBookKeeping.prototype.destructor = function () {
  this.result = null;
  this.keyPrefix = null;
  this.func = null;
  this.context = null;
  this.count = 0;
};
PooledClass.addPoolingTo(MapBookKeeping, fourArgumentPooler);

function mapSingleChildIntoContext(bookKeeping, child, childKey) {
  var result = bookKeeping.result;
  var keyPrefix = bookKeeping.keyPrefix;
  var func = bookKeeping.func;
  var context = bookKeeping.context;


  var mappedChild = func.call(context, child, bookKeeping.count++);
  if (Array.isArray(mappedChild)) {
    mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, emptyFunction.thatReturnsArgument);
  } else if (mappedChild != null) {
    if (ReactElement.isValidElement(mappedChild)) {
      mappedChild = ReactElement.cloneAndReplaceKey(mappedChild,
      // Keep both the (mapped) and old keys if they differ, just as
      // traverseAllChildren used to do for objects as children
      keyPrefix + (mappedChild.key && (!child || child.key !== mappedChild.key) ? escapeUserProvidedKey(mappedChild.key) + '/' : '') + childKey);
    }
    result.push(mappedChild);
  }
}

function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context) {
  var escapedPrefix = '';
  if (prefix != null) {
    escapedPrefix = escapeUserProvidedKey(prefix) + '/';
  }
  var traverseContext = MapBookKeeping.getPooled(array, escapedPrefix, func, context);
  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
  MapBookKeeping.release(traverseContext);
}

/**
 * Maps children that are typically specified as `props.children`.
 *
 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.map
 *
 * The provided mapFunction(child, key, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} func The map function.
 * @param {*} context Context for mapFunction.
 * @return {object} Object containing the ordered map of results.
 */
function mapChildren(children, func, context) {
  if (children == null) {
    return children;
  }
  var result = [];
  mapIntoWithKeyPrefixInternal(children, result, null, func, context);
  return result;
}

function forEachSingleChildDummy(traverseContext, child, name) {
  return null;
}

/**
 * Count the number of children that are typically specified as
 * `props.children`.
 *
 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.count
 *
 * @param {?*} children Children tree container.
 * @return {number} The number of children.
 */
function countChildren(children, context) {
  return traverseAllChildren(children, forEachSingleChildDummy, null);
}

/**
 * Flatten a children object (typically specified as `props.children`) and
 * return an array with appropriately re-keyed children.
 *
 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.toarray
 */
function toArray(children) {
  var result = [];
  mapIntoWithKeyPrefixInternal(children, result, null, emptyFunction.thatReturnsArgument);
  return result;
}

var ReactChildren = {
  forEach: forEachChildren,
  map: mapChildren,
  mapIntoWithKeyPrefixInternal: mapIntoWithKeyPrefixInternal,
  count: countChildren,
  toArray: toArray
};

module.exports = ReactChildren;
},{"./PooledClass":4,"./ReactElement":12,"./traverseAllChildren":26,"fbjs/lib/emptyFunction":27}],7:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactClass
 */

'use strict';

var _prodInvariant = require('./reactProdInvariant'),
    _assign = require('object-assign');

var ReactComponent = require('./ReactComponent');
var ReactElement = require('./ReactElement');
var ReactPropTypeLocations = require('./ReactPropTypeLocations');
var ReactPropTypeLocationNames = require('./ReactPropTypeLocationNames');
var ReactNoopUpdateQueue = require('./ReactNoopUpdateQueue');

var emptyObject = require('fbjs/lib/emptyObject');
var invariant = require('fbjs/lib/invariant');
var keyMirror = require('fbjs/lib/keyMirror');
var keyOf = require('fbjs/lib/keyOf');
var warning = require('fbjs/lib/warning');

var MIXINS_KEY = keyOf({ mixins: null });

/**
 * Policies that describe methods in `ReactClassInterface`.
 */
var SpecPolicy = keyMirror({
  /**
   * These methods may be defined only once by the class specification or mixin.
   */
  DEFINE_ONCE: null,
  /**
   * These methods may be defined by both the class specification and mixins.
   * Subsequent definitions will be chained. These methods must return void.
   */
  DEFINE_MANY: null,
  /**
   * These methods are overriding the base class.
   */
  OVERRIDE_BASE: null,
  /**
   * These methods are similar to DEFINE_MANY, except we assume they return
   * objects. We try to merge the keys of the return values of all the mixed in
   * functions. If there is a key conflict we throw.
   */
  DEFINE_MANY_MERGED: null
});

var injectedMixins = [];

/**
 * Composite components are higher-level components that compose other composite
 * or host components.
 *
 * To create a new type of `ReactClass`, pass a specification of
 * your new class to `React.createClass`. The only requirement of your class
 * specification is that you implement a `render` method.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return <div>Hello World</div>;
 *     }
 *   });
 *
 * The class specification supports a specific protocol of methods that have
 * special meaning (e.g. `render`). See `ReactClassInterface` for
 * more the comprehensive protocol. Any other properties and methods in the
 * class specification will be available on the prototype.
 *
 * @interface ReactClassInterface
 * @internal
 */
var ReactClassInterface = {

  /**
   * An array of Mixin objects to include when defining your component.
   *
   * @type {array}
   * @optional
   */
  mixins: SpecPolicy.DEFINE_MANY,

  /**
   * An object containing properties and methods that should be defined on
   * the component's constructor instead of its prototype (static methods).
   *
   * @type {object}
   * @optional
   */
  statics: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of prop types for this component.
   *
   * @type {object}
   * @optional
   */
  propTypes: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of context types for this component.
   *
   * @type {object}
   * @optional
   */
  contextTypes: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of context types this component sets for its children.
   *
   * @type {object}
   * @optional
   */
  childContextTypes: SpecPolicy.DEFINE_MANY,

  // ==== Definition methods ====

  /**
   * Invoked when the component is mounted. Values in the mapping will be set on
   * `this.props` if that prop is not specified (i.e. using an `in` check).
   *
   * This method is invoked before `getInitialState` and therefore cannot rely
   * on `this.state` or use `this.setState`.
   *
   * @return {object}
   * @optional
   */
  getDefaultProps: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * Invoked once before the component is mounted. The return value will be used
   * as the initial value of `this.state`.
   *
   *   getInitialState: function() {
   *     return {
   *       isOn: false,
   *       fooBaz: new BazFoo()
   *     }
   *   }
   *
   * @return {object}
   * @optional
   */
  getInitialState: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * @return {object}
   * @optional
   */
  getChildContext: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * Uses props from `this.props` and state from `this.state` to render the
   * structure of the component.
   *
   * No guarantees are made about when or how often this method is invoked, so
   * it must not have side effects.
   *
   *   render: function() {
   *     var name = this.props.name;
   *     return <div>Hello, {name}!</div>;
   *   }
   *
   * @return {ReactComponent}
   * @nosideeffects
   * @required
   */
  render: SpecPolicy.DEFINE_ONCE,

  // ==== Delegate methods ====

  /**
   * Invoked when the component is initially created and about to be mounted.
   * This may have side effects, but any external subscriptions or data created
   * by this method must be cleaned up in `componentWillUnmount`.
   *
   * @optional
   */
  componentWillMount: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component has been mounted and has a DOM representation.
   * However, there is no guarantee that the DOM node is in the document.
   *
   * Use this as an opportunity to operate on the DOM when the component has
   * been mounted (initialized and rendered) for the first time.
   *
   * @param {DOMElement} rootNode DOM element representing the component.
   * @optional
   */
  componentDidMount: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked before the component receives new props.
   *
   * Use this as an opportunity to react to a prop transition by updating the
   * state using `this.setState`. Current props are accessed via `this.props`.
   *
   *   componentWillReceiveProps: function(nextProps, nextContext) {
   *     this.setState({
   *       likesIncreasing: nextProps.likeCount > this.props.likeCount
   *     });
   *   }
   *
   * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
   * transition may cause a state change, but the opposite is not true. If you
   * need it, you are probably looking for `componentWillUpdate`.
   *
   * @param {object} nextProps
   * @optional
   */
  componentWillReceiveProps: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked while deciding if the component should be updated as a result of
   * receiving new props, state and/or context.
   *
   * Use this as an opportunity to `return false` when you're certain that the
   * transition to the new props/state/context will not require a component
   * update.
   *
   *   shouldComponentUpdate: function(nextProps, nextState, nextContext) {
   *     return !equal(nextProps, this.props) ||
   *       !equal(nextState, this.state) ||
   *       !equal(nextContext, this.context);
   *   }
   *
   * @param {object} nextProps
   * @param {?object} nextState
   * @param {?object} nextContext
   * @return {boolean} True if the component should update.
   * @optional
   */
  shouldComponentUpdate: SpecPolicy.DEFINE_ONCE,

  /**
   * Invoked when the component is about to update due to a transition from
   * `this.props`, `this.state` and `this.context` to `nextProps`, `nextState`
   * and `nextContext`.
   *
   * Use this as an opportunity to perform preparation before an update occurs.
   *
   * NOTE: You **cannot** use `this.setState()` in this method.
   *
   * @param {object} nextProps
   * @param {?object} nextState
   * @param {?object} nextContext
   * @param {ReactReconcileTransaction} transaction
   * @optional
   */
  componentWillUpdate: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component's DOM representation has been updated.
   *
   * Use this as an opportunity to operate on the DOM when the component has
   * been updated.
   *
   * @param {object} prevProps
   * @param {?object} prevState
   * @param {?object} prevContext
   * @param {DOMElement} rootNode DOM element representing the component.
   * @optional
   */
  componentDidUpdate: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component is about to be removed from its parent and have
   * its DOM representation destroyed.
   *
   * Use this as an opportunity to deallocate any external resources.
   *
   * NOTE: There is no `componentDidUnmount` since your component will have been
   * destroyed by that point.
   *
   * @optional
   */
  componentWillUnmount: SpecPolicy.DEFINE_MANY,

  // ==== Advanced methods ====

  /**
   * Updates the component's currently mounted DOM representation.
   *
   * By default, this implements React's rendering and reconciliation algorithm.
   * Sophisticated clients may wish to override this.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   * @overridable
   */
  updateComponent: SpecPolicy.OVERRIDE_BASE

};

/**
 * Mapping from class specification keys to special processing functions.
 *
 * Although these are declared like instance properties in the specification
 * when defining classes using `React.createClass`, they are actually static
 * and are accessible on the constructor instead of the prototype. Despite
 * being static, they must be defined outside of the "statics" key under
 * which all other static methods are defined.
 */
var RESERVED_SPEC_KEYS = {
  displayName: function (Constructor, displayName) {
    Constructor.displayName = displayName;
  },
  mixins: function (Constructor, mixins) {
    if (mixins) {
      for (var i = 0; i < mixins.length; i++) {
        mixSpecIntoComponent(Constructor, mixins[i]);
      }
    }
  },
  childContextTypes: function (Constructor, childContextTypes) {
    if (process.env.NODE_ENV !== 'production') {
      validateTypeDef(Constructor, childContextTypes, ReactPropTypeLocations.childContext);
    }
    Constructor.childContextTypes = _assign({}, Constructor.childContextTypes, childContextTypes);
  },
  contextTypes: function (Constructor, contextTypes) {
    if (process.env.NODE_ENV !== 'production') {
      validateTypeDef(Constructor, contextTypes, ReactPropTypeLocations.context);
    }
    Constructor.contextTypes = _assign({}, Constructor.contextTypes, contextTypes);
  },
  /**
   * Special case getDefaultProps which should move into statics but requires
   * automatic merging.
   */
  getDefaultProps: function (Constructor, getDefaultProps) {
    if (Constructor.getDefaultProps) {
      Constructor.getDefaultProps = createMergedResultFunction(Constructor.getDefaultProps, getDefaultProps);
    } else {
      Constructor.getDefaultProps = getDefaultProps;
    }
  },
  propTypes: function (Constructor, propTypes) {
    if (process.env.NODE_ENV !== 'production') {
      validateTypeDef(Constructor, propTypes, ReactPropTypeLocations.prop);
    }
    Constructor.propTypes = _assign({}, Constructor.propTypes, propTypes);
  },
  statics: function (Constructor, statics) {
    mixStaticSpecIntoComponent(Constructor, statics);
  },
  autobind: function () {} };

// noop
function validateTypeDef(Constructor, typeDef, location) {
  for (var propName in typeDef) {
    if (typeDef.hasOwnProperty(propName)) {
      // use a warning instead of an invariant so components
      // don't show up in prod but only in __DEV__
      process.env.NODE_ENV !== 'production' ? warning(typeof typeDef[propName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', Constructor.displayName || 'ReactClass', ReactPropTypeLocationNames[location], propName) : void 0;
    }
  }
}

function validateMethodOverride(isAlreadyDefined, name) {
  var specPolicy = ReactClassInterface.hasOwnProperty(name) ? ReactClassInterface[name] : null;

  // Disallow overriding of base class methods unless explicitly allowed.
  if (ReactClassMixin.hasOwnProperty(name)) {
    !(specPolicy === SpecPolicy.OVERRIDE_BASE) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClassInterface: You are attempting to override `%s` from your class specification. Ensure that your method names do not overlap with React methods.', name) : _prodInvariant('73', name) : void 0;
  }

  // Disallow defining methods more than once unless explicitly allowed.
  if (isAlreadyDefined) {
    !(specPolicy === SpecPolicy.DEFINE_MANY || specPolicy === SpecPolicy.DEFINE_MANY_MERGED) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClassInterface: You are attempting to define `%s` on your component more than once. This conflict may be due to a mixin.', name) : _prodInvariant('74', name) : void 0;
  }
}

/**
 * Mixin helper which handles policy validation and reserved
 * specification keys when building React classes.
 */
function mixSpecIntoComponent(Constructor, spec) {
  if (!spec) {
    if (process.env.NODE_ENV !== 'production') {
      var typeofSpec = typeof spec;
      var isMixinValid = typeofSpec === 'object' && spec !== null;

      process.env.NODE_ENV !== 'production' ? warning(isMixinValid, '%s: You\'re attempting to include a mixin that is either null ' + 'or not an object. Check the mixins included by the component, ' + 'as well as any mixins they include themselves. ' + 'Expected object but got %s.', Constructor.displayName || 'ReactClass', spec === null ? null : typeofSpec) : void 0;
    }

    return;
  }

  !(typeof spec !== 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You\'re attempting to use a component class or function as a mixin. Instead, just use a regular object.') : _prodInvariant('75') : void 0;
  !!ReactElement.isValidElement(spec) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You\'re attempting to use a component as a mixin. Instead, just use a regular object.') : _prodInvariant('76') : void 0;

  var proto = Constructor.prototype;
  var autoBindPairs = proto.__reactAutoBindPairs;

  // By handling mixins before any other properties, we ensure the same
  // chaining order is applied to methods with DEFINE_MANY policy, whether
  // mixins are listed before or after these methods in the spec.
  if (spec.hasOwnProperty(MIXINS_KEY)) {
    RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
  }

  for (var name in spec) {
    if (!spec.hasOwnProperty(name)) {
      continue;
    }

    if (name === MIXINS_KEY) {
      // We have already handled mixins in a special case above.
      continue;
    }

    var property = spec[name];
    var isAlreadyDefined = proto.hasOwnProperty(name);
    validateMethodOverride(isAlreadyDefined, name);

    if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
      RESERVED_SPEC_KEYS[name](Constructor, property);
    } else {
      // Setup methods on prototype:
      // The following member methods should not be automatically bound:
      // 1. Expected ReactClass methods (in the "interface").
      // 2. Overridden methods (that were mixed in).
      var isReactClassMethod = ReactClassInterface.hasOwnProperty(name);
      var isFunction = typeof property === 'function';
      var shouldAutoBind = isFunction && !isReactClassMethod && !isAlreadyDefined && spec.autobind !== false;

      if (shouldAutoBind) {
        autoBindPairs.push(name, property);
        proto[name] = property;
      } else {
        if (isAlreadyDefined) {
          var specPolicy = ReactClassInterface[name];

          // These cases should already be caught by validateMethodOverride.
          !(isReactClassMethod && (specPolicy === SpecPolicy.DEFINE_MANY_MERGED || specPolicy === SpecPolicy.DEFINE_MANY)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: Unexpected spec policy %s for key %s when mixing in component specs.', specPolicy, name) : _prodInvariant('77', specPolicy, name) : void 0;

          // For methods which are defined more than once, call the existing
          // methods before calling the new property, merging if appropriate.
          if (specPolicy === SpecPolicy.DEFINE_MANY_MERGED) {
            proto[name] = createMergedResultFunction(proto[name], property);
          } else if (specPolicy === SpecPolicy.DEFINE_MANY) {
            proto[name] = createChainedFunction(proto[name], property);
          }
        } else {
          proto[name] = property;
          if (process.env.NODE_ENV !== 'production') {
            // Add verbose displayName to the function, which helps when looking
            // at profiling tools.
            if (typeof property === 'function' && spec.displayName) {
              proto[name].displayName = spec.displayName + '_' + name;
            }
          }
        }
      }
    }
  }
}

function mixStaticSpecIntoComponent(Constructor, statics) {
  if (!statics) {
    return;
  }
  for (var name in statics) {
    var property = statics[name];
    if (!statics.hasOwnProperty(name)) {
      continue;
    }

    var isReserved = name in RESERVED_SPEC_KEYS;
    !!isReserved ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You are attempting to define a reserved property, `%s`, that shouldn\'t be on the "statics" key. Define it as an instance property instead; it will still be accessible on the constructor.', name) : _prodInvariant('78', name) : void 0;

    var isInherited = name in Constructor;
    !!isInherited ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You are attempting to define `%s` on your component more than once. This conflict may be due to a mixin.', name) : _prodInvariant('79', name) : void 0;
    Constructor[name] = property;
  }
}

/**
 * Merge two objects, but throw if both contain the same key.
 *
 * @param {object} one The first object, which is mutated.
 * @param {object} two The second object
 * @return {object} one after it has been mutated to contain everything in two.
 */
function mergeIntoWithNoDuplicateKeys(one, two) {
  !(one && two && typeof one === 'object' && typeof two === 'object') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.') : _prodInvariant('80') : void 0;

  for (var key in two) {
    if (two.hasOwnProperty(key)) {
      !(one[key] === undefined) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'mergeIntoWithNoDuplicateKeys(): Tried to merge two objects with the same key: `%s`. This conflict may be due to a mixin; in particular, this may be caused by two getInitialState() or getDefaultProps() methods returning objects with clashing keys.', key) : _prodInvariant('81', key) : void 0;
      one[key] = two[key];
    }
  }
  return one;
}

/**
 * Creates a function that invokes two functions and merges their return values.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createMergedResultFunction(one, two) {
  return function mergedResult() {
    var a = one.apply(this, arguments);
    var b = two.apply(this, arguments);
    if (a == null) {
      return b;
    } else if (b == null) {
      return a;
    }
    var c = {};
    mergeIntoWithNoDuplicateKeys(c, a);
    mergeIntoWithNoDuplicateKeys(c, b);
    return c;
  };
}

/**
 * Creates a function that invokes two functions and ignores their return vales.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createChainedFunction(one, two) {
  return function chainedFunction() {
    one.apply(this, arguments);
    two.apply(this, arguments);
  };
}

/**
 * Binds a method to the component.
 *
 * @param {object} component Component whose method is going to be bound.
 * @param {function} method Method to be bound.
 * @return {function} The bound method.
 */
function bindAutoBindMethod(component, method) {
  var boundMethod = method.bind(component);
  if (process.env.NODE_ENV !== 'production') {
    boundMethod.__reactBoundContext = component;
    boundMethod.__reactBoundMethod = method;
    boundMethod.__reactBoundArguments = null;
    var componentName = component.constructor.displayName;
    var _bind = boundMethod.bind;
    boundMethod.bind = function (newThis) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      // User is trying to bind() an autobound method; we effectively will
      // ignore the value of "this" that the user is trying to use, so
      // let's warn.
      if (newThis !== component && newThis !== null) {
        process.env.NODE_ENV !== 'production' ? warning(false, 'bind(): React component methods may only be bound to the ' + 'component instance. See %s', componentName) : void 0;
      } else if (!args.length) {
        process.env.NODE_ENV !== 'production' ? warning(false, 'bind(): You are binding a component method to the component. ' + 'React does this for you automatically in a high-performance ' + 'way, so you can safely remove this call. See %s', componentName) : void 0;
        return boundMethod;
      }
      var reboundMethod = _bind.apply(boundMethod, arguments);
      reboundMethod.__reactBoundContext = component;
      reboundMethod.__reactBoundMethod = method;
      reboundMethod.__reactBoundArguments = args;
      return reboundMethod;
    };
  }
  return boundMethod;
}

/**
 * Binds all auto-bound methods in a component.
 *
 * @param {object} component Component whose method is going to be bound.
 */
function bindAutoBindMethods(component) {
  var pairs = component.__reactAutoBindPairs;
  for (var i = 0; i < pairs.length; i += 2) {
    var autoBindKey = pairs[i];
    var method = pairs[i + 1];
    component[autoBindKey] = bindAutoBindMethod(component, method);
  }
}

/**
 * Add more to the ReactClass base class. These are all legacy features and
 * therefore not already part of the modern ReactComponent.
 */
var ReactClassMixin = {

  /**
   * TODO: This will be deprecated because state should always keep a consistent
   * type signature and the only use case for this, is to avoid that.
   */
  replaceState: function (newState, callback) {
    this.updater.enqueueReplaceState(this, newState);
    if (callback) {
      this.updater.enqueueCallback(this, callback, 'replaceState');
    }
  },

  /**
   * Checks whether or not this composite component is mounted.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function () {
    return this.updater.isMounted(this);
  }
};

var ReactClassComponent = function () {};
_assign(ReactClassComponent.prototype, ReactComponent.prototype, ReactClassMixin);

/**
 * Module for creating composite components.
 *
 * @class ReactClass
 */
var ReactClass = {

  /**
   * Creates a composite component class given a class specification.
   * See https://facebook.github.io/react/docs/top-level-api.html#react.createclass
   *
   * @param {object} spec Class specification (which must define `render`).
   * @return {function} Component constructor function.
   * @public
   */
  createClass: function (spec) {
    var Constructor = function (props, context, updater) {
      // This constructor gets overridden by mocks. The argument is used
      // by mocks to assert on what gets mounted.

      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(this instanceof Constructor, 'Something is calling a React component directly. Use a factory or ' + 'JSX instead. See: https://fb.me/react-legacyfactory') : void 0;
      }

      // Wire up auto-binding
      if (this.__reactAutoBindPairs.length) {
        bindAutoBindMethods(this);
      }

      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;

      this.state = null;

      // ReactClasses doesn't have constructors. Instead, they use the
      // getInitialState and componentWillMount methods for initialization.

      var initialState = this.getInitialState ? this.getInitialState() : null;
      if (process.env.NODE_ENV !== 'production') {
        // We allow auto-mocks to proceed as if they're returning null.
        if (initialState === undefined && this.getInitialState._isMockFunction) {
          // This is probably bad practice. Consider warning here and
          // deprecating this convenience.
          initialState = null;
        }
      }
      !(typeof initialState === 'object' && !Array.isArray(initialState)) ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s.getInitialState(): must return an object or null', Constructor.displayName || 'ReactCompositeComponent') : _prodInvariant('82', Constructor.displayName || 'ReactCompositeComponent') : void 0;

      this.state = initialState;
    };
    Constructor.prototype = new ReactClassComponent();
    Constructor.prototype.constructor = Constructor;
    Constructor.prototype.__reactAutoBindPairs = [];

    injectedMixins.forEach(mixSpecIntoComponent.bind(null, Constructor));

    mixSpecIntoComponent(Constructor, spec);

    // Initialize the defaultProps property after all mixins have been merged.
    if (Constructor.getDefaultProps) {
      Constructor.defaultProps = Constructor.getDefaultProps();
    }

    if (process.env.NODE_ENV !== 'production') {
      // This is a tag to indicate that the use of these method names is ok,
      // since it's used with createClass. If it's not, then it's likely a
      // mistake so we'll warn you to use the static property, property
      // initializer or constructor respectively.
      if (Constructor.getDefaultProps) {
        Constructor.getDefaultProps.isReactClassApproved = {};
      }
      if (Constructor.prototype.getInitialState) {
        Constructor.prototype.getInitialState.isReactClassApproved = {};
      }
    }

    !Constructor.prototype.render ? process.env.NODE_ENV !== 'production' ? invariant(false, 'createClass(...): Class specification must implement a `render` method.') : _prodInvariant('83') : void 0;

    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(!Constructor.prototype.componentShouldUpdate, '%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', spec.displayName || 'A component') : void 0;
      process.env.NODE_ENV !== 'production' ? warning(!Constructor.prototype.componentWillRecieveProps, '%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', spec.displayName || 'A component') : void 0;
    }

    // Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in ReactClassInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }

    return Constructor;
  },

  injection: {
    injectMixin: function (mixin) {
      injectedMixins.push(mixin);
    }
  }

};

module.exports = ReactClass;
}).call(this,require('_process'))
},{"./ReactComponent":8,"./ReactElement":12,"./ReactNoopUpdateQueue":14,"./ReactPropTypeLocationNames":15,"./ReactPropTypeLocations":16,"./reactProdInvariant":25,"_process":1,"fbjs/lib/emptyObject":28,"fbjs/lib/invariant":29,"fbjs/lib/keyMirror":30,"fbjs/lib/keyOf":31,"fbjs/lib/warning":32,"object-assign":33}],8:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactComponent
 */

'use strict';

var _prodInvariant = require('./reactProdInvariant');

var ReactNoopUpdateQueue = require('./ReactNoopUpdateQueue');

var canDefineProperty = require('./canDefineProperty');
var emptyObject = require('fbjs/lib/emptyObject');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

/**
 * Base class helpers for the updating state of a component.
 */
function ReactComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}

ReactComponent.prototype.isReactComponent = {};

/**
 * Sets a subset of the state. Always use this to mutate
 * state. You should treat `this.state` as immutable.
 *
 * There is no guarantee that `this.state` will be immediately updated, so
 * accessing `this.state` after calling this method may return the old value.
 *
 * There is no guarantee that calls to `setState` will run synchronously,
 * as they may eventually be batched together.  You can provide an optional
 * callback that will be executed when the call to setState is actually
 * completed.
 *
 * When a function is provided to setState, it will be called at some point in
 * the future (not synchronously). It will be called with the up to date
 * component arguments (state, props, context). These values can be different
 * from this.* because your function may be called after receiveProps but before
 * shouldComponentUpdate, and this new state, props, and context will not yet be
 * assigned to this.
 *
 * @param {object|function} partialState Next partial state or function to
 *        produce next partial state to be merged with current state.
 * @param {?function} callback Called after state is updated.
 * @final
 * @protected
 */
ReactComponent.prototype.setState = function (partialState, callback) {
  !(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'setState(...): takes an object of state variables to update or a function which returns an object of state variables.') : _prodInvariant('85') : void 0;
  this.updater.enqueueSetState(this, partialState);
  if (callback) {
    this.updater.enqueueCallback(this, callback, 'setState');
  }
};

/**
 * Forces an update. This should only be invoked when it is known with
 * certainty that we are **not** in a DOM transaction.
 *
 * You may want to call this when you know that some deeper aspect of the
 * component's state has changed but `setState` was not called.
 *
 * This will not invoke `shouldComponentUpdate`, but it will invoke
 * `componentWillUpdate` and `componentDidUpdate`.
 *
 * @param {?function} callback Called after update is complete.
 * @final
 * @protected
 */
ReactComponent.prototype.forceUpdate = function (callback) {
  this.updater.enqueueForceUpdate(this);
  if (callback) {
    this.updater.enqueueCallback(this, callback, 'forceUpdate');
  }
};

/**
 * Deprecated APIs. These APIs used to exist on classic React classes but since
 * we would like to deprecate them, we're not going to move them over to this
 * modern base class. Instead, we define a getter that warns if it's accessed.
 */
if (process.env.NODE_ENV !== 'production') {
  var deprecatedAPIs = {
    isMounted: ['isMounted', 'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'],
    replaceState: ['replaceState', 'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).']
  };
  var defineDeprecationWarning = function (methodName, info) {
    if (canDefineProperty) {
      Object.defineProperty(ReactComponent.prototype, methodName, {
        get: function () {
          process.env.NODE_ENV !== 'production' ? warning(false, '%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]) : void 0;
          return undefined;
        }
      });
    }
  };
  for (var fnName in deprecatedAPIs) {
    if (deprecatedAPIs.hasOwnProperty(fnName)) {
      defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
    }
  }
}

module.exports = ReactComponent;
}).call(this,require('_process'))
},{"./ReactNoopUpdateQueue":14,"./canDefineProperty":21,"./reactProdInvariant":25,"_process":1,"fbjs/lib/emptyObject":28,"fbjs/lib/invariant":29,"fbjs/lib/warning":32}],9:[function(require,module,exports){
(function (process){
/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactComponentTreeHook
 */

'use strict';

var _prodInvariant = require('./reactProdInvariant');

var ReactCurrentOwner = require('./ReactCurrentOwner');

var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

function isNative(fn) {
  // Based on isNative() from Lodash
  var funcToString = Function.prototype.toString;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var reIsNative = RegExp('^' + funcToString
  // Take an example native function source for comparison
  .call(hasOwnProperty)
  // Strip regex characters so we can use it for regex
  .replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  // Remove hasOwnProperty from the template to make it generic
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
  try {
    var source = funcToString.call(fn);
    return reIsNative.test(source);
  } catch (err) {
    return false;
  }
}

var canUseCollections =
// Array.from
typeof Array.from === 'function' &&
// Map
typeof Map === 'function' && isNative(Map) &&
// Map.prototype.keys
Map.prototype != null && typeof Map.prototype.keys === 'function' && isNative(Map.prototype.keys) &&
// Set
typeof Set === 'function' && isNative(Set) &&
// Set.prototype.keys
Set.prototype != null && typeof Set.prototype.keys === 'function' && isNative(Set.prototype.keys);

var itemMap;
var rootIDSet;

var itemByKey;
var rootByKey;

if (canUseCollections) {
  itemMap = new Map();
  rootIDSet = new Set();
} else {
  itemByKey = {};
  rootByKey = {};
}

var unmountedIDs = [];

// Use non-numeric keys to prevent V8 performance issues:
// https://github.com/facebook/react/pull/7232
function getKeyFromID(id) {
  return '.' + id;
}
function getIDFromKey(key) {
  return parseInt(key.substr(1), 10);
}

function get(id) {
  if (canUseCollections) {
    return itemMap.get(id);
  } else {
    var key = getKeyFromID(id);
    return itemByKey[key];
  }
}

function remove(id) {
  if (canUseCollections) {
    itemMap['delete'](id);
  } else {
    var key = getKeyFromID(id);
    delete itemByKey[key];
  }
}

function create(id, element, parentID) {
  var item = {
    element: element,
    parentID: parentID,
    text: null,
    childIDs: [],
    isMounted: false,
    updateCount: 0
  };

  if (canUseCollections) {
    itemMap.set(id, item);
  } else {
    var key = getKeyFromID(id);
    itemByKey[key] = item;
  }
}

function addRoot(id) {
  if (canUseCollections) {
    rootIDSet.add(id);
  } else {
    var key = getKeyFromID(id);
    rootByKey[key] = true;
  }
}

function removeRoot(id) {
  if (canUseCollections) {
    rootIDSet['delete'](id);
  } else {
    var key = getKeyFromID(id);
    delete rootByKey[key];
  }
}

function getRegisteredIDs() {
  if (canUseCollections) {
    return Array.from(itemMap.keys());
  } else {
    return Object.keys(itemByKey).map(getIDFromKey);
  }
}

function getRootIDs() {
  if (canUseCollections) {
    return Array.from(rootIDSet.keys());
  } else {
    return Object.keys(rootByKey).map(getIDFromKey);
  }
}

function purgeDeep(id) {
  var item = get(id);
  if (item) {
    var childIDs = item.childIDs;

    remove(id);
    childIDs.forEach(purgeDeep);
  }
}

function describeComponentFrame(name, source, ownerName) {
  return '\n    in ' + name + (source ? ' (at ' + source.fileName.replace(/^.*[\\\/]/, '') + ':' + source.lineNumber + ')' : ownerName ? ' (created by ' + ownerName + ')' : '');
}

function getDisplayName(element) {
  if (element == null) {
    return '#empty';
  } else if (typeof element === 'string' || typeof element === 'number') {
    return '#text';
  } else if (typeof element.type === 'string') {
    return element.type;
  } else {
    return element.type.displayName || element.type.name || 'Unknown';
  }
}

function describeID(id) {
  var name = ReactComponentTreeHook.getDisplayName(id);
  var element = ReactComponentTreeHook.getElement(id);
  var ownerID = ReactComponentTreeHook.getOwnerID(id);
  var ownerName;
  if (ownerID) {
    ownerName = ReactComponentTreeHook.getDisplayName(ownerID);
  }
  process.env.NODE_ENV !== 'production' ? warning(element, 'ReactComponentTreeHook: Missing React element for debugID %s when ' + 'building stack', id) : void 0;
  return describeComponentFrame(name, element && element._source, ownerName);
}

var ReactComponentTreeHook = {
  onSetChildren: function (id, nextChildIDs) {
    var item = get(id);
    item.childIDs = nextChildIDs;

    for (var i = 0; i < nextChildIDs.length; i++) {
      var nextChildID = nextChildIDs[i];
      var nextChild = get(nextChildID);
      !nextChild ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Expected hook events to fire for the child before its parent includes it in onSetChildren().') : _prodInvariant('140') : void 0;
      !(nextChild.childIDs != null || typeof nextChild.element !== 'object' || nextChild.element == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Expected onSetChildren() to fire for a container child before its parent includes it in onSetChildren().') : _prodInvariant('141') : void 0;
      !nextChild.isMounted ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Expected onMountComponent() to fire for the child before its parent includes it in onSetChildren().') : _prodInvariant('71') : void 0;
      if (nextChild.parentID == null) {
        nextChild.parentID = id;
        // TODO: This shouldn't be necessary but mounting a new root during in
        // componentWillMount currently causes not-yet-mounted components to
        // be purged from our tree data so their parent ID is missing.
      }
      !(nextChild.parentID === id) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Expected onBeforeMountComponent() parent and onSetChildren() to be consistent (%s has parents %s and %s).', nextChildID, nextChild.parentID, id) : _prodInvariant('142', nextChildID, nextChild.parentID, id) : void 0;
    }
  },
  onBeforeMountComponent: function (id, element, parentID) {
    create(id, element, parentID);
  },
  onBeforeUpdateComponent: function (id, element) {
    var item = get(id);
    if (!item || !item.isMounted) {
      // We may end up here as a result of setState() in componentWillUnmount().
      // In this case, ignore the element.
      return;
    }
    item.element = element;
  },
  onMountComponent: function (id) {
    var item = get(id);
    item.isMounted = true;
    var isRoot = item.parentID === 0;
    if (isRoot) {
      addRoot(id);
    }
  },
  onUpdateComponent: function (id) {
    var item = get(id);
    if (!item || !item.isMounted) {
      // We may end up here as a result of setState() in componentWillUnmount().
      // In this case, ignore the element.
      return;
    }
    item.updateCount++;
  },
  onUnmountComponent: function (id) {
    var item = get(id);
    if (item) {
      // We need to check if it exists.
      // `item` might not exist if it is inside an error boundary, and a sibling
      // error boundary child threw while mounting. Then this instance never
      // got a chance to mount, but it still gets an unmounting event during
      // the error boundary cleanup.
      item.isMounted = false;
      var isRoot = item.parentID === 0;
      if (isRoot) {
        removeRoot(id);
      }
    }
    unmountedIDs.push(id);
  },
  purgeUnmountedComponents: function () {
    if (ReactComponentTreeHook._preventPurging) {
      // Should only be used for testing.
      return;
    }

    for (var i = 0; i < unmountedIDs.length; i++) {
      var id = unmountedIDs[i];
      purgeDeep(id);
    }
    unmountedIDs.length = 0;
  },
  isMounted: function (id) {
    var item = get(id);
    return item ? item.isMounted : false;
  },
  getCurrentStackAddendum: function (topElement) {
    var info = '';
    if (topElement) {
      var type = topElement.type;
      var name = typeof type === 'function' ? type.displayName || type.name : type;
      var owner = topElement._owner;
      info += describeComponentFrame(name || 'Unknown', topElement._source, owner && owner.getName());
    }

    var currentOwner = ReactCurrentOwner.current;
    var id = currentOwner && currentOwner._debugID;

    info += ReactComponentTreeHook.getStackAddendumByID(id);
    return info;
  },
  getStackAddendumByID: function (id) {
    var info = '';
    while (id) {
      info += describeID(id);
      id = ReactComponentTreeHook.getParentID(id);
    }
    return info;
  },
  getChildIDs: function (id) {
    var item = get(id);
    return item ? item.childIDs : [];
  },
  getDisplayName: function (id) {
    var element = ReactComponentTreeHook.getElement(id);
    if (!element) {
      return null;
    }
    return getDisplayName(element);
  },
  getElement: function (id) {
    var item = get(id);
    return item ? item.element : null;
  },
  getOwnerID: function (id) {
    var element = ReactComponentTreeHook.getElement(id);
    if (!element || !element._owner) {
      return null;
    }
    return element._owner._debugID;
  },
  getParentID: function (id) {
    var item = get(id);
    return item ? item.parentID : null;
  },
  getSource: function (id) {
    var item = get(id);
    var element = item ? item.element : null;
    var source = element != null ? element._source : null;
    return source;
  },
  getText: function (id) {
    var element = ReactComponentTreeHook.getElement(id);
    if (typeof element === 'string') {
      return element;
    } else if (typeof element === 'number') {
      return '' + element;
    } else {
      return null;
    }
  },
  getUpdateCount: function (id) {
    var item = get(id);
    return item ? item.updateCount : 0;
  },


  getRegisteredIDs: getRegisteredIDs,

  getRootIDs: getRootIDs
};

module.exports = ReactComponentTreeHook;
}).call(this,require('_process'))
},{"./ReactCurrentOwner":10,"./reactProdInvariant":25,"_process":1,"fbjs/lib/invariant":29,"fbjs/lib/warning":32}],10:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactCurrentOwner
 */

'use strict';

/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 */

var ReactCurrentOwner = {

  /**
   * @internal
   * @type {ReactComponent}
   */
  current: null

};

module.exports = ReactCurrentOwner;
},{}],11:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMFactories
 */

'use strict';

var ReactElement = require('./ReactElement');

/**
 * Create a factory that creates HTML tag elements.
 *
 * @private
 */
var createDOMFactory = ReactElement.createFactory;
if (process.env.NODE_ENV !== 'production') {
  var ReactElementValidator = require('./ReactElementValidator');
  createDOMFactory = ReactElementValidator.createFactory;
}

/**
 * Creates a mapping from supported HTML tags to `ReactDOMComponent` classes.
 * This is also accessible via `React.DOM`.
 *
 * @public
 */
var ReactDOMFactories = {
  a: createDOMFactory('a'),
  abbr: createDOMFactory('abbr'),
  address: createDOMFactory('address'),
  area: createDOMFactory('area'),
  article: createDOMFactory('article'),
  aside: createDOMFactory('aside'),
  audio: createDOMFactory('audio'),
  b: createDOMFactory('b'),
  base: createDOMFactory('base'),
  bdi: createDOMFactory('bdi'),
  bdo: createDOMFactory('bdo'),
  big: createDOMFactory('big'),
  blockquote: createDOMFactory('blockquote'),
  body: createDOMFactory('body'),
  br: createDOMFactory('br'),
  button: createDOMFactory('button'),
  canvas: createDOMFactory('canvas'),
  caption: createDOMFactory('caption'),
  cite: createDOMFactory('cite'),
  code: createDOMFactory('code'),
  col: createDOMFactory('col'),
  colgroup: createDOMFactory('colgroup'),
  data: createDOMFactory('data'),
  datalist: createDOMFactory('datalist'),
  dd: createDOMFactory('dd'),
  del: createDOMFactory('del'),
  details: createDOMFactory('details'),
  dfn: createDOMFactory('dfn'),
  dialog: createDOMFactory('dialog'),
  div: createDOMFactory('div'),
  dl: createDOMFactory('dl'),
  dt: createDOMFactory('dt'),
  em: createDOMFactory('em'),
  embed: createDOMFactory('embed'),
  fieldset: createDOMFactory('fieldset'),
  figcaption: createDOMFactory('figcaption'),
  figure: createDOMFactory('figure'),
  footer: createDOMFactory('footer'),
  form: createDOMFactory('form'),
  h1: createDOMFactory('h1'),
  h2: createDOMFactory('h2'),
  h3: createDOMFactory('h3'),
  h4: createDOMFactory('h4'),
  h5: createDOMFactory('h5'),
  h6: createDOMFactory('h6'),
  head: createDOMFactory('head'),
  header: createDOMFactory('header'),
  hgroup: createDOMFactory('hgroup'),
  hr: createDOMFactory('hr'),
  html: createDOMFactory('html'),
  i: createDOMFactory('i'),
  iframe: createDOMFactory('iframe'),
  img: createDOMFactory('img'),
  input: createDOMFactory('input'),
  ins: createDOMFactory('ins'),
  kbd: createDOMFactory('kbd'),
  keygen: createDOMFactory('keygen'),
  label: createDOMFactory('label'),
  legend: createDOMFactory('legend'),
  li: createDOMFactory('li'),
  link: createDOMFactory('link'),
  main: createDOMFactory('main'),
  map: createDOMFactory('map'),
  mark: createDOMFactory('mark'),
  menu: createDOMFactory('menu'),
  menuitem: createDOMFactory('menuitem'),
  meta: createDOMFactory('meta'),
  meter: createDOMFactory('meter'),
  nav: createDOMFactory('nav'),
  noscript: createDOMFactory('noscript'),
  object: createDOMFactory('object'),
  ol: createDOMFactory('ol'),
  optgroup: createDOMFactory('optgroup'),
  option: createDOMFactory('option'),
  output: createDOMFactory('output'),
  p: createDOMFactory('p'),
  param: createDOMFactory('param'),
  picture: createDOMFactory('picture'),
  pre: createDOMFactory('pre'),
  progress: createDOMFactory('progress'),
  q: createDOMFactory('q'),
  rp: createDOMFactory('rp'),
  rt: createDOMFactory('rt'),
  ruby: createDOMFactory('ruby'),
  s: createDOMFactory('s'),
  samp: createDOMFactory('samp'),
  script: createDOMFactory('script'),
  section: createDOMFactory('section'),
  select: createDOMFactory('select'),
  small: createDOMFactory('small'),
  source: createDOMFactory('source'),
  span: createDOMFactory('span'),
  strong: createDOMFactory('strong'),
  style: createDOMFactory('style'),
  sub: createDOMFactory('sub'),
  summary: createDOMFactory('summary'),
  sup: createDOMFactory('sup'),
  table: createDOMFactory('table'),
  tbody: createDOMFactory('tbody'),
  td: createDOMFactory('td'),
  textarea: createDOMFactory('textarea'),
  tfoot: createDOMFactory('tfoot'),
  th: createDOMFactory('th'),
  thead: createDOMFactory('thead'),
  time: createDOMFactory('time'),
  title: createDOMFactory('title'),
  tr: createDOMFactory('tr'),
  track: createDOMFactory('track'),
  u: createDOMFactory('u'),
  ul: createDOMFactory('ul'),
  'var': createDOMFactory('var'),
  video: createDOMFactory('video'),
  wbr: createDOMFactory('wbr'),

  // SVG
  circle: createDOMFactory('circle'),
  clipPath: createDOMFactory('clipPath'),
  defs: createDOMFactory('defs'),
  ellipse: createDOMFactory('ellipse'),
  g: createDOMFactory('g'),
  image: createDOMFactory('image'),
  line: createDOMFactory('line'),
  linearGradient: createDOMFactory('linearGradient'),
  mask: createDOMFactory('mask'),
  path: createDOMFactory('path'),
  pattern: createDOMFactory('pattern'),
  polygon: createDOMFactory('polygon'),
  polyline: createDOMFactory('polyline'),
  radialGradient: createDOMFactory('radialGradient'),
  rect: createDOMFactory('rect'),
  stop: createDOMFactory('stop'),
  svg: createDOMFactory('svg'),
  text: createDOMFactory('text'),
  tspan: createDOMFactory('tspan')
};

module.exports = ReactDOMFactories;
}).call(this,require('_process'))
},{"./ReactElement":12,"./ReactElementValidator":13,"_process":1}],12:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactElement
 */

'use strict';

var _assign = require('object-assign');

var ReactCurrentOwner = require('./ReactCurrentOwner');

var warning = require('fbjs/lib/warning');
var canDefineProperty = require('./canDefineProperty');
var hasOwnProperty = Object.prototype.hasOwnProperty;

// The Symbol used to tag the ReactElement type. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol['for'] && Symbol['for']('react.element') || 0xeac7;

var RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
};

var specialPropKeyWarningShown, specialPropRefWarningShown;

function hasValidRef(config) {
  if (process.env.NODE_ENV !== 'production') {
    if (hasOwnProperty.call(config, 'ref')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;
      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }
  return config.ref !== undefined;
}

function hasValidKey(config) {
  if (process.env.NODE_ENV !== 'production') {
    if (hasOwnProperty.call(config, 'key')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;
      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }
  return config.key !== undefined;
}

function defineKeyPropWarningGetter(props, displayName) {
  var warnAboutAccessingKey = function () {
    if (!specialPropKeyWarningShown) {
      specialPropKeyWarningShown = true;
      process.env.NODE_ENV !== 'production' ? warning(false, '%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName) : void 0;
    }
  };
  warnAboutAccessingKey.isReactWarning = true;
  Object.defineProperty(props, 'key', {
    get: warnAboutAccessingKey,
    configurable: true
  });
}

function defineRefPropWarningGetter(props, displayName) {
  var warnAboutAccessingRef = function () {
    if (!specialPropRefWarningShown) {
      specialPropRefWarningShown = true;
      process.env.NODE_ENV !== 'production' ? warning(false, '%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName) : void 0;
    }
  };
  warnAboutAccessingRef.isReactWarning = true;
  Object.defineProperty(props, 'ref', {
    get: warnAboutAccessingRef,
    configurable: true
  });
}

/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, no instanceof check
 * will work. Instead test $$typeof field against Symbol.for('react.element') to check
 * if something is a React Element.
 *
 * @param {*} type
 * @param {*} key
 * @param {string|object} ref
 * @param {*} self A *temporary* helper to detect places where `this` is
 * different from the `owner` when React.createElement is called, so that we
 * can warn. We want to get rid of owner and replace string `ref`s with arrow
 * functions, and as long as `this` and owner are the same, there will be no
 * change in behavior.
 * @param {*} source An annotation object (added by a transpiler or otherwise)
 * indicating filename, line number, and/or other information.
 * @param {*} owner
 * @param {*} props
 * @internal
 */
var ReactElement = function (type, key, ref, self, source, owner, props) {
  var element = {
    // This tag allow us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner
  };

  if (process.env.NODE_ENV !== 'production') {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    element._store = {};
    var shadowChildren = Array.isArray(props.children) ? props.children.slice(0) : props.children;

    // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.
    if (canDefineProperty) {
      Object.defineProperty(element._store, 'validated', {
        configurable: false,
        enumerable: false,
        writable: true,
        value: false
      });
      // self and source are DEV only properties.
      Object.defineProperty(element, '_self', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: self
      });
      Object.defineProperty(element, '_shadowChildren', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: shadowChildren
      });
      // Two elements created in two different places should be considered
      // equal for testing purposes and therefore we hide it from enumeration.
      Object.defineProperty(element, '_source', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: source
      });
    } else {
      element._store.validated = false;
      element._self = self;
      element._shadowChildren = shadowChildren;
      element._source = source;
    }
    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }

  return element;
};

/**
 * Create and return a new ReactElement of the given type.
 * See https://facebook.github.io/react/docs/top-level-api.html#react.createelement
 */
ReactElement.createElement = function (type, config, children) {
  var propName;

  // Reserved names are extracted
  var props = {};

  var key = null;
  var ref = null;
  var self = null;
  var source = null;

  if (config != null) {
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(
      /* eslint-disable no-proto */
      config.__proto__ == null || config.__proto__ === Object.prototype,
      /* eslint-enable no-proto */
      'React.createElement(...): Expected props argument to be a plain object. ' + 'Properties defined in its prototype chain will be ignored.') : void 0;
    }

    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  // Resolve default props
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  if (process.env.NODE_ENV !== 'production') {
    if (key || ref) {
      if (typeof props.$$typeof === 'undefined' || props.$$typeof !== REACT_ELEMENT_TYPE) {
        var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;
        if (key) {
          defineKeyPropWarningGetter(props, displayName);
        }
        if (ref) {
          defineRefPropWarningGetter(props, displayName);
        }
      }
    }
  }
  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
};

/**
 * Return a function that produces ReactElements of a given type.
 * See https://facebook.github.io/react/docs/top-level-api.html#react.createfactory
 */
ReactElement.createFactory = function (type) {
  var factory = ReactElement.createElement.bind(null, type);
  // Expose the type on the factory and the prototype so that it can be
  // easily accessed on elements. E.g. `<Foo />.type === Foo`.
  // This should not be named `constructor` since this may not be the function
  // that created the element, and it may not even be a constructor.
  // Legacy hook TODO: Warn if this is accessed
  factory.type = type;
  return factory;
};

ReactElement.cloneAndReplaceKey = function (oldElement, newKey) {
  var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);

  return newElement;
};

/**
 * Clone and return a new ReactElement using element as the starting point.
 * See https://facebook.github.io/react/docs/top-level-api.html#react.cloneelement
 */
ReactElement.cloneElement = function (element, config, children) {
  var propName;

  // Original props are copied
  var props = _assign({}, element.props);

  // Reserved names are extracted
  var key = element.key;
  var ref = element.ref;
  // Self is preserved since the owner is preserved.
  var self = element._self;
  // Source is preserved since cloneElement is unlikely to be targeted by a
  // transpiler, and the original source is probably a better indicator of the
  // true owner.
  var source = element._source;

  // Owner will be preserved, unless ref is overridden
  var owner = element._owner;

  if (config != null) {
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(
      /* eslint-disable no-proto */
      config.__proto__ == null || config.__proto__ === Object.prototype,
      /* eslint-enable no-proto */
      'React.cloneElement(...): Expected props argument to be a plain object. ' + 'Properties defined in its prototype chain will be ignored.') : void 0;
    }

    if (hasValidRef(config)) {
      // Silently steal the ref from the parent.
      ref = config.ref;
      owner = ReactCurrentOwner.current;
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    // Remaining properties override existing props
    var defaultProps;
    if (element.type && element.type.defaultProps) {
      defaultProps = element.type.defaultProps;
    }
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        if (config[propName] === undefined && defaultProps !== undefined) {
          // Resolve default props
          props[propName] = defaultProps[propName];
        } else {
          props[propName] = config[propName];
        }
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return ReactElement(element.type, key, ref, self, source, owner, props);
};

/**
 * Verifies the object is a ReactElement.
 * See https://facebook.github.io/react/docs/top-level-api.html#react.isvalidelement
 * @param {?object} object
 * @return {boolean} True if `object` is a valid component.
 * @final
 */
ReactElement.isValidElement = function (object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
};

ReactElement.REACT_ELEMENT_TYPE = REACT_ELEMENT_TYPE;

module.exports = ReactElement;
}).call(this,require('_process'))
},{"./ReactCurrentOwner":10,"./canDefineProperty":21,"_process":1,"fbjs/lib/warning":32,"object-assign":33}],13:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactElementValidator
 */

/**
 * ReactElementValidator provides a wrapper around a element factory
 * which validates the props passed to the element. This is intended to be
 * used only in DEV and could be replaced by a static type checker for languages
 * that support it.
 */

'use strict';

var ReactCurrentOwner = require('./ReactCurrentOwner');
var ReactComponentTreeHook = require('./ReactComponentTreeHook');
var ReactElement = require('./ReactElement');
var ReactPropTypeLocations = require('./ReactPropTypeLocations');

var checkReactTypeSpec = require('./checkReactTypeSpec');

var canDefineProperty = require('./canDefineProperty');
var getIteratorFn = require('./getIteratorFn');
var warning = require('fbjs/lib/warning');

function getDeclarationErrorAddendum() {
  if (ReactCurrentOwner.current) {
    var name = ReactCurrentOwner.current.getName();
    if (name) {
      return ' Check the render method of `' + name + '`.';
    }
  }
  return '';
}

/**
 * Warn if there's no key explicitly set on dynamic arrays of children or
 * object keys are not valid. This allows us to keep track of children between
 * updates.
 */
var ownerHasKeyUseWarning = {};

function getCurrentComponentErrorInfo(parentType) {
  var info = getDeclarationErrorAddendum();

  if (!info) {
    var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;
    if (parentName) {
      info = ' Check the top-level render call using <' + parentName + '>.';
    }
  }
  return info;
}

/**
 * Warn if the element doesn't have an explicit key assigned to it.
 * This element is in an array. The array could grow and shrink or be
 * reordered. All children that haven't already been validated are required to
 * have a "key" property assigned to it. Error statuses are cached so a warning
 * will only be shown once.
 *
 * @internal
 * @param {ReactElement} element Element that requires a key.
 * @param {*} parentType element's parent's type.
 */
function validateExplicitKey(element, parentType) {
  if (!element._store || element._store.validated || element.key != null) {
    return;
  }
  element._store.validated = true;

  var memoizer = ownerHasKeyUseWarning.uniqueKey || (ownerHasKeyUseWarning.uniqueKey = {});

  var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
  if (memoizer[currentComponentErrorInfo]) {
    return;
  }
  memoizer[currentComponentErrorInfo] = true;

  // Usually the current owner is the offender, but if it accepts children as a
  // property, it may be the creator of the child that's responsible for
  // assigning it a key.
  var childOwner = '';
  if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
    // Give the component that originally created this child.
    childOwner = ' It was passed a child from ' + element._owner.getName() + '.';
  }

  process.env.NODE_ENV !== 'production' ? warning(false, 'Each child in an array or iterator should have a unique "key" prop.' + '%s%s See https://fb.me/react-warning-keys for more information.%s', currentComponentErrorInfo, childOwner, ReactComponentTreeHook.getCurrentStackAddendum(element)) : void 0;
}

/**
 * Ensure that every element either is passed in a static location, in an
 * array with an explicit keys property defined, or in an object literal
 * with valid key property.
 *
 * @internal
 * @param {ReactNode} node Statically passed child of any type.
 * @param {*} parentType node's parent's type.
 */
function validateChildKeys(node, parentType) {
  if (typeof node !== 'object') {
    return;
  }
  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) {
      var child = node[i];
      if (ReactElement.isValidElement(child)) {
        validateExplicitKey(child, parentType);
      }
    }
  } else if (ReactElement.isValidElement(node)) {
    // This element was passed in a valid location.
    if (node._store) {
      node._store.validated = true;
    }
  } else if (node) {
    var iteratorFn = getIteratorFn(node);
    // Entry iterators provide implicit keys.
    if (iteratorFn) {
      if (iteratorFn !== node.entries) {
        var iterator = iteratorFn.call(node);
        var step;
        while (!(step = iterator.next()).done) {
          if (ReactElement.isValidElement(step.value)) {
            validateExplicitKey(step.value, parentType);
          }
        }
      }
    }
  }
}

/**
 * Given an element, validate that its props follow the propTypes definition,
 * provided by the type.
 *
 * @param {ReactElement} element
 */
function validatePropTypes(element) {
  var componentClass = element.type;
  if (typeof componentClass !== 'function') {
    return;
  }
  var name = componentClass.displayName || componentClass.name;
  if (componentClass.propTypes) {
    checkReactTypeSpec(componentClass.propTypes, element.props, ReactPropTypeLocations.prop, name, element, null);
  }
  if (typeof componentClass.getDefaultProps === 'function') {
    process.env.NODE_ENV !== 'production' ? warning(componentClass.getDefaultProps.isReactClassApproved, 'getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.') : void 0;
  }
}

var ReactElementValidator = {

  createElement: function (type, props, children) {
    var validType = typeof type === 'string' || typeof type === 'function';
    // We warn in this case but don't throw. We expect the element creation to
    // succeed and there will likely be errors in render.
    if (!validType) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'React.createElement: type should not be null, undefined, boolean, or ' + 'number. It should be a string (for DOM elements) or a ReactClass ' + '(for composite components).%s', getDeclarationErrorAddendum()) : void 0;
    }

    var element = ReactElement.createElement.apply(this, arguments);

    // The result can be nullish if a mock or a custom function is used.
    // TODO: Drop this when these are no longer allowed as the type argument.
    if (element == null) {
      return element;
    }

    // Skip key warning if the type isn't valid since our key validation logic
    // doesn't expect a non-string/function type and can throw confusing errors.
    // We don't want exception behavior to differ between dev and prod.
    // (Rendering will throw with a helpful message and as soon as the type is
    // fixed, the key warnings will appear.)
    if (validType) {
      for (var i = 2; i < arguments.length; i++) {
        validateChildKeys(arguments[i], type);
      }
    }

    validatePropTypes(element);

    return element;
  },

  createFactory: function (type) {
    var validatedFactory = ReactElementValidator.createElement.bind(null, type);
    // Legacy hook TODO: Warn if this is accessed
    validatedFactory.type = type;

    if (process.env.NODE_ENV !== 'production') {
      if (canDefineProperty) {
        Object.defineProperty(validatedFactory, 'type', {
          enumerable: false,
          get: function () {
            process.env.NODE_ENV !== 'production' ? warning(false, 'Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.') : void 0;
            Object.defineProperty(this, 'type', {
              value: type
            });
            return type;
          }
        });
      }
    }

    return validatedFactory;
  },

  cloneElement: function (element, props, children) {
    var newElement = ReactElement.cloneElement.apply(this, arguments);
    for (var i = 2; i < arguments.length; i++) {
      validateChildKeys(arguments[i], newElement.type);
    }
    validatePropTypes(newElement);
    return newElement;
  }

};

module.exports = ReactElementValidator;
}).call(this,require('_process'))
},{"./ReactComponentTreeHook":9,"./ReactCurrentOwner":10,"./ReactElement":12,"./ReactPropTypeLocations":16,"./canDefineProperty":21,"./checkReactTypeSpec":22,"./getIteratorFn":23,"_process":1,"fbjs/lib/warning":32}],14:[function(require,module,exports){
(function (process){
/**
 * Copyright 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactNoopUpdateQueue
 */

'use strict';

var warning = require('fbjs/lib/warning');

function warnNoop(publicInstance, callerName) {
  if (process.env.NODE_ENV !== 'production') {
    var constructor = publicInstance.constructor;
    process.env.NODE_ENV !== 'production' ? warning(false, '%s(...): Can only update a mounted or mounting component. ' + 'This usually means you called %s() on an unmounted component. ' + 'This is a no-op. Please check the code for the %s component.', callerName, callerName, constructor && (constructor.displayName || constructor.name) || 'ReactClass') : void 0;
  }
}

/**
 * This is the abstract API for an update queue.
 */
var ReactNoopUpdateQueue = {

  /**
   * Checks whether or not this composite component is mounted.
   * @param {ReactClass} publicInstance The instance we want to test.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function (publicInstance) {
    return false;
  },

  /**
   * Enqueue a callback that will be executed after all the pending updates
   * have processed.
   *
   * @param {ReactClass} publicInstance The instance to use as `this` context.
   * @param {?function} callback Called after state is updated.
   * @internal
   */
  enqueueCallback: function (publicInstance, callback) {},

  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldComponentUpdate`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @internal
   */
  enqueueForceUpdate: function (publicInstance) {
    warnNoop(publicInstance, 'forceUpdate');
  },

  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} completeState Next state.
   * @internal
   */
  enqueueReplaceState: function (publicInstance, completeState) {
    warnNoop(publicInstance, 'replaceState');
  },

  /**
   * Sets a subset of the state. This only exists because _pendingState is
   * internal. This provides a merging strategy that is not available to deep
   * properties which is confusing. TODO: Expose pendingState or don't use it
   * during the merge.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialState Next partial state to be merged with state.
   * @internal
   */
  enqueueSetState: function (publicInstance, partialState) {
    warnNoop(publicInstance, 'setState');
  }
};

module.exports = ReactNoopUpdateQueue;
}).call(this,require('_process'))
},{"_process":1,"fbjs/lib/warning":32}],15:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPropTypeLocationNames
 */

'use strict';

var ReactPropTypeLocationNames = {};

if (process.env.NODE_ENV !== 'production') {
  ReactPropTypeLocationNames = {
    prop: 'prop',
    context: 'context',
    childContext: 'child context'
  };
}

module.exports = ReactPropTypeLocationNames;
}).call(this,require('_process'))
},{"_process":1}],16:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPropTypeLocations
 */

'use strict';

var keyMirror = require('fbjs/lib/keyMirror');

var ReactPropTypeLocations = keyMirror({
  prop: null,
  context: null,
  childContext: null
});

module.exports = ReactPropTypeLocations;
},{"fbjs/lib/keyMirror":30}],17:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPropTypes
 */

'use strict';

var ReactElement = require('./ReactElement');
var ReactPropTypeLocationNames = require('./ReactPropTypeLocationNames');
var ReactPropTypesSecret = require('./ReactPropTypesSecret');

var emptyFunction = require('fbjs/lib/emptyFunction');
var getIteratorFn = require('./getIteratorFn');
var warning = require('fbjs/lib/warning');

/**
 * Collection of methods that allow declaration and validation of props that are
 * supplied to React components. Example usage:
 *
 *   var Props = require('ReactPropTypes');
 *   var MyArticle = React.createClass({
 *     propTypes: {
 *       // An optional string prop named "description".
 *       description: Props.string,
 *
 *       // A required enum prop named "category".
 *       category: Props.oneOf(['News','Photos']).isRequired,
 *
 *       // A prop named "dialog" that requires an instance of Dialog.
 *       dialog: Props.instanceOf(Dialog).isRequired
 *     },
 *     render: function() { ... }
 *   });
 *
 * A more formal specification of how these methods are used:
 *
 *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
 *   decl := ReactPropTypes.{type}(.isRequired)?
 *
 * Each and every declaration produces a function with the same signature. This
 * allows the creation of custom validation functions. For example:
 *
 *  var MyLink = React.createClass({
 *    propTypes: {
 *      // An optional string or URI prop named "href".
 *      href: function(props, propName, componentName) {
 *        var propValue = props[propName];
 *        if (propValue != null && typeof propValue !== 'string' &&
 *            !(propValue instanceof URI)) {
 *          return new Error(
 *            'Expected a string or an URI for ' + propName + ' in ' +
 *            componentName
 *          );
 *        }
 *      }
 *    },
 *    render: function() {...}
 *  });
 *
 * @internal
 */

var ANONYMOUS = '<<anonymous>>';

var ReactPropTypes = {
  array: createPrimitiveTypeChecker('array'),
  bool: createPrimitiveTypeChecker('boolean'),
  func: createPrimitiveTypeChecker('function'),
  number: createPrimitiveTypeChecker('number'),
  object: createPrimitiveTypeChecker('object'),
  string: createPrimitiveTypeChecker('string'),
  symbol: createPrimitiveTypeChecker('symbol'),

  any: createAnyTypeChecker(),
  arrayOf: createArrayOfTypeChecker,
  element: createElementTypeChecker(),
  instanceOf: createInstanceTypeChecker,
  node: createNodeChecker(),
  objectOf: createObjectOfTypeChecker,
  oneOf: createEnumTypeChecker,
  oneOfType: createUnionTypeChecker,
  shape: createShapeTypeChecker
};

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
/*eslint-disable no-self-compare*/
function is(x, y) {
  // SameValue algorithm
  if (x === y) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    return x !== 0 || 1 / x === 1 / y;
  } else {
    // Step 6.a: NaN == NaN
    return x !== x && y !== y;
  }
}
/*eslint-enable no-self-compare*/

/**
 * We use an Error-like object for backward compatibility as people may call
 * PropTypes directly and inspect their output. However we don't use real
 * Errors anymore. We don't inspect their stack anyway, and creating them
 * is prohibitively expensive if they are created too often, such as what
 * happens in oneOfType() for any type before the one that matched.
 */
function PropTypeError(message) {
  this.message = message;
  this.stack = '';
}
// Make `instanceof Error` still work for returned errors.
PropTypeError.prototype = Error.prototype;

function createChainableTypeChecker(validate) {
  if (process.env.NODE_ENV !== 'production') {
    var manualPropTypeCallCache = {};
  }
  function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
    componentName = componentName || ANONYMOUS;
    propFullName = propFullName || propName;
    if (process.env.NODE_ENV !== 'production') {
      if (secret !== ReactPropTypesSecret && typeof console !== 'undefined') {
        var cacheKey = componentName + ':' + propName;
        if (!manualPropTypeCallCache[cacheKey]) {
          process.env.NODE_ENV !== 'production' ? warning(false, 'You are manually calling a React.PropTypes validation ' + 'function for the `%s` prop on `%s`. This is deprecated ' + 'and will not work in the next major version. You may be ' + 'seeing this warning due to a third-party PropTypes library. ' + 'See https://fb.me/react-warning-dont-call-proptypes for details.', propFullName, componentName) : void 0;
          manualPropTypeCallCache[cacheKey] = true;
        }
      }
    }
    if (props[propName] == null) {
      var locationName = ReactPropTypeLocationNames[location];
      if (isRequired) {
        return new PropTypeError('Required ' + locationName + ' `' + propFullName + '` was not specified in ' + ('`' + componentName + '`.'));
      }
      return null;
    } else {
      return validate(props, propName, componentName, location, propFullName);
    }
  }

  var chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}

function createPrimitiveTypeChecker(expectedType) {
  function validate(props, propName, componentName, location, propFullName, secret) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== expectedType) {
      var locationName = ReactPropTypeLocationNames[location];
      // `propValue` being instance of, say, date/regexp, pass the 'object'
      // check, but we can offer a more precise error message here rather than
      // 'of type `object`'.
      var preciseType = getPreciseType(propValue);

      return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createAnyTypeChecker() {
  return createChainableTypeChecker(emptyFunction.thatReturns(null));
}

function createArrayOfTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location, propFullName) {
    if (typeof typeChecker !== 'function') {
      return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
    }
    var propValue = props[propName];
    if (!Array.isArray(propValue)) {
      var locationName = ReactPropTypeLocationNames[location];
      var propType = getPropType(propValue);
      return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
    }
    for (var i = 0; i < propValue.length; i++) {
      var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
      if (error instanceof Error) {
        return error;
      }
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createElementTypeChecker() {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    if (!ReactElement.isValidElement(propValue)) {
      var locationName = ReactPropTypeLocationNames[location];
      var propType = getPropType(propValue);
      return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createInstanceTypeChecker(expectedClass) {
  function validate(props, propName, componentName, location, propFullName) {
    if (!(props[propName] instanceof expectedClass)) {
      var locationName = ReactPropTypeLocationNames[location];
      var expectedClassName = expectedClass.name || ANONYMOUS;
      var actualClassName = getClassName(props[propName]);
      return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createEnumTypeChecker(expectedValues) {
  if (!Array.isArray(expectedValues)) {
    process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
    return emptyFunction.thatReturnsNull;
  }

  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    for (var i = 0; i < expectedValues.length; i++) {
      if (is(propValue, expectedValues[i])) {
        return null;
      }
    }

    var locationName = ReactPropTypeLocationNames[location];
    var valuesString = JSON.stringify(expectedValues);
    return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
  }
  return createChainableTypeChecker(validate);
}

function createObjectOfTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location, propFullName) {
    if (typeof typeChecker !== 'function') {
      return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
    }
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== 'object') {
      var locationName = ReactPropTypeLocationNames[location];
      return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
    }
    for (var key in propValue) {
      if (propValue.hasOwnProperty(key)) {
        var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createUnionTypeChecker(arrayOfTypeCheckers) {
  if (!Array.isArray(arrayOfTypeCheckers)) {
    process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
    return emptyFunction.thatReturnsNull;
  }

  function validate(props, propName, componentName, location, propFullName) {
    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
        return null;
      }
    }

    var locationName = ReactPropTypeLocationNames[location];
    return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
  }
  return createChainableTypeChecker(validate);
}

function createNodeChecker() {
  function validate(props, propName, componentName, location, propFullName) {
    if (!isNode(props[propName])) {
      var locationName = ReactPropTypeLocationNames[location];
      return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createShapeTypeChecker(shapeTypes) {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== 'object') {
      var locationName = ReactPropTypeLocationNames[location];
      return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
    }
    for (var key in shapeTypes) {
      var checker = shapeTypes[key];
      if (!checker) {
        continue;
      }
      var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
      if (error) {
        return error;
      }
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function isNode(propValue) {
  switch (typeof propValue) {
    case 'number':
    case 'string':
    case 'undefined':
      return true;
    case 'boolean':
      return !propValue;
    case 'object':
      if (Array.isArray(propValue)) {
        return propValue.every(isNode);
      }
      if (propValue === null || ReactElement.isValidElement(propValue)) {
        return true;
      }

      var iteratorFn = getIteratorFn(propValue);
      if (iteratorFn) {
        var iterator = iteratorFn.call(propValue);
        var step;
        if (iteratorFn !== propValue.entries) {
          while (!(step = iterator.next()).done) {
            if (!isNode(step.value)) {
              return false;
            }
          }
        } else {
          // Iterator will provide entry [k,v] tuples rather than values.
          while (!(step = iterator.next()).done) {
            var entry = step.value;
            if (entry) {
              if (!isNode(entry[1])) {
                return false;
              }
            }
          }
        }
      } else {
        return false;
      }

      return true;
    default:
      return false;
  }
}

function isSymbol(propType, propValue) {
  // Native Symbol.
  if (propType === 'symbol') {
    return true;
  }

  // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
  if (propValue['@@toStringTag'] === 'Symbol') {
    return true;
  }

  // Fallback for non-spec compliant Symbols which are polyfilled.
  if (typeof Symbol === 'function' && propValue instanceof Symbol) {
    return true;
  }

  return false;
}

// Equivalent of `typeof` but with special handling for array and regexp.
function getPropType(propValue) {
  var propType = typeof propValue;
  if (Array.isArray(propValue)) {
    return 'array';
  }
  if (propValue instanceof RegExp) {
    // Old webkits (at least until Android 4.0) return 'function' rather than
    // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
    // passes PropTypes.object.
    return 'object';
  }
  if (isSymbol(propType, propValue)) {
    return 'symbol';
  }
  return propType;
}

// This handles more types than `getPropType`. Only used for error messages.
// See `createPrimitiveTypeChecker`.
function getPreciseType(propValue) {
  var propType = getPropType(propValue);
  if (propType === 'object') {
    if (propValue instanceof Date) {
      return 'date';
    } else if (propValue instanceof RegExp) {
      return 'regexp';
    }
  }
  return propType;
}

// Returns class name of the object, if any.
function getClassName(propValue) {
  if (!propValue.constructor || !propValue.constructor.name) {
    return ANONYMOUS;
  }
  return propValue.constructor.name;
}

module.exports = ReactPropTypes;
}).call(this,require('_process'))
},{"./ReactElement":12,"./ReactPropTypeLocationNames":15,"./ReactPropTypesSecret":18,"./getIteratorFn":23,"_process":1,"fbjs/lib/emptyFunction":27,"fbjs/lib/warning":32}],18:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPropTypesSecret
 */

'use strict';

var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;
},{}],19:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPureComponent
 */

'use strict';

var _assign = require('object-assign');

var ReactComponent = require('./ReactComponent');
var ReactNoopUpdateQueue = require('./ReactNoopUpdateQueue');

var emptyObject = require('fbjs/lib/emptyObject');

/**
 * Base class helpers for the updating state of a component.
 */
function ReactPureComponent(props, context, updater) {
  // Duplicated from ReactComponent.
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}

function ComponentDummy() {}
ComponentDummy.prototype = ReactComponent.prototype;
ReactPureComponent.prototype = new ComponentDummy();
ReactPureComponent.prototype.constructor = ReactPureComponent;
// Avoid an extra prototype jump for these methods.
_assign(ReactPureComponent.prototype, ReactComponent.prototype);
ReactPureComponent.prototype.isPureReactComponent = true;

module.exports = ReactPureComponent;
},{"./ReactComponent":8,"./ReactNoopUpdateQueue":14,"fbjs/lib/emptyObject":28,"object-assign":33}],20:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactVersion
 */

'use strict';

module.exports = '15.3.1';
},{}],21:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule canDefineProperty
 */

'use strict';

var canDefineProperty = false;
if (process.env.NODE_ENV !== 'production') {
  try {
    Object.defineProperty({}, 'x', { get: function () {} });
    canDefineProperty = true;
  } catch (x) {
    // IE will fail on defineProperty
  }
}

module.exports = canDefineProperty;
}).call(this,require('_process'))
},{"_process":1}],22:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule checkReactTypeSpec
 */

'use strict';

var _prodInvariant = require('./reactProdInvariant');

var ReactPropTypeLocationNames = require('./ReactPropTypeLocationNames');
var ReactPropTypesSecret = require('./ReactPropTypesSecret');

var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

var ReactComponentTreeHook;

if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
  // Temporary hack.
  // Inline requires don't work well with Jest:
  // https://github.com/facebook/react/issues/7240
  // Remove the inline requires when we don't need them anymore:
  // https://github.com/facebook/react/pull/7178
  ReactComponentTreeHook = require('./ReactComponentTreeHook');
}

var loggedTypeFailures = {};

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?object} element The React element that is being type-checked
 * @param {?number} debugID The React component instance that is being type-checked
 * @private
 */
function checkReactTypeSpec(typeSpecs, values, location, componentName, element, debugID) {
  for (var typeSpecName in typeSpecs) {
    if (typeSpecs.hasOwnProperty(typeSpecName)) {
      var error;
      // Prop type validation may throw. In case they do, we don't want to
      // fail the render phase where it didn't fail before. So we log it.
      // After these have been cleaned up, we'll let them throw.
      try {
        // This is intentionally an invariant that gets caught. It's the same
        // behavior as without this statement except with a better message.
        !(typeof typeSpecs[typeSpecName] === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s: %s type `%s` is invalid; it must be a function, usually from React.PropTypes.', componentName || 'React class', ReactPropTypeLocationNames[location], typeSpecName) : _prodInvariant('84', componentName || 'React class', ReactPropTypeLocationNames[location], typeSpecName) : void 0;
        error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
      } catch (ex) {
        error = ex;
      }
      process.env.NODE_ENV !== 'production' ? warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', ReactPropTypeLocationNames[location], typeSpecName, typeof error) : void 0;
      if (error instanceof Error && !(error.message in loggedTypeFailures)) {
        // Only monitor this failure once because there tends to be a lot of the
        // same error.
        loggedTypeFailures[error.message] = true;

        var componentStackInfo = '';

        if (process.env.NODE_ENV !== 'production') {
          if (!ReactComponentTreeHook) {
            ReactComponentTreeHook = require('./ReactComponentTreeHook');
          }
          if (debugID !== null) {
            componentStackInfo = ReactComponentTreeHook.getStackAddendumByID(debugID);
          } else if (element !== null) {
            componentStackInfo = ReactComponentTreeHook.getCurrentStackAddendum(element);
          }
        }

        process.env.NODE_ENV !== 'production' ? warning(false, 'Failed %s type: %s%s', location, error.message, componentStackInfo) : void 0;
      }
    }
  }
}

module.exports = checkReactTypeSpec;
}).call(this,require('_process'))
},{"./ReactComponentTreeHook":9,"./ReactPropTypeLocationNames":15,"./ReactPropTypesSecret":18,"./reactProdInvariant":25,"_process":1,"fbjs/lib/invariant":29,"fbjs/lib/warning":32}],23:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getIteratorFn
 * 
 */

'use strict';

/* global Symbol */

var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

/**
 * Returns the iterator method function contained on the iterable object.
 *
 * Be sure to invoke the function with the iterable as context:
 *
 *     var iteratorFn = getIteratorFn(myIterable);
 *     if (iteratorFn) {
 *       var iterator = iteratorFn.call(myIterable);
 *       ...
 *     }
 *
 * @param {?object} maybeIterable
 * @return {?function}
 */
function getIteratorFn(maybeIterable) {
  var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}

module.exports = getIteratorFn;
},{}],24:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule onlyChild
 */
'use strict';

var _prodInvariant = require('./reactProdInvariant');

var ReactElement = require('./ReactElement');

var invariant = require('fbjs/lib/invariant');

/**
 * Returns the first child in a collection of children and verifies that there
 * is only one child in the collection.
 *
 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.only
 *
 * The current implementation of this function assumes that a single child gets
 * passed without a wrapper, but the purpose of this helper function is to
 * abstract away the particular structure of children.
 *
 * @param {?object} children Child collection structure.
 * @return {ReactElement} The first and only `ReactElement` contained in the
 * structure.
 */
function onlyChild(children) {
  !ReactElement.isValidElement(children) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'React.Children.only expected to receive a single React element child.') : _prodInvariant('143') : void 0;
  return children;
}

module.exports = onlyChild;
}).call(this,require('_process'))
},{"./ReactElement":12,"./reactProdInvariant":25,"_process":1,"fbjs/lib/invariant":29}],25:[function(require,module,exports){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule reactProdInvariant
 * 
 */
'use strict';

/**
 * WARNING: DO NOT manually require this module.
 * This is a replacement for `invariant(...)` used by the error code system
 * and will _only_ be required by the corresponding babel pass.
 * It always throws.
 */

function reactProdInvariant(code) {
  var argCount = arguments.length - 1;

  var message = 'Minified React error #' + code + '; visit ' + 'http://facebook.github.io/react/docs/error-decoder.html?invariant=' + code;

  for (var argIdx = 0; argIdx < argCount; argIdx++) {
    message += '&args[]=' + encodeURIComponent(arguments[argIdx + 1]);
  }

  message += ' for the full message or use the non-minified dev environment' + ' for full errors and additional helpful warnings.';

  var error = new Error(message);
  error.name = 'Invariant Violation';
  error.framesToPop = 1; // we don't care about reactProdInvariant's own frame

  throw error;
}

module.exports = reactProdInvariant;
},{}],26:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule traverseAllChildren
 */

'use strict';

var _prodInvariant = require('./reactProdInvariant');

var ReactCurrentOwner = require('./ReactCurrentOwner');
var ReactElement = require('./ReactElement');

var getIteratorFn = require('./getIteratorFn');
var invariant = require('fbjs/lib/invariant');
var KeyEscapeUtils = require('./KeyEscapeUtils');
var warning = require('fbjs/lib/warning');

var SEPARATOR = '.';
var SUBSEPARATOR = ':';

/**
 * TODO: Test that a single child and an array with one item have the same key
 * pattern.
 */

var didWarnAboutMaps = false;

/**
 * Generate a key string that identifies a component within a set.
 *
 * @param {*} component A component that could contain a manual key.
 * @param {number} index Index that is used if a manual key is not provided.
 * @return {string}
 */
function getComponentKey(component, index) {
  // Do some typechecking here since we call this blindly. We want to ensure
  // that we don't block potential future ES APIs.
  if (component && typeof component === 'object' && component.key != null) {
    // Explicit key
    return KeyEscapeUtils.escape(component.key);
  }
  // Implicit key determined by the index in the set
  return index.toString(36);
}

/**
 * @param {?*} children Children tree container.
 * @param {!string} nameSoFar Name of the key path so far.
 * @param {!function} callback Callback to invoke with each child found.
 * @param {?*} traverseContext Used to pass information throughout the traversal
 * process.
 * @return {!number} The number of children in this subtree.
 */
function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
  var type = typeof children;

  if (type === 'undefined' || type === 'boolean') {
    // All of the above are perceived as null.
    children = null;
  }

  if (children === null || type === 'string' || type === 'number' || ReactElement.isValidElement(children)) {
    callback(traverseContext, children,
    // If it's the only child, treat the name as if it was wrapped in an array
    // so that it's consistent if the number of children grows.
    nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar);
    return 1;
  }

  var child;
  var nextName;
  var subtreeCount = 0; // Count of children found in the current subtree.
  var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      nextName = nextNamePrefix + getComponentKey(child, i);
      subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
    }
  } else {
    var iteratorFn = getIteratorFn(children);
    if (iteratorFn) {
      var iterator = iteratorFn.call(children);
      var step;
      if (iteratorFn !== children.entries) {
        var ii = 0;
        while (!(step = iterator.next()).done) {
          child = step.value;
          nextName = nextNamePrefix + getComponentKey(child, ii++);
          subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          var mapsAsChildrenAddendum = '';
          if (ReactCurrentOwner.current) {
            var mapsAsChildrenOwnerName = ReactCurrentOwner.current.getName();
            if (mapsAsChildrenOwnerName) {
              mapsAsChildrenAddendum = ' Check the render method of `' + mapsAsChildrenOwnerName + '`.';
            }
          }
          process.env.NODE_ENV !== 'production' ? warning(didWarnAboutMaps, 'Using Maps as children is not yet fully supported. It is an ' + 'experimental feature that might be removed. Convert it to a ' + 'sequence / iterable of keyed ReactElements instead.%s', mapsAsChildrenAddendum) : void 0;
          didWarnAboutMaps = true;
        }
        // Iterator will provide entry [k,v] tuples rather than values.
        while (!(step = iterator.next()).done) {
          var entry = step.value;
          if (entry) {
            child = entry[1];
            nextName = nextNamePrefix + KeyEscapeUtils.escape(entry[0]) + SUBSEPARATOR + getComponentKey(child, 0);
            subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
          }
        }
      }
    } else if (type === 'object') {
      var addendum = '';
      if (process.env.NODE_ENV !== 'production') {
        addendum = ' If you meant to render a collection of children, use an array ' + 'instead or wrap the object using createFragment(object) from the ' + 'React add-ons.';
        if (children._isReactElement) {
          addendum = ' It looks like you\'re using an element created by a different ' + 'version of React. Make sure to use only one copy of React.';
        }
        if (ReactCurrentOwner.current) {
          var name = ReactCurrentOwner.current.getName();
          if (name) {
            addendum += ' Check the render method of `' + name + '`.';
          }
        }
      }
      var childrenString = String(children);
      !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Objects are not valid as a React child (found: %s).%s', childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString, addendum) : _prodInvariant('31', childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString, addendum) : void 0;
    }
  }

  return subtreeCount;
}

/**
 * Traverses children that are typically specified as `props.children`, but
 * might also be specified through attributes:
 *
 * - `traverseAllChildren(this.props.children, ...)`
 * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
 *
 * The `traverseContext` is an optional argument that is passed through the
 * entire traversal. It can be used to store accumulations or anything else that
 * the callback might find relevant.
 *
 * @param {?*} children Children tree object.
 * @param {!function} callback To invoke upon traversing each child.
 * @param {?*} traverseContext Context for traversal.
 * @return {!number} The number of children in this subtree.
 */
function traverseAllChildren(children, callback, traverseContext) {
  if (children == null) {
    return 0;
  }

  return traverseAllChildrenImpl(children, '', callback, traverseContext);
}

module.exports = traverseAllChildren;
}).call(this,require('_process'))
},{"./KeyEscapeUtils":3,"./ReactCurrentOwner":10,"./ReactElement":12,"./getIteratorFn":23,"./reactProdInvariant":25,"_process":1,"fbjs/lib/invariant":29,"fbjs/lib/warning":32}],27:[function(require,module,exports){
"use strict";

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;
},{}],28:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

var emptyObject = {};

if (process.env.NODE_ENV !== 'production') {
  Object.freeze(emptyObject);
}

module.exports = emptyObject;
}).call(this,require('_process'))
},{"_process":1}],29:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

function invariant(condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
}).call(this,require('_process'))
},{"_process":1}],30:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks static-only
 */

'use strict';

var invariant = require('./invariant');

/**
 * Constructs an enumeration with keys equal to their value.
 *
 * For example:
 *
 *   var COLORS = keyMirror({blue: null, red: null});
 *   var myColor = COLORS.blue;
 *   var isColorValid = !!COLORS[myColor];
 *
 * The last line could not be performed if the values of the generated enum were
 * not equal to their keys.
 *
 *   Input:  {key1: val1, key2: val2}
 *   Output: {key1: key1, key2: key2}
 *
 * @param {object} obj
 * @return {object}
 */
var keyMirror = function keyMirror(obj) {
  var ret = {};
  var key;
  !(obj instanceof Object && !Array.isArray(obj)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'keyMirror(...): Argument must be an object.') : invariant(false) : void 0;
  for (key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = key;
  }
  return ret;
};

module.exports = keyMirror;
}).call(this,require('_process'))
},{"./invariant":29,"_process":1}],31:[function(require,module,exports){
"use strict";

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

/**
 * Allows extraction of a minified key. Let's the build system minify keys
 * without losing the ability to dynamically use key strings as values
 * themselves. Pass in an object with a single key/val pair and it will return
 * you the string key of that single record. Suppose you want to grab the
 * value for a key 'className' inside of an object. Key/val minification may
 * have aliased that key to be 'xa12'. keyOf({className: null}) will return
 * 'xa12' in that case. Resolve keys you want to use once at startup time, then
 * reuse those resolutions.
 */
var keyOf = function keyOf(oneKeyObj) {
  var key;
  for (key in oneKeyObj) {
    if (!oneKeyObj.hasOwnProperty(key)) {
      continue;
    }
    return key;
  }
  return null;
};

module.exports = keyOf;
},{}],32:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

var emptyFunction = require('./emptyFunction');

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if (process.env.NODE_ENV !== 'production') {
  (function () {
    var printWarning = function printWarning(format) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };

    warning = function warning(condition, format) {
      if (format === undefined) {
        throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
      }

      if (format.indexOf('Failed Composite propType: ') === 0) {
        return; // Ignore CompositeComponent proptype check.
      }

      if (!condition) {
        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }

        printWarning.apply(undefined, [format].concat(args));
      }
    };
  })();
}

module.exports = warning;
}).call(this,require('_process'))
},{"./emptyFunction":27,"_process":1}],33:[function(require,module,exports){
'use strict';
/* eslint-disable no-unused-vars */
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (e) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],34:[function(require,module,exports){
'use strict';

module.exports = require('./lib/React');

},{"./lib/React":5}],35:[function(require,module,exports){
var react = require('react');
var R = require('ramda');

console.log("awww yisss");

(function Ramda(R) {
  
})(R);
},{"ramda":2,"react":34}]},{},[35]);
