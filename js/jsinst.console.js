/*
    jsInst
    @copyright 2013  Zheng Li <lizheng@lizheng.me>
    @github https://github.com/nocoo/jsinst
    @license MIT
*/

var jsinst;
(function(jsinst) {
    var config = {
        'auto_scroll': true
    };
    var el = document.getElementById('console');

    jsinst.log = function(message, id, native) {
        if (id) {
            el = document.getElementById(id);
        }

        if (el) {
            var dom = document.createElement('p');
            dom.innerText = message;
            el.appendChild(dom);

            if (config.auto_scroll) {
                el.scrollTop = el.scrollHeight;
            }
        }

        if (native) {
            console.log(message);
        }
    };
})(jsinst || (jsinst = {}));
