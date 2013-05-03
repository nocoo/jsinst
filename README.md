jsinst
======

A JavaScript instrumentation and performance toolkit

jsinst is a light weight JavaScript toolkit for in page instrumentation and performance test.
By adding very few extra properties to existing web page elements, you can easily know how your visitor interactive with your web page.
jsinst can queue up user events in frontend, and send the data to your server as you demand.

# Usage

## Enable log for an element

On any existing DOM elements, by adding "jsinst" class and "data-feature", "data-value" properties, jsinst will attach click event to them.

Example:

    <input class="jsinst" data-feature="inputbox" data-value="default" type="text" placeholder="Type some thing here." />

When user click on this input box, a instrumentation log will be queued, and will be sent to your server.

    {"feature":"inputbox","data":"default","timestamp":1367570833695}

## Configurations

By costomize the global config, you can make jsinst work as you want.

* enabled: [true | false]
* classname: The class name for jsinst to watch, default is "jsinst"
* feature: The feature property name, default is "data-feature"
* value: The value property name, default is "data-value"
* max_queue: The max queue length. When max queue length is reached, jsinst will start a send activity. default is 3
* method: [image | get | head | post] image: jsinst will create a invisible img element, and append it to body, using this element to make contact with server. GET/HEAD/POST are standard XMLHTTPRequest call
* endpoint: Server endpoint URL
* data: Server endpoint data parameter name

In code:

    var global_config = {
        'enabled': true,
        'classname': 'jsinst',
        'feature': 'data-feature',
        'value': 'data-value',
        'max_queue': 3,
        'method': 'get',
        'endpoint': '/',
        'data': 'data'
    };

## Events

You can subscribe "queue" event or/and "send" event, to add your own actions when an event has been queued or sent.

    jsinst.register('queue', function(data) {
        console.log('Queue Event: ' + JSON.stringify(data));
    }, this);

    jsinst.register('send', function(data) {
        jsinst.log('Send Event: ' + JSON.stringify(data));
    }, this);

# License
(The MIT License)

Copyright (c) 2013 Zheng Li

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
