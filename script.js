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
const clearWorkoutsBtn = document.getElementById('clear-workouts');
const currentExerciseDisplay = document.getElementById('current-exercise');
const completionMessage = document.getElementById('completion-message');
const noWorkoutsWarning = document.getElementById('no-workouts-warning');

// Initialize variables
let workoutListData = [];
let timer = null;

// Event listeners
addWorkoutBtn.addEventListener('click', addWorkout);
clearWorkoutsBtn.addEventListener('click', clearWorkouts);
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);

// add workout all input fields must be filled out
function addWorkout() {
    const exerciseName = exerciseNameInput.value.trim();
    const reps = parseInt(repsInput.value);
    const sets = parseInt(setsInput.value);
    const interval = parseInt(intervalInput.value);
    const rest = parseInt(restInput.value);

    if (exerciseName && reps && sets && interval && rest) {
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

function displayWorkout(workout) {
    const li = document.createElement('li');
    li.textContent = `${workout.exerciseName} (${workout.reps} reps) x ${workout.sets} sets - ${workout.interval}s interval - ${workout.rest}s rest`;
    li.dataset.completed = false;
    workoutList.appendChild(li);
}

function clearWorkouts() {
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
}

function startTimer() {
    if (workoutListData.length > 0) {
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        completionMessage.classList.add('d-none'); // Hide the completion message
        noWorkoutsWarning.classList.add('d-none'); // Hide the no workouts warning message
        startWorkoutTimer();
    } else {
        noWorkoutsWarning.classList.remove('d-none');
    }
}

function pauseTimer() {
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    clearInterval(timer);
}

function startWorkoutTimer() {
    let currentWorkoutIndex = 0;
    let currentSet = 1;
    let currentTime = workoutListData[currentWorkoutIndex].interval;
    let isRestPeriod = false;

    // Get the DOM elements for workout state and current exercise
    const workoutStateDisplay = document.getElementById('workout-state');
    const currentExercise = workoutList.children[currentWorkoutIndex];

    // Highlight the current exercise and display the initial workout state
    currentExercise.classList.add('active');
    currentExerciseDisplay.textContent = `Current Exercise: ${workoutListData[currentWorkoutIndex].exerciseName}`;
    speak('Workout')
    workoutStateDisplay.textContent = 'Workout';

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

    function nextStep() {
        isRestPeriod = !isRestPeriod;

        if (isRestPeriod) {
            speak('Rest')
            workoutStateDisplay.textContent = 'Rest';

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
                    speak('All workouts completed.'); // Add text-to-speech for workout completion
                    return;
                }

                // Highlight the next exercise
                const nextExercise = workoutList.children[currentWorkoutIndex];
                nextExercise.classList.add('active');
            }
            currentTime = workoutListData[currentWorkoutIndex].rest;
        } else {
            speak("Workout")
            workoutStateDisplay.textContent = 'Workout';
            currentTime = workoutListData[currentWorkoutIndex].interval;
        }

        timerDisplay.textContent = formatTime(currentTime);
        document.getElementById('current-set').textContent = `Current Set: ${currentSet}`;
        currentExerciseDisplay.textContent = `Current Exercise: ${workoutListData[currentWorkoutIndex].exerciseName}`;
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function speak(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
}
