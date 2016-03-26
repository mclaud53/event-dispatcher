"use strict";var Event=function(){function a(a,b,c,d){void 0===d&&(d={}),this._isDefaultPrevented=!1,this._type=a,this._target=b,this._cancellable=c,this._options=d}return Object.defineProperty(a.prototype,"type",{get:function(){return this._type},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"target",{get:function(){return this._target},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"cancellable",{get:function(){return this._cancellable},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"isDefaultPrevented",{get:function(){return this._isDefaultPrevented},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"options",{get:function(){return this._options},enumerable:!0,configurable:!0}),a.prototype.preventDefault=function(){this.cancellable&&(this._isDefaultPrevented=!0)},a}();exports.Event=Event;var EventDispatcher=function(){function a(a){void 0===a&&(a=":"),this._listeners=[],this._listenersAll=[],this._listenersMap={},this._listenersSorted=!0,this._dispatchers=[],this._suspendCount=0,this._suspendQueue=!1,this._queue=[],this._separator=":",this._eventsStack=[],this._separator=a}return Object.defineProperty(a.prototype,"hasListeners",{get:function(){return this._listeners.length>0},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"suspended",{get:function(){return this._suspendCount>0},enumerable:!0,configurable:!0}),a.prototype.add=function(a,b,c,d){void 0===c&&(c=null),void 0===d&&(d=null),this.addListener.apply(this,arguments)},a.prototype.addListener=function(a,b,c,d){void 0===c&&(c=null),void 0===d&&(d=null);var e,f,g,h=this._transform(c);for(e=0;e<this._listeners.length;e++)if(this._listeners[e].listener===a&&this._listeners[e].scope===b)return this._listeners[e].options=d,g=this._listeners[e].allowEventType(h),void this._applyEventDiff(this._listeners[e],g);f=new ListenerHelper(a,b,h,d),this._addListener(f,f.eventTypes)},a.prototype.addAll=function(a){this.addListeners.apply(this,arguments)},a.prototype.addListeners=function(a){var b;for(b=a.length-1;b>=0;b--)this.add(a[b].listener,a[b].scope,a[b].eventType,a[b].options)},a.prototype.dispatch=function(a){var b,c,d,e=this;if(!(this._eventsStack.indexOf(a)>-1)){if(this.suspended&&!a.cancellable)return void(this._suspendQueue&&this._queue.push(a));if(c=this._transform(a.type),d=this._eventType2Listener(c),d.sort(function(a,b){return a.priority===b.priority?b.order-a.order:a.priority-b.priority}),0!==d.length){this._eventsStack.push(a);try{for(b=d.length-1;b>=0;b--)d[b].dispatch(a,c),d[b].single&&(d[b].buffer?d[b].onDispatch=function(a,b){e._removeListener(a,a.eventTypes)}:this._removeListener(d[b],d[b].eventTypes))}finally{this._eventsStack.pop()}}}},a.prototype.has=function(a,b){return this.hasListener.apply(this,arguments)},a.prototype.hasListener=function(a,b){var c;for(c=0;c<this._listeners.length;c++)if(this._listeners[c].listener===a&&this._listeners[c].scope===b)return!0;return!1},a.prototype.remove=function(a,b,c){void 0===c&&(c=null),this.removeListener.apply(this,arguments)},a.prototype.removeListener=function(a,b,c){void 0===c&&(c=null);var d,e,f=this._transform(c),g=null;for(d=this._listeners.length-1;d>=0;d++)if(g=this._listeners[d],g.listener===a&&g.scope===b){null===f?this._removeListener(g,g.eventTypes):(e=g.denyEventType(f),g.hasEventTypes?this._applyEventDiff(this._listeners[d],e):this._removeListener(g,g.eventTypes));break}},a.prototype.removeAll=function(a){this.removeListeners.apply(this,arguments)},a.prototype.removeListeners=function(a){var b;for(b=0;b<a.length;b++)this.remove(a[b].listener,a[b].scope,a[b].eventType)},a.prototype.suspend=function(a){this._suspendCount++,a&&(this._suspendQueue=!0)},a.prototype.resume=function(){var a;for(this._suspendCount>0&&this._suspendCount--;!this.suspended&&this._queue.length>0;)a=this._queue.shift(),this.dispatch(a);this.suspended||(this._suspendQueue=!1)},a.prototype.relay=function(a,b,c){if(void 0===b&&(b=null),void 0===c&&(c=null),this===a)throw new Error("Dispatcher can't relay self events");this.relayed(a)||(a.add(this.onEvent,this,b,c),this._dispatchers.push(a))},a.prototype.relayAll=function(a,b,c){void 0===b&&(b=null),void 0===c&&(c=null);var d;for(d=0;d<a.length;d++)this.relay(a[d],b,c)},a.prototype.relayed=function(a){return this._dispatchers.indexOf(a)>-1},a.prototype.unrelay=function(a,b){void 0===b&&(b=null);var c=this._dispatchers.indexOf(a);c>-1&&(a.remove(this.onEvent,this,b),a.has(this.onEvent,this)||this._dispatchers.splice(c,1))},a.prototype.unrelayAll=function(a,b){void 0===b&&(b=null);var c;for(c=0;c<a.length;c++)this.unrelay(a[c],b)},a.prototype.purge=function(){this.purgeListeners(),this.purgeDispatchers(),this.purgeQueue()},a.prototype.purgeListeners=function(a){void 0===a&&(a=null);var b;if(null===a)this._listeners.length=0,this._listenersAll.length=0,this._listenersMap={};else if(this._listeners.length>0)for(b=this._listeners.length-1;b>=0;b--)this._listeners[b].scope===a&&this._removeListener(this._listeners[b],this._listeners[b].eventTypes)},a.prototype.purgeDispatchers=function(){var a;for(a=0;a<this._dispatchers.length;a++)this._dispatchers[a].remove(this.onEvent,this);this._dispatchers.length=0},a.prototype.purgeQueue=function(){this._queue.length=0},a.prototype.willDispatch=function(a){var b,c,d;if(null===a||a instanceof Array&&0===a.length)throw new Error("EventType can't be null or empty array");if(!this.hasListeners)return!1;for(c=this._transform(a),d=this._eventType2Listener(c),b=0;b<d.length;b++)if(d[b].willDispatch(c))return!0;return!1},a.prototype.onEvent=function(a){this.dispatch(a)},a.prototype._transform=function(a){var b,c,d,e,f,g,h;if(null===a)return null;if("string"==typeof a)e=a.toString(),h=[e];else if(a instanceof Array)for(h=[],b=0;b<a.length;b++)for(g=this._transform(a[b]),c=0;c<g.length;c++)-1===h.indexOf(g[c])&&h.push(g[c]);else if(a instanceof Object)for(h=[],f=Object.keys(a),b=0;b<f.length;b++)for(e=f[b],g=this._transform(a[e]),c=0;c<g.length;c++)d=e+this._separator+g[c],-1===h.indexOf(d)&&h.push(d);return h.sort()},a.prototype._eventType2Listener=function(a){var b,c,d,e,f=this._listenersAll.slice();if(null===a)return f;for(b=0;b<a.length;b++)if(d=a[b],this._listenersMap.hasOwnProperty(d))for(e=this._listenersMap[d],c=0;c<e.length;c++)-1===f.indexOf(e[c])&&f.push(e[c]);return f},a.prototype._applyEventDiff=function(a,b){b.add.length&&this._addListener(a,b.add,!1),b.addAll&&this._addListener(a,null,!1),b.del.length&&this._removeListener(a,b.del,!1),b.delAll&&this._removeListener(a,null,!1)},a.prototype._addListener=function(a,b,c){void 0===c&&(c=!0);var d,e;if(c&&-1===this._listeners.indexOf(a)&&this._listeners.push(a),null===b)return void(-1===this._listenersAll.indexOf(a)&&this._listenersAll.push(a));for(d=0;d<b.length;d++)e=b[d],this._listenersMap.hasOwnProperty(e)?-1===this._listenersMap[e].indexOf(a)&&this._listenersMap[e].push(a):this._listenersMap[e]=[a]},a.prototype._removeListener=function(a,b,c){void 0===c&&(c=!0);var d,e,f;if(c&&(e=this._listeners.indexOf(a),e>-1&&this._listeners.splice(e,1)),null===b)return e=this._listenersAll.indexOf(a),void(e>-1&&this._listenersAll.splice(e,1));for(d=0;d<b.length;d++)f=b[d],this._listenersMap.hasOwnProperty(f)&&(e=this._listenersMap[f].indexOf(a),e>-1&&this._listenersMap[f].splice(e,1))},a}();exports.EventDispatcher=EventDispatcher;var ListenerHelper=function(){function a(b,c,d,e){this._listOfAllowTypes=null,this._listOfDenyTypes=null,this._timeout=null,this.onDispatch=null,this._order=++a._orderGen,this._listener=b,this._scope=c,this._listOfAllowTypes=d,this.options=e,this.buffer&&(this._timeout={})}return Object.defineProperty(a.prototype,"order",{get:function(){return this._order},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"eventTypes",{get:function(){return this._listOfAllowTypes},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"hasEventTypes",{get:function(){return null===this._listOfAllowTypes?!0:this._listOfAllowTypes.length>0},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"listener",{get:function(){return this._listener},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"scope",{get:function(){return this._scope},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"options",{get:function(){return this._options},set:function(a){null!==a&&(this._options=a)},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"extra",{get:function(){return this._options&&this._options.hasOwnProperty("extra")?this._options.extra:null},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"single",{get:function(){return this._options?!!this._options.single:!1},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"buffer",{get:function(){return this._options&&this._options.hasOwnProperty("buffer")&&this._options.buffer>0?+this._options.buffer:0},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"delay",{get:function(){return this._options&&this._options.hasOwnProperty("delay")&&this._options.delay>0?+this._options.delay:0},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"defer",{get:function(){return this._options&&this._options.hasOwnProperty("defer")?!!this._options.defer:!1},enumerable:!0,configurable:!0}),Object.defineProperty(a.prototype,"priority",{get:function(){return this._options&&this._options.hasOwnProperty("priority")?+this._options.priority:0},enumerable:!0,configurable:!0}),a.prototype.allowEventType=function(a){var b,c,d={add:[],addAll:!1,del:[],delAll:!1};if(d.add.length=0,d.addAll=!1,d.del.length=0,d.delAll=!1,null===this._listOfAllowTypes){if(null===this._listOfDenyTypes||0===this._listOfDenyTypes.length)return d;if(null===a)this._listOfDenyTypes.length=0;else for(b=0;b<a.length;b++)c=this._listOfDenyTypes.indexOf(a[b]),c>-1&&this._listOfDenyTypes.splice(c,1)}else if(null===a)d.addAll=!0,d.del=this._listOfAllowTypes,this._listOfAllowTypes=null;else for(b=0;b<a.length;b++)c=this._listOfAllowTypes.indexOf(a[b]),-1===c&&(this._listOfAllowTypes.push(a[b]),d.add.push(a[b]));return d},a.prototype.denyEventType=function(a){var b,c,c,d={add:[],addAll:!1,del:[],delAll:!1};if(d.add.length=0,d.addAll=!1,d.del.length=0,d.delAll=!1,null===this._listOfAllowTypes)for(null===this._listOfDenyTypes&&(this._listOfDenyTypes=[]),b=0;b<a.length;b++)c=this._listOfDenyTypes.indexOf(a[b]),-1===c&&this._listOfDenyTypes.push(a[b]);else for(b=0;b<a.length;b++)c=this._listOfAllowTypes.indexOf(a[b]),c>-1&&(this._listOfAllowTypes.splice(c,1),d.del.push(a[b]));return d},a.prototype.dispatch=function(a,b){if(this.willDispatch(b))switch(!0){case!!this.buffer:this._dispatchBuffered(a,b);break;case!!this.delay:this._dispatchDelayed(a);break;case this.defer:this._dispatchDeferred(a);break;default:this._dispatch(a)}},a.prototype.willDispatch=function(a){var b,c;if(null===this._listOfAllowTypes){if(null===this._listOfDenyTypes||0===this._listOfDenyTypes.length)return!0;for(b=0;b<a.length;b++)if(c=a[b],-1===this._listOfDenyTypes.indexOf(c))return!0}else for(b=0;b<a.length;b++)if(c=a[b],this._listOfAllowTypes.indexOf(c)>-1)return!0;return!1},a.prototype._dispatchBuffered=function(a,b){var c=this,d=b.join(",");this._timeout.hasOwnProperty(d)&&clearTimeout(this._timeout[d]),this._timeout[d]=setTimeout(function(){delete c._timeout[d],c._dispatch(a)},this.buffer)},a.prototype._dispatchDelayed=function(a){var b=this;setTimeout(function(){b._dispatch(a)},this.delay)},a.prototype._dispatchDeferred=function(a){var b=this;setTimeout(function(){b._dispatch(a)},0)},a.prototype._dispatch=function(a){this._listener.call(this._scope,a,this.extra),this.onDispatch&&this.onDispatch(this,a)},a._orderGen=0,a}();