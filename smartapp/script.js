// ==================== GAME STATE ====================
let gameState = {
    screen: 'start',
    character: null,
    mission: null,
    score: 0,
    level: 1,
    lives: 3,
    currentQuestion: 0,
    correctAnswers: 0,
    totalQuestions: 10
};

// ==================== THREE.JS VARIABLES ====================
let scene, camera, renderer, blocks = [];
let selectedBlock = null;

// ==================== HAND TRACKING VARIABLES ====================
let hands, cameraFeed;
let currentGesture = null;
let previousGesture = null;
let handPosition = { x: 0, y: 0 };
let isPinching = false;

// ==================== DRAG & DROP VARIABLES ====================
let draggedPlanet = null;
let dropZones = [];

// ==================== QUIZ DATA ====================
const quizQuestions = [
    {
        question: "Quyoshga eng yaqin sayyora qaysi?",
        answers: ["Merkuriy", "Venera", "Yer", "Mars"],
        correct: 0
    },
    {
        question: "Eng katta sayyora qaysi?",
        answers: ["Saturn", "Yupiter", "Neptun", "Uran"],
        correct: 1
    },
    {
        question: "Qizil sayyora deb qaysi sayyorani ataladi?",
        answers: ["Venera", "Mars", "Yupiter", "Saturn"],
        correct: 1
    },
    {
        question: "Halqalari bor sayyora?",
        answers: ["Mars", "Yer", "Saturn", "Merkuriy"],
        correct: 2
    },
    {
        question: "Biz qaysi sayyorada yashaymiz?",
        answers: ["Mars", "Venera", "Yer", "Yupiter"],
        correct: 2
    },
    {
        question: "Quyoshdan eng uzoq sayyora?",
        answers: ["Uran", "Neptun", "Pluton", "Saturn"],
        correct: 1
    },
    {
        question: "Eng issiq sayyora qaysi?",
        answers: ["Merkuriy", "Venera", "Mars", "Yer"],
        correct: 1
    },
    {
        question: "Oy qaysi sayyoraning yo'ldoshi?",
        answers: ["Mars", "Yer", "Yupiter", "Saturn"],
        correct: 1
    },
    {
        question: "Quyosh nima?",
        answers: ["Sayyora", "Yulduz", "Oy", "Asteroid"],
        correct: 1
    },
    {
        question: "Qancha sayyora bor (Quyosh sistemasida)?",
        answers: ["6 ta", "7 ta", "8 ta", "9 ta"],
        correct: 2
    }
];

// ==================== MOVEMENT DATA ====================
const movementQuestions = [
    {
        question: "Qo'lingizni QUYOSH ustiga qo'ying",
        correct: "☀️",
        options: ["☀️", "🌙", "⭐", "🌍"]
    },
    {
        question: "Qo'lingizni YER ustiga qo'ying",
        correct: "🌍",
        options: ["🌍", "🔴", "🪐", "💍"]
    },
    {
        question: "Qo'lingizni MARS ustiga qo'ying",
        correct: "🔴",
        options: ["🔴", "🌍", "🪐", "🌙"]
    },
    {
        question: "Qo'lingizni OY ustiga qo'ying",
        correct: "🌙",
        options: ["🌙", "⭐", "☀️", "🌍"]
    },
    {
        question: "Qo'lingizni YUPITER ustiga qo'ying",
        correct: "🪐",
        options: ["🪐", "💍", "🔴", "🌍"]
    }
];

let currentMovementQ = 0;

// ==================== THREE.JS SETUP ====================
function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('canvas3d'),
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Add stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
        starsVertices.push(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200
        );
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    scene.add(new THREE.Points(starsGeometry, starsMaterial));

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light1 = new THREE.PointLight(0x00ffff, 1, 100);
    light1.position.set(10, 10, 10);
    scene.add(light1);

    createPlanets();
    animate();
}

