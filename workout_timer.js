// DOM elements
const elements = {
    restInput: document.getElementById('rest'),
    intervalInput: document.getElementById('interval'),
    setsInput: document.getElementById('sets'),
    exerciseNameInput: document.getElementById('exercise-name'),
    repsInput: document.getElementById('reps'),
    addWorkoutBtn: document.getElementById('add-workout'),
    workoutList: document.getElementById('workout-list'),
    timerDisplay: document.getElementById('timer-display'),
    startBtn: document.getElementById('start'),
    pauseBtn: document.getElementById('pause'),
    clearWorkoutsBtn: document.getElementById('clear-workouts'),
    currentExerciseDisplay: document.getElementById('current-exercise'),
    currentSetDisplay: document.getElementById('current-set'),
    completionMessage: document.getElementById('completion-message'),
    noWorkoutsWarning: document.getElementById('no-workouts-warning'),
    workoutStateDisplay: document.getElementById('workout-state'),
};

// Constants
const WORKOUT_STATES = {
    WORKOUT: 'WORK OUT! 💪',
    REST: 'REST TIME 😤',
    COMPLETED: 'WORKOUT COMPLETE! 🏆',
};

const MOTIVATIONAL_MESSAGES = [
    "Push through the burn! 🔥",
    "You're stronger than you think! 💪",
    "One more rep! You got this! 🚀",
    "Mind over muscle! 🧠",
    "Champions are made in moments like this! 🏆",
    "Feel the power within! ⚡",
    "Every rep is progress! 📈",
    "You're unstoppable! 🌟"
];

const REST_MESSAGES = [
    "Breathe deep, you earned it! 🌬️",
    "Recovery is part of the process! 💚",
    "Fuel up for the next round! ⚡",
    "Stay focused, stay strong! 🎯",
    "You're doing amazing! ⭐",
    "Reset and reload! 🔄"
];

// App state
let state = {
    workouts: [],
    currentWorkoutIndex: 0,
    currentSet: 1,
    isRestPeriod: false,
    timer: null,
    currentTime: 0,
    isPaused: false,
    totalWorkouts: 0,
    completedWorkouts: 0,
    startTime: null,
    totalElapsedTime: 0
};

// Event listeners
document.getElementById('workout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    addWorkout();
});
elements.clearWorkoutsBtn.addEventListener('click', clearWorkouts);
elements.startBtn.addEventListener('click', startTimer);
elements.pauseBtn.addEventListener('click', pauseTimer);

// Sound toggle functionality
let soundEnabled = true;
const soundToggleBtn = document.getElementById('sound-toggle');
soundToggleBtn.addEventListener('click', function() {
    soundEnabled = !soundEnabled;
    this.innerHTML = soundEnabled ? 
        '<i class="fas fa-volume-up"></i> Sound: ON' : 
        '<i class="fas fa-volume-mute"></i> Sound: OFF';
    this.classList.toggle('btn-outline-light');
    this.classList.toggle('btn-outline-danger');
});

function addWorkout() {
    const workout = {
        exerciseName: elements.exerciseNameInput.value.trim(),
        reps: parseInt(elements.repsInput.value),
        sets: parseInt(elements.setsInput.value),
        interval: parseInt(elements.intervalInput.value),
        rest: parseInt(elements.restInput.value),
    };

    if (isValidWorkout(workout)) {
        state.workouts.push(workout);
        state.totalWorkouts = state.workouts.length;
        displayWorkout(workout);
        clearForm();
        showSuccessMessage('Workout added! 💪');
    }
}

function clearForm() {
    elements.exerciseNameInput.value = '';
    elements.repsInput.value = '';
    elements.setsInput.value = '';
    elements.intervalInput.value = '';
    elements.restInput.value = '';
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success mt-2';
    successDiv.textContent = message;
    successDiv.style.animation = 'fadeIn 0.5s ease-in';
    
    const form = document.getElementById('workout-form');
    form.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 2000);
}

function isValidWorkout(workout) {
    return workout.exerciseName && workout.reps && workout.sets && workout.interval && workout.rest;
}

