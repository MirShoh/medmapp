/**
 * GALAKTIKA QAHRAMONI - O'YIN KODI
 * Muallif: Dunyoning eng tajribali dasturchisi
 * Maqsad: Bolajonlar uchun 3D Puzzle
 */

// --- 1. O'YIN KONFIGURATSIYASI VA MA'LUMOTLAR ---
const CONFIG = {
    sensitivity: 3.0,      // Qo'l harakati tezligi
    snapDistance: 1.5,     // Magnit masofasi
    cameraZ: 12            // Kamera uzoqligi
};

const LEVELS = [
    {
        id: 1, name: "YER", code: ["Y", "E", "R"], type: "EARTH",
        color: 0x2244ff, bgColors: [0x000000, 0x001133]
    },
    {
        id: 2, name: "OY", code: ["O", "Y"], type: "MOON",
        color: 0xaaaaaa, bgColors: [0x000000, 0x222222]
    },
    {
        id: 3, name: "MARS", code: ["M", "A", "R", "S"], type: "MARS",
        color: 0xff3300, bgColors: [0x220000, 0x441100]
    },
    {
        id: 4, name: "SATURN", code: ["S", "A", "T", "U", "R", "N"], type: "SATURN",
        color: 0xffcc00, bgColors: [0x111100, 0x332200]
    },
    {
        id: 5, name: "QUYOSH", code: ["Q", "U", "Y", "O", "S", "H"], type: "SUN",
        color: 0xffaa00, bgColors: [0x330000, 0xffaa00]
    }
];

const STATE = {
    levelIndex: 0,
    handVisible: false,
    handPos: { x: 0, y: 0 },
    gesture: 'OPEN', // OPEN, PINCH
    grabbedObj: null,
    hoveredObj: null,
    lockedCount: 0,
    isWon: false,
    isPlaying: false
};

// DOM Elementlar (Keshlab olish)
const UI = {
    loading: document.getElementById('loading-screen'),
    status: document.getElementById('status-text'),
    startBtn: document.getElementById('start-btn'),
    levelName: document.getElementById('level-name'),
    targetCode: document.getElementById('target-code'),
    progressBar: document.getElementById('progress-bar'),
    winModal: document.getElementById('win-modal'),
    unlockedText: document.getElementById('planet-unlocked-text'),
    nextBtn: document.getElementById('next-btn'),
    robotMsg: document.getElementById('robot-msg'),
    video: document.getElementById('input-video'),
    preview: document.getElementById('video-preview'),
    previewCtx: document.getElementById('video-preview').getContext('2d')
};

// --- 2. 3D SAHNA MENEJERI ---
const SceneManager = {
    scene: null, camera: null, renderer: null,
    groups: { pieces: null, slots: null, planet: null, effects: null },
    
    init() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050510, 0.02);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.z = CONFIG.cameraZ;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); 
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Yoritish
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        const sun = new THREE.DirectionalLight(0xffffff, 1.2);
        sun.position.set(5, 10, 8);
        this.scene.add(ambient, sun);

        // Guruhlar
        this.groups.pieces = new THREE.Group();
        this.groups.slots = new THREE.Group(); 
        this.groups.planet = new THREE.Group();
        this.groups.effects = new THREE.Group();
        
        this.scene.add(this.groups.planet);
        this.scene.add(this.groups.slots);
        this.scene.add(this.groups.pieces);
        this.scene.add(this.groups.effects);

        // Kursor
        this.cursor = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 })
        );
        this.scene.add(this.cursor);

        // Yulduzlar
        this.createStars();

        window.addEventListener('resize', () => this.onResize());
    },

    createStars() {
        const geo = new THREE.BufferGeometry();
        const pos = [];
        for(let i=0; i<1500; i++) pos.push((Math.random()-0.5)*80, (Math.random()-0.5)*80, (Math.random()-0.5)*60);
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        this.stars = new THREE.Points(geo, new THREE.PointsMaterial({color: 0xffffff, size: 0.15}));
        this.scene.add(this.stars);
    },

    clearLevel() {
        const clearGroup = (group) => {
            while(group.children.length > 0) {
                const obj = group.children[0];
                if(obj.geometry) obj.geometry.dispose();
                if(obj.material) {
                    if(Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                    else obj.material.dispose();
                    if(obj.material.map) obj.material.map.dispose();
                }
                group.remove(obj);
            }
        };
        clearGroup(this.groups.pieces);
        clearGroup(this.groups.slots);
        clearGroup(this.groups.planet);
        clearGroup(this.groups.effects);
    },

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
};

