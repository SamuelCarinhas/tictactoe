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

  useEffect(() => {
    console.log('Socket created');
    socket = io(CONNECTION_STRING);
    socket.on('clientJoin', (data) => {
      setGame(data);
    });
    socket.on('wait', (status) => {
      if(!status)
        setError('Someone is already using this name in this room');
      else
        setError('');
      setWaiting(status);
    });
  }, []);

  const connectToRoom = () => {
    socket.emit('join_room', {'username': username, 'room': room});
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
        <Alert variant='info' className="join">
          Waiting for more players...
        </Alert>
      }
      
    </div>
  );
}

export default App;
