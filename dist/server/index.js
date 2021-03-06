"use strict";

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const path = require('path');

const cors = require('cors');

const params = require('../../params');

const debug = require('debug')('∆:index');

const fs = require('fs');

const env = require('./env');

const {
  initSocketAuth
} = require('./sockets/auth');

const {
  initSocketRoom
} = require('./sockets/room');

const {
  initSocketGame
} = require('./sockets/game');

const {
  initSocketUrl
} = require('./sockets/url');

const {
  remove
} = require('./controllers/player/player');

const handler = (req, res) => {
  console.log(req.url, req.path);
  const file = req.path === '/bundle.js' ? '/../../build/bundle.js' : '/../../index.html';
  console.log(file);
  fs.readFile(path.join(__dirname, file), (err, data) => {
    if (err) {
      debug(err);
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
};

const initEngine = io => {
  debug('initengine');
  io.on('connection', socket => {
    debug(`Socket connected: ${socket.id}`);
    initSocketAuth(io, socket);
    initSocketRoom(io, socket);
    initSocketUrl(io, socket);
    initSocketGame(io, socket);
    socket.on('disconnect', () => {
      debug(`Socket disconnected: ${socket.id}`);
      remove(socket.username, socket.roomId, error => {
        if (socket.roomId) {
          io.to(socket.roomId).emit('gameOver', {
            username: socket.username,
            index: -1
          });
          io.to(socket.roomId).emit('logout', {
            error,
            username: socket.username,
            roomId: socket.roomId
          });
        }

        io.to('lobby').emit('logout', {
          error,
          username: socket.username,
          roomId: socket.roomId
        });
      });
    });
  });
};

const create = port => {
  return new Promise((resolve, reject) => {
    const connect = () => {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true
      };
      mongoose.connect(params.db.url, options);
      return mongoose.connection;
    };

    const express = require('express');

    const app = new express();

    const http = require('http').createServer(app);

    const io = require('socket.io')(http);

    const stop = cb => {
      io.close();
      debug('io closed');
      http.close(() => {
        http.unref();
        debug('Engine Stopped.');
      });
      cb();
    };

    app.use(cors());
    app.use(bodyParser.urlencoded({
      extended: false
    }));
    app.use(express.json());
    app.use('*', handler);
    connect().on('disconnected', () => {
      stop(() => {
        debug('MONGO disconnected');
      });
    }).on('error', err => {
      stop(() => {
        debug('MONGO disconnected');
      });
    }).on('open', () => {
      env.fillDb().then(() => {
        initEngine(io);
        http.listen(port || params.server.port, () => {
          debug(`server is running on port ${port || params.server.port}`);
          resolve({
            stop
          });
        });
      });
    });
  });
};

module.exports = {
  create
};