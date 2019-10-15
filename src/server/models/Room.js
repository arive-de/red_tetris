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
  players: {
    type: Array,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
})

module.exports = mongoose.model('rooms', RoomSchema)
