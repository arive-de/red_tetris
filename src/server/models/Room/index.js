// Room.js

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const RoomSchema = new Schema({
  roomId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  players: [String],
  running: {
    type: Boolean,
    required: true,
  },
  leaderBoard: [Number],
})

module.exports = mongoose.model('rooms', RoomSchema)
