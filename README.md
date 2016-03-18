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
  	"node-event-dispatcher": "github:mclaud53/event-dispatcher/event-dispatcher.d.ts#3e4e8cc89c8d6aa010968425329dcdd25c822a9d"
  	...
  }
...
```

## Usage

Simple example:
```js

var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher();

// subscribe on event "SOME_EVENT"
dispatcher.add(function (e) {
	console.log('event received!');
}, this, 'SOME_EVENT');

// dispatch of event
dispatcher.dispatch(new ned.Event('SOME_EVENT', this)); // -> event received!
```

To listen several events in one listener:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher();

dispatcher.add(function (e) {
	console.log(e.type);
}, this, ['EVENT_1', 'EVENT_2', 'EVENT_3']);

dispatcher.dispatch(new ned.Event('EVENT_1', this)); // -> EVENT_1
dispatcher.dispatch(new ned.Event('EVENT_2', this)); // -> EVENT_2
dispatcher.dispatch(new ned.Event('EVENT_3', this)); // -> EVENT_3
```

To listen all events in one listener:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher();

dispatcher.add(function (e) {
	console.log(e.type);
}, this);

dispatcher.dispatch(new ned.Event('ANY_EVENT', this)); // -> ANY_EVENT
```

To listen all events except some:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher(),
	listener = function (e) {
		console.log(e.type);
	};

dispatcher.add(listener, this);
dispatcher.remove(listener, this, ['EXCLUDED_EVENT', 'EXLUDED_EVENT_TOO']);

dispatcher.dispatch(new ned.Event('ANY_EVENT', this)); // -> ANY_EVENT
dispatcher.dispatch(new ned.Event('EXCLUDED_EVENT', this)); // -> 
```

To add several listeners:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher();

dispatcher.addAll([
	{
		listener: function (e) {
			console.log('first listener!');
		},
		scope: this,
		eventType: 'FIRST_EVENT'
	},
	{
		listener: function (e) {
			console.log('second listener!');
		},
		scope: this,
		eventType: 'SECOND_EVENT'
	},
	{
		listener: function (e) {
			console.log('third listener!');
		},
		scope: this,
		eventType: 'THIRD_EVENT'
	}
]);

dispatcher.dispatch(new ned.Event('FIRST_EVENT', this));  // -> first listener!
dispatcher.dispatch(new ned.Event('SECOND_EVENT', this)); // -> second listener!
dispatcher.dispatch(new ned.Event('THIRD_EVENT', this));  // -> second listener!
```

To set priority to the listener:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher();

dispatcher.add(function (e) {
	console.log('listener with priority 0');
}, this, 'SOME_EVENT');	

dispatcher.add(function (e) {
	console.log('listener with priority -100');
}, this, 'SOME_EVENT', {priority: -100});

dispatcher.add(function (e) {
	console.log('listener with priority 100');
}, this, 'SOME_EVENT', {priority: 100});

dispatcher.dispatch(new ned.Event('SOME_EVENT', this));

// -> listener with priority 100
// -> listener with priority 0
// -> listener with priority -100
```

Dispatch of cancellable event:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher();

dispatcher.add(function (e) {
	e.preventDefault();
}, this, 'SOME_EVENT');

dispatcher.dispatch(new ned.Event('SOME_EVENT', this, 'cancellable'));

console.log(event.isDefaultPrevented); // -> true
```

Dispatch event with extra data:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher();

dispatcher.add(function (e) {
	console.log(e.options);
}, this, 'SOME_EVENT');

dispatcher.dispatch(new ned.Event('SOME_EVENT', this, false, {extra: 'extra data'})); // -> { extra: 'extra data' }
```

Automatic removal of the listener after receiving the first event:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher();

dispatcher.add(function (e) {
	console.log(e.type);
}, this, ['FIRST', 'SECOND'], {single: true});

dispatcher.dispatch(new ned.Event('FIRST', this)); // -> FIRST
dispatcher.dispatch(new ned.Event('SECOND', this)); // -> 
```

Addition of the deferred listener:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher();

dispatcher.add(function (e) {
	console.log('event received!');
}, this, null, {delay: true});

dispatcher.dispatch(new ned.Event('SOME_EVENT', this));
console.log('event dispatched!');

// -> event dispatched!
// -> event received!
```

Addition of the delayed listener:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher(),
	time = (new Date()).valueOf();

dispatcher.add(function (e) {
	var delay = (new Date()).valueOf() - time;
	console.log('event received! delay: ' + delay);
}, this, null, {delay: 100});

dispatcher.dispatch(new ned.Event('SOME_EVENT', this));
console.log('event dispatched!');

// -> event dispatched!
// -> event received! delay: 102
```

Addition of the buffered listener:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher(),
	time = (new Date()).valueOf();

dispatcher.add(function (e) {
	var delay = (new Date()).valueOf() - time;
	console.log('event received! delay: ' + delay);
}, this, null, {buffer: 100});

dispatcher.dispatch(new ned.Event('SOME_EVENT', this));
setTimeout(function () {
	dispatcher.dispatch(new ned.Event('SOME_EVENT', this));
}, 50);

// -> event received! delay: 152
```