function displayWorkout(workout) {
    const li = document.createElement('li');
    li.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <strong><i class="fas fa-dumbbell"></i> ${workout.exerciseName}</strong><br>
                <small><i class="fas fa-repeat"></i> ${workout.reps} reps × ${workout.sets} sets | 
                <i class="fas fa-clock"></i> ${workout.interval}s work | 
                <i class="fas fa-pause"></i> ${workout.rest}s rest</small>
            </div>
            <button class="btn btn-sm btn-outline-danger" onclick="removeWorkout(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    li.dataset.completed = 'false';
    li.className = 'list-group-item';
    elements.workoutList.appendChild(li);
}

function removeWorkout(button) {
    const li = button.closest('li');
    const index = Array.from(elements.workoutList.children).indexOf(li);
    state.workouts.splice(index, 1);
    state.totalWorkouts = state.workouts.length;
    li.remove();
}

function resetDisplay() {
    clearInterval(state.timer);
    elements.timerDisplay.textContent = '00:00';
    elements.completionMessage.classList.add('d-none');
    elements.currentSetDisplay.textContent = '';
    elements.currentExerciseDisplay.textContent = '';
    elements.workoutStateDisplay.textContent = '';
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
}

function clearWorkouts() {
    if (state.workouts.length === 0) return;
    
    if (confirm('Are you sure you want to clear all workouts? 🗑️')) {
        elements.workoutList.innerHTML = '';
        state.workouts = [];
        state.currentWorkoutIndex = 0;
        state.currentSet = 1;
        state.totalWorkouts = 0;
        state.completedWorkouts = 0;
        resetDisplay();
        showSuccessMessage('All workouts cleared! 🧹');
    }
}

function startTimer() {
    if (state.workouts.length > 0) {
        if (state.isPaused) {
            resumeTimer();
        } else {
            initializeNewWorkout();
            state.startTime = Date.now();
        }
        elements.startBtn.disabled = true;
        elements.pauseBtn.disabled = false;
        elements.completionMessage.classList.add('d-none');
        elements.noWorkoutsWarning.classList.add('d-none');
        state.timer = setInterval(timerTick, 1000);
        
        // Add visual feedback
        elements.timerDisplay.classList.add(state.isRestPeriod ? 'timer-rest' : 'timer-workout');
        playMotivationalSound();
    } else {
        elements.noWorkoutsWarning.classList.remove('d-none');
        elements.noWorkoutsWarning.innerHTML = '<i class="fas fa-exclamation-triangle"></i> No workouts added! Please add a workout to start the timer.';
    }
}

function initializeNewWorkout() {
    state.currentWorkoutIndex = 0;
    state.currentSet = 1;
    state.isRestPeriod = false;
    const currentWorkout = state.workouts[state.currentWorkoutIndex];
    state.currentTime = currentWorkout.interval;
    updateWorkoutState(WORKOUT_STATES.WORKOUT);
}

function resumeTimer() {
    updateWorkoutState(state.isRestPeriod ? WORKOUT_STATES.REST : WORKOUT_STATES.WORKOUT);
}

function pauseTimer() {
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    clearInterval(state.timer);
    state.isPaused = true;
}

function updateWorkoutState(newState) {
    elements.workoutStateDisplay.textContent = newState;
    
    // Update timer display classes
    elements.timerDisplay.classList.remove('timer-workout', 'timer-rest');
    if (newState.includes('WORK')) {
        elements.timerDisplay.classList.add('timer-workout');
    } else if (newState.includes('REST')) {
        elements.timerDisplay.classList.add('timer-rest');
    }
    
    speak(newState);
    showMotivationalMessage(newState);
}

function showMotivationalMessage(state) {
    const motivationalDiv = document.querySelector('.motivational-message');
    let message;
    
    if (state.includes('WORK')) {
        message = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
    } else if (state.includes('REST')) {
        message = REST_MESSAGES[Math.floor(Math.random() * REST_MESSAGES.length)];
    } else {
        message = "🎉 Congratulations! You crushed that workout! 🎉";
    }
    
    motivationalDiv.innerHTML = `<i class="fas fa-fire"></i> ${message} <i class="fas fa-fire"></i>`;
    motivationalDiv.style.animation = 'pulse 0.5s ease-in-out';
}

