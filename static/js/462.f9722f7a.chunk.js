!function(){"use strict";var e={6462:function(e,r,n){var t=n(4165),o=n(5861),i=n(5671),s=n(3144),c=n(1555);importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.2/full/pyodide.js");var u=function(){function e(){(0,i.Z)(this,e),this.isPythonWorker=!0}return(0,s.Z)(e,[{key:"initPyodide",value:function(){var e=(0,o.Z)((0,t.Z)().mark((function e(r){var n,o,i;return(0,t.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,self.loadPyodide();case 2:return n=e.sent,self.pyodide=n,console.log(n.runPython("import sys\nsys.version")),e.next=7,n.loadPackage(["scipy","micropip"]);case 7:return"/ui/libs/converter/dist/",e.next=10,fetch("/ui/libs/converter/dist/yaptide_converter.json");case 10:return e.next=12,e.sent.json();case 12:if(o=e.sent,i=o.fileName){e.next=16;break}throw new Error("converterFileName is not defined");case 16:return e.next=18,n.runPythonAsync("\t\t\t\nimport micropip\nawait micropip.install('".concat("/ui/libs/converter/dist/").concat(i,"') \nprint(micropip.list())\n\t\t\t"));case 18:r();case 19:case"end":return e.stop()}}),e)})));return function(r){return e.apply(this,arguments)}}()},{key:"close",value:function(){self.close()}},{key:"runPython",value:function(e){return self.pyodide.runPython(e)}},{key:"checkConverter",value:function(){return self.pyodide.runPython("\ndef checkIfConverterReady():\n\ttry:\n\t\tfrom converter.api import run_parser\n\t\tprint(\"module 'converter' is installed\")\n\t\treturn True\n\texcept ModuleNotFoundError:\n\t\tprint(\"module 'converter' is not installed\")\n\t\treturn False\ncheckIfConverterReady()\n")}},{key:"convertJSON",value:function(e){return self.pyodide.runPython("\nimport os\nfrom converter.api import run_parser\nfrom converter.api import get_parser_from_str\ndef convertJson(editor_json, parser_name = 'shieldhit'):\n\tparser=get_parser_from_str(parser_name)\n\treturn run_parser(parser, editor_json.to_py(), None, True)\nconvertJson")(e).toJs()}}]),e}(),a=new u;c.Jj(a)}},r={};function n(t){var o=r[t];if(void 0!==o)return o.exports;var i=r[t]={exports:{}};return e[t](i,i.exports,n),i.exports}n.m=e,n.x=function(){var e=n.O(void 0,[352],(function(){return n(6462)}));return e=n.O(e)},function(){var e=[];n.O=function(r,t,o,i){if(!t){var s=1/0;for(p=0;p<e.length;p++){t=e[p][0],o=e[p][1],i=e[p][2];for(var c=!0,u=0;u<t.length;u++)(!1&i||s>=i)&&Object.keys(n.O).every((function(e){return n.O[e](t[u])}))?t.splice(u--,1):(c=!1,i<s&&(s=i));if(c){e.splice(p--,1);var a=o();void 0!==a&&(r=a)}}return r}i=i||0;for(var p=e.length;p>0&&e[p-1][2]>i;p--)e[p]=e[p-1];e[p]=[t,o,i]}}(),n.d=function(e,r){for(var t in r)n.o(r,t)&&!n.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:r[t]})},n.f={},n.e=function(e){return Promise.all(Object.keys(n.f).reduce((function(r,t){return n.f[t](e,r),r}),[]))},n.u=function(e){return""+e+".adc414d1.chunk.js"},n.miniCssF=function(e){},n.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},n.p="./",function(){var e={462:1};n.f.i=function(r,t){e[r]||importScripts(n.p+n.u(r))};var r=self.webpackChunkthreejs_editor_react=self.webpackChunkthreejs_editor_react||[],t=r.push.bind(r);r.push=function(r){var o=r[0],i=r[1],s=r[2];for(var c in i)n.o(i,c)&&(n.m[c]=i[c]);for(s&&s(n);o.length;)e[o.pop()]=1;t(r)}}(),function(){var e=n.x;n.x=function(){return n.e(352).then(e)}}();n.x()}();
//# sourceMappingURL=462.f9722f7a.chunk.js.map