"use strict";

const debug = require('debug')('∆:main');

const server = require('./index');

server.create().then(() => {
  debug('server and Db are UP ^^');
});