function createPlanets() {
    const planetData = [
        { color: 0xFFD700, size: 1.2, name: 'sun', emoji: '☀️' },
        { color: 0x87CEEB, size: 0.8, name: 'earth', emoji: '🌍' },
        { color: 0xFF6347, size: 0.6, name: 'mars', emoji: '🔴' },
        { color: 0xFFA500, size: 1.5, name: 'jupiter', emoji: '🪐' },
        { color: 0xF0E68C, size: 1.2, name: 'saturn', emoji: '💍' },
        { color: 0xC0C0C0, size: 0.5, name: 'moon', emoji: '🌙' }
    ];

    planetData.forEach((data, i) => {
        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.9,
            shininess: 100
        });

        const planet = new THREE.Mesh(geometry, material);
        const angle = (i / planetData.length) * Math.PI * 2;
        planet.position.x = Math.cos(angle) * 8;
        planet.position.y = Math.sin(angle) * 5;
        planet.position.z = -5;
        
        planet.userData = {
            rotationSpeed: 0.01 + Math.random() * 0.02,
            name: data.name,
            emoji: data.emoji,
            isDragging: false,
            originalPos: planet.position.clone()
        };

        scene.add(planet);
        blocks.push(planet);
    });
}

function animate() {
    requestAnimationFrame(animate);

    blocks.forEach(planet => {
        if (!planet.userData.isDragging) {
            planet.rotation.y += planet.userData.rotationSpeed;
        }

        if (planet === selectedBlock) {
            planet.scale.set(1.4, 1.4, 1.4);
            planet.material.emissive = new THREE.Color(0xffff00);
        } else {
            planet.scale.set(1, 1, 1);
            planet.material.emissive = new THREE.Color(0x000000);
        }
    });

    renderer.render(scene, camera);
}

// ==================== SCREEN NAVIGATION ====================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    if (screenId) document.getElementById(screenId).classList.add('active');
}

function showStartScreen() {
    showScreen('startScreen');
    document.getElementById('gameUI').classList.remove('active');
    document.getElementById('video').style.display = 'none';
    if (cameraFeed) cameraFeed.stop();
}

function showCharacterSelect() {
    showScreen('characterScreen');
}

function showMissionSelect() {
    if (!gameState.character) {
        alert('Iltimos, avval qahramonni tanlang!');
        showCharacterSelect();
        return;
    }
    showScreen('missionScreen');
}

function showHelp() {
    alert('🎮 O\'yin qoidalari:\n\n1️⃣ Qahramonni tanlang\n2️⃣ Missiyani tanlang\n3️⃣ Qo\'l ishoralari:\n  👋 Ochiq kaft - Tanlash\n  🤏 Qisish - Ushlab olish\n  👍 Thumbs up - Tasdiqlash\n\n📹 Kamerani yoqish talab qilinadi!');
}

function selectCharacter(char) {
    document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
    event.target.closest('.character-card').classList.add('selected');
    gameState.character = char;
}

function exitGame() {
    if (confirm('O\'yindan chiqmoqchimisiz?')) {
        showMissionSelect();
    }
}

// ==================== MISSION START ====================
async function startMission(missionType) {
    gameState.mission = missionType;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.currentQuestion = 0;
    gameState.correctAnswers = 0;
    currentMovementQ = 0;

    showScreen('');
    document.getElementById('gameUI').classList.add('active');
    document.getElementById('video').style.display = 'block';
    
    document.getElementById('questionPanel').style.display = 'none';
    document.getElementById('dragTargets').style.display = 'none';
    document.getElementById('movementGame').style.display = 'none';
    document.getElementById('resultScreen').classList.remove('active');

    updateGameUI();
    await setupHandTracking();

    if (missionType === 'quiz') {
        startQuiz();
    } else if (missionType === 'drag') {
        startDragDrop();
    } else if (missionType === 'movement') {
        startMovement();
    }
}

// ==================== UPDATE UI ====================
function updateGameUI() {
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('levelDisplay').textContent = gameState.level;
    document.getElementById('livesDisplay').textContent = gameState.lives;
    
    const progress = `${gameState.currentQuestion}/${gameState.totalQuestions}`;
    const percent = (gameState.currentQuestion / gameState.totalQuestions) * 100;
    document.getElementById('progressBar').style.width = percent + '%';
    document.getElementById('progressBar').textContent = progress;
}

// ==================== QUIZ MODE ====================
function startQuiz() {
    document.getElementById('questionPanel').style.display = 'block';
    showNextQuestion();
}

function showNextQuestion() {
    if (gameState.currentQuestion >= gameState.totalQuestions) {
        endGame();
        return;
    }

    const question = quizQuestions[gameState.currentQuestion];
    document.getElementById('questionText').textContent = question.question;

    const answersGrid = document.getElementById('answersGrid');
    answersGrid.innerHTML = '';

    question.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-button';
        btn.textContent = answer;
        btn.onclick = () => checkAnswer(index);
        answersGrid.appendChild(btn);
    });
}

