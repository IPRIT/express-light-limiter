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

import UserZone from './UserZone';

const isDebug = false;
const debug = (...args) => isDebug && console.log(...args);

export default class Storehouse {
  
  static QUANTUM = 5000; // 5 sec.
  static REQUESTS_PER_QUANTUM = 25;
  static DESTROY_TIMEOUT = 10000; // 10 sec.
  
  zones = new Map();
  timers = new Map();
  
  constructor(quantum) {
    this._quantum = quantum;
  }
  
  findUserZone(ip) {
    return this.zones.get(ip);
  }
  
  findOrCreateUserZone(ip) {
    let userZone = this.findUserZone(ip);
    if (!userZone || !(userZone instanceof UserZone)) {
      userZone = this.createUserZone(ip);
    }
    return userZone;
  }
  
  findDestroyTimer(userZone) {
    return this.timers.get(userZone.getAddress());
  }
  
  createUserZone(ip) {
    debug('Creating zone:', ip);
    let userZone = new UserZone(ip, this._quantum);
    this.addUserZone(userZone);
    return userZone;
  }
  
  addUserZone(userZone) {
    this.zones.set(userZone.getAddress(), userZone);
  }
  
  detachUserZone(userZone) {
    this.zones.delete(userZone.getAddress());
    debug('Zone detached:', userZone.getId());
    return userZone;
  }
  
  destroyUserZone(userZone) {
    debug('Zone destroying:', userZone.getId());
    this.deleteDestroyTimer(userZone);
    this.detachUserZone(userZone).dispose();
    userZone = null;
    debug(`Zone destroyed. Zones: ${this.zones.size}; Timers: ${this.timers.size}`);
  }
  
  setDestroyTimer(userZone, ms = Storehouse.DESTROY_TIMEOUT) {
    debug('Destroy timer was set:', userZone.getId());
    this.deleteDestroyTimer(userZone);
    let timeoutId = setTimeout(() => {
      this.destroyUserZone(userZone);
    }, ms);
    this.timers.set(userZone.getAddress(), timeoutId);
  }
  
  refreshDestroyTimer(userZone, ms = Storehouse.DESTROY_TIMEOUT) {
    this.setDestroyTimer(userZone, ms);
  }
  
  deleteDestroyTimer(userZone) {
    debug('Destroy timer deleting:', userZone.getId());
    let timeoutId = this.findDestroyTimer(userZone);
    if (timeoutId) {
      this.timers.delete(userZone.getAddress());
      clearTimeout(timeoutId);
      debug('Destroy timer deleted:', userZone.getId());
    }
  }
  
  hasDestroyTimer(userZone) {
    return !!this.findDestroyTimer(userZone);
  }
  
  count() {
    return this.zones.length;
  }
  
  clear() {
    for (let userZone of this.zones) {
      this.destroyUserZone(userZone);
    }
  }
}