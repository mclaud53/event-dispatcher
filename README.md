# EventDispatcher

 [![Build Status](https://api.travis-ci.org/mclaud53/event-dispatcher.svg?branch=master)](http://travis-ci.org/mclaud53/event-dispatcher)


## Install

 ```js
npm i node-event-dispatcher
```

Definitions for typescript:
```js
...
  "dependencies": {
  	...
  	"node-event-dispatcher": "github:mclaud53/event-dispatcher/event-dispatcher.d.ts#42d85ae7d54dbcb08766ce52d65543b4f74f9577"
  	...
  }
...
```

## Usage

Simple example:
```js
var ned = require('node-event-dispatcher'),
	event = new ned.Event('SOME_EVENT', this),
	dispatcher = new ned.EventDispatcher();

dispatcher.add(function (e) {
	console.log('event received!');
}, this, 'SOME_EVENT');

dispatcher.dispatch(event);

```

## License

MIT