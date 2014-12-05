/**
 * ZenoFullscreen - A simple plugin to wrap fullscreen api handling
 *
 * @author Richard Smith <richard@smith-net.org.uk>
 * @copyright 2014 Richard Smith
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

(function($, undefined) {
    "use strict";

    //provide a way to seamlessly use the prefixed functions and events
    var fn = (function () {

        var function_map = [
            [ 'requestFullscreen',       'exitFullscreen',       'fullscreenElement',       'fullscreenEnabled',       'fullscreenchange',       'fullscreenerror'       ],
            [ 'webkitRequestFullscreen', 'webkitExitFullscreen', 'webkitFullscreenElement', 'webkitFullscreenEnabled', 'webkitfullscreenchange', 'webkitfullscreenerror' ],
            [ 'mozRequestFullScreen',    'mozCancelFullScreen',  'mozFullScreenElement',    'mozFullScreenEnabled',    'mozfullscreenchange',    'mozfullscreenerror'    ],
            [ 'msRequestFullscreen',     'msExitFullscreen',     'msFullscreenElement',     'msFullscreenEnabled',     'MSFullscreenChange',     'MSFullscreenError'     ],
        ];

        var normalized_mapping = {};
        for (var i = 0; i < function_map.length; i++) {
            if (function_map[i] && function_map[i][1] in document) {

                //declare that we support fullscreen mode in jquery support
                $.support.fullscreen = true;

                //map the browser specifics to a native name
                for (var j = 0; j < function_map[i].length; j++) {
                    normalized_mapping[function_map[0][j]] = function_map[i][j];
                }

                return normalized_mapping;
            }
        }

    })();

    //attach the event listeners to re throw the on change and on error events
    if ($.support.fullscreen === true) {
        $(document).bind(fn.fullscreenchange, function(event) { $(document).trigger(new jQuery.Event('fullscreenchange')); });
        $(document).bind(fn.fullscreenerror,  function(event) { $(document).trigger(new jQuery.Event('fullscreenerror'));  });
    }

    //test to see if full screen mode has been activated
    function getFullscreenStatus(){
        return !!document[fn.fullscreenElement];
    }

    //request full screen mode on an provided element
    function startFullScreen(element) {
        element[0][fn.requestFullscreen]();
    }

    //cancel out of fullscreen mode
    function stopFullScreen(){
        document[fn.exitFullscreen]();
    }

    //extend the jquery core to include the start fullscreen method
    $.fn.zeno_fullscreen = function(method) {
        if ($.support.fullscreen === true) {
            if (typeof method === 'string') {
                switch (method) {
                    case 'start': startFullScreen(this); break;
                    case 'stop':  stopFullScreen();      break;
                }
            }
            else
            {
                return getFullscreenStatus();
            }
        }
    };

})(jQuery);