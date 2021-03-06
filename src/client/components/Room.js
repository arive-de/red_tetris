import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Game from './Game'
import Header from './Header'
import Invite from './Invite'
import ListGroup from 'react-bootstrap/ListGroup'
import Wall from './Wall'
import './Room.scss'
import { actInitRoomSocket } from '../actions/room'

const Room = ({ room }) => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const username = useSelector(state => state.username)
  const isPlaying = useSelector(state => state.isPlaying)
  const socket = useSelector(state => state.socket)

  const onChange = (e) => {
    e.preventDefault()
    setMessage(e.target.value)
  }

  const sendMessage = (e) => {
    if (e.key === 'Enter') {
      socket.emit('message', { roomId: room.roomdId, username, message })
      setMessage('')
    }
  }

  const onPlay = () => {
    socket.emit('play_game', { roomId: room.roomId });
  }

  const onReturn = () => {
    socket.emit('leave_room', { username, roomId: room.roomId })
  }

  useEffect(() => {
    dispatch(actInitRoomSocket(setMessages, room))
    return () => {
      socket.removeListener('message')
      socket.removeListener('add_win')
    }
  }, [])

  if (isPlaying) {
    return <Game room={room} solo={room.roomId === undefined ? true : false} />
  }

  const rankInfos = [['1st', 'warning', 'firstRank'], ['2nd', 'secondary', 'secondRank'], ['3rd', 'danger', 'thirdRank'], ['4th', 'light', 'fourhtRank']]
  const sortedPlayers = room.players.map((p, i) => ({ username: p, score: room.leaderBoard[i] })).sort((a, b) => b.score - a.score)

  return (
    <div>
      <Wall />
      <Header title={`room ${room.roomId}`} onReturn={onReturn}></Header>
      <Invite room={room} />
    <div className='m-3 d-flex flex-column'>
      <div id='leaderBoard' className='w-50 align-self-center '>
      <ListGroup className='list-group' id='ranking'>
      { sortedPlayers.map((player, i) =>
          <ListGroup.Item variant={rankInfos[i][1]} className={rankInfos[i][2]} key={i}>
            <div className='d-flex row justify-content-around p-2 bd-highlight'>
                <div className='' id ='rank'>{`${rankInfos[i][0]}`}</div>
                <div className='font-weight-bold' id={`player${i}`}>{player.username}</div>
                <div className='' id ='victories'>{player.score} win{player.score > 1 ? 's' : ''}</div>
              </div>
            </ListGroup.Item>
      )}
      </ListGroup>
      </div>
      <div className='align-self-center m-4'>
      { username === room.players[0] && !room.running && room.players.length > 1 ? <button id='playButton' className='btn btn-primary ' onClick={onPlay}>Play</button> : null }
      </div>
      <div id='chat' className='col-sm-12 align-self-center '>
        <div className='card'>
          <div id='logoChat' className='p-2'>
          <i className='fas fa-comment fa-spin fa-2x'></i>
          </div>
            <div id='messageBox' className='card-body overflow-hidden d-flex flex-column flex-nowrap'>
               { messages.map((m, index) => {
                 const playerIndex = sortedPlayers.findIndex(p => p.username === m.username)
                 return(
                <div className={`h-10 ${playerIndex === -1 ? '' : `bg-${rankInfos[playerIndex][1]}`}`} key={index}>
                  <span className='font-weight-bold'>{m.username}:</span> {m.message.substr(0, 100)}
                 </div>)})}
            </div>
        </div>
        <div>
          <input autoComplete='off' autoFocus id='messageInput' className='form-control' onChange={onChange} onKeyDown={sendMessage} placeholder='Say something...' value={message}></input>
        </div>
      </div>
      </div>
    </div>
    )
}
export default Room

