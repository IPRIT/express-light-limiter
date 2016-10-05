/* @preserve
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Alexander Belov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import Storehouse from './Storehouse';
import lookupObject from 'object-path-wild';

export default ({
  error = new Error('Too many requests'),
  lookup = 'connection.remoteAddress',
  maxRequestsPerQuantum = Storehouse.REQUESTS_PER_QUANTUM,
  quantum = Storehouse.QUANTUM
} = {}) => {
  
  const store = new Storehouse(quantum);
  
  function resolveLookup(req, lookup) {
    if (typeof lookup === 'string') {
      return lookupObject(req, lookup)[0];
    } else if (typeof lookup === 'function') {
      return lookup(req);
    } else if (Array.isArray(lookup)) {
      return lookup.reduce((acc, cur) => {
        return acc || resolveLookup(req, cur);
      }, false);
    }
    return req.connection.remoteAddress;
  }
  
  return (req, res, next) => {
    const factor = resolveLookup(req, lookup);
    let userZone = store.findOrCreateUserZone(factor);
    let errTooManyRequests = error;
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
}