To check whether listeners were added:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher(),
	listener = function (e) {};

console.log(dispatcher.hasListeners); // -> false
dispatcher.add(listener, this);
console.log(dispatcher.hasListeners); // -> true
dispatcher.remove(listener, this);
console.log(dispatcher.hasListeners); // -> false
```

To check there are listeners for an event:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher(),
	listener = function (e) {};

console.log(dispatcher.willDispatch('SOME_EVENT')); // -> false
dispatcher.add(listener, this, 'SOME_EVENT');
console.log(dispatcher.willDispatch('SOME_EVENT')); // -> true
dispatcher.remove(listener, this, 'SOME_EVENT');
console.log(dispatcher.willDispatch('SOME_EVENT')); // -> false
```

To check whether a listener is added
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher(),
	listener = function (e) {};

console.log(dispatcher.has(listener, this)); // -> false
dispatcher.add(listener, this, 'SOME_EVENT');
console.log(dispatcher.has(listener, this)); // -> true
dispatcher.remove(listener, this, 'SOME_EVENT');
console.log(dispatcher.has(listener, this)); // -> false
```

To suspend a dispatching of events:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher();

dispatcher.add(function (e) {
	console.log(e.type);
}, this, ['FIRST', 'SECOND']);

console.log(dispatcher.suspended); // -> false
dispatcher.suspend('To enqueue the suspended events');
console.log(dispatcher.suspended); // -> true

dispatcher.dispatch(new ned.Event('FIRST', this)); // -> 

// Warning! The cancellable events can't be suspended
dispatcher.dispatch(new ned.Event('SECOND', this, 'cancellable')); // -> SECOND 

dispatcher.resume(); // -> FIRST
console.log(dispatcher.suspended); // -> false
```

To clear queue of the suspended events:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher();

dispatcher.add(function (e) {
	console.log(e.type);
}, this, ['FIRST', 'SECOND']);

dispatcher.suspend('To enqueue the suspended events');

dispatcher.dispatch(new ned.Event('FIRST', this)); // -> 
dispatcher.dispatch(new ned.Event('SECOND', this)); // -> 

dispatcher.purgeQueue();

dispatcher.resume(); // -> 
```

To remove all listeners:
```js
var ned = require('node-event-dispatcher'),
	dispatcher = new ned.EventDispatcher();

dispatcher.add(function (e) {
	console.log('first listener');
}, this);

dispatcher.add(function (e) {
	console.log('second listener');
}, this);

dispatcher.purgeListeners();

dispatcher.dispatch(new ned.Event('SOME_EVENT', this)); // -> 
```

To remove all listeners by scope:
```js
var ned = require('node-event-dispatcher'),
	scope1 = {},
	scope2 = {},
	dispatcher = new ned.EventDispatcher();

dispatcher.add(function (e) {
	console.log('first listener');
}, scope1);

dispatcher.add(function (e) {
	console.log('second listener');
}, scope2);

dispatcher.purgeListeners(scope1);

dispatcher.dispatch(new ned.Event('SOME_EVENT', this)); // -> second listener
```

To proxy events from other dispatcher:
```js
var ned = require('node-event-dispatcher'),
	first = new ned.EventDispatcher(),
	second = new ned.EventDispatcher();

first.add(function (e) {
	console.log('event received!');
}, this);

first.relay(second);

second.dispatch(new ned.Event('SOME_EVENT', this)); // -> event received!
```

To stop proxying of events from other dispatcher:
```js
var ned = require('node-event-dispatcher'),
	first = new ned.EventDispatcher(),
	second = new ned.EventDispatcher();

first.add(function (e) {
	console.log('event received!');
}, this);

first.relay(second);

second.dispatch(new ned.Event('SOME_EVENT', this)); // -> event received!

first.unrelay(second);

second.dispatch(new ned.Event('SOME_EVENT', this)); // ->
```

To stop proxying of events from all dispatchers:
```js
var ned = require('node-event-dispatcher'),
	first = new ned.EventDispatcher(),
	second = new ned.EventDispatcher();

first.add(function (e) {
	console.log('event received!');
}, this);

first.relay(second);

second.dispatch(new ned.Event('SOME_EVENT', this)); // -> event received!

first.purgeDispatchers();

second.dispatch(new ned.Event('SOME_EVENT', this)); // ->
```

To check whether events are dispatching from a dispatcher:
```js
var ned = require('node-event-dispatcher'),
	first = new ned.EventDispatcher(),
	second = new ned.EventDispatcher();

console.log(first.relayed(second)); // -> false
first.relay(second);
console.log(first.relayed(second)); // -> true
first.unrelayAll([second]);
console.log(first.relayed(second)); // -> false
```
## License

MIT