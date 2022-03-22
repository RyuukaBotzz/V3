// Copyright 2014, Patrick Mooney.  All rights reserved.

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var assert = require('assert-plus');

/**
 * Manage a cooldown period.
 *
 * @param {Number} timeout - length in ms of cooldown periods.
 * @property {Boolean} ready - false if during a cooldown period.
 */
function Cooldown(timeout) {
  assert.number(timeout);
  assert.ok(timeout > 0);
  EventEmitter.call(this);

  var self = this;
  this._timeout = timeout;
  this._ready = true;

  this.__defineGetter__('ready', function () {
    return self._ready;
  });
}
util.inherits(Cooldown, EventEmitter);
module.exports = Cooldown;

/**
 * Attempt to fire the cooldown.
 *
 * @return {Boolean} false if during cooldown period, else true.
 */
Cooldown.prototype.fire = function fire() {
  if (this._ready) {
    this._ready = false;
    this._blocked = false;
    this._lastRun = process.hrtime();
    this._checkTimer(true);
    this.emit('cooldown');
    return true;
  }
  this._blocked = true;
  return false;
};

/**
 * Reset a cooldown period.
 *
 * @param {Number} noEmit do not emit ready if resetting cooldown.
 */
Cooldown.prototype.reset = function reset(noEmit) {
  if (!this._ready) {
    clearTimeout(this._timer);
    this._timer = null;
    this._ready = true;
    if (!noEmit) {
      this.emit('ready', false);
    }
  }
};

/**
 * Destroy cooldown object, clearing any timers.
 */
Cooldown.prototype.destroy = function destroy() {
  if (this._timer) {
    clearTimeout(this._timer);
  }
  this._ready = false;
};

/**
 * Set or re-set timer for cooldown window.
 *
 * To ensure that clock variations don't cause a cooldown period to end before
 * adequate time has elapsed, setTimeout is not trusted completely.  When it
 * ends, the elapsed interval is checked with process.hrtime.  If adequate time
 * has passed, it is indicated to consumers, otherwise another timeout to make
 * up the difference is initiated.
 */
Cooldown.prototype._checkTimer = function _checkTimer(initial) {
  // Use process.hrtime to ensure that the timeout elapses before indicating
  // the end of the cooldown.
  var elapsed = process.hrtime(this._lastRun);
  var msElapsed = (elapsed[0] * 1000) + (elapsed[1] / 1000000);
  if (msElapsed >= this._timeout && !initial) {
    this._ready = true;
    this._timer = null;
    this.emit('ready', this._blocked);
  } else {
    // It's not _quite_ time yet
    this._timer = setTimeout(this._checkTimer.bind(this),
        (this._timeout - msElapsed)|0);
  }
};
