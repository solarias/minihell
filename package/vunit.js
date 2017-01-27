/**
 * Polyfill for VW, VH, VM, VMIN units. Handles int and float values, both positive and negative.
 * @depends StyleFix from -prefix-free http://leaverou.github.com/prefixfree/
 * @author Lea Verou, Xandor Schiefer, Viktor Bezdek
 */
(function () {

    // dependence je prefixfree.js
    if (!window.StyleFix) {
        console.warn('Viewport units polyfill requires StyleFix from prefixfree.js.');
        return;
    }

    // check capabilities
    var dummy = document.createElement('_').style,
        units = ['vw', 'vh', 'vmax', 'vmin'].filter(function (unit) {
            dummy.width = '';
            dummy.width = '10' + unit;
            return !dummy.width;
        });

    if (!units.length) {
        return;
    }

    // parse int & float values
    // pattern info - http://regex101.com/r/oO9fA9/3
    var searchPattern = /(-?[a-z]+(-[a-z]+)*\s*:\s*)(-?[0-9.]+)(vw|vh|vm|vmin)\b(\s*;.\s*(-?[a-z]+(-[a-z]+)*\s*:\s*)\b([0-9]*\.?[0-9]+)(px)\b)?/gi;

    // register CSS processing function
    StyleFix.register(function (css) {
        var w = innerWidth, h = innerHeight, m = Math.min(w, h);
        return css.replace(searchPattern,
            function (match, property, sub_property, num, unit) {
                return property + num + unit + ';' + property + ((num * (unit == 'vw' ? w : unit == 'vh' ? h : m) / 100) + 'px');
            }
        );
    });

    // throttled function to update view after orientation change
    var handleOrientationChange = (function () {
        'use strict';

        var timeWindow = 200; // ms throttle time
        var lastExecution = new Date((new Date()).getTime() - timeWindow);

        var handleOrientationChange = function () {
            // process style fix
            StyleFix.process();
        };

        return function () {
            if ((lastExecution.getTime() + timeWindow) <= (new Date()).getTime()) {
                lastExecution = new Date();
                return handleOrientationChange.apply(this, arguments);
            }
        };
    }());

    // handle viewport resize and orientation change
    window.addEventListener('resize', handleOrientationChange, false);
    window.addEventListener('orientationchange', handleOrientationChange, false);

})();
