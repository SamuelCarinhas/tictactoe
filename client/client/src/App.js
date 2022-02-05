import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

let socket;
const CONNECTION_STRING = 'localhost:4000'

function App() {

  const [room, setRoom] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    console.log('Socket created');
    socket = io(CONNECTION_STRING);
  }, []);

  const connectToRoom = () => {
    console.log('Connecting...');
    socket.emit('join_room', {'username': username, 'room': room});
  }

  return (
    <div className="App">
      <div className="Inputs">
        <input type="text" placeholder="Username..." onChange={((e) => {setUsername(e.target.value)})}/>
        <input type="text" placeholder="Room..." onChange={((e) => {setRoom(e.target.value)})}/>
      </div>
      <button onClick={connectToRoom}>Join game</button>
    </div>
  );
}

export default App;
