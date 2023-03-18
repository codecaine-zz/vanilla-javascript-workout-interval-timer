// Get DOM elements
const intervalInput = document.getElementById('interval');
const setsInput = document.getElementById('sets');
const exerciseNameInput = document.getElementById('exercise-name');
const repsInput = document.getElementById('reps');
const addWorkoutBtn = document.getElementById('add-workout');
const workoutList = document.getElementById('workout-list');
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const clearWorkoutsBtn = document.getElementById('clear-workouts');
const currentExerciseDisplay = document.getElementById('current-exercise');
  // Add this line at the beginning of the script to get the completion message DOM element
const completionMessage = document.getElementById('completion-message');

// Initialize variables
let workoutListData = [];
let timer = null;
let totalTime = 0;

// Add workout event
addWorkoutBtn.addEventListener('click', () => {
  const exerciseName = exerciseNameInput.value.trim();
  const reps = parseInt(repsInput.value);
  const sets = parseInt(setsInput.value);
  const interval = parseInt(intervalInput.value);

  if (exerciseName && reps && sets && interval) {
    const workout = {
      exerciseName,
      reps,
      sets,
      interval
    };

    workoutListData.push(workout);
    displayWorkout(workout);
    exerciseNameInput.value = '';
  }
});

// Display workout in the list
function displayWorkout(workout) {
  const li = document.createElement('li');
  li.textContent = `${workout.exerciseName} (${workout.reps} reps) x ${workout.sets} sets - ${workout.interval}s interval`;
  li.dataset.completed = false;
  workoutList.appendChild(li);
}

// Update the clearWorkoutsBtn event listener to clear the timer
clearWorkoutsBtn.addEventListener('click', () => {
  workoutList.innerHTML = '';
  workoutListData = [];
  currentWorkoutIndex = 0;
  currentSet = 1;
  clearInterval(timer); // Clear the interval timer
  timerDisplay.textContent = '00:00'; // Reset the timer display
  completionMessage.classList.add('d-none'); // Hide the completion message
  document.getElementById('current-set').textContent = ''; // Clear the current set
  currentExerciseDisplay.textContent = ''; // Clear the current exercise
  startBtn.disabled = false; // Enable the start button
  pauseBtn.disabled = true; // Disable the pause button
});

// Start timer event
startBtn.addEventListener('click', () => {
  if (workoutListData.length > 0) {
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    startWorkoutTimer();
  }
});

// Pause timer event
pauseBtn.addEventListener('click', () => {
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  clearInterval(timer);
});

// Start workout timer
function startWorkoutTimer() {
  let currentWorkoutIndex = 0;
  let currentSet = 1;
  let currentTime = workoutListData[currentWorkoutIndex].interval;

  // Highlight the current exercise
  const currentExercise = workoutList.children[currentWorkoutIndex];
  currentExercise.classList.add('active');
  currentExerciseDisplay.textContent = `Current Exercise: ${workoutListData[currentWorkoutIndex].exerciseName}`;

  timer = setInterval(() => {
    currentTime--;

    if (currentTime < 0) {
      nextStep();
    } else {
      timerDisplay.textContent = formatTime(currentTime);
      document.getElementById('current-set').textContent = `Current Set: ${currentSet}`;
      currentExerciseDisplay.textContent = `Current Exercise: ${workoutListData[currentWorkoutIndex].exerciseName}`;
    }
  }, 1000);


// next step
function nextStep() {
  if (currentSet < workoutListData[currentWorkoutIndex].sets) {
    currentSet++;
  } else {
    currentSet = 1;
    currentExercise.classList.remove('active');
    currentExercise.classList.add('completed');
    currentExercise.dataset.completed = true;

    currentWorkoutIndex++;

    if (currentWorkoutIndex >= workoutListData.length) {
      clearInterval(timer);
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      timerDisplay.textContent = '00:00';
      document.getElementById('current-set').textContent = '';
      completionMessage.classList.remove('d-none'); // Show the completion message
      return;
    }

    // Highlight the next exercise
    const nextExercise = workoutList.children[currentWorkoutIndex];
    nextExercise.classList.add('active');
  }

  currentTime = workoutListData[currentWorkoutIndex].interval;
  timerDisplay.textContent = formatTime(currentTime);
  document.getElementById('current-set').textContent = `Current Set: ${currentSet}`;
  currentExerciseDisplay.textContent = `Current Exercise: ${workoutListData[currentWorkoutIndex].exerciseName}`;
}

// Update the startBtn event listener to hide the completion message when starting a new workout
startBtn.addEventListener('click', () => {
  if (workoutListData.length > 0) {
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    completionMessage.classList.add('d-none'); // Hide the completion message
    startWorkoutTimer();
  }
});
}

// Format time to display
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}
