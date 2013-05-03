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
        'max_queue': 3,
        'endpoint': '/?data='
    };

    var dom_sender;
    var track_list = {}, event_queue = [];
    var callback_queue = [], callback_send = [];
    var serialize_map = { 'feature': 'f', 'data': 'd', 'timestamp': 'ts' };

    exports.reset = function() {
        delete track_list;
        track_list = {};

        if (!dom_sender) {
            dom_sender = document.createElement('img');
            dom_sender.setAttribute('style', 'width:0;height:0;display:none;');
            var body = document.getElementsByTagName('body');

            if (body && body.length === 1) {
                body[0].appendChild(dom_sender);
            } else {
                global_config.enabled = false;
            }
        }

        if (global_config.enabled) {
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
                item.removeEventListener('click', on_target_click);
                item.addEventListener('click', on_target_click, true);
            }

            event_queue = [];
            event_send = [];
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
        switch (method) {
            default: {
                if (dom_sender) {
                    dom_sender.setAttribute('src', global_config.endpoint + data + '&' + exports.timestamp());
                }
                break;
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
