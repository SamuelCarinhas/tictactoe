import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Form, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

let socket;
const CONNECTION_STRING = 'localhost:4000'

function App() {

  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');
  const [room, setRoom] = useState('');
  const [username, setUsername] = useState('');
  const [game, setGame] = useState({rooms: {}});
  const [started, setStarted] = useState(false);
  const [isPlaying, setPlaying] = useState(true);
  const [winner, setWinner] = useState('');
  const [draw, setDraw] = useState(false);
  const [grid, setGrid] = useState([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);

  useEffect(() => {
    socket = io(CONNECTION_STRING);
    socket.on('clientJoin', (data) => {
      setGame(data);
    });
    socket.on('wait', (status) => {
      if(!status)
        setError('Someone is already using this name in this room or the game already started');
      else
        setError('');
      setWaiting(status);
    });
  }, []);

  const connectToRoom = () => {
    if(username.trim() && room.trim()) {
      if(username.length < 15 && room.length < 15) {
        socket.emit('join_room', {'username': username, 'room': room});
        socket.on('start', (starter) => {
          setStarted(true);
          setPlaying(starter === username);
        });
        socket.on('play', (gameGrid, next) => {
          setGrid(gameGrid);
          setPlaying(next === username);
        });
        socket.on('win', (winner) => {
          setWinner(winner);
          setPlaying(false);
        });
        socket.on('draw', () => {
          setDraw(true);
          setPlaying(false);
        });
      } else {
        setError('Username and roomn should have a length less than 15')
      }
    } else {
      setError('Invalid room or username')
    }
  }

  const getPiece = (line, col) => {
    let status = grid[line][col];

    return status === 0 ? 'empty.png' : status === 1 ? 'circle.png' : 'cross.png';
  }

  const playPiece = (line, col) => {
    if(!isPlaying || grid[line][col])
      return;
    socket.emit('play', {line: line, col: col});
  }

  return (
    <div className="App">
      <div className="roomList">
        <div className="title">
          <h1>Active rooms:</h1>
        </div>
        <div className="rooms">
        {
          Object.entries(game.rooms).map((gameRoom, value) => {
            return (
              <div className="dummy" key={value}>
                <div className="roomDesc">
                  <p>{gameRoom[1].name}</p>
                  <p className="right">{gameRoom[1].players.length}/2</p>
                </div>
                <div className="roomPlayers">
                  {
                    gameRoom[1].players.map((player, value) => {
                      return <p key={value}>{player.username}</p>
                    })
                  }
                </div>
              </div>
            );
          })
        }
        </div>
      </div>
      {error ?
      <Alert variant='danger' className="join">
        {error}
      </Alert>
      :
      undefined
      }
      {!waiting ?
        <Form className="join">
          <Form.Group className="mb-3" controlId="Username">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" placeholder="Enter username" onChange={(e) => setUsername(e.target.value)}/>
          </Form.Group>

          <Form.Group className="mb-3" controlId="Room">
            <Form.Label>Room</Form.Label>
            <Form.Control type="text" placeholder="Enter room" onChange={(e) => setRoom(e.target.value)}/>
          </Form.Group>
          <Button variant="success" onClick={connectToRoom}>
            Play
          </Button>
        </Form>
        :
        started ?
        <div>
          {
            draw ?
            <Alert variant='warning' className='join'>Draw</Alert>
            :
            winner ?
            <Alert variant='success' className='join'>{`WINNER: ${winner}`}</Alert>
            :
            <Alert variant='info' className='join'>{isPlaying ? 'Its your turn' : 'Waiting for your opponent'}</Alert>
          }
          <div>
            <img className="piece" src={getPiece(0, 0)} onClick={() => playPiece(0, 0)} />
            <img className="piece" src={getPiece(0, 1)} onClick={() => playPiece(0, 1)} />
            <img className="piece" src={getPiece(0, 2)} onClick={() => playPiece(0, 2)} />
          </div>
          <div>
            <img className="piece" src={getPiece(1, 0)} onClick={() => playPiece(1, 0)} />
            <img className="piece" src={getPiece(1, 1)} onClick={() => playPiece(1, 1)} />
            <img className="piece" src={getPiece(1, 2)} onClick={() => playPiece(1, 2)} />
          </div>
          <div>
            <img className="piece" src={getPiece(2, 0)} onClick={() => playPiece(2, 0)} />
            <img className="piece" src={getPiece(2, 1)} onClick={() => playPiece(2, 1)} />
            <img className="piece" src={getPiece(2, 2)} onClick={() => playPiece(2, 2)} />
          </div>
        </div>
        :
        <Alert variant='info' className="join">
          Waiting for more players...
        </Alert>
      }
      
    </div>
  );
}

export default App;
