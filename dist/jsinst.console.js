/*
    jsInst
    @copyright 2013  Zheng Li <lizheng@lizheng.me>
    @github https://github.com/nocoo/jsinst
    @license MIT
*/
var jsinst;(function(e){var f={'auto_scroll':true};var g=document.getElementById('console');e.log=function(a,b,c){if(b){g=document.getElementById(b)}if(g){var d=document.createElement('p');d.innerText=a;g.appendChild(d);if(f.auto_scroll){g.scrollTop=g.scrollHeight}}if(c){console.log(a)}}})(jsinst||(jsinst={}));
