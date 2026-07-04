const videoElement = document.getElementById('input-video');
const canvasElement = document.getElementById('output-canvas');
const canvasCtx = canvasElement.getContext('2d');
const spinner = document.getElementById('loading-spinner');
const poseNameEl = document.getElementById('pose-name');
const targetImageEl = document.getElementById('target-image');
const progressBarFill = document.getElementById('progress-bar-fill');
const matchStatusEl = document.getElementById('match-status');
const overlay = document.getElementById('celebration-overlay');
const nextBtn = document.getElementById('next-btn');
const webcamPanel = document.querySelector('.webcam-panel');
const scoreDisplayEl = document.getElementById('total-score');
const oddsDisplayEl = document.getElementById('pose-odds');
const timerDisplayEl = document.getElementById('time-left');

let currentCelebrationIndex = 0;
let isGoal = false;
let totalScore = 0;
let timeLeft = 10;
let timerInterval = null;

function getAngle(a, b, c) {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
        angle = 360.0 - angle;
    }
    return angle;
}

const articleImages = [
    'https://cdn.mos.cms.futurecdn.net/V8ECTveCRzqP26etR2MxrH.jpg',
    'https://cdn.mos.cms.futurecdn.net/33aCc9RBsayqt7rnhQcX5V.jpg',
    'https://cdn.mos.cms.futurecdn.net/zVbpLzc4jybXgtGnsNNap9.jpg',
    'https://cdn.mos.cms.futurecdn.net/u7nNbx7yUsMwYEkThsXoeS.jpg',
    'https://cdn.mos.cms.futurecdn.net/AiFc2nkBssEwuN4kU7HkH8.jpg',
    'https://cdn.mos.cms.futurecdn.net/7jkJP6KCTCYLzuD3zYaQSR.jpg',
    'https://cdn.mos.cms.futurecdn.net/47kDE3fWjphcac7vP7cNZU.jpg',
    'https://cdn.mos.cms.futurecdn.net/MJp6FTzpgNAXMSpNMp73Z8.jpg',
    'https://cdn.mos.cms.futurecdn.net/ZjUEW4oQZ5QRA68gCif5yC.jpg',
    'https://cdn.mos.cms.futurecdn.net/taXjQo8QuhyhvaByuk5J7T.jpg',
    'https://cdn.mos.cms.futurecdn.net/vF5xGqNQ28jcApMduzS7GU.jpg',
    'https://cdn.mos.cms.futurecdn.net/LpTTQD2gujVpmBTNCGszcW.jpg',
    'https://cdn.mos.cms.futurecdn.net/WzGsPDCDvovR7WRH4U5nfm.jpg',
    'https://cdn.mos.cms.futurecdn.net/Ar5DxJcWZc3tmrUiZKTeM4.jpg',
    'https://cdn.mos.cms.futurecdn.net/4TxvfepJXZgJqQ9zuTwmAd.jpg',
    'https://cdn.mos.cms.futurecdn.net/gCnKJahLBsTBymMGRK7Sq7.jpg',
    'https://cdn.mos.cms.futurecdn.net/9u2kQxyrSU7o4jWuwgqprB.jpg',
    'https://cdn.mos.cms.futurecdn.net/GY3K54vE4No8vLRjDJcS3g.jpg',
    'https://cdn.mos.cms.futurecdn.net/JcJNR4n5naPC3ELmZd549i.jpg',
    'https://cdn.mos.cms.futurecdn.net/jmMakwb2q99yBLBdy7vciX.jpg',
    'https://cdn.mos.cms.futurecdn.net/FLxoCQvMLis9FwkXyimD4m.jpg',
    'https://cdn.mos.cms.futurecdn.net/ZZGeXeuH3rs6hoh2RnCGe8.jpg',
    'https://cdn.mos.cms.futurecdn.net/rzJZL6zcoDbRdQ5atfK4Vg.jpg',
    'https://cdn.mos.cms.futurecdn.net/uoTvVsumNfkGnrCty3Zt4M.jpg',
    'https://cdn.mos.cms.futurecdn.net/vrjUwG42nJriV5umoj4Gu6.jpg',
    'https://cdn.mos.cms.futurecdn.net/srauDmd783y6rBEzbhWRjT.jpg',
    'https://cdn.mos.cms.futurecdn.net/tMhCNBRQrrMhRvNTAnuwSm.jpg',
    'https://cdn.mos.cms.futurecdn.net/XjTuFjhDxXDXa2NBtWqmh7.jpg',
    'https://cdn.mos.cms.futurecdn.net/WiqsifmhWHt5x4FbYaEKAU.jpg',
    'https://cdn.mos.cms.futurecdn.net/Wg3p8dVGd6tfP3vySgS9de.jpg',
    'https://cdn.mos.cms.futurecdn.net/N2pF4DdJj5d384kAZmPAmh.png',
    'https://cdn.mos.cms.futurecdn.net/wQhyWtVHPqDZH3bybAd4AT.jpg',
    'https://cdn.mos.cms.futurecdn.net/zQ2esb87tjWHkL3nEL4oWR.jpg'
];

