'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Storehouse = require('./Storehouse');

var _Storehouse2 = _interopRequireDefault(_Storehouse);

var _objectPathWild = require('object-path-wild');

var _objectPathWild2 = _interopRequireDefault(_objectPathWild);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


exports.default = function () {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$error = _ref.error;
  var error = _ref$error === undefined ? new Error('Too many requests') : _ref$error;
  var _ref$lookup = _ref.lookup;
  var lookup = _ref$lookup === undefined ? 'connection.remoteAddress' : _ref$lookup;
  var _ref$maxRequestsPerQu = _ref.maxRequestsPerQuantum;
  var maxRequestsPerQuantum = _ref$maxRequestsPerQu === undefined ? _Storehouse2.default.REQUESTS_PER_QUANTUM : _ref$maxRequestsPerQu;
  var _ref$quantum = _ref.quantum;
  var quantum = _ref$quantum === undefined ? _Storehouse2.default.QUANTUM : _ref$quantum;


  var store = new _Storehouse2.default(quantum);

  function resolveLookup(req, lookup) {
    if (typeof lookup === 'string') {
      return (0, _objectPathWild2.default)(req, lookup)[0];
    } else if (typeof lookup === 'function') {
      return lookup(req);
    } else if (Array.isArray(lookup)) {
      return lookup.reduce(function (acc, cur) {
        return acc || resolveLookup(req, cur);
      }, false);
    }
    return req.connection.remoteAddress;
  }

  return function (req, res, next) {
    var factor = resolveLookup(req, lookup);
    var userZone = store.findOrCreateUserZone(factor);
    var errTooManyRequests = error;
    if (userZone.isBanned) {
      return next(errTooManyRequests);
    } else if (userZone.getCounter() >= maxRequestsPerQuantum) {
      userZone.ban();
      return next(errTooManyRequests);
    }
    userZone.increment();
    store.refreshDestroyTimer(userZone);
    next();
  };
};
//# sourceMappingURL=express-light-limiter.js.map
