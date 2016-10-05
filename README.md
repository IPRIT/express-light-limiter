# express-light-limiter [![NPM version][npm-image]][npm-url] [![dependencies Status][depstat-image]][depstat-url] [![devDependencies Status Status][deVdepstat-image]][deVdepstat-url]

Smart express light-weight middleware for rate-limiting based on Zones to prevent memory-leaks



## Install

* Install module from npm:
```
$ npm install --save express-light-limiter
```


## Usage

``` js
import express from 'express';
import limiter from 'express-light-limiter';

let app = express();

const limiterConfig = {
  quantum: 10 * 1000, // 10 seconds
  maxRequestsPerQuantum: 20, // requests restriction is 20 for a single quantum
  lookup: 'connection.remoteAddress', // it can be an array or a function
  error: new HttpError('Too many requests', 429) // your custom error object
};

app.get('/api/action', [ limiter(limiterConfig) ], function (req, res) {
  res.send(200, 'ok')
})
```

### API options

``` js
limiter(options)
```

 - `lookup`: `Function|String|Array.<String>` value lookup on the request object. Can be a single value, array or function. See examples below. Default is `connection.remoteAddress`.

 - `quantum`: `Number` unit of time for counting requests. Default is `5 * 1000` (5 sec).

 - `maxRequestsPerQuantum`: `Number` number of requests that allowed in a single quantum of time.

 - `error`: `Object` optional param allowing throw a custom error in `next` function

### Examples

``` js
// limit by IP address
limiter({
  ...
  lookup: 'connection.remoteAddress'
  ...
})

// or if you are behind a trusted proxy (like nginx)
limiter({
  lookup: 'headers.x-forwarded-for'
})

// by user (assuming a user is logged in with a valid id)
limiter({
  lookup: 'user.id'
})

// limit users by their id or IP (if user's id is not available)
limiter({
  lookup: ['user.id', 'connection.remoteAddress']
})

// with a function
limiter({
  lookup(req) {
    return req.connection.remoteAddress || req.user.id || req.ip;
  }
})

```

### Separate methods

``` js
// limiter with default options
app.get('/user', limiter(), (req, res, next) => {
  User.findOne(req.user.id).then(result => {
    res.json(result);
  }).catch(next);
});

app.get('/news', limiter({ quantum: 60 * 1000, maxRequestsPerQuantum: 120 }), (req, res, next) => {
  User.findAll().then(result => {
    res.json(result);
  }).catch(next);
})
```

## License

[MIT](https://github.com/IPRIT/express-light-limiter/LICENCE.md) © 2016 Alexander Belov


[npm-url]: https://www.npmjs.com/package/express-light-limiter
[npm-image]: https://img.shields.io/npm/v/express-light-limiter.svg

[depstat-url]: https://david-dm.org/IPRIT/express-light-limiter
[depstat-image]: https://img.shields.io/david/IPRIT/express-light-limiter.svg

[deVdepstat-url]: https://david-dm.org/IPRIT/express-light-limiter?type=dev
[deVdepstat-image]: https://img.shields.io/david/dev/IPRIT/express-light-limiter.svg
