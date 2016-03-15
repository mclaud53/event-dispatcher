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
});