function checkAnswer(selectedIndex) {
    const question = quizQuestions[gameState.currentQuestion];
    const buttons = document.querySelectorAll('.answer-button');
    
    buttons.forEach(btn => btn.style.pointerEvents = 'none');
    
    if (selectedIndex === question.correct) {
        buttons[selectedIndex].classList.add('correct');
        gameState.score += 100;
        gameState.correctAnswers++;
    } else {
        buttons[selectedIndex].classList.add('wrong');
        buttons[question.correct].classList.add('correct');
        gameState.lives--;
    }
    
    updateGameUI();
    
    if (gameState.lives <= 0) {
        setTimeout(endGame, 1500);
    } else {
        setTimeout(() => {
            gameState.currentQuestion++;
            updateGameUI();
            showNextQuestion();
        }, 1500);
    }
}

// ==================== DRAG & DROP MODE ====================
function startDragDrop() {
    document.getElementById('dragTargets').style.display = 'grid';
    gameState.totalQuestions = 6;
    dropZones = Array.from(document.querySelectorAll('.drop-zone'));
}

function checkDrop(planet, zone) {
    if (planet.userData.name === zone.dataset.planet) {
        zone.classList.add('filled');
        zone.style.pointerEvents = 'none';
        gameState.score += 150;
        gameState.correctAnswers++;
        gameState.currentQuestion++;
        
        planet.userData.isDragging = false;
        selectedBlock = null;
        
        if (gameState.currentQuestion >= gameState.totalQuestions) {
            setTimeout(endGame, 1000);
        }
        
        updateGameUI();
        return true;
    } else {
        gameState.lives--;
        updateGameUI();
        
        if (gameState.lives <= 0) {
            setTimeout(endGame, 1000);
        }
        return false;
    }
}

// ==================== MOVEMENT MODE ====================
function startMovement() {
    document.getElementById('movementGame').style.display = 'block';
    gameState.totalQuestions = movementQuestions.length;
    showNextMovement();
}

function showNextMovement() {
    if (currentMovementQ >= movementQuestions.length) {
        endGame();
        return;
    }

    const q = movementQuestions[currentMovementQ];
    document.getElementById('movementInstruction').textContent = q.question;
    
    const optionsDiv = document.getElementById('movementOptions');
    optionsDiv.innerHTML = '';
    
    q.options.forEach(opt => {
        const target = document.createElement('div');
        target.className = 'movement-target';
        target.textContent = opt;
        target.dataset.option = opt;
        optionsDiv.appendChild(target);
    });
}

function checkMovementAnswer(option) {
    const q = movementQuestions[currentMovementQ];
    
    if (option === q.correct) {
        gameState.score += 120;
        gameState.correctAnswers++;
        currentMovementQ++;
        gameState.currentQuestion++;
        
        if (currentMovementQ >= movementQuestions.length) {
            setTimeout(endGame, 1000);
        } else {
            setTimeout(showNextMovement, 1000);
        }
    } else {
        gameState.lives--;
        if (gameState.lives <= 0) {
            setTimeout(endGame, 1000);
        }
    }
    
    updateGameUI();
}

// ==================== END GAME ====================
function endGame() {
    document.getElementById('questionPanel').style.display = 'none';
    document.getElementById('dragTargets').style.display = 'none';
    document.getElementById('movementGame').style.display = 'none';
    
    const resultScreen = document.getElementById('resultScreen');
    const percent = (gameState.correctAnswers / gameState.totalQuestions) * 100;
    
    let stars = '⭐';
    let title = 'Yaxshi harakat!';
    let icon = '👍';
    
    if (percent >= 90) {
        stars = '⭐⭐⭐';
        title = 'Mukammal!';
        icon = '🏆';
    } else if (percent >= 70) {
        stars = '⭐⭐';
        title = 'Juda yaxshi!';
        icon = '🎉';
    }
    
    document.getElementById('resultIcon').textContent = icon;
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('resultStars').textContent = stars;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('correctAnswers').textContent = 
        `${gameState.correctAnswers}/${gameState.totalQuestions}`;
    
    resultScreen.classList.add('active');
}

