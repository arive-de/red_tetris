const debug = require('debug')('∆:app spec')
import React from 'react'
import { mount } from 'enzyme'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import reducer from './reducers'
import App from './containers/app'
import Home from './components/Home'
import Menu from './components/Menu'
import Lobby from './components/Lobby'
import Room from './components/Room'
import Game from './components/Game'
import SearchPlayer from './components/SearchPlayer'
import RoomList from './components/RoomList'
import Invite from './components/Invite'
import { actSetUsername, actSetTypeGame } from './actions/user'
import { actCreateRoom, actPlayGame } from './actions/room'
import { fillDb } from '../server/env'
import openSocket from 'socket.io-client'

describe('App component', () => {
  let store
  let wrapper
  let username
  let roomId

  before(function(done) {
    const initialState = {
      username: null,
      typeGame: false,
      isPlaying: false,
      roomId: null,
      spectr: [],
      socket: null,
      rooms: [{ roomId: 'test', players: ['john'], running: false, type: 'Classic', leaderBoard: [0] },
      { roomId: '2test', players: ['jane', 'brad', 'mama', 'oaoa'], running: true, type: 'Ghost', leaderBoard: [0, 2, 8, 0] }],
      userList: ['mama', 'mimi', 'jane', 'john', 'oaoa'],
      highscores: [],
      socket: openSocket(),
    }

    store = createStore(
          reducer,
          initialState,
          )

    username = 'tester'
    roomId = 'xx01234'
    wrapper = mount(<Provider store={store}><App/></Provider>)
    done()
  })

  it('initial state', function(done) {
    const state = store.getState()
    expect(state.username).to.equal(null)
    expect(state.typeGame).to.equal(false)
    expect(state.isPlaying).to.equal(false)
    expect(state.roomId).to.equal(null)
    expect(wrapper.find(Home)).to.have.length(1)
    wrapper.find(Home).find('input').simulate('keyDown', { target: { key: 'Enter' } })
    done()
  })

  it('setting username', function(done) {
    store.dispatch(actSetUsername(username))
    const state = store.getState()
    state.socket.disconnect()
    expect(state.username).to.equal(username)
    wrapper.update()
    expect(wrapper.find(Menu)).to.have.length(1)
    done()
  })

  it('setting the type game', function(done) {
    store.dispatch(actSetTypeGame(true))
    const state = store.getState()
    expect(state.typeGame).to.equal(true)
    wrapper.update()
    expect(wrapper.find(Lobby)).to.have.length(1)
    wrapper.find(SearchPlayer).find('input').simulate('change', { target: { value: 'm' } })
    expect(wrapper.find(SearchPlayer).find('li')).to.have.length(2)
    wrapper.find(SearchPlayer).find('input').simulate('change', { target: { value: 'jane' } })
    wrapper.find(SearchPlayer).find('input').simulate('keyDown', { keyCode: 38 })
    wrapper.find(SearchPlayer).find('input').simulate('keyDown', { keyCode: 40 })
    wrapper.find(SearchPlayer).find('li').simulate('click')
    wrapper.find(Lobby).find('select').simulate('change', { target: { value: 'Ghost' } })
    expect(wrapper.find(Lobby).find('select').prop('value')).to.equal('Ghost')
    wrapper.find('i.sort').forEach((i) => {
      i.simulate('click')
      expect(wrapper.find(RoomList)).to.have.length(2)
    })
    wrapper.find(Lobby).find('input#hide').simulate('click')
    wrapper.find(Lobby).find('Button#joinRoomButton').simulate('click')
    done()
  })

  it('create a room', function(done) {
    store.dispatch(actCreateRoom({ roomId, players: [username], running: false, type: 'Classic', leaderBoard: [0] }))
    const state = store.getState()
    expect(state.roomId).to.equal(roomId)
    wrapper.update()
    expect(wrapper.find(Room)).to.have.length(1)
    expect(wrapper.find(Room).props().room.roomId).to.equal(roomId)
    wrapper.find(Room).find('input#messageInput').simulate('change', { target: { value: 'message' } })
    expect(wrapper.find(Room).find('input#messageInput').prop('value')).to.equal('message')
    wrapper.find(Room).find('input#messageInput').simulate('keyDown', { target: { key: 'Enter' } })
    wrapper.find(Invite).find('#friendButton').simulate('click')
    wrapper.find(Invite).find('input#friendInput').simulate('change', { target: { value: 'testfriend' } })
    expect(wrapper.find(Invite).find('input#friendInput').prop('value')).to.equal('testfriend')

    wrapper.find(Room).find('.leaveButton').simulate('click')
    done()
  })

  it('let s play a game', function(done) {
    store.dispatch(actPlayGame(roomId))
    const state = store.getState()
    expect(state.isPlaying).to.equal(true)
    wrapper.update()
    expect(wrapper.find(Game)).to.have.length(1)
    expect(wrapper.find(Game).props().room.running).to.equal(true)
    done()
  })

  it('try controls', function(done) {
    const LEFT = 37
    const UP = 38
    const RIGHT = 39
    const DOWN = 40
    const controls = wrapper.find('input#gameControlsInput')
    controls.simulate('keyDown', { keyCode: LEFT })
    controls.simulate('keyDown', { keyCode: RIGHT })
    controls.simulate('keyDown', { keyCode: DOWN })
    controls.simulate('keyDown', { keyCode: UP })
    wrapper.update()
    done()
  })

  after(function(done) {
    wrapper.unmount()
    done()
  })
})