function checkHypePose(landmarks) {
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    
    // Generic hype pose: throw hands above shoulders
    const lScore = leftWrist.y < leftShoulder.y ? 100 : 0;
    const rScore = rightWrist.y < rightShoulder.y ? 100 : 0;
    
    return (lScore + rScore) / 2;
}

const celebrations = [
    {
        id: 'shearer',
        name: 'Alan Shearer (The Raised Hand)',
        image: 'https://cdn.mos.cms.futurecdn.net/WzGsPDCDvovR7WRH4U5nfm.jpg',
        odds: 2.0,
        checkPose: (landmarks) => {
            const rightWrist = landmarks[16];
            const rightShoulder = landmarks[12];
            const rightElbow = landmarks[14];
            const rightElbowAngle = getAngle(rightShoulder, rightElbow, rightWrist);
            const isArmUp = rightWrist.y < rightShoulder.y;
            return isArmUp ? Math.max(0, 100 - Math.abs(rightElbowAngle - 180)) : 0;
        }
    },
    {
        id: 'montella',
        name: 'Vincenzo Montella (The Aeroplane)',
        image: 'https://cdn.mos.cms.futurecdn.net/u7nNbx7yUsMwYEkThsXoeS.jpg',
        odds: 3.5,
        checkPose: (landmarks) => {
            const leftShoulderAngle = getAngle(landmarks[23], landmarks[11], landmarks[13]);
            const rightShoulderAngle = getAngle(landmarks[24], landmarks[12], landmarks[14]);
            const sScoreL = Math.max(0, 100 - Math.abs(leftShoulderAngle - 90));
            const sScoreR = Math.max(0, 100 - Math.abs(rightShoulderAngle - 90));
            return (sScoreL + sScoreR) / 2;
        }
    },
    {
        id: 'crouch',
        name: 'Peter Crouch (The Robot)',
        image: 'https://cdn.mos.cms.futurecdn.net/vrjUwG42nJriV5umoj4Gu6.jpg',
        odds: 5.0,
        checkPose: (landmarks) => {
            const leftElbowAngle = getAngle(landmarks[11], landmarks[13], landmarks[15]);
            const rightElbowAngle = getAngle(landmarks[12], landmarks[14], landmarks[16]);
            const eScoreL = Math.max(0, 100 - Math.abs(leftElbowAngle - 90));
            const eScoreR = Math.max(0, 100 - Math.abs(rightElbowAngle - 90));
            return (eScoreL + eScoreR) / 2;
        }
    }
];

// Remove the 3 we already manually added so we don't repeat them
const manualUrls = [
    'https://cdn.mos.cms.futurecdn.net/WzGsPDCDvovR7WRH4U5nfm.jpg', // Shearer
    'https://cdn.mos.cms.futurecdn.net/u7nNbx7yUsMwYEkThsXoeS.jpg', // Montella
    'https://cdn.mos.cms.futurecdn.net/vrjUwG42nJriV5umoj4Gu6.jpg'  // Crouch
];

const uniqueArticleImages = articleImages.filter(url => !manualUrls.includes(url));

// Slice the array to only take the first 27 extra images (making 30 total celebrations)
const allExtraImages = uniqueArticleImages.slice(0, 27);

