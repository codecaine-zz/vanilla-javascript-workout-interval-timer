// Get DOM elements
const restInput = document.getElementById('rest');
const intervalInput = document.getElementById('interval');
const setsInput = document.getElementById('sets');
const exerciseNameInput = document.getElementById('exercise-name');
const repsInput = document.getElementById('reps');
const addWorkoutBtn = document.getElementById('add-workout');
const workoutList = document.getElementById('workout-list');
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resumeBtn = document.getElementById('resume');
const clearWorkoutsBtn = document.getElementById('clear-workouts');
const currentExerciseDisplay = document.getElementById('current-exercise');
const currentSetDisplay = document.getElementById('current-set');
const completionMessage = document.getElementById('completion-message');
const noWorkoutsWarning = document.getElementById('no-workouts-warning');

// app state messages
const workoutState = { workout: 'Workout', rest: 'Rest', allWorkoutsCompleted: 'All workouts completed.' }

// Initialize variables
let workoutListData = [];
let timer = null;
let currentTime = 0;
let isPaused = false;
let pausedWorkoutIndex = 0;
let pausedSet = 1;

// Event listeners
addWorkoutBtn.addEventListener('click', addWorkout);
clearWorkoutsBtn.addEventListener('click', clearWorkouts);
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resumeBtn.addEventListener('click', resumeTimer);

// Add a new workout to the list
function addWorkout() {
    const exerciseName = exerciseNameInput.value.trim();
    const reps = parseInt(repsInput.value);
    const sets = parseInt(setsInput.value);
    const interval = parseInt(intervalInput.value);
    const rest = parseInt(restInput.value);

    if (exerciseName && reps && sets && interval, rest) {
        const workout = {
            exerciseName,
            reps,
            sets,
            interval,
            rest
        };

        workoutListData.push(workout);
        displayWorkout(workout);
        exerciseNameInput.value = '';
    }
}

// Display a workout in the list
function displayWorkout(workout) {
    const li = document.createElement('li');
    li.textContent = `${workout.exerciseName} (${workout.reps} reps) x ${workout.sets} sets - ${workout.interval}s interval - ${workout.rest}s rest`;
    li.dataset.completed = false;
    workoutList.appendChild(li);
}

// Clear all workouts from the list
function clearWorkouts() {
    workoutList.innerHTML = '';
    workoutListData = [];
    currentWorkoutIndex = 0;
    currentSet = 1;
    clearInterval(timer); // Clear the interval timer
    timerDisplay.textContent = '00:00'; // Reset the timer display
    completionMessage.classList.add('d-none'); // Hide the completion message
    currentSetDisplay.textContent = ''; // Clear the current set
    currentExerciseDisplay.textContent = ''; // Clear the current exercise
    startBtn.disabled = false; // Enable the start button
    pauseBtn.disabled = true; // Disable the pause button
}

// Start the timer
function startTimer() {
    if (workoutListData.length > 0) {
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resumeBtn.disabled = true; // Disable the resume button
        completionMessage.classList.add('d-none'); // Hide the completion message
        noWorkoutsWarning.classList.add('d-none'); // Hide the no workouts warning message
        startWorkoutTimer();
    } else {
        noWorkoutsWarning.classList.remove('d-none');
    }
}

// Pause the timer
function pauseTimer() {
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
    clearInterval(timer);
    isPaused = true;
    pausedWorkoutIndex = currentWorkoutIndex;
    pausedSet = currentSet;
}

// Resume the timer
function resumeTimer() {
    resumeBtn.disabled = true; // Disable the resume button
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    isPaused = false;

    currentWorkoutIndex = pausedWorkoutIndex;
    currentSet = pausedSet;

    currentExercise = workoutList.children[currentWorkoutIndex]; // Update the currentExercise variable

    if (isRestPeriod) {
        workoutStateDisplay.textContent = workoutState.rest;
    } else {
        workoutStateDisplay.textContent = workoutState.workout;
    }

    timer = setInterval(() => {
        currentTime--;
        if (currentTime < 0) {
            nextStep();
        } else {
            timerDisplay.textContent = formatTime(currentTime);
            currentSetDisplay.textContent = `Current Set: ${currentSet}`;
            currentExerciseDisplay.textContent = `Current Exercise: ${workoutListData[currentWorkoutIndex].exerciseName}`;
        }
    }, 1000);
}


// Start the workout timer
function startWorkoutTimer() {
    currentWorkoutIndex = 0;
    currentSet = 1;
    currentTime = workoutListData[currentWorkoutIndex].interval;
    isRestPeriod = true; // Set the initial value of isRestPeriod to true

    // Get the DOM elements for workout state and current exercise
    const workoutStateDisplay = document.getElementById('workout-state');
    const currentExercise = workoutList.children[currentWorkoutIndex];

    currentExerciseDisplay.textContent = `Current Exercise: ${workoutListData[currentWorkoutIndex].exerciseName}`;
    speak(workoutState.workout);
    workoutStateDisplay.textContent = workoutState.workout;

    timer = setInterval(() => {
        currentTime--;
        if (currentTime < 0) {
            nextStep();
        } else {
            timerDisplay.textContent = formatTime(currentTime);
            currentSetDisplay.textContent = `Current Set: ${currentSet}`;
            currentExerciseDisplay.textContent = `Current Exercise: ${workoutListData[currentWorkoutIndex].exerciseName}`;
        }
    }, 1000);
}

// Go to the next step in the workout
function nextStep() {
    if (isPaused) {
        isPaused = false;
        if (isRestPeriod) {
            currentTime = workoutListData[currentWorkoutIndex].rest;
        } else {
            currentTime = workoutListData[currentWorkoutIndex].interval;
        }
    } else if (isRestPeriod) {
        if (currentSet < workoutListData[currentWorkoutIndex].sets) {
            currentSet++;
        } else {
            currentSet = 1;
            currentExercise.classList.add('completed');
            currentExercise.dataset.completed = true;

            currentWorkoutIndex++;

            if (currentWorkoutIndex >= workoutListData.length) {
                clearInterval(timer);
                currentExerciseDisplay.textContent = "";
                workoutStateDisplay.textContent = "";
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                timerDisplay.textContent = '00:00';
                currentSetDisplay.textContent = '';
                completionMessage.classList.remove('d-none'); // Show the completion message
                speak(workoutState.allWorkoutsCompleted); // Add text-to-speech for workout completion
                return;
            }
        }
        currentTime = workoutListData[currentWorkoutIndex].rest;
        isRestPeriod = false;
    } else {
        currentTime = workoutListData[currentWorkoutIndex].interval;
        isRestPeriod = true;
    }

    timerDisplay.textContent = formatTime(currentTime);
    currentSetDisplay.textContent = `Current Set: ${currentSet}`;
    currentExerciseDisplay.textContent = `Current Exercise: ${workoutListData[currentWorkoutIndex].exerciseName}`;
}

// Format the time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Add text-to-speech
function speak(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
}