function timerTick() {
    state.currentTime--;
    if (state.currentTime < 0) {
        nextStep();
    } else {
        updateDisplay();
    }
}

function nextStep() {
    state.isRestPeriod = !state.isRestPeriod;
    const currentWorkout = state.workouts[state.currentWorkoutIndex];

    if (state.isRestPeriod) {
        handleRestPeriod(currentWorkout);
    } else {
        handleWorkoutPeriod(currentWorkout);
    }

    updateDisplay();
}

function handleRestPeriod(currentWorkout) {
    updateWorkoutState(WORKOUT_STATES.REST);

    if (state.currentSet < currentWorkout.sets) {
        state.currentSet++;
    } else {
        moveToNextWorkout();
    }
    state.currentTime = currentWorkout.rest;
}

function handleWorkoutPeriod(currentWorkout) {
    updateWorkoutState(WORKOUT_STATES.WORKOUT);
    state.currentTime = currentWorkout.interval;
}

function moveToNextWorkout() {
    state.currentSet = 1;
    const currentExercise = elements.workoutList.children[state.currentWorkoutIndex];
    currentExercise.classList.add('completed');
    currentExercise.dataset.completed = 'true';
    
    state.completedWorkouts++;
    state.currentWorkoutIndex++;

    if (state.currentWorkoutIndex >= state.workouts.length) {
        completeWorkout();
    }
}

function completeWorkout() {
    resetDisplay();
    const totalTime = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
    const timeStr = formatTime(totalTime);
    
    elements.completionMessage.innerHTML = `
        <h4><i class="fas fa-trophy"></i> WORKOUT COMPLETE! <i class="fas fa-trophy"></i></h4>
        <p>🎯 Workouts completed: ${state.completedWorkouts}/${state.totalWorkouts}</p>
        <p>⏱️ Total time: ${timeStr}</p>
        <p>💪 You're a champion! Keep pushing those limits!</p>
    `;
    elements.completionMessage.classList.remove('d-none');
    
    speak(WORKOUT_STATES.COMPLETED);
    showMotivationalMessage('COMPLETED');
    
    // Celebration effect
    createCelebrationEffect();
}

function updateDisplay() {
    const currentWorkout = state.workouts[state.currentWorkoutIndex];
    elements.timerDisplay.textContent = formatTime(state.currentTime);
    elements.currentSetDisplay.innerHTML = `<i class="fas fa-list-ol"></i> Set: ${state.currentSet}/${currentWorkout.sets}`;
    elements.currentExerciseDisplay.innerHTML = `<i class="fas fa-dumbbell"></i> ${currentWorkout.exerciseName} (${currentWorkout.reps} reps)`;
    
    // Add progress indicator
    const progress = ((currentWorkout.sets - state.currentSet + 1) / currentWorkout.sets) * 100;
    updateProgressBar(progress);
    
    // Warning for last 10 seconds
    if (state.currentTime <= 10 && state.currentTime > 0) {
        elements.timerDisplay.style.animation = 'pulse 0.5s infinite';
        if (state.currentTime <= 3) {
            elements.timerDisplay.style.color = '#ff6b6b';
        }
    } else {
        elements.timerDisplay.style.animation = '';
        elements.timerDisplay.style.color = '';
    }
}

function updateProgressBar(progress) {
    let progressBar = document.querySelector('.progress-bar');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        elements.currentSetDisplay.appendChild(progressBar);
    }
    progressBar.style.width = `${progress}%`;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function speak(text) {
    if (!soundEnabled) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.2;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
}

function playMotivationalSound() {
    if (!soundEnabled) return;
    
    // Create a simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function createCelebrationEffect() {
    // Create confetti-like effect
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.innerHTML = ['🎉', '🏆', '💪', '⭐', '🔥'][Math.floor(Math.random() * 5)];
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-50px';
            confetti.style.fontSize = '2rem';
            confetti.style.zIndex = '9999';
            confetti.style.animation = 'fall 3s linear forwards';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 100);
    }
}