// Generate exactly 27 unique remaining celebrations
for (let i = 0; i < allExtraImages.length; i++) {
    celebrations.push({
        id: `generic_${i}`,
        name: `Iconic Celebration #${i + 4}`,
        image: allExtraImages[i],
        odds: (Math.random() * 3 + 1).toFixed(1), // Random odds between 1.0 and 4.0
        checkPose: checkHypePose
    });
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 10;
    timerDisplayEl.textContent = `${timeLeft}s`;
    timerDisplayEl.style.color = 'var(--text-main)';
    
    timerInterval = setInterval(() => {
        if (!isGoal) {
            timeLeft--;
            timerDisplayEl.textContent = `${timeLeft}s`;
            
            if (timeLeft <= 5) {
                timerDisplayEl.style.color = 'var(--warning-color)';
            }
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                passToNext(false); // Time out, 0 points
            }
        }
    }, 1000);
}

function loadCelebration(index) {
    const cel = celebrations[index];
    // Dynamically display the total number of celebrations
    poseNameEl.textContent = `${cel.name} (${index + 1}/${celebrations.length})`;
    targetImageEl.src = cel.image;
    progressBarFill.style.width = '0%';
    matchStatusEl.textContent = 'Match: 0%';
    oddsDisplayEl.textContent = `Odds: ${cel.odds}x`;
    webcamPanel.classList.remove('success');
    isGoal = false;
    startTimer();
}

function onResults(results) {
    spinner.style.display = 'none';
    
    if (canvasElement.width !== videoElement.videoWidth) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    canvasCtx.scale(-1, 1);
    canvasCtx.translate(-canvasElement.width, 0);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    
    if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
            {color: 'rgba(255, 255, 255, 0.5)', lineWidth: 4});
        drawLandmarks(canvasCtx, results.poseLandmarks,
            {color: '#38bdf8', lineWidth: 2, radius: 4});
            
        if (!isGoal && timeLeft > 0) {
            checkCurrentPose(results.poseLandmarks);
        }
    }
    
    canvasCtx.restore();
}

function checkCurrentPose(landmarks) {
    if (landmarks[11].visibility < 0.5 || landmarks[12].visibility < 0.5) {
        updateProgress(0);
        return;
    }

    const cel = celebrations[currentCelebrationIndex];
    let score = cel.checkPose(landmarks);
    
    score = Math.max(0, Math.min(100, score));
    updateProgress(score);
    
    if (score >= 99) { // Using 99 to ensure it triggers easily when maxed out
        triggerGoal(score, cel.odds);
    }
}

function updateProgress(score) {
    const displayScore = Math.round(score);
    progressBarFill.style.width = `${displayScore}%`;
    matchStatusEl.textContent = `Match: ${displayScore}%`;
    
    if (score > 70) {
        progressBarFill.style.background = 'linear-gradient(90deg, #4ade80, #38bdf8)';
    } else {
        progressBarFill.style.background = 'linear-gradient(90deg, var(--accent-color), #818cf8)';
    }
}

function triggerGoal(score, odds) {
    isGoal = true;
    clearInterval(timerInterval);
    webcamPanel.classList.add('success');
    progressBarFill.style.width = '100%';
    
    const pointsWon = Math.round(100 * odds);
    totalScore += pointsWon;
    
    matchStatusEl.textContent = `PERFECT! +${pointsWon} PTS`;
    scoreDisplayEl.textContent = `Score: ${totalScore}`;
    progressBarFill.style.background = 'var(--success-color)';
    
    document.querySelector('.glow-text').textContent = `+${pointsWon} PTS!`;
    overlay.classList.remove('hidden');
    
    // Auto pass after 2 seconds when successful
    setTimeout(() => {
        passToNext(true);
    }, 2000);
}

function passToNext(success) {
    overlay.classList.add('hidden');
    currentCelebrationIndex++;
    if (currentCelebrationIndex >= celebrations.length) {
        // End of game
        poseNameEl.textContent = "GAME OVER!";
        matchStatusEl.textContent = `Final Score: ${totalScore}`;
        targetImageEl.src = "";
        return;
    }
    loadCelebration(currentCelebrationIndex);
}

// Next button can be used to skip manually
nextBtn.addEventListener('click', () => {
    passToNext(false);
});

const pose = new Pose({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});

pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

pose.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await pose.send({image: videoElement});
    },
    width: 640,
    height: 480
});

loadCelebration(0);
camera.start().catch(err => {
    console.error(err);
    spinner.textContent = "Camera Error! Please grant permissions.";
});