/*
    jsInst
    @copyright 2013  Zheng Li <lizheng@lizheng.me>
    @github https://github.com/nocoo/jsinst
    @license MIT
*/

define(function(require, exports, module) {
    var global_config = {
        'enabled': true,
        'classname': 'jsinst',
        'feature': 'data-feature',
        'value': 'data-value',
        'max_queue': 10,
        'endpoint': '/?data='
    };

    var dom_sender, track_list, event_queue, callback_queue, callback_send;
    var serialize_map = { 'feature': 'f', 'data': 'd', 'timestamp': 'ts' };

    var addHandler = function(target, event, handler) {
        if (target.addEventListener) {
            target.addEventListener(event, handler, false);
        } else if (target.attachEvent) {
            target.attachEvent('on' + event, handler);
        } else {
            target['on' + event] = handler;
        }
    };

    var removeHandler = function(target, event, handler) {
        if (target.removeEventListener) {
            target.removeEventListener(event, handler, false);
        } else if (target.detachEvent) {
            target.detachEvent('on' + event, handler);
        } else {
            target['on' + event] = null;
        }
    };

    exports.reset = function() {
        delete track_list;
        delete event_queue;
        delete callback_queue;
        delete callback_send;

        track_list = {};
        event_queue = [];
        callback_queue = [];
        callback_send = [];

        if (global_config.enabled) {
            // Register click event to jsinst elements.
            var on_target_click = function(evt) {
                var feature = evt.target.getAttribute('data-feature') || 'uknown';
                var value = evt.target.getAttribute('data-value') || 'undefined';
                var event = {};

                event.feature = feature;
                event.data = value;

                exports.queue(event);
            };

            var list = document.getElementsByClassName(global_config.classname);
            for (var i = 0, len = list.length; i < len; ++i) {
                var item = list[i];
                removeHandler(item, 'click', on_target_click);
                addHandler(item, 'click', on_target_click, true);
            }

            // Register window events
            var on_window_load = function(evt) {
                dom_sender = document.createElement('img');
                dom_sender.setAttribute('style', 'width:0;height:0;display:none;');
                var body = document.getElementsByTagName('body');
                if (body && body.length === 1) {
                    body[0].appendChild(dom_sender);
                }
            };

            var on_window_unload = function(evt) {
                exports.send(exports.serialize());
                event_queue = [];
            };

            addHandler(window, 'load', on_window_load);
            addHandler(window, 'beforeunload', on_window_unload);
        }
    };

    exports.queue = function(event) {
        if (!global_config.enabled) { return; }

        if (!event.timestamp) {
            event.timestamp = (new Date()).getTime();
        }

        event_queue.push(event);
        if (event_queue.length >= global_config.max_queue) {
            exports.send(exports.serialize());
            event_queue = [];
        }

        // Event
        var item;
        for (var i = 0, len = callback_queue.length; i < len; ++i) {
            item = callback_queue[i];
            if (item.callback && typeof(item.callback) === 'function') {
                item.callback.apply(item.that, [ event ]);
            }
        }
    };

    exports.send = function(data, method) {
        if (!global_config.enabled) { return; }
        if (!method) {
            method = 'get';
        }

        switch (method.toLowerCase()) {
            case 'get':
            default: {
                if (dom_sender) {
                    dom_sender.setAttribute('src', global_config.endpoint + data + '&' + exports.timestamp());
                }
                break;
            }
        }

        // Event
        var item;
        for (var i = 0, len = callback_send.length; i < len; ++i) {
            item = callback_send[i];
            if (item.callback && typeof(item.callback) === 'function') {
                item.callback.apply(item.that, [ data, method ]);
            }
        }
    };

    exports.start = function(name) {
        name = name || 'default';
        track_list[name] = exports.timestamp();
    };

    exports.end = function(name) {
        var ts = exports.timestamp();

        name = name || 'default';

        if (!track_list[name]) {
            return 0;
        } else {
            var result = ts - track_list[name];
            delete track_list[name];
            return result;
        }
    };

    exports.info = function() {
        console.log(global_config);
        console.log(track_list);
        console.log(event_queue);
    };

    exports.register = function(event, callback, that) {
        switch (event) {
            case 'queue': {
                callback_queue.push({ 'callback': callback, 'that': that });
                break;
            }
            case 'send': {
                callback_send.push({ 'callback': callback, 'that': that });
                break;
            }
        }
    };

    exports.serialize = function() {
        var cache = [], item;
        cache.push('[');

        for (var i = 0, len = event_queue.length; i < len; ++i) {
            item = event_queue[i];
            cache.push('{"' + serialize_map.feature + '":"' + item.feature + '",');
            cache.push('"' + serialize_map.data + '":"' + item.data + '",');
            cache.push('"' + serialize_map.timestamp + '":' + item.timestamp + '}');

            if (i < len - 1) {
                cache.push(',');
            }
        }

        cache.push(']');
        return cache.join('');
    };

    exports.timestamp = function() {
        return (new Date).getTime();
    };

    exports.reset();
});
