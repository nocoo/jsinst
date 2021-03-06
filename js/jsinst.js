/*
    jsinst
    @copyright 2013  Zheng Li <lizheng@lizheng.me>
    @github https://github.com/nocoo/jsinst
    @license MIT
*/

var jsinst;
(function(jsinst) {
    var default_global_config = {
        'enabled': true,
        'classname': 'jsinst',
        'feature': 'data-feature',
        'value': 'data-value',
        'max_queue': 5,
        'method': 'image',
        'endpoint': '/?',
        'data_name': 'data'
    };

    var dom_sender, track_list, event_queue, callback_queue, callback_send, global_config;
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

    jsinst.reset = function() {
        delete track_list;
        delete event_queue;
        delete callback_queue;
        delete callback_send;
        delete global_config;

        track_list = {};
        event_queue = [];
        callback_queue = [];
        callback_send = [];
        global_config = default_global_config;

        if (global_config.enabled) {
            // Register click event to jsinst elements.
            var on_target_click = function(evt) {
                var feature = evt.target.getAttribute('data-feature') || 'uknown';
                var value = evt.target.getAttribute('data-value') || 'undefined';
                var event = {};

                event.feature = feature;
                event.data = value;

                jsinst.queue(event);
            };

            var list = document.getElementsByClassName(global_config.classname);
            for (var i = 0, len = list.length; i < len; ++i) {
                var item = list[i];
                removeHandler(item, 'click', on_target_click);
                addHandler(item, 'click', on_target_click, true);
            }

            // Register window events
            var on_window_load = function(evt) {
                if (global_config.method.toLowerCase() === 'image') {
                    dom_sender = document.createElement('img');
                    dom_sender.setAttribute('style', 'width:0;height:0;display:none;');
                    var body = document.getElementsByTagName('body');
                    if (body && body.length === 1) {
                        body[0].appendChild(dom_sender);
                    }
                }
            };

            var on_window_unload = function(evt) {
                jsinst.send(event_queue, false);
                event_queue = [];
            };

            addHandler(window, 'load', on_window_load);
            addHandler(window, 'beforeunload', on_window_unload);
        }
    };

    jsinst.queue = function(event) {
        if (!global_config.enabled) { return; }

        if (!event.timestamp) {
            event.timestamp = (new Date()).getTime();
        }

        event_queue.push(event);
        if (event_queue.length >= global_config.max_queue) {
            jsinst.send(event_queue, true);
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

    jsinst.send = function(data, async) {
        if (!global_config.enabled) { return; }
        if (!data || data.length === 0) { return; }

        var xhr = new XMLHttpRequest();
        var url_base = global_config.endpoint;
        var data = encodeURIComponent(global_config.data_name) + '=' + encodeURIComponent(jsinst.serialize());

        switch (global_config.method.toLowerCase()) {
            case 'image':
            default: {
                if (dom_sender) {
                    dom_sender.setAttribute('src', url_base + data);
                }
                break;
            }
            case 'head': {
                if (xhr) {
                    xhr.open('HEAD', url_base + data, async);
                    xhr.send(null);
                }

                break;
            }
            case 'get': {
                if (xhr) {
                    xhr.open('GET', url_base + data, async);
                    xhr.send(null);
                }

                break;
            }
            case 'post': {
                if (xhr) {
                    xhr.open('POST', url_base, async);
                    xhr.send(data);
                }

                break;
            }
        }

        // Event
        var item;
        for (var i = 0, len = callback_send.length; i < len; ++i) {
            item = callback_send[i];
            if (item.callback && typeof(item.callback) === 'function') {
                item.callback.apply(item.that, [ data ]);
            }
        }
    };

    jsinst.start = function(name) {
        name = name || 'default';
        track_list[name] = jsinst.timestamp();
    };

    jsinst.end = function(name) {
        var ts = jsinst.timestamp();

        name = name || 'default';

        if (!track_list[name]) {
            return 0;
        } else {
            var result = ts - track_list[name];
            delete track_list[name];
            return result;
        }
    };

    jsinst.settings = function(setting) {
        for (var item in global_config) {
            if (setting &&
                global_config[item] != undefined && setting[item] != undefined &&
                global_config[item] != null && setting[item] != null &&
                typeof(global_config[item]) === typeof(setting[item])) {
                global_config[item] = setting[item];
            }
        }

        return global_config;
    };

    jsinst.register = function(event, callback, that) {
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

    jsinst.serialize = function() {
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

    jsinst.timestamp = function() {
        return (new Date).getTime();
    };

    jsinst.reset();
})(jsinst || (jsinst = {}));
