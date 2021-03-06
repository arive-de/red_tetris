"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _user = require("../actions/user");

const deleteUser = (state, username, roomId) => {
  const userList = state.userList.filter(u => u !== username);
  let rooms;

  if (roomId) {
    rooms = state.rooms.map(r => {
      if (r.roomId === roomId) {
        const newLeaderBoard = [...r.leaderBoard];
        newLeaderBoard.splice(r.players.indexOf(username), 1);
        return { ...r,
          players: r.players.filter(u => u !== username),
          leaderBoard: newLeaderBoard
        };
      }

      return r;
    });
  } else {
    rooms = [...state.rooms];
  }

  return { ...state,
    userList,
    rooms: rooms.filter(r => r.players.length > 0)
  };
};

const reducer = (state, action) => {
  const {
    username,
    hostname,
    typeGame,
    socket
  } = action;

  switch (action.type) {
    case _user.SET_USERNAME:
      return state.username !== null ? { ...state
      } : { ...state,
        username
      };

    case _user.SET_TYPEGAME:
      return { ...state,
        typeGame
      };

    case _user.SET_SOCKET:
      return { ...state,
        socket
      };

    case _user.GET_USERS:
      return { ...state,
        userList: action.users
      };

    case _user.ADD_USER:
      return { ...state,
        userList: [...state.userList, action.username]
      };

    case _user.LOGOUT:
      return deleteUser(state, username, action.roomId);

    case _user.GET_HIGHSCORES:
      return { ...state,
        highscores: action.highscores
      };

    case _user.ADD_WIN:
      return { ...state,
        rooms: state.rooms.map(r => {
          if (r.roomId === action.roomId) {
            r.leaderBoard[r.players.indexOf(username)] += 1;
          }

          return r;
        })
      };

    default:
      return state;
  }
};

var _default = reducer;
exports.default = _default;