// ==================== HAND TRACKING ====================
async function setupHandTracking() {
    try {
        const video = document.getElementById('video');
        
        hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults(onHandResults);

        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        video.srcObject = stream;

        cameraFeed = new Camera(video, {
            onFrame: async () => {
                await hands.send({ image: video });
            },
            width: 640,
            height: 480
        });

        cameraFeed.start();
    } catch (error) {
        console.error('Camera error:', error);
        alert('Kamera ruxsat etilmadi. Tugmalar bilan o\'ynang.');
    }
}

function onHandResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const gesture = detectGesture(landmarks);
        const palm = landmarks[9];
        
        handPosition.x = palm.x * window.innerWidth;
        handPosition.y = palm.y * window.innerHeight;
        
        const cursor = document.getElementById('handCursor');
        cursor.style.left = handPosition.x + 'px';
        cursor.style.top = handPosition.y + 'px';
        
        handleGesture(gesture, landmarks);
    }
}

function detectGesture(landmarks) {
    const thumb = landmarks[4];
    const index = landmarks[8];
    const middle = landmarks[12];
    const wrist = landmarks[0];

    const distance = (p1, p2) => 
        Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

    isPinching = distance(thumb, index) < 0.05;
    
    if (isPinching) return 'pinch';
    if (thumb.y < index.y && index.y > wrist.y) return 'thumbsup';
    return 'open';
}

function handleGesture(gesture, landmarks) {
    const palm = landmarks[9];
    const x = (palm.x - 0.5) * 20;
    const y = -(palm.y - 0.5) * 15;
    
    const cursor = document.getElementById('handCursor');

    if (gameState.mission === 'drag') {
        handleDragGesture(gesture, x, y, palm);
    } else if (gameState.mission === 'movement') {
        handleMovementGesture(palm);
    }

    if (isPinching) {
        cursor.classList.add('grabbing');
    } else {
        cursor.classList.remove('grabbing');
    }

    previousGesture = gesture;
}

function handleDragGesture(gesture, x, y, palm) {
    if (gesture === 'open' && previousGesture !== 'open' && !draggedPlanet) {
        selectNearestPlanet(x, y);
    } else if (gesture === 'pinch' && selectedBlock) {
        selectedBlock.userData.isDragging = true;
        selectedBlock.position.x = x;
        selectedBlock.position.y = y;
        draggedPlanet = selectedBlock;
        
        dropZones.forEach(zone => {
            const rect = zone.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const dist = Math.sqrt(
                Math.pow(handPosition.x - centerX, 2) + 
                Math.pow(handPosition.y - centerY, 2)
            );
            
            if (dist < 100 && !zone.classList.contains('filled')) {
                zone.classList.add('active');
            } else {
                zone.classList.remove('active');
            }
        });
    } else if (gesture !== 'pinch' && draggedPlanet) {
        let dropped = false;
        dropZones.forEach(zone => {
            if (zone.classList.contains('active')) {
                if (checkDrop(draggedPlanet, zone)) {
                    dropped = true;
                }
                zone.classList.remove('active');
            }
        });
        
        if (!dropped && draggedPlanet) {
            draggedPlanet.position.copy(draggedPlanet.userData.originalPos);
        }
        
        draggedPlanet.userData.isDragging = false;
        draggedPlanet = null;
        selectedBlock = null;
    }
}

function handleMovementGesture(palm) {
    const targets = document.querySelectorAll('.movement-target');
    let foundMatch = false;
    
    targets.forEach(target => {
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const dist = Math.sqrt(
            Math.pow(handPosition.x - centerX, 2) + 
            Math.pow(handPosition.y - centerY, 2)
        );
        
        if (dist < 80) {
            target.classList.add('highlight');
            foundMatch = true;
            
            if (isPinching && previousGesture !== 'pinch') {
                checkMovementAnswer(target.dataset.option);
            }
        } else {
            target.classList.remove('highlight');
        }
    });
}

function selectNearestPlanet(x, y) {
    let nearest = null;
    let minDist = Infinity;

    blocks.forEach(planet => {
        const dist = Math.sqrt(
            Math.pow(planet.position.x - x, 2) + 
            Math.pow(planet.position.y - y, 2)
        );
        if (dist < minDist && dist < 6) {
            minDist = dist;
            nearest = planet;
        }
    });

    selectedBlock = nearest;
}

// ==================== WINDOW RESIZE ====================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==================== INITIALIZE ====================
window.addEventListener('load', initScene);