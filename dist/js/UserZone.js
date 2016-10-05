'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); 

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isDebug = false;
var debug = function debug() {
  var _console;

  return isDebug && (_console = console).log.apply(_console, arguments);
};

var UserZone = function () {
  function UserZone() {
    var ip = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
    var quantum = arguments.length <= 1 || arguments[1] === undefined ? 5 * 1000 : arguments[1];

    _classCallCheck(this, UserZone);

    this._ip = ip;
    this._quantum = quantum;
    this.init();
  }

  _createClass(UserZone, [{
    key: 'init',
    value: function init() {
      this._uuid = _uuid2.default.v1();
      this._counter = 0;
      this._isBanned = false;
      this._firstActivityTimeMs = new Date().getTime();
    }
  }, {
    key: 'getId',
    value: function getId() {
      return this._uuid;
    }
  }, {
    key: 'getAddress',
    value: function getAddress() {
      return this._ip;
    }
  }, {
    key: 'getFirstActivityTimeMs',
    value: function getFirstActivityTimeMs() {
      return this._firstActivityTimeMs;
    }
  }, {
    key: 'getCounter',
    value: function getCounter() {
      var currentTime = new Date().getTime();
      if (this.getFirstActivityTimeMs() + this._quantum > currentTime) {
        return this._counter;
      }
      this.reset();
      return this._counter;
    }
  }, {
    key: 'reset',
    value: function reset() {
      this._counter = 0;
      this._firstActivityTimeMs = new Date().getTime();
      debug('[' + this.getId() + '] Counter reset');
    }
  }, {
    key: 'increment',
    value: function increment() {
      this._counter++;
      debug('[' + this.getId() + '] Counter: ' + this._counter);
    }
  }, {
    key: 'decrease',
    value: function decrease() {
      this._counter = Math.max(0, this._counter - 1);
    }
  }, {
    key: 'ban',
    value: function ban() {
      this._isBanned = true;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      debug('Zone disposing:', this.getId());
      for (var key in this) {
        if (!this.hasOwnProperty(key)) {
          continue;
        }
        delete this[key];
      }
    }
  }, {
    key: 'isBanned',
    get: function get() {
      return this._isBanned;
    }
  }]);

  return UserZone;
}();

exports.default = UserZone;
//# sourceMappingURL=UserZone.js.map