// --- 3. AVATAR MENEJERI (ROBOTCHA) ---
const AvatarManager = {
    scene: null, camera: null, renderer: null, robot: null,
    head: null, lArm: null, rArm: null,
    
    init() {
        const container = document.getElementById('avatar-container');
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        this.camera.position.set(0, 1, 4);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(300, 300);
        container.appendChild(this.renderer.domElement);

        const light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.set(2, 5, 5);
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        this.buildRobot();
    },

    buildRobot() {
        this.robot = new THREE.Group();

        const matBody = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
        const matDark = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const matEye = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff });

        // Gavda
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 1, 8), matBody);
        this.robot.add(body);

        // Bosh
        this.head = new THREE.Group();
        const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.7), matBody);
        this.head.position.y = 0.9;
        this.head.add(headMesh);
        
        // Ko'zlar
        const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.15), matEye);
        lEye.position.set(-0.2, 0, 0.35);
        const rEye = new THREE.Mesh(new THREE.SphereGeometry(0.15), matEye);
        rEye.position.set(0.2, 0, 0.35);
        this.head.add(lEye, rEye);
        this.robot.add(this.head);

        // Qo'llar (Silindr shakli)
        const armGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
        
        this.lArm = new THREE.Group();
        const lArmMesh = new THREE.Mesh(armGeo, matDark);
        lArmMesh.position.y = -0.3;
        this.lArm.add(lArmMesh);
        this.lArm.position.set(-0.9, 0.3, 0);
        this.lArm.rotation.z = 0.5;
        this.robot.add(this.lArm);

        this.rArm = new THREE.Group();
        const rArmMesh = new THREE.Mesh(armGeo, matDark);
        rArmMesh.position.y = -0.3;
        this.rArm.add(rArmMesh);
        this.rArm.position.set(0.9, 0.3, 0);
        this.rArm.rotation.z = -0.5;
        this.robot.add(this.rArm);

        this.robot.position.y = -0.5;
        this.scene.add(this.robot);
    },

    animate(time) {
        if(!this.robot) return;
        
        this.robot.position.y = -0.5 + Math.sin(time * 2) * 0.05;

        if (STATE.isWon) {
            this.lArm.rotation.z = Math.sin(time * 10) * 0.5 + 2.5; 
            this.rArm.rotation.z = Math.cos(time * 10) * 0.5 - 2.5;
            this.head.rotation.y = Math.sin(time * 5) * 0.2;
        } else if (STATE.handVisible) {
            const targetX = STATE.handPos.x * 0.5;
            const targetY = STATE.handPos.y * 0.5;
            this.head.rotation.y += (targetX - this.head.rotation.y) * 0.1;
            this.head.rotation.x += (-targetY - this.head.rotation.x) * 0.1;

            if (STATE.gesture === 'PINCH') {
                this.lArm.rotation.z = 1.5; 
            } else {
                this.lArm.rotation.z = 0.5;
            }
        } else {
            this.head.rotation.y = Math.sin(time) * 0.1;
            this.lArm.rotation.z = 0.5;
        }

        this.renderer.render(this.scene, this.camera);
    }
};

// --- 4. SAYYORALAR FABRIKASI ---
const PlanetFactory = {
    create(type, color) {
        const group = new THREE.Group();
        let mesh;

        if (type === 'SATURN') {
            const geo = new THREE.SphereGeometry(2.2, 32, 32);
            const mat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.5 });
            mesh = new THREE.Mesh(geo, mat);
            group.add(mesh);
            const ringGeo = new THREE.RingGeometry(3, 5, 64);
            const ringMat = new THREE.MeshStandardMaterial({ 
                color: 0xaa8800, side: THREE.DoubleSide, transparent: true, opacity: 0.8 
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2.5;
            group.add(ring);
        } else if (type === 'EARTH') {
            const geo = new THREE.SphereGeometry(2.5, 32, 32);
            const mat = new THREE.MeshStandardMaterial({ color: 0x1144cc, roughness: 0.6 });
            mesh = new THREE.Mesh(geo, mat);
            for(let i=0; i<8; i++) {
                const blob = new THREE.Mesh(
                    new THREE.SphereGeometry(Math.random()*0.8 + 0.3, 16, 16),
                    new THREE.MeshStandardMaterial({ color: 0x228822 })
                );
                blob.position.setFromSphericalCoords(2.4, Math.random()*Math.PI, Math.random()*Math.PI*2);
                mesh.add(blob);
            }
            group.add(mesh);
        } else {
            const geo = new THREE.SphereGeometry(2.5, 32, 32);
            const mat = new THREE.MeshStandardMaterial({ 
                color: color, 
                roughness: 0.8,
                emissive: type === 'SUN' ? color : 0x000000,
                emissiveIntensity: 0.4
            });
            mesh = new THREE.Mesh(geo, mat);
            if (type === 'MOON' || type === 'MARS') {
                for(let i=0; i<5; i++) {
                    const crater = new THREE.Mesh(
                        new THREE.RingGeometry(0.2, 0.3, 16),
                        new THREE.MeshStandardMaterial({ color: 0x000000, opacity: 0.3, transparent: true })
                    );
                    const phi = Math.random() * Math.PI;
                    const theta = Math.random() * Math.PI * 2;
                    crater.position.setFromSphericalCoords(2.51, phi, theta);
                    crater.lookAt(0,0,0);
                    mesh.add(crater);
                }
            }
            group.add(mesh);
        }

        return group;
    }
};

