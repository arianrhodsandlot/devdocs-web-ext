/**
 * @file This file is ported from the original source in devdocs, which was written in CoffeeScript. See https://github.com/freeCodeCamp/devdocs/blob/main/assets/javascripts/lib/events.coffee
 */

var slice = [].slice;

export const Events = {
  on: function(event, callback) {
    var base, i, len, name, ref;
    if (event.indexOf(' ') >= 0) {
      ref = event.split(' ');
      for (i = 0, len = ref.length; i < len; i++) {
        name = ref[i];
        this.on(name, callback);
      }
    } else {
      ((base = (this._callbacks != null ? this._callbacks : this._callbacks = {}))[event] != null ? base[event] : base[event] = []).push(callback);
    }
    return this;
  },
  off: function(event, callback) {
    var callbacks, i, index, len, name, ref, ref1;
    if (event.indexOf(' ') >= 0) {
      ref = event.split(' ');
      for (i = 0, len = ref.length; i < len; i++) {
        name = ref[i];
        this.off(name, callback);
      }
    } else if ((callbacks = (ref1 = this._callbacks) != null ? ref1[event] : void 0) && (index = callbacks.indexOf(callback)) >= 0) {
      callbacks.splice(index, 1);
      if (!callbacks.length) {
        delete this._callbacks[event];
      }
    }
    return this;
  },
  trigger: function() {
    var args, callback, callbacks, event, i, len, ref, ref1;
    event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    this.eventInProgress = {
      name: event,
      args: args
    };
    if (callbacks = (ref = this._callbacks) != null ? ref[event] : void 0) {
      ref1 = callbacks.slice(0);
      for (i = 0, len = ref1.length; i < len; i++) {
        callback = ref1[i];
        if (typeof callback === "function") {
          callback.apply(null, args);
        }
      }
    }
    this.eventInProgress = null;
    if (event !== 'all') {
      this.trigger.apply(this, ['all', event].concat(slice.call(args)));
    }
    return this;
  },
  removeEvent: function(event) {
    var i, len, name, ref;
    if (this._callbacks != null) {
      ref = event.split(' ');
      for (i = 0, len = ref.length; i < len; i++) {
        name = ref[i];
        delete this._callbacks[name];
      }
    }
    return this;
  }
};
