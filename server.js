const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.get('/', (req, res) => {
  res.send('Welcome to Hangman!');
});
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Welcome to the Node.js server!');
});

app.get('/hangman', (req, res) => {
  res.send('Hangman!');
});
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:4200']
  }
});

let gameState = {
  movieName: '',
  clue: '',
  guesses: [],
  wrongGuesses: []
};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('startGame', (data) => {
    console.log('Starting game:', data);
    gameState = data;
    io.emit('gameState', gameState);
  });

  socket.on('guessMovie', (guess) => {
    console.log('Guess received:', guess);
    const { movieName, guesses, wrongGuesses } = gameState;

    if (movieName.toLowerCase().includes(guess.toLowerCase())) {
      movieName.split('').forEach((char, index) => {
        if (char.toLowerCase() === guess.toLowerCase()) {
          guesses[index] = char;
        }
      });
    } else {
      wrongGuesses.push(guess);
    }

    io.emit('gameState', { movieName, clue: gameState.clue, guesses, wrongGuesses });
  });

  socket.on('updateGameState', (gameStateUpdate) => {
    console.log('Updating game state:', gameStateUpdate);
    gameState = gameStateUpdate;
    io.emit('gameState', gameState);
  });

  socket.on('disconnect', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
