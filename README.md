# Khan Academy -- Challenge Framework

[Online demo](http://ka.likhter.com)

### Stack/Tools
* Esprima
* CodeMirror
* Webworker
* ES6, LESS
* No framework

### Build and run
The only **requirement** is `node >= 6.3.x`.

* `$ git clone https://github.com/likhter/ka-challenge.git`
* `$ npm install`
* `$ npm run build`
* `$ npm run serve`
* Navigate your favorite browser to http://localhost:8080 .

### Tests
* `$ npm run test` -- run ~~many~~ unit tests for the API (`src/api.js`).
* `$ npm run lint`

### What's cool
* Works in modern FF, Chrome, Safari and IE 10+.
* Parses user code in a real thread separate from UI thread.
* Provides some samples demonstrating how it works.
* Checks for different statements even inside `for` init block, `if` condition block, etc, not only inside bodies of statements.

### Thoughts
* `src/worker.js`: Webworker has built-in instrument for external scripts loading -- `importScripts`. However it works synchronously and blocks execution of the worker until scripts are fully loaded, just "inlines" scripts to the webworker scope, read "you should have global variable in every imported script so that worker could access it" (or something like RequireJS supporting WebWorkers, that is sort of overcomplication in our case). It makes almost any developer sad and adds problems during unit testing. Used ES6's `import Smth from './script'` instead of `importScripts`.
* `src/api.js`: `matchStructure` method changes AST during traversal -- adds `__childrenAdded` property to every tree node. Not critical in our case, however can not be considered "ideal approach". Possible workaround: save this value to the stack along with nodes scheduled for traversal.
* `src/api.js`: some methods were intended to use built-in `Set` object. Unfortunately, IE10 (and even IE11) does not support native sets. Had to use polyfill (with the fallback to native sets if supported).
* `src/challenge.js`: code of the application is still small enough, giving us a chance to use vanilla js. Using of a framework is a subject to talk about. ~~Keep it simple!~~

### Known issues/TODOs
* Show some kind of preloader unless webworker is completely loaded. It is 196K when compressed.
* Probably it is a good idea to have CodeMirror loaded before DOM is ready. Now we may see textarea not turned into CodeMirror for a while on a slow connection. For the moment CodeMirror's source code is inlined to the `challenge.js` that is 252K when compressed.
* Having separate config file (with CodeMirror default settings and default values, for example) is a nice idea as well.
* So far you need to trigger `blur` event of every rule field to trigger code/rules submission. Should definitely handle Enter.