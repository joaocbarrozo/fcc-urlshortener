const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const crypto = require('crypto');

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.urlencoded({ extended: true }));

// Users array
let users = [];
// Exercises array
let exercises = [];
// Log array
let log = [];

// Post user endpoint
app.post('/api/users', (req, res) => {
  // Get username from form
  const { username } = req.body;
  // Check if username already exists
  if (users.some(user => user.username === username)){
    res.json({'error': 'User already exists'});
  // Create a new user
  } else {
    // Generate a user id
    const userId = `${crypto.randomBytes(8).toString('hex')}`;
    // Create a user object
    const newUser = {'username': username, '_id': userId};
    // Add new user to users array
    users.push(newUser);
    // Add user to log
    const newLog = {
      'username': username,
      'count': 0,
      '_id': userId,
      'log':[]
    };
    log.push(newLog);
    // Response JSON with new user added
    res.json(newUser);
  }

});
// Get users endpoint
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Post exercises endpoint
app.post('/api/users/:_id/exercises', (req, res) => {
  // Get id from parameters
  const { _id } = req.params;
  // Find user wit the input id
  const username = users.find(user => user._id === _id).username;
  if (username) {
    const { description, duration, date } = req.body;
    // Cast duration to INT
    const exerciseDuration = parseInt(duration);
    // Format date
    const exerciseDate = date ? new Date(date).toDateString(): new Date().toDateString();
    // Create object newExercise
    const newExercise = { 
      'username': username,
      'description': description, 
      'duration': exerciseDuration, 
      'date': exerciseDate,
      'id': _id
    };
    // Add newExercise to exercises array
    exercises.push(newExercise);
    // Create object newLog
    const newLog = {
      'description': description, 
      'duration': exerciseDuration, 
      'date': exerciseDate
    }
    // Find the user in log array
    const userLog = log.find(user => user._id === _id);
    // Update user log and count
    userLog.log.push(newLog);
    userLog.count++;
    // Response JSON with the user and exercise added
    res.json({
      '_id': _id,
      'username': username,
      'date': exerciseDate,
      'duration': exerciseDuration,
      'description': description
    })
  } else {
    res.json({'error': 'user not found'});
  }
  
});

// Get /api/users/log endpoint
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const userLog = log.find(user => user._id === _id);
  res.json( userLog );
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
