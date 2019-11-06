const Room = require('../../models/Room');

let i = 0

const createRoom = (username, type, cb) => {

  i = i + 1

  const newRoom = new Room({
    players: [username],
    roomId: `xx${i}`,
    type,
    running: false,
  })

  newRoom.save()
    .then(data => {
      // console.log(data)
      // console.log(`new room added by ${username} to db`)
      cb(null, data)
    })
    .catch(err => {
      // console.log(err)
      cb('can\'t store the new room in db')
    })

}

const joinRoom = (username, roomId, cb) => {
  // console.log('roomid', roomId)
  Room.findOne({ roomId })
    .then(room => {
      // console.log('room found', room.players)
      if (room.players.length === 4) {
        throw new Error('room is full')
      }
      room.players.push(username)
      room.save()
      .then(r => {
        // console.log(`user ${username} join the room ${r.roomId} to db`)
        cb(null, { roomId, username })
      })
      .catch(err => {
        // console.log(err)
        cb('can\'t update room in db')
      })
    })
    .catch(err => {
      cb(err)
    })

}

const leaveRoom = (username, roomId, cb) => {
  Room.findOne({ roomId })
    .then(room => {
      // console.log('room found', room.players)
      room.players = room.players.filter(u => u !== username)
      if (room.players.length === 0) {
        Room.deleteOne({ roomId })
        .then(r => {
          // console.log(`user ${username} leave the room ${r.roomId} to db and delete the room`)
          return cb(null, { roomId, username })
        })
        .catch(err => {
          // console.log(err)
          cb('can\'t remove the empty room from db')
        })
      }
      else {
        room.save()
        .then(r => {
          // console.log(`user ${username} leave the room ${r.roomId} to db`)
          cb(null, { roomId, username })
        })
        .catch(err => {
          // console.log(err)
          cb('can\'t update room in db')
        })
      }
    })
    .catch(err => {
      throw new Error(err)
    })

}

module.exports = { createRoom, joinRoom, leaveRoom }
