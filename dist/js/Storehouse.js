'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); 

var _UserZone = require('./UserZone');

var _UserZone2 = _interopRequireDefault(_UserZone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isDebug = false;
var debug = function debug() {
  var _console;

  return isDebug && (_console = console).log.apply(_console, arguments);
};

var Storehouse = function () {

  function Storehouse(quantum) {
    _classCallCheck(this, Storehouse);

    this.zones = new Map();
    this.timers = new Map();

    this._quantum = quantum;
  }

  _createClass(Storehouse, [{
    key: 'findUserZone',
    value: function findUserZone(ip) {
      return this.zones.get(ip);
    }
  }, {
    key: 'findOrCreateUserZone',
    value: function findOrCreateUserZone(ip) {
      var userZone = this.findUserZone(ip);
      if (!userZone || !(userZone instanceof _UserZone2.default)) {
        userZone = this.createUserZone(ip);
      }
      return userZone;
    }
  }, {
    key: 'findDestroyTimer',
    value: function findDestroyTimer(userZone) {
      return this.timers.get(userZone.getAddress());
    }
  }, {
    key: 'createUserZone',
    value: function createUserZone(ip) {
      debug('Creating zone:', ip);
      var userZone = new _UserZone2.default(ip, this._quantum);
      this.addUserZone(userZone);
      return userZone;
    }
  }, {
    key: 'addUserZone',
    value: function addUserZone(userZone) {
      this.zones.set(userZone.getAddress(), userZone);
    }
  }, {
    key: 'detachUserZone',
    value: function detachUserZone(userZone) {
      this.zones.delete(userZone.getAddress());
      debug('Zone detached:', userZone.getId());
      return userZone;
    }
  }, {
    key: 'destroyUserZone',
    value: function destroyUserZone(userZone) {
      debug('Zone destroying:', userZone.getId());
      this.deleteDestroyTimer(userZone);
      this.detachUserZone(userZone).dispose();
      userZone = null;
      debug('Zone destroyed. Zones: ' + this.zones.size + '; Timers: ' + this.timers.size);
    }
  }, {
    key: 'setDestroyTimer',
    value: function setDestroyTimer(userZone) {
      var _this = this;

      var ms = arguments.length <= 1 || arguments[1] === undefined ? Storehouse.DESTROY_TIMEOUT : arguments[1];

      debug('Destroy timer was set:', userZone.getId());
      this.deleteDestroyTimer(userZone);
      var timeoutId = setTimeout(function () {
        _this.destroyUserZone(userZone);
      }, ms);
      this.timers.set(userZone.getAddress(), timeoutId);
    }
  }, {
    key: 'refreshDestroyTimer',
    value: function refreshDestroyTimer(userZone) {
      var ms = arguments.length <= 1 || arguments[1] === undefined ? Storehouse.DESTROY_TIMEOUT : arguments[1];

      this.setDestroyTimer(userZone, ms);
    }
  }, {
    key: 'deleteDestroyTimer',
    value: function deleteDestroyTimer(userZone) {
      debug('Destroy timer deleting:', userZone.getId());
      var timeoutId = this.findDestroyTimer(userZone);
      if (timeoutId) {
        this.timers.delete(userZone.getAddress());
        clearTimeout(timeoutId);
        debug('Destroy timer deleted:', userZone.getId());
      }
    }
  }, {
    key: 'hasDestroyTimer',
    value: function hasDestroyTimer(userZone) {
      return !!this.findDestroyTimer(userZone);
    }
  }, {
    key: 'count',
    value: function count() {
      return this.zones.length;
    }
  }, {
    key: 'clear',
    value: function clear() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.zones[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var userZone = _step.value;

          this.destroyUserZone(userZone);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }]);

  return Storehouse;
}();

Storehouse.QUANTUM = 5000;
Storehouse.REQUESTS_PER_QUANTUM = 25;
Storehouse.DESTROY_TIMEOUT = 10000;
exports.default = Storehouse;
//# sourceMappingURL=Storehouse.js.map
