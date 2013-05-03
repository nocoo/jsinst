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
        'max_queue': 10
    };

    var dom_sender;
    var track_list = {}, event_queue = [];

    exports.reset = function() {
        delete track_list;
        track_list = {};

        if (!dom_sender) {
            dom_sender = document.createElement('img');
            dom_sender.setAttribute('src', 'ss');
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
        }
    };

    exports.queue = function(event) {
        if (!global_config.enabled) { return; }

        if (!event.timestamp) {
            event.timestamp = (new Date()).getTime();
        }

        event_queue.push(event);
        if (event_queue.length >= global_config.max_queue) {
            console.log('send');
        }
    };

    exports.send = function() {
        if (!global_config.enabled) { return; }

    };

    exports.start = function(name) {
        name = name || 'default';
        track_list[name] = timestamp();
    };

    exports.end = function(name) {
        var ts = timestamp();

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

    var timestamp = function() {
        return (new Date).getTime();
    };

    exports.reset();
});