// --- 5. O'YIN MANTIQI ---
const GameManager = {
    init() {
        SceneManager.init();
        AvatarManager.init();
        this.initAI();
        this.addListeners();
        this.loop();
    },

    initAI() {
        const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 0,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        hands.onResults(this.onHandResults.bind(this));
        
        hands.initialize().then(() => {
            UI.status.innerText = "Tizim tayyor!";
            UI.startBtn.disabled = false;
        });
        
        this.hands = hands;
    },

    addListeners() {
        UI.startBtn.addEventListener('click', () => this.startCamera());
        UI.nextBtn.addEventListener('click', () => this.nextLevel());
    },

    async startCamera() {
        UI.startBtn.innerText = "Ulanmoqda...";
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 640 } } 
            });
            UI.video.srcObject = stream;
            UI.video.onloadedmetadata = () => {
                UI.video.play();
                UI.loading.style.display = 'none';
                STATE.isPlaying = true;
                this.loadLevel(0);
                this.processVideo();
                this.showRobotMessage("Salom! Keling o'ynaymiz!", 3000);
            };
        } catch (e) {
            alert("Kamera xatosi: " + e.message);
            UI.startBtn.innerText = "Qayta urinish";
        }
    },

    async processVideo() {
        if (STATE.isPlaying) {
            await this.hands.send({image: UI.video});
            requestAnimationFrame(this.processVideo.bind(this));
        }
    },

    onHandResults(results) {
        UI.previewCtx.clearRect(0, 0, UI.preview.width, UI.preview.height);
        UI.previewCtx.drawImage(results.image, 0, 0, UI.preview.width, UI.preview.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            drawConnectors(UI.previewCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});
            
            const x = (1 - landmarks[9].x - 0.5) * CONFIG.sensitivity * 5;
            const y = -(landmarks[9].y - 0.5) * CONFIG.sensitivity * 4;
            
            STATE.handPos.x += (x - STATE.handPos.x) * 0.3;
            STATE.handPos.y += (y - STATE.handPos.y) * 0.3;
            STATE.handVisible = true;

            const thumb = landmarks[4];
            const index = landmarks[8];
            const dist = Math.sqrt(Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2));
            STATE.gesture = dist < 0.08 ? 'PINCH' : 'OPEN';
        } else {
            STATE.handVisible = false;
        }
    },

    loadLevel(index) {
        SceneManager.clearLevel();
        STATE.levelIndex = index;
        STATE.lockedCount = 0;
        STATE.isWon = false;
        
        const level = LEVELS[index];
        
        UI.levelName.innerText = `${index + 1}-SAYYORA: ${level.name}`;
        UI.targetCode.innerText = level.code.join("");
        UI.progressBar.style.width = '0%';
        UI.winModal.style.display = 'none';
        UI.unlockedText.innerText = `${level.name} OCHILDI`;

        const planet = PlanetFactory.create(level.type, level.color);
        planet.scale.set(0.1, 0.1, 0.1);
        SceneManager.groups.planet.add(planet);
        STATE.currentPlanet = planet;

        const radius = 3.5;
        const total = level.code.length;
        
        level.code.forEach((char, i) => {
            const angle = (i / total) * Math.PI * 2;
            const tx = Math.cos(angle) * radius;
            const ty = Math.sin(angle) * radius;
            const targetPos = new THREE.Vector3(tx, ty, 0);

            const slot = this.createCard(char, true, level.color);
            slot.position.copy(targetPos);
            SceneManager.groups.slots.add(slot);

            const piece = this.createCard(char, false, level.color);
            piece.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 6,
                3 + Math.random()
            );
            piece.userData = { id: i, targetPos: targetPos, isLocked: false };
            SceneManager.groups.pieces.add(piece);
        });
        
        this.showRobotMessage("Harflarni joyiga qo'ying!", 3000);
    },

    createCard(text, isSlot, colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = isSlot ? 'rgba(255,255,255,0.1)' : '#' + colorHex.toString(16).padStart(6,'0');
        if(!isSlot) ctx.shadowBlur = 10; ctx.shadowColor = "white";
        
        ctx.beginPath();
        ctx.arc(64, 64, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.font = 'bold 80px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 64, 68);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        if (!isSlot) mat.opacity = 0.9;
        
        return new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), mat);
    },

    checkInteraction() {
        if (!STATE.handVisible || STATE.isWon) return;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(STATE.handPos.x / 5, STATE.handPos.y / 4);
        
        raycaster.setFromCamera(mouse, SceneManager.camera);
        const dist = -SceneManager.camera.position.z / raycaster.ray.direction.z;
        const cursorPos = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(dist));
        
        SceneManager.cursor.position.lerp(cursorPos, 0.2);

        const intersects = raycaster.intersectObjects(SceneManager.groups.pieces.children);

        SceneManager.groups.pieces.children.forEach(p => {
            if(!p.userData.isLocked && p !== STATE.grabbedObj) p.scale.setScalar(1);
        });

        if (STATE.gesture === 'PINCH') {
            if (!STATE.grabbedObj && intersects.length > 0) {
                const obj = intersects[0].object;
                if (!obj.userData.isLocked) STATE.grabbedObj = obj;
            }

            if (STATE.grabbedObj) {
                STATE.grabbedObj.position.lerp(cursorPos, 0.2);
                STATE.grabbedObj.scale.setScalar(1.2);
                
                if (STATE.grabbedObj.position.distanceTo(STATE.grabbedObj.userData.targetPos) < CONFIG.snapDistance) {
                    STATE.grabbedObj.material.color.setHex(0x00ff00);
                } else {
                    STATE.grabbedObj.material.color.setHex(0xffffff);
                }
            }
        } else {
            if (STATE.grabbedObj) {
                const obj = STATE.grabbedObj;
                const distToTarget = obj.position.distanceTo(obj.userData.targetPos);
                
                if (distToTarget < CONFIG.snapDistance) {
                    obj.userData.isLocked = true;
                    obj.position.copy(obj.userData.targetPos);
                    obj.material.color.setHex(0x00ff00);
                    obj.scale.setScalar(1);
                    
                    this.spawnParticles(obj.position, 0x00ff00);
                    
                    STATE.lockedCount++;
                    this.updateProgress();
                } else {
                     obj.material.color.setHex(0xffffff);
                }
                STATE.grabbedObj = null;
            }
        }
    },

    updateProgress() {
        const total = LEVELS[STATE.levelIndex].code.length;
        const percent = (STATE.lockedCount / total) * 100;
        UI.progressBar.style.width = `${percent}%`;

        if (STATE.lockedCount === total) {
            this.winLevel();
        }
    },

    winLevel() {
        STATE.isWon = true;
        SceneManager.groups.slots.visible = false;
        SceneManager.groups.pieces.visible = false;
        
        this.showRobotMessage("Ura! Barakalla!", 5000);
        UI.winModal.style.display = 'flex';
    },

    spawnParticles(pos, color) {
        for(let i=0; i<10; i++) {
            const geo = new THREE.PlaneGeometry(0.2, 0.2);
            const mat = new THREE.MeshBasicMaterial({ color: color });
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(pos);
            p.userData.vel = new THREE.Vector3((Math.random()-0.5)*0.2, (Math.random()-0.5)*0.2, Math.random()*0.2);
            p.userData.life = 1.0;
            SceneManager.groups.effects.add(p);
        }
    },

    nextLevel() {
        let nextIdx = STATE.levelIndex + 1;
        if (nextIdx >= LEVELS.length) nextIdx = 0;
        this.loadLevel(nextIdx);
    },

    showRobotMessage(text, duration) {
        UI.robotMsg.innerText = text;
        UI.robotMsg.style.opacity = 1;
        setTimeout(() => { UI.robotMsg.style.opacity = 0; }, duration);
    },

    loop() {
        requestAnimationFrame(this.loop.bind(this));
        
        const time = Date.now() * 0.001;
        
        this.checkInteraction();
        AvatarManager.animate(time);
        
        if (STATE.currentPlanet) {
            STATE.currentPlanet.rotation.y += 0.005;
            
            if (STATE.isWon) {
                STATE.currentPlanet.scale.lerp(new THREE.Vector3(1,1,1), 0.05);
                STATE.currentPlanet.rotation.y += 0.02;
            }
        }

        SceneManager.groups.effects.children.forEach(p => {
            p.position.add(p.userData.vel);
            p.userData.life -= 0.02;
            p.scale.setScalar(p.userData.life);
            if (p.userData.life <= 0) SceneManager.groups.effects.remove(p);
        });

        SceneManager.renderer.render(SceneManager.scene, SceneManager.camera);
    }
};

// O'yinni boshlash
GameManager.init();