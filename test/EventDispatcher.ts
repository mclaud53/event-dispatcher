/// <reference path="../typings/main.d.ts" />
import event = require('../src/Event');
import dispatcher = require('../src/EventDispatcher');
import assert = require('assert');
require('sinomocha')();

describe('EventDispatcher', function() {

	it('creation', function() {
		var instance: dispatcher.EventDispatcher<event.Event<Object>, Object>;
		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();

		assert.equal(instance.hasListeners, false, 'The new EventDispatcher can\'t has listeners');
		assert.equal(instance.suspended, false, 'The new EventDispatcher can\'t be suspended');
	});

	it('add', function() {
		var target: Object = {},
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				// do nothing
			};

		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.add(listener, target);

		assert.equal(instance.hasListeners, true, 'The EventDispatcher must has listeners');
	});

	it('has', function() {
		var target: Object = {},
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				// do nothing
			};

		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.add(listener, target);

		assert.equal(instance.has(listener, target), true, 'The listener must exists in the list of listeners');
	});

	it('add & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			e: event.Event<Object> = new event.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.add(listener, target);
		instance.dispatch(e);

		assert.equal(actualCallCounter, 1, 'The listener must be executed');
	});

	it('add listener twice & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			e: event.Event<Object> = new event.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.add(listener, target);
		instance.add(listener, target);
		instance.dispatch(e);

		assert.equal(actualCallCounter, 1, 'The listener must be executed only once');
	});

	it('add listener, remove listener, dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			e: event.Event<Object> = new event.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.add(listener, target);
		instance.remove(listener, target);
		instance.dispatch(e);

		assert.equal(instance.hasListeners, false, 'The list of listeners must be empty');
		assert.equal(actualCallCounter, 0, 'The listener mustn\'t be executed');
	});	

	it('addAll', function() {
		var target: Object = {},
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				// do nothing
			};

		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.addAll([listener], target);

		assert.equal(instance.hasListeners, true, 'The EventDispatcher must has listeners');
	});	

	it('addAll & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			e: event.Event<Object> = new event.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.addAll([listener], target);
		instance.dispatch(e);

		assert.equal(actualCallCounter, 1, 'The listener must be executed');
	});	

	it('addAll two identical listeners & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			e: event.Event<Object> = new event.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.addAll([listener, listener], target);
		instance.dispatch(e);

		assert.equal(actualCallCounter, 1, 'The listener must be executed only once');
	});	

	it('addAll listener, removeAll listener, dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			e: event.Event<Object> = new event.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.addAll([listener], target);
		instance.removeAll([listener], target);
		instance.dispatch(e);

		assert.equal(instance.hasListeners, false, 'The list of listeners must be empty');
		assert.equal(actualCallCounter, 0, 'The listener mustn\'t be executed');
	});

	it('suspend', function() {
		var instance: dispatcher.EventDispatcher<event.Event<Object>, Object>;
		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();

		instance.suspend(false);

		assert.equal(instance.suspended, true, 'The EventDispatcher must be suspended');
	});	

	it('add & suspend & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			e: event.Event<Object> = new event.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.add(listener, target);
		instance.suspend(false);
		instance.dispatch(e);

		assert.equal(instance.suspended, true, 'The EventDispatcher must be suspended');
		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed');
	});	

	it('add & suspend & dispatch cancellable', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			e: event.Event<Object> = new event.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.add(listener, target);
		instance.suspend(false);
		instance.dispatch(e);

		assert.equal(instance.suspended, true, 'The EventDispatcher must be suspended');
		assert.equal(actualCallCounter, 1, 'The listener must be executed');
	});	

	it('add & suspend & dispatch & resume', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			e: event.Event<Object> = new event.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.add(listener, target);
		instance.suspend(false);
		instance.dispatch(e);

		assert.equal(instance.suspended, true, 'The EventDispatcher must be suspended');
		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed');

		instance.resume();

		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed');
	});		

	it('add & suspend queued & dispatch & resume', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			e: event.Event<Object> = new event.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.add(listener, target);
		instance.suspend(true);
		instance.dispatch(e);

		assert.equal(instance.suspended, true, 'The EventDispatcher must be suspended');
		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed');

		instance.resume();

		assert.equal(actualCallCounter, 1, 'The listener must be executed');
	});

	it('relay', function() {
		var source: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>;

		source = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.relay(source);
		assert.equal(source.hasListeners, true, 'The EventDispatcher must be suspended');
	});	

	it('relayed', function() {
		var source: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>;

		source = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.relay(source);
		assert.equal(instance.relayed(source), true, 'The EventDispatcher must be relayed');
	});		

	it('relay & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			source: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			e: event.Event<Object> = new event.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				actualCallCounter++;
			};

		source = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.relay(source);
		instance.add(listener, target);
		source.dispatch(e);

		assert.equal(actualCallCounter, 1, 'The listener must be executed');
	});

	it('relay & unrelay & dispatch', function() {
		var source: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>;

		source = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.relay(source);
		assert.equal(source.hasListeners, true, 'The EventDispatcher must be suspended');
		instance.unrelay(source);
		assert.equal(instance.hasListeners, false, 'The list of listeners must be empty');
	});

	it('relayAll two identical dispatchers & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			source: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			e: event.Event<Object> = new event.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				actualCallCounter++;
			};

		source = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.relayAll([source, source]);
		instance.add(listener, target);
		source.dispatch(e);

		assert.equal(actualCallCounter, 1, 'The listener must be executed');
	});	

	it('relayAll two dispatchers & both dispatch event', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			source1: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			source2: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			e: event.Event<Object> = new event.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				actualCallCounter++;
			};

		source1 = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		source2 = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.relayAll([source1, source2]);
		instance.add(listener, target);
		source1.dispatch(e);
		source2.dispatch(e);

		assert.equal(actualCallCounter, 2, 'The listener must be executed twice');
	});	

	it('relayAll & unrelayAll & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			source1: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			source2: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			instance: dispatcher.EventDispatcher<event.Event<Object>, Object>,
			e: event.Event<Object> = new event.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: event.Event<Object>): void } = function(e: event.Event<Object>): void {
				actualCallCounter++;
			};

		source1 = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		source2 = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance = new dispatcher.EventDispatcher<event.Event<Object>, Object>();
		instance.relayAll([source1, source2]);
		instance.unrelayAll([source1, source2]);
		instance.add(listener, target);
		source1.dispatch(e);
		source2.dispatch(e);

		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed');
	});		
});