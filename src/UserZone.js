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

import uuid from 'uuid';

const isDebug = false;
const debug = (...args) => isDebug && console.log(...args);

export default class UserZone {
  
  constructor(ip = "", quantum = 5 * 1000) {
    this._ip = ip;
    this._quantum = quantum;
    this.init();
  }
  
  init() {
    this._uuid = uuid.v1();
    this._counter = 0;
    this._isBanned = false;
    this._firstActivityTimeMs = new Date().getTime();
  }
  
  getId() {
    return this._uuid;
  }
  
  getAddress() {
    return this._ip;
  }
  
  getFirstActivityTimeMs() {
    return this._firstActivityTimeMs;
  }
  
  getCounter() {
    let currentTime = new Date().getTime();
    if (this.getFirstActivityTimeMs() + this._quantum > currentTime) {
      return this._counter;
    }
    this.reset();
    return this._counter;
  }
  
  reset() {
    this._counter = 0;
    this._firstActivityTimeMs = new Date().getTime();
    debug(`[${this.getId()}] Counter reset`);
  }
  
  increment() {
    this._counter++;
    debug(`[${this.getId()}] Counter: ${this._counter}`);
  }
  
  decrease() {
    this._counter = Math.max(0, this._counter - 1);
  }
  
  ban() {
    this._isBanned = true;
  }
  
  get isBanned() {
    return this._isBanned;
  }
  
  dispose() {
    debug('Zone disposing:', this.getId());
    for (let key in this) {
      if (!this.hasOwnProperty(key)) {
        continue;
      }
      delete this[ key ];
    }
  }
}
