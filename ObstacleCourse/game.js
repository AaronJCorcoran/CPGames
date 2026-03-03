// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameState = {
    coins: 0,
    jumpCoils: 0,
    speedCoils: 0,
    doubleJumps: 0,
    magnets: 0,
    shields: 0,
    gameRunning: true,
    shopOpen: false,
    currentLevel: 1,
    totalLevels: 10,
    hasUsedDoubleJump: false
};

// Player Object
const player = {
    x: 50,
    y: 400,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 12,
    gravity: 0.5,
    onGround: false,
    onLadder: false,
    onRope: false,
    color: '#FF6B35'
};

// Camera for horizontal scrolling
const camera = {
    x: 0,
    y: 0
};

// Input State
const keys = {};

// Level Definitions
const levels = {
    1: {
        name: "Beginner Course",
        width: 3000,
        platforms: [
            // Starting platform (left side)
            { x: 20, y: 500, width: 150, height: 20, color: '#4A90E2' },
            
            // Jump platforms
            { x: 220, y: 480, width: 80, height: 20, color: '#4A90E2' },
            { x: 350, y: 450, width: 80, height: 20, color: '#4A90E2' },
            { x: 480, y: 420, width: 80, height: 20, color: '#4A90E2' },
            
            // Platform with fan
            { x: 620, y: 520, width: 100, height: 20, color: '#4A90E2' },
            
            // Upper platform after fan
            { x: 780, y: 300, width: 120, height: 20, color: '#4A90E2' },
            
            // Platform with ladder
            { x: 950, y: 450, width: 100, height: 20, color: '#4A90E2' },
            
            // Middle section extension
            { x: 1100, y: 500, width: 100, height: 20, color: '#4A90E2' },
            { x: 1250, y: 470, width: 80, height: 20, color: '#4A90E2' },
            { x: 1380, y: 440, width: 80, height: 20, color: '#4A90E2' },
            { x: 1510, y: 410, width: 80, height: 20, color: '#4A90E2' },
            { x: 1640, y: 380, width: 80, height: 20, color: '#4A90E2' },
            { x: 1770, y: 350, width: 100, height: 20, color: '#4A90E2' },
            
            // Lower platforms with fan
            { x: 1920, y: 520, width: 100, height: 20, color: '#4A90E2' },
            { x: 2080, y: 480, width: 80, height: 20, color: '#4A90E2' },
            
            // Rope section
            { x: 2230, y: 400, width: 100, height: 20, color: '#4A90E2' },
            { x: 2480, y: 400, width: 100, height: 20, color: '#4A90E2' },
            
            // Final platforms
            { x: 2630, y: 470, width: 80, height: 20, color: '#4A90E2' },
            { x: 2750, y: 500, width: 150, height: 20, color: '#50C878' }
        ],
        fans: [
            { x: 640, y: 400, width: 60, height: 120, power: 1.5, active: true },
            { x: 1940, y: 380, width: 60, height: 140, power: 1.5, active: true }
        ],
        ladders: [
            { x: 780, y: 320, width: 30, height: 180 },
            { x: 980, y: 280, width: 30, height: 170 },
            { x: 1790, y: 370, width: 30, height: 150 },
            { x: 2250, y: 420, width: 30, height: 100 }
        ],
        ropes: [
            { x: 900, y: 300, width: 150, height: 5 },
            { x: 2330, y: 400, width: 150, height: 5 }
        ],
        coins: [
            { x: 250, y: 440, width: 20, height: 20, collected: false, value: 100 },
            { x: 380, y: 410, width: 20, height: 20, collected: false, value: 100 },
            { x: 510, y: 380, width: 20, height: 20, collected: false, value: 100 },
            { x: 670, y: 360, width: 20, height: 20, collected: false, value: 100 },
            { x: 830, y: 260, width: 20, height: 20, collected: false, value: 100 },
            { x: 950, y: 260, width: 20, height: 20, collected: false, value: 100 },
            { x: 975, y: 250, width: 20, height: 20, collected: false, value: 150 },
            { x: 1130, y: 460, width: 20, height: 20, collected: false, value: 150 },
            { x: 1280, y: 430, width: 20, height: 20, collected: false, value: 100 },
            { x: 1410, y: 400, width: 20, height: 20, collected: false, value: 100 },
            { x: 1540, y: 370, width: 20, height: 20, collected: false, value: 150 },
            { x: 1670, y: 340, width: 20, height: 20, collected: false, value: 150 },
            { x: 1800, y: 310, width: 20, height: 20, collected: false, value: 150 },
            { x: 1970, y: 340, width: 20, height: 20, collected: false, value: 150 },
            { x: 2110, y: 440, width: 20, height: 20, collected: false, value: 150 },
            { x: 2360, y: 370, width: 20, height: 20, collected: false, value: 200 },
            { x: 2660, y: 430, width: 20, height: 20, collected: false, value: 200 },
            { x: 2800, y: 460, width: 20, height: 20, collected: false, value: 250 }
        ]
    },
    2: {
        name: "Intermediate Challenge",
        width: 3200,
        platforms: [
            // Starting area
            { x: 20, y: 500, width: 120, height: 20, color: '#4A90E2' },
            
            // Longer jumps required
            { x: 200, y: 480, width: 70, height: 20, color: '#4A90E2' },
            { x: 340, y: 460, width: 60, height: 20, color: '#4A90E2' },
            { x: 470, y: 430, width: 60, height: 20, color: '#4A90E2' },
            { x: 600, y: 400, width: 70, height: 20, color: '#4A90E2' },
            
            // Double fan section
            { x: 750, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 920, y: 520, width: 80, height: 20, color: '#4A90E2' },
            
            // High platforms
            { x: 1050, y: 250, width: 100, height: 20, color: '#4A90E2' },
            
            // Rope bridge section
            { x: 750, y: 350, width: 100, height: 20, color: '#4A90E2' },
            { x: 1000, y: 350, width: 100, height: 20, color: '#4A90E2' },
            
            // Extended middle section
            { x: 1200, y: 480, width: 80, height: 20, color: '#4A90E2' },
            { x: 1330, y: 450, width: 70, height: 20, color: '#4A90E2' },
            { x: 1450, y: 420, width: 60, height: 20, color: '#4A90E2' },
            { x: 1560, y: 380, width: 60, height: 20, color: '#4A90E2' },
            { x: 1670, y: 340, width: 70, height: 20, color: '#4A90E2' },
            { x: 1790, y: 300, width: 80, height: 20, color: '#4A90E2' },
            
            // Lower level with fans
            { x: 1920, y: 520, width: 90, height: 20, color: '#4A90E2' },
            { x: 2100, y: 520, width: 90, height: 20, color: '#4A90E2' },
            { x: 2280, y: 520, width: 90, height: 20, color: '#4A90E2' },
            
            // High rope section
            { x: 2100, y: 280, width: 100, height: 20, color: '#4A90E2' },
            { x: 2380, y: 280, width: 100, height: 20, color: '#4A90E2' },
            
            // Final platforms
            { x: 2530, y: 400, width: 80, height: 20, color: '#4A90E2' },
            { x: 2660, y: 460, width: 80, height: 20, color: '#4A90E2' },
            { x: 2790, y: 500, width: 80, height: 20, color: '#4A90E2' },
            { x: 2920, y: 500, width: 150, height: 20, color: '#50C878' }
        ],
        fans: [
            { x: 770, y: 380, width: 60, height: 140, power: 2, active: true },
            { x: 940, y: 380, width: 60, height: 140, power: 2, active: true },
            { x: 1940, y: 360, width: 60, height: 160, power: 2, active: true },
            { x: 2120, y: 360, width: 60, height: 160, power: 2, active: true },
            { x: 2300, y: 360, width: 60, height: 160, power: 2, active: true }
        ],
        ladders: [
            { x: 1070, y: 270, width: 30, height: 210 },
            { x: 1810, y: 320, width: 30, height: 200 },
            { x: 2120, y: 300, width: 30, height: 220 }
        ],
        ropes: [
            { x: 850, y: 350, width: 150, height: 5 },
            { x: 2200, y: 280, width: 180, height: 5 }
        ],
        coins: [
            { x: 230, y: 440, width: 20, height: 20, collected: false, value: 100 },
            { x: 370, y: 420, width: 20, height: 20, collected: false, value: 100 },
            { x: 500, y: 390, width: 20, height: 20, collected: false, value: 150 },
            { x: 630, y: 360, width: 20, height: 20, collected: false, value: 150 },
            { x: 800, y: 330, width: 20, height: 20, collected: false, value: 150 },
            { x: 950, y: 330, width: 20, height: 20, collected: false, value: 150 },
            { x: 920, y: 310, width: 20, height: 20, collected: false, value: 200 },
            { x: 1080, y: 210, width: 20, height: 20, collected: false, value: 250 },
            { x: 1100, y: 200, width: 20, height: 20, collected: false, value: 250 },
            { x: 1230, y: 440, width: 20, height: 20, collected: false, value: 150 },
            { x: 1360, y: 410, width: 20, height: 20, collected: false, value: 150 },
            { x: 1480, y: 380, width: 20, height: 20, collected: false, value: 200 },
            { x: 1590, y: 340, width: 20, height: 20, collected: false, value: 200 },
            { x: 1700, y: 300, width: 20, height: 20, collected: false, value: 200 },
            { x: 1820, y: 260, width: 20, height: 20, collected: false, value: 250 },
            { x: 1990, y: 320, width: 20, height: 20, collected: false, value: 200 },
            { x: 2170, y: 320, width: 20, height: 20, collected: false, value: 200 },
            { x: 2290, y: 240, width: 20, height: 20, collected: false, value: 300 },
            { x: 2560, y: 360, width: 20, height: 20, collected: false, value: 250 },
            { x: 2690, y: 420, width: 20, height: 20, collected: false, value: 250 },
            { x: 2970, y: 460, width: 20, height: 20, collected: false, value: 300 }
        ]
    },
    3: {
        name: "Advanced Parkour",
        width: 3400,
        platforms: [
            // Starting area
            { x: 20, y: 500, width: 100, height: 20, color: '#4A90E2' },
            
            // Quick jumps
            { x: 180, y: 480, width: 55, height: 20, color: '#4A90E2' },
            { x: 300, y: 450, width: 50, height: 20, color: '#4A90E2' },
            { x: 410, y: 420, width: 50, height: 20, color: '#4A90E2' },
            { x: 520, y: 390, width: 50, height: 20, color: '#4A90E2' },
            
            // Lower section with fans
            { x: 630, y: 520, width: 70, height: 20, color: '#4A90E2' },
            { x: 790, y: 520, width: 70, height: 20, color: '#4A90E2' },
            { x: 950, y: 520, width: 70, height: 20, color: '#4A90E2' },
            
            // Triple rope section
            { x: 630, y: 300, width: 90, height: 20, color: '#4A90E2' },
            { x: 860, y: 280, width: 90, height: 20, color: '#4A90E2' },
            { x: 1090, y: 260, width: 90, height: 20, color: '#4A90E2' },
            
            // Extended middle section - more precision jumps
            { x: 1240, y: 400, width: 70, height: 20, color: '#4A90E2' },
            { x: 1360, y: 370, width: 60, height: 20, color: '#4A90E2' },
            { x: 1470, y: 340, width: 55, height: 20, color: '#4A90E2' },
            { x: 1575, y: 310, width: 50, height: 20, color: '#4A90E2' },
            { x: 1675, y: 280, width: 50, height: 20, color: '#4A90E2' },
            { x: 1775, y: 250, width: 60, height: 20, color: '#4A90E2' },
            
            // Fan gauntlet
            { x: 1900, y: 520, width: 70, height: 20, color: '#4A90E2' },
            { x: 2050, y: 520, width: 70, height: 20, color: '#4A90E2' },
            { x: 2200, y: 520, width: 70, height: 20, color: '#4A90E2' },
            { x: 2350, y: 520, width: 70, height: 20, color: '#4A90E2' },
            
            // Sky platforms
            { x: 1900, y: 250, width: 80, height: 20, color: '#4A90E2' },
            { x: 2100, y: 230, width: 80, height: 20, color: '#4A90E2' },
            { x: 2300, y: 210, width: 80, height: 20, color: '#4A90E2' },
            { x: 2500, y: 240, width: 80, height: 20, color: '#4A90E2' },
            
            // Final descent
            { x: 2650, y: 380, width: 80, height: 20, color: '#4A90E2' },
            { x: 2780, y: 450, width: 70, height: 20, color: '#4A90E2' },
            { x: 2900, y: 500, width: 70, height: 20, color: '#4A90E2' },
            { x: 3020, y: 500, width: 200, height: 20, color: '#50C878' }
        ],
        fans: [
            { x: 650, y: 360, width: 50, height: 160, power: 2.5, active: true },
            { x: 810, y: 360, width: 50, height: 160, power: 2.5, active: true },
            { x: 970, y: 360, width: 50, height: 160, power: 2.5, active: true },
            { x: 1920, y: 340, width: 50, height: 180, power: 2.5, active: true },
            { x: 2070, y: 340, width: 50, height: 180, power: 2.5, active: true },
            { x: 2220, y: 340, width: 50, height: 180, power: 2.5, active: true },
            { x: 2370, y: 340, width: 50, height: 180, power: 2.5, active: true }
        ],
        ladders: [
            { x: 640, y: 320, width: 30, height: 200 },
            { x: 1110, y: 280, width: 30, height: 120 },
            { x: 1920, y: 270, width: 30, height: 250 },
            { x: 2670, y: 400, width: 30, height: 120 }
        ],
        ropes: [
            { x: 720, y: 300, width: 140, height: 5 },
            { x: 950, y: 280, width: 140, height: 5 },
            { x: 2180, y: 230, width: 120, height: 5 },
            { x: 2380, y: 210, width: 120, height: 5 }
        ],
        coins: [
            { x: 210, y: 440, width: 20, height: 20, collected: false, value: 150 },
            { x: 330, y: 410, width: 20, height: 20, collected: false, value: 150 },
            { x: 440, y: 380, width: 20, height: 20, collected: false, value: 150 },
            { x: 550, y: 350, width: 20, height: 20, collected: false, value: 200 },
            { x: 680, y: 280, width: 20, height: 20, collected: false, value: 200 },
            { x: 830, y: 260, width: 20, height: 20, collected: false, value: 250 },
            { x: 900, y: 240, width: 20, height: 20, collected: false, value: 250 },
            { x: 1000, y: 240, width: 20, height: 20, collected: false, value: 250 },
            { x: 1120, y: 220, width: 20, height: 20, collected: false, value: 300 },
            { x: 1140, y: 210, width: 20, height: 20, collected: false, value: 300 },
            { x: 1270, y: 360, width: 20, height: 20, collected: false, value: 200 },
            { x: 1390, y: 330, width: 20, height: 20, collected: false, value: 200 },
            { x: 1500, y: 300, width: 20, height: 20, collected: false, value: 250 },
            { x: 1605, y: 270, width: 20, height: 20, collected: false, value: 250 },
            { x: 1705, y: 240, width: 20, height: 20, collected: false, value: 300 },
            { x: 1805, y: 210, width: 20, height: 20, collected: false, value: 300 },
            { x: 1950, y: 210, width: 20, height: 20, collected: false, value: 350 },
            { x: 2130, y: 190, width: 20, height: 20, collected: false, value: 350 },
            { x: 2330, y: 170, width: 20, height: 20, collected: false, value: 400 },
            { x: 2530, y: 200, width: 20, height: 20, collected: false, value: 400 },
            { x: 2680, y: 340, width: 20, height: 20, collected: false, value: 300 },
            { x: 2810, y: 410, width: 20, height: 20, collected: false, value: 300 },
            { x: 3100, y: 460, width: 20, height: 20, collected: false, value: 500 }
        ]
    },
    4: {
        name: "Expert Gauntlet",
        width: 3600,
        platforms: [
            // Starting area
            { x: 20, y: 500, width: 90, height: 20, color: '#4A90E2' },
            
            // Precision jumps
            { x: 170, y: 470, width: 45, height: 20, color: '#4A90E2' },
            { x: 280, y: 440, width: 40, height: 20, color: '#4A90E2' },
            { x: 380, y: 410, width: 40, height: 20, color: '#4A90E2' },
            { x: 480, y: 370, width: 40, height: 20, color: '#4A90E2' },
            { x: 580, y: 330, width: 40, height: 20, color: '#4A90E2' },
            
            // Mega fan section
            { x: 680, y: 520, width: 60, height: 20, color: '#4A90E2' },
            { x: 820, y: 520, width: 60, height: 20, color: '#4A90E2' },
            { x: 960, y: 520, width: 60, height: 20, color: '#4A90E2' },
            
            // Sky high platforms
            { x: 680, y: 200, width: 80, height: 20, color: '#4A90E2' },
            { x: 840, y: 180, width: 80, height: 20, color: '#4A90E2' },
            { x: 1000, y: 160, width: 80, height: 20, color: '#4A90E2' },
            
            // Long rope bridge
            { x: 1000, y: 350, width: 80, height: 20, color: '#4A90E2' },
            
            // Extended middle gauntlet
            { x: 1150, y: 450, width: 50, height: 20, color: '#4A90E2' },
            { x: 1250, y: 420, width: 45, height: 20, color: '#4A90E2' },
            { x: 1340, y: 390, width: 40, height: 20, color: '#4A90E2' },
            { x: 1420, y: 350, width: 40, height: 20, color: '#4A90E2' },
            { x: 1500, y: 310, width: 40, height: 20, color: '#4A90E2' },
            { x: 1580, y: 270, width: 45, height: 20, color: '#4A90E2' },
            { x: 1660, y: 230, width: 50, height: 20, color: '#4A90E2' },
            
            // More fan challenges
            { x: 1800, y: 520, width: 65, height: 20, color: '#4A90E2' },
            { x: 1950, y: 520, width: 65, height: 20, color: '#4A90E2' },
            { x: 2100, y: 520, width: 65, height: 20, color: '#4A90E2' },
            { x: 2250, y: 520, width: 65, height: 20, color: '#4A90E2' },
            
            // Ultra high section
            { x: 1800, y: 180, width: 80, height: 20, color: '#4A90E2' },
            { x: 1980, y: 160, width: 80, height: 20, color: '#4A90E2' },
            { x: 2160, y: 140, width: 80, height: 20, color: '#4A90E2' },
            { x: 2340, y: 160, width: 80, height: 20, color: '#4A90E2' },
            
            // Rope network
            { x: 2500, y: 300, width: 80, height: 20, color: '#4A90E2' },
            { x: 2750, y: 300, width: 80, height: 20, color: '#4A90E2' },
            
            // Final challenges
            { x: 2900, y: 400, width: 60, height: 20, color: '#4A90E2' },
            { x: 3020, y: 460, width: 60, height: 20, color: '#4A90E2' },
            { x: 3140, y: 500, width: 60, height: 20, color: '#4A90E2' },
            { x: 3250, y: 500, width: 200, height: 20, color: '#50C878' }
        ],
        fans: [
            { x: 700, y: 340, width: 40, height: 180, power: 3, active: true },
            { x: 840, y: 340, width: 40, height: 180, power: 3, active: true },
            { x: 980, y: 340, width: 40, height: 180, power: 3, active: true },
            { x: 1820, y: 320, width: 45, height: 200, power: 3, active: true },
            { x: 1970, y: 320, width: 45, height: 200, power: 3, active: true },
            { x: 2120, y: 320, width: 45, height: 200, power: 3, active: true },
            { x: 2270, y: 320, width: 45, height: 200, power: 3, active: true }
        ],
        ladders: [
            { x: 690, y: 220, width: 30, height: 300 },
            { x: 1010, y: 180, width: 30, height: 170 },
            { x: 1680, y: 250, width: 30, height: 270 },
            { x: 1820, y: 200, width: 30, height: 320 },
            { x: 2520, y: 320, width: 30, height: 200 }
        ],
        ropes: [
            { x: 760, y: 200, width: 80, height: 5 },
            { x: 920, y: 180, width: 80, height: 5 },
            { x: 1080, y: 350, width: 120, height: 5 },
            { x: 2060, y: 160, width: 100, height: 5 },
            { x: 2240, y: 140, width: 100, height: 5 },
            { x: 2580, y: 300, width: 170, height: 5 }
        ],
        coins: [
            { x: 200, y: 430, width: 20, height: 20, collected: false, value: 200 },
            { x: 310, y: 400, width: 20, height: 20, collected: false, value: 200 },
            { x: 410, y: 370, width: 20, height: 20, collected: false, value: 200 },
            { x: 510, y: 330, width: 20, height: 20, collected: false, value: 250 },
            { x: 610, y: 290, width: 20, height: 20, collected: false, value: 250 },
            { x: 720, y: 160, width: 20, height: 20, collected: false, value: 300 },
            { x: 870, y: 140, width: 20, height: 20, collected: false, value: 300 },
            { x: 1030, y: 120, width: 20, height: 20, collected: false, value: 350 },
            { x: 1050, y: 110, width: 20, height: 20, collected: false, value: 350 },
            { x: 1130, y: 310, width: 20, height: 20, collected: false, value: 400 },
            { x: 1180, y: 410, width: 20, height: 20, collected: false, value: 300 },
            { x: 1280, y: 380, width: 20, height: 20, collected: false, value: 300 },
            { x: 1370, y: 350, width: 20, height: 20, collected: false, value: 350 },
            { x: 1450, y: 310, width: 20, height: 20, collected: false, value: 350 },
            { x: 1530, y: 270, width: 20, height: 20, collected: false, value: 400 },
            { x: 1610, y: 230, width: 20, height: 20, collected: false, value: 400 },
            { x: 1690, y: 190, width: 20, height: 20, collected: false, value: 450 },
            { x: 1850, y: 140, width: 20, height: 20, collected: false, value: 500 },
            { x: 2010, y: 120, width: 20, height: 20, collected: false, value: 500 },
            { x: 2190, y: 100, width: 20, height: 20, collected: false, value: 550 },
            { x: 2370, y: 120, width: 20, height: 20, collected: false, value: 550 },
            { x: 2640, y: 260, width: 20, height: 20, collected: false, value: 500 },
            { x: 2930, y: 360, width: 20, height: 20, collected: false, value: 400 },
            { x: 3050, y: 420, width: 20, height: 20, collected: false, value: 400 },
            { x: 3330, y: 460, width: 20, height: 20, collected: false, value: 600 }
        ]
    },
    5: {
        name: "Speed Runner",
        width: 3800,
        platforms: [
            { x: 20, y: 500, width: 100, height: 20, color: '#4A90E2' },
            { x: 170, y: 480, width: 50, height: 20, color: '#4A90E2' },
            { x: 270, y: 460, width: 45, height: 20, color: '#4A90E2' },
            { x: 360, y: 440, width: 40, height: 20, color: '#4A90E2' },
            { x: 440, y: 420, width: 40, height: 20, color: '#4A90E2' },
            { x: 520, y: 400, width: 40, height: 20, color: '#4A90E2' },
            { x: 600, y: 380, width: 40, height: 20, color: '#4A90E2' },
            { x: 680, y: 360, width: 45, height: 20, color: '#4A90E2' },
            { x: 770, y: 340, width: 50, height: 20, color: '#4A90E2' },
            { x: 870, y: 320, width: 60, height: 20, color: '#4A90E2' },
            { x: 980, y: 300, width: 70, height: 20, color: '#4A90E2' },
            { x: 1100, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 1250, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 1400, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 1550, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 1700, y: 200, width: 90, height: 20, color: '#4A90E2' },
            { x: 1880, y: 180, width: 90, height: 20, color: '#4A90E2' },
            { x: 2060, y: 160, width: 90, height: 20, color: '#4A90E2' },
            { x: 2240, y: 180, width: 90, height: 20, color: '#4A90E2' },
            { x: 2420, y: 200, width: 90, height: 20, color: '#4A90E2' },
            { x: 2580, y: 350, width: 100, height: 20, color: '#4A90E2' },
            { x: 2820, y: 350, width: 100, height: 20, color: '#4A90E2' },
            { x: 2970, y: 450, width: 80, height: 20, color: '#4A90E2' },
            { x: 3100, y: 490, width: 80, height: 20, color: '#4A90E2' },
            { x: 3230, y: 510, width: 80, height: 20, color: '#4A90E2' },
            { x: 3360, y: 500, width: 250, height: 20, color: '#50C878' }
        ],
        fans: [
            { x: 1120, y: 320, width: 60, height: 200, power: 3.5, active: true },
            { x: 1270, y: 320, width: 60, height: 200, power: 3.5, active: true },
            { x: 1420, y: 320, width: 60, height: 200, power: 3.5, active: true },
            { x: 1570, y: 320, width: 60, height: 200, power: 3.5, active: true }
        ],
        ladders: [
            { x: 1000, y: 320, width: 30, height: 200 },
            { x: 1720, y: 220, width: 30, height: 300 },
            { x: 2600, y: 370, width: 30, height: 150 }
        ],
        ropes: [
            { x: 1790, y: 180, width: 90, height: 5 },
            { x: 1970, y: 160, width: 90, height: 5 },
            { x: 2150, y: 160, width: 90, height: 5 },
            { x: 2330, y: 180, width: 90, height: 5 },
            { x: 2680, y: 350, width: 140, height: 5 }
        ],
        coins: [
            { x: 200, y: 440, width: 20, height: 20, collected: false, value: 250 },
            { x: 300, y: 420, width: 20, height: 20, collected: false, value: 250 },
            { x: 390, y: 400, width: 20, height: 20, collected: false, value: 300 },
            { x: 470, y: 380, width: 20, height: 20, collected: false, value: 300 },
            { x: 550, y: 360, width: 20, height: 20, collected: false, value: 350 },
            { x: 630, y: 340, width: 20, height: 20, collected: false, value: 350 },
            { x: 710, y: 320, width: 20, height: 20, collected: false, value: 400 },
            { x: 800, y: 300, width: 20, height: 20, collected: false, value: 400 },
            { x: 900, y: 280, width: 20, height: 20, collected: false, value: 450 },
            { x: 1010, y: 260, width: 20, height: 20, collected: false, value: 500 },
            { x: 1180, y: 280, width: 20, height: 20, collected: false, value: 450 },
            { x: 1330, y: 280, width: 20, height: 20, collected: false, value: 450 },
            { x: 1480, y: 280, width: 20, height: 20, collected: false, value: 450 },
            { x: 1750, y: 160, width: 20, height: 20, collected: false, value: 550 },
            { x: 1910, y: 140, width: 20, height: 20, collected: false, value: 600 },
            { x: 2090, y: 120, width: 20, height: 20, collected: false, value: 600 },
            { x: 2270, y: 140, width: 20, height: 20, collected: false, value: 600 },
            { x: 2450, y: 160, width: 20, height: 20, collected: false, value: 550 },
            { x: 2730, y: 310, width: 20, height: 20, collected: false, value: 500 },
            { x: 3000, y: 410, width: 20, height: 20, collected: false, value: 450 },
            { x: 3130, y: 450, width: 20, height: 20, collected: false, value: 450 },
            { x: 3450, y: 460, width: 20, height: 20, collected: false, value: 650 }
        ]
    },
    6: {
        name: "Vertical Madness",
        width: 4000,
        platforms: [
            { x: 20, y: 500, width: 100, height: 20, color: '#4A90E2' },
            { x: 170, y: 480, width: 60, height: 20, color: '#4A90E2' },
            { x: 280, y: 460, width: 60, height: 20, color: '#4A90E2' },
            { x: 390, y: 440, width: 60, height: 20, color: '#4A90E2' },
            { x: 500, y: 420, width: 60, height: 20, color: '#4A90E2' },
            { x: 610, y: 400, width: 70, height: 20, color: '#4A90E2' },
            { x: 730, y: 380, width: 70, height: 20, color: '#4A90E2' },
            { x: 850, y: 350, width: 80, height: 20, color: '#4A90E2' },
            { x: 980, y: 320, width: 80, height: 20, color: '#4A90E2' },
            { x: 1110, y: 280, width: 80, height: 20, color: '#4A90E2' },
            { x: 1240, y: 240, width: 80, height: 20, color: '#4A90E2' },
            { x: 1370, y: 200, width: 90, height: 20, color: '#4A90E2' },
            { x: 1510, y: 160, width: 90, height: 20, color: '#4A90E2' },
            { x: 1650, y: 200, width: 90, height: 20, color: '#4A90E2' },
            { x: 1790, y: 240, width: 80, height: 20, color: '#4A90E2' },
            { x: 1920, y: 280, width: 80, height: 20, color: '#4A90E2' },
            { x: 2050, y: 320, width: 80, height: 20, color: '#4A90E2' },
            { x: 2180, y: 360, width: 80, height: 20, color: '#4A90E2' },
            { x: 2310, y: 400, width: 80, height: 20, color: '#4A90E2' },
            { x: 2440, y: 440, width: 80, height: 20, color: '#4A90E2' },
            { x: 2570, y: 480, width: 80, height: 20, color: '#4A90E2' },
            { x: 2700, y: 520, width: 90, height: 20, color: '#4A90E2' },
            { x: 2850, y: 480, width: 80, height: 20, color: '#4A90E2' },
            { x: 2980, y: 440, width: 80, height: 20, color: '#4A90E2' },
            { x: 3110, y: 400, width: 80, height: 20, color: '#4A90E2' },
            { x: 3240, y: 360, width: 80, height: 20, color: '#4A90E2' },
            { x: 3370, y: 400, width: 100, height: 20, color: '#4A90E2' },
            { x: 3520, y: 460, width: 100, height: 20, color: '#4A90E2' },
            { x: 3670, y: 500, width: 150, height: 20, color: '#50C878' }
        ],
        fans: [
            { x: 1000, y: 160, width: 60, height: 160, power: 2.5, active: true },
            { x: 2070, y: 160, width: 60, height: 160, power: 2.5, active: true }
        ],
        ladders: [
            { x: 140, y: 400, width: 30, height: 100 },
            { x: 510, y: 340, width: 30, height: 80 },
            { x: 1000, y: 160, width: 30, height: 160 },
            { x: 1520, y: 180, width: 30, height: 340 },
            { x: 2070, y: 160, width: 30, height: 160 },
            { x: 2710, y: 440, width: 30, height: 80 },
            { x: 3380, y: 420, width: 30, height: 100 }
        ],
        ropes: [
            { x: 1390, y: 200, width: 120, height: 5 },
            { x: 1670, y: 240, width: 120, height: 5 },
            { x: 3470, y: 400, width: 50, height: 5 }
        ],
        coins: [
            { x: 200, y: 440, width: 20, height: 20, collected: false, value: 300 },
            { x: 310, y: 420, width: 20, height: 20, collected: false, value: 300 },
            { x: 420, y: 400, width: 20, height: 20, collected: false, value: 350 },
            { x: 530, y: 380, width: 20, height: 20, collected: false, value: 350 },
            { x: 640, y: 360, width: 20, height: 20, collected: false, value: 400 },
            { x: 760, y: 340, width: 20, height: 20, collected: false, value: 400 },
            { x: 880, y: 310, width: 20, height: 20, collected: false, value: 450 },
            { x: 1010, y: 280, width: 20, height: 20, collected: false, value: 450 },
            { x: 1140, y: 240, width: 20, height: 20, collected: false, value: 500 },
            { x: 1270, y: 200, width: 20, height: 20, collected: false, value: 500 },
            { x: 1400, y: 160, width: 20, height: 20, collected: false, value: 600 },
            { x: 1540, y: 120, width: 20, height: 20, collected: false, value: 650 },
            { x: 1680, y: 160, width: 20, height: 20, collected: false, value: 600 },
            { x: 1820, y: 200, width: 20, height: 20, collected: false, value: 500 },
            { x: 1950, y: 240, width: 20, height: 20, collected: false, value: 500 },
            { x: 2080, y: 280, width: 20, height: 20, collected: false, value: 450 },
            { x: 2210, y: 320, width: 20, height: 20, collected: false, value: 450 },
            { x: 2340, y: 360, width: 20, height: 20, collected: false, value: 400 },
            { x: 2470, y: 400, width: 20, height: 20, collected: false, value: 400 },
            { x: 2600, y: 440, width: 20, height: 20, collected: false, value: 350 },
            { x: 2730, y: 480, width: 20, height: 20, collected: false, value: 350 },
            { x: 3140, y: 360, width: 20, height: 20, collected: false, value: 500 },
            { x: 3270, y: 320, width: 20, height: 20, collected: false, value: 500 },
            { x: 3550, y: 420, width: 20, height: 20, collected: false, value: 600 },
            { x: 3730, y: 460, width: 20, height: 20, collected: false, value: 700 }
        ]
    },
    7: {
        name: "Fan Frenzy",
        width: 4200,
        platforms: [
            { x: 20, y: 500, width: 100, height: 20, color: '#4A90E2' },
            { x: 180, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 340, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 500, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 660, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 820, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 980, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 200, y: 250, width: 100, height: 20, color: '#4A90E2' },
            { x: 400, y: 230, width: 100, height: 20, color: '#4A90E2' },
            { x: 600, y: 210, width: 100, height: 20, color: '#4A90E2' },
            { x: 800, y: 190, width: 100, height: 20, color: '#4A90E2' },
            { x: 1000, y: 170, width: 100, height: 20, color: '#4A90E2' },
            { x: 1160, y: 350, width: 90, height: 20, color: '#4A90E2' },
            { x: 1400, y: 350, width: 90, height: 20, color: '#4A90E2' },
            { x: 1640, y: 350, width: 90, height: 20, color: '#4A90E2' },
            { x: 1790, y: 480, width: 80, height: 20, color: '#4A90E2' },
            { x: 1930, y: 450, width: 70, height: 20, color: '#4A90E2' },
            { x: 2050, y: 420, width: 70, height: 20, color: '#4A90E2' },
            { x: 2170, y: 390, width: 70, height: 20, color: '#4A90E2' },
            { x: 2290, y: 360, width: 70, height: 20, color: '#4A90E2' },
            { x: 2410, y: 330, width: 70, height: 20, color: '#4A90E2' },
            { x: 2530, y: 300, width: 80, height: 20, color: '#4A90E2' },
            { x: 2660, y: 270, width: 80, height: 20, color: '#4A90E2' },
            { x: 2790, y: 240, width: 80, height: 20, color: '#4A90E2' },
            { x: 2920, y: 210, width: 90, height: 20, color: '#4A90E2' },
            { x: 3060, y: 180, width: 90, height: 20, color: '#4A90E2' },
            { x: 3210, y: 320, width: 100, height: 20, color: '#4A90E2' },
            { x: 3460, y: 320, width: 100, height: 20, color: '#4A90E2' },
            { x: 3610, y: 420, width: 100, height: 20, color: '#4A90E2' },
            { x: 3760, y: 480, width: 100, height: 20, color: '#4A90E2' },
            { x: 3910, y: 500, width: 150, height: 20, color: '#50C878' }
        ],
        fans: [
            { x: 200, y: 320, width: 60, height: 200, power: 4, active: true },
            { x: 360, y: 320, width: 60, height: 200, power: 4, active: true },
            { x: 520, y: 320, width: 60, height: 200, power: 4, active: true },
            { x: 680, y: 320, width: 60, height: 200, power: 4, active: true },
            { x: 840, y: 320, width: 60, height: 200, power: 4, active: true },
            { x: 1000, y: 320, width: 60, height: 200, power: 4, active: true },
            { x: 1280, y: 150, width: 60, height: 200, power: 3, active: true },
            { x: 1520, y: 150, width: 60, height: 200, power: 3, active: true }
        ],
        ladders: [
            { x: 150, y: 420, width: 30, height: 80 },
            { x: 220, y: 270, width: 30, height: 250 },
            { x: 1020, y: 190, width: 30, height: 330 },
            { x: 1280, y: 150, width: 30, height: 200 },
            { x: 1520, y: 150, width: 30, height: 200 },
            { x: 3230, y: 340, width: 30, height: 180 }
        ],
        ropes: [
            { x: 310, y: 250, width: 90, height: 5 },
            { x: 510, y: 230, width: 90, height: 5 },
            { x: 710, y: 210, width: 90, height: 5 },
            { x: 910, y: 190, width: 90, height: 5 },
            { x: 1250, y: 350, width: 150, height: 5 },
            { x: 1490, y: 350, width: 150, height: 5 },
            { x: 3310, y: 320, width: 150, height: 5 }
        ],
        coins: [
            { x: 110, y: 460, width: 20, height: 20, collected: false, value: 350 },
            { x: 250, y: 210, width: 20, height: 20, collected: false, value: 500 },
            { x: 430, y: 190, width: 20, height: 20, collected: false, value: 550 },
            { x: 630, y: 170, width: 20, height: 20, collected: false, value: 600 },
            { x: 830, y: 150, width: 20, height: 20, collected: false, value: 650 },
            { x: 1030, y: 130, width: 20, height: 20, collected: false, value: 700 },
            { x: 1310, y: 120, width: 20, height: 20, collected: false, value: 750 },
            { x: 1350, y: 310, width: 20, height: 20, collected: false, value: 600 },
            { x: 1550, y: 110, width: 20, height: 20, collected: false, value: 750 },
            { x: 1590, y: 310, width: 20, height: 20, collected: false, value: 600 },
            { x: 1820, y: 440, width: 20, height: 20, collected: false, value: 400 },
            { x: 1960, y: 410, width: 20, height: 20, collected: false, value: 450 },
            { x: 2080, y: 380, width: 20, height: 20, collected: false, value: 450 },
            { x: 2200, y: 350, width: 20, height: 20, collected: false, value: 500 },
            { x: 2320, y: 320, width: 20, height: 20, collected: false, value: 500 },
            { x: 2440, y: 290, width: 20, height: 20, collected: false, value: 550 },
            { x: 2560, y: 260, width: 20, height: 20, collected: false, value: 550 },
            { x: 2690, y: 230, width: 20, height: 20, collected: false, value: 600 },
            { x: 2820, y: 200, width: 20, height: 20, collected: false, value: 600 },
            { x: 2950, y: 170, width: 20, height: 20, collected: false, value: 650 },
            { x: 3090, y: 140, width: 20, height: 20, collected: false, value: 700 },
            { x: 3380, y: 280, width: 20, height: 20, collected: false, value: 650 },
            { x: 3640, y: 380, width: 20, height: 20, collected: false, value: 550 },
            { x: 3790, y: 440, width: 20, height: 20, collected: false, value: 500 },
            { x: 3980, y: 460, width: 20, height: 20, collected: false, value: 800 }
        ]
    },
    8: {
        name: "Rope Master",
        width: 4400,
        platforms: [
            { x: 20, y: 500, width: 100, height: 20, color: '#4A90E2' },
            { x: 170, y: 450, width: 80, height: 20, color: '#4A90E2' },
            { x: 320, y: 400, width: 80, height: 20, color: '#4A90E2' },
            { x: 470, y: 350, width: 80, height: 20, color: '#4A90E2' },
            { x: 620, y: 300, width: 80, height: 20, color: '#4A90E2' },
            { x: 900, y: 300, width: 100, height: 20, color: '#4A90E2' },
            { x: 1180, y: 300, width: 100, height: 20, color: '#4A90E2' },
            { x: 1460, y: 300, width: 100, height: 20, color: '#4A90E2' },
            { x: 1740, y: 300, width: 100, height: 20, color: '#4A90E2' },
            { x: 2020, y: 250, width: 100, height: 20, color: '#4A90E2' },
            { x: 2340, y: 250, width: 100, height: 20, color: '#4A90E2' },
            { x: 2660, y: 250, width: 100, height: 20, color: '#4A90E2' },
            { x: 2860, y: 400, width: 90, height: 20, color: '#4A90E2' },
            { x: 3020, y: 450, width: 90, height: 20, color: '#4A90E2' },
            { x: 3180, y: 480, width: 90, height: 20, color: '#4A90E2' },
            { x: 3340, y: 500, width: 90, height: 20, color: '#4A90E2' },
            { x: 3500, y: 350, width: 100, height: 20, color: '#4A90E2' },
            { x: 3760, y: 350, width: 100, height: 20, color: '#4A90E2' },
            { x: 3910, y: 450, width: 100, height: 20, color: '#4A90E2' },
            { x: 4060, y: 500, width: 200, height: 20, color: '#50C878' }
        ],
        fans: [
            { x: 3020, y: 250, width: 60, height: 200, power: 2.5, active: true },
            { x: 3180, y: 250, width: 60, height: 230, power: 2.5, active: true }
        ],
        ladders: [
            { x: 90, y: 420, width: 30, height: 80 },
            { x: 640, y: 320, width: 30, height: 200 },
            { x: 2680, y: 270, width: 30, height: 250 },
            { x: 3520, y: 370, width: 30, height: 150 }
        ],
        ropes: [
            { x: 700, y: 300, width: 200, height: 5 },
            { x: 1000, y: 300, width: 180, height: 5 },
            { x: 1280, y: 300, width: 180, height: 5 },
            { x: 1560, y: 300, width: 180, height: 5 },
            { x: 1840, y: 280, width: 180, height: 5 },
            { x: 2120, y: 250, width: 220, height: 5 },
            { x: 2440, y: 250, width: 220, height: 5 },
            { x: 3600, y: 350, width: 160, height: 5 }
        ],
        coins: [
            { x: 200, y: 410, width: 20, height: 20, collected: false, value: 400 },
            { x: 350, y: 360, width: 20, height: 20, collected: false, value: 450 },
            { x: 500, y: 310, width: 20, height: 20, collected: false, value: 500 },
            { x: 650, y: 260, width: 20, height: 20, collected: false, value: 550 },
            { x: 800, y: 270, width: 20, height: 20, collected: false, value: 600 },
            { x: 1000, y: 270, width: 20, height: 20, collected: false, value: 650 },
            { x: 1090, y: 260, width: 20, height: 20, collected: false, value: 650 },
            { x: 1280, y: 270, width: 20, height: 20, collected: false, value: 650 },
            { x: 1370, y: 260, width: 20, height: 20, collected: false, value: 650 },
            { x: 1560, y: 270, width: 20, height: 20, collected: false, value: 650 },
            { x: 1650, y: 260, width: 20, height: 20, collected: false, value: 650 },
            { x: 1840, y: 250, width: 20, height: 20, collected: false, value: 700 },
            { x: 1930, y: 240, width: 20, height: 20, collected: false, value: 700 },
            { x: 2120, y: 220, width: 20, height: 20, collected: false, value: 750 },
            { x: 2230, y: 210, width: 20, height: 20, collected: false, value: 750 },
            { x: 2440, y: 220, width: 20, height: 20, collected: false, value: 750 },
            { x: 2550, y: 210, width: 20, height: 20, collected: false, value: 750 },
            { x: 2710, y: 210, width: 20, height: 20, collected: false, value: 800 },
            { x: 2890, y: 360, width: 20, height: 20, collected: false, value: 600 },
            { x: 3050, y: 410, width: 20, height: 20, collected: false, value: 550 },
            { x: 3210, y: 440, width: 20, height: 20, collected: false, value: 500 },
            { x: 3370, y: 460, width: 20, height: 20, collected: false, value: 500 },
            { x: 3680, y: 310, width: 20, height: 20, collected: false, value: 700 },
            { x: 3940, y: 410, width: 20, height: 20, collected: false, value: 650 },
            { x: 4140, y: 460, width: 20, height: 20, collected: false, value: 900 }
        ]
    },
    9: {
        name: "Precision Paradise",
        width: 4600,
        platforms: [
            { x: 20, y: 500, width: 80, height: 20, color: '#4A90E2' },
            { x: 150, y: 480, width: 40, height: 20, color: '#4A90E2' },
            { x: 240, y: 460, width: 38, height: 20, color: '#4A90E2' },
            { x: 328, y: 440, width: 36, height: 20, color: '#4A90E2' },
            { x: 414, y: 420, width: 35, height: 20, color: '#4A90E2' },
            { x: 499, y: 400, width: 35, height: 20, color: '#4A90E2' },
            { x: 584, y: 380, width: 35, height: 20, color: '#4A90E2' },
            { x: 669, y: 360, width: 35, height: 20, color: '#4A90E2' },
            { x: 754, y: 340, width: 36, height: 20, color: '#4A90E2' },
            { x: 840, y: 320, width: 38, height: 20, color: '#4A90E2' },
            { x: 928, y: 300, width: 40, height: 20, color: '#4A90E2' },
            { x: 1018, y: 280, width: 42, height: 20, color: '#4A90E2' },
            { x: 1110, y: 260, width: 45, height: 20, color: '#4A90E2' },
            { x: 1205, y: 240, width: 50, height: 20, color: '#4A90E2' },
            { x: 1305, y: 220, width: 55, height: 20, color: '#4A90E2' },
            { x: 1410, y: 200, width: 60, height: 20, color: '#4A90E2' },
            { x: 1520, y: 180, width: 65, height: 20, color: '#4A90E2' },
            { x: 1635, y: 160, width: 70, height: 20, color: '#4A90E2' },
            { x: 1755, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 1905, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 2055, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 1900, y: 220, width: 90, height: 20, color: '#4A90E2' },
            { x: 2120, y: 200, width: 90, height: 20, color: '#4A90E2' },
            { x: 2340, y: 180, width: 90, height: 20, color: '#4A90E2' },
            { x: 2560, y: 200, width: 90, height: 20, color: '#4A90E2' },
            { x: 2780, y: 220, width: 90, height: 20, color: '#4A90E2' },
            { x: 2950, y: 340, width: 80, height: 20, color: '#4A90E2' },
            { x: 3100, y: 380, width: 75, height: 20, color: '#4A90E2' },
            { x: 3245, y: 420, width: 70, height: 20, color: '#4A90E2' },
            { x: 3385, y: 460, width: 65, height: 20, color: '#4A90E2' },
            { x: 3520, y: 490, width: 60, height: 20, color: '#4A90E2' },
            { x: 3650, y: 510, width: 55, height: 20, color: '#4A90E2' },
            { x: 3775, y: 490, width: 55, height: 20, color: '#4A90E2' },
            { x: 3900, y: 460, width: 60, height: 20, color: '#4A90E2' },
            { x: 4030, y: 420, width: 65, height: 20, color: '#4A90E2' },
            { x: 4165, y: 460, width: 70, height: 20, color: '#4A90E2' },
            { x: 4305, y: 500, width: 150, height: 20, color: '#50C878' }
        ],
        fans: [
            { x: 1775, y: 280, width: 60, height: 240, power: 4.5, active: true },
            { x: 1925, y: 280, width: 60, height: 240, power: 4.5, active: true },
            { x: 2075, y: 280, width: 60, height: 240, power: 4.5, active: true }
        ],
        ladders: [
            { x: 100, y: 420, width: 30, height: 80 },
            { x: 1540, y: 200, width: 30, height: 320 },
            { x: 1920, y: 240, width: 30, height: 280 },
            { x: 2970, y: 360, width: 30, height: 160 }
        ],
        ropes: [
            { x: 2010, y: 220, width: 110, height: 5 },
            { x: 2230, y: 200, width: 110, height: 5 },
            { x: 2450, y: 180, width: 110, height: 5 },
            { x: 2670, y: 200, width: 110, height: 5 }
        ],
        coins: [
            { x: 180, y: 440, width: 20, height: 20, collected: false, value: 450 },
            { x: 270, y: 420, width: 20, height: 20, collected: false, value: 500 },
            { x: 358, y: 400, width: 20, height: 20, collected: false, value: 550 },
            { x: 444, y: 380, width: 20, height: 20, collected: false, value: 600 },
            { x: 529, y: 360, width: 20, height: 20, collected: false, value: 650 },
            { x: 614, y: 340, width: 20, height: 20, collected: false, value: 700 },
            { x: 699, y: 320, width: 20, height: 20, collected: false, value: 750 },
            { x: 784, y: 300, width: 20, height: 20, collected: false, value: 800 },
            { x: 870, y: 280, width: 20, height: 20, collected: false, value: 850 },
            { x: 958, y: 260, width: 20, height: 20, collected: false, value: 900 },
            { x: 1048, y: 240, width: 20, height: 20, collected: false, value: 950 },
            { x: 1140, y: 220, width: 20, height: 20, collected: false, value: 1000 },
            { x: 1235, y: 200, width: 20, height: 20, collected: false, value: 1050 },
            { x: 1335, y: 180, width: 20, height: 20, collected: false, value: 1100 },
            { x: 1440, y: 160, width: 20, height: 20, collected: false, value: 1150 },
            { x: 1550, y: 140, width: 20, height: 20, collected: false, value: 1200 },
            { x: 1665, y: 120, width: 20, height: 20, collected: false, value: 1250 },
            { x: 1950, y: 180, width: 20, height: 20, collected: false, value: 1000 },
            { x: 2060, y: 180, width: 20, height: 20, collected: false, value: 1000 },
            { x: 2170, y: 160, width: 20, height: 20, collected: false, value: 1100 },
            { x: 2390, y: 140, width: 20, height: 20, collected: false, value: 1200 },
            { x: 2610, y: 160, width: 20, height: 20, collected: false, value: 1100 },
            { x: 2830, y: 180, width: 20, height: 20, collected: false, value: 1000 },
            { x: 2980, y: 300, width: 20, height: 20, collected: false, value: 900 },
            { x: 3130, y: 340, width: 20, height: 20, collected: false, value: 800 },
            { x: 3275, y: 380, width: 20, height: 20, collected: false, value: 700 },
            { x: 3415, y: 420, width: 20, height: 20, collected: false, value: 650 },
            { x: 3550, y: 450, width: 20, height: 20, collected: false, value: 600 },
            { x: 3805, y: 450, width: 20, height: 20, collected: false, value: 700 },
            { x: 3930, y: 420, width: 20, height: 20, collected: false, value: 750 },
            { x: 4060, y: 380, width: 20, height: 20, collected: false, value: 800 },
            { x: 4370, y: 460, width: 20, height: 20, collected: false, value: 1000 }
        ]
    },
    10: {
        name: "Ultimate Challenge",
        width: 5000,
        platforms: [
            { x: 20, y: 500, width: 100, height: 20, color: '#4A90E2' },
            { x: 170, y: 470, width: 45, height: 20, color: '#4A90E2' },
            { x: 265, y: 440, width: 40, height: 20, color: '#4A90E2' },
            { x: 355, y: 410, width: 38, height: 20, color: '#4A90E2' },
            { x: 443, y: 380, width: 36, height: 20, color: '#4A90E2' },
            { x: 529, y: 350, width: 35, height: 20, color: '#4A90E2' },
            { x: 614, y: 320, width: 35, height: 20, color: '#4A90E2' },
            { x: 699, y: 290, width: 35, height: 20, color: '#4A90E2' },
            { x: 784, y: 260, width: 36, height: 20, color: '#4A90E2' },
            { x: 870, y: 230, width: 38, height: 20, color: '#4A90E2' },
            { x: 958, y: 200, width: 40, height: 20, color: '#4A90E2' },
            { x: 1048, y: 170, width: 45, height: 20, color: '#4A90E2' },
            { x: 1143, y: 140, width: 50, height: 20, color: '#4A90E2' },
            { x: 1300, y: 520, width: 70, height: 20, color: '#4A90E2' },
            { x: 1440, y: 520, width: 70, height: 20, color: '#4A90E2' },
            { x: 1580, y: 520, width: 70, height: 20, color: '#4A90E2' },
            { x: 1720, y: 520, width: 70, height: 20, color: '#4A90E2' },
            { x: 1860, y: 520, width: 70, height: 20, color: '#4A90E2' },
            { x: 2000, y: 520, width: 70, height: 20, color: '#4A90E2' },
            { x: 1400, y: 200, width: 90, height: 20, color: '#4A90E2' },
            { x: 1620, y: 180, width: 90, height: 20, color: '#4A90E2' },
            { x: 1840, y: 160, width: 90, height: 20, color: '#4A90E2' },
            { x: 2060, y: 140, width: 90, height: 20, color: '#4A90E2' },
            { x: 2280, y: 160, width: 90, height: 20, color: '#4A90E2' },
            { x: 2500, y: 180, width: 90, height: 20, color: '#4A90E2' },
            { x: 2720, y: 200, width: 90, height: 20, color: '#4A90E2' },
            { x: 2870, y: 350, width: 80, height: 20, color: '#4A90E2' },
            { x: 3020, y: 400, width: 75, height: 20, color: '#4A90E2' },
            { x: 3165, y: 440, width: 70, height: 20, color: '#4A90E2' },
            { x: 3305, y: 470, width: 70, height: 20, color: '#4A90E2' },
            { x: 3445, y: 490, width: 70, height: 20, color: '#4A90E2' },
            { x: 3585, y: 510, width: 70, height: 20, color: '#4A90E2' },
            { x: 3725, y: 520, width: 80, height: 20, color: '#4A90E2' },
            { x: 3875, y: 480, width: 75, height: 20, color: '#4A90E2' },
            { x: 4020, y: 440, width: 70, height: 20, color: '#4A90E2' },
            { x: 4160, y: 400, width: 65, height: 20, color: '#4A90E2' },
            { x: 4295, y: 360, width: 60, height: 20, color: '#4A90E2' },
            { x: 4425, y: 320, width: 55, height: 20, color: '#4A90E2' },
            { x: 4550, y: 360, width: 65, height: 20, color: '#4A90E2' },
            { x: 4685, y: 420, width: 75, height: 20, color: '#4A90E2' },
            { x: 4830, y: 500, width: 170, height: 20, color: '#50C878' }
        ],
        fans: [
            { x: 1320, y: 280, width: 50, height: 240, power: 5, active: true },
            { x: 1460, y: 280, width: 50, height: 240, power: 5, active: true },
            { x: 1600, y: 280, width: 50, height: 240, power: 5, active: true },
            { x: 1740, y: 280, width: 50, height: 240, power: 5, active: true },
            { x: 1880, y: 280, width: 50, height: 240, power: 5, active: true },
            { x: 2020, y: 280, width: 50, height: 240, power: 5, active: true }
        ],
        ladders: [
            { x: 100, y: 420, width: 30, height: 80 },
            { x: 1163, y: 160, width: 30, height: 360 },
            { x: 1420, y: 220, width: 30, height: 300 },
            { x: 2890, y: 370, width: 30, height: 150 },
            { x: 4305, y: 380, width: 30, height: 140 }
        ],
        ropes: [
            { x: 1500, y: 200, width: 120, height: 5 },
            { x: 1730, y: 180, width: 110, height: 5 },
            { x: 1950, y: 160, width: 110, height: 5 },
            { x: 2170, y: 140, width: 110, height: 5 },
            { x: 2390, y: 160, width: 110, height: 5 },
            { x: 2610, y: 180, width: 110, height: 5 }
        ],
        coins: [
            { x: 200, y: 430, width: 20, height: 20, collected: false, value: 500 },
            { x: 295, y: 400, width: 20, height: 20, collected: false, value: 550 },
            { x: 385, y: 370, width: 20, height: 20, collected: false, value: 600 },
            { x: 473, y: 340, width: 20, height: 20, collected: false, value: 650 },
            { x: 559, y: 310, width: 20, height: 20, collected: false, value: 700 },
            { x: 644, y: 280, width: 20, height: 20, collected: false, value: 750 },
            { x: 729, y: 250, width: 20, height: 20, collected: false, value: 800 },
            { x: 814, y: 220, width: 20, height: 20, collected: false, value: 850 },
            { x: 900, y: 190, width: 20, height: 20, collected: false, value: 900 },
            { x: 988, y: 160, width: 20, height: 20, collected: false, value: 950 },
            { x: 1078, y: 130, width: 20, height: 20, collected: false, value: 1000 },
            { x: 1173, y: 100, width: 20, height: 20, collected: false, value: 1200 },
            { x: 1360, y: 160, width: 20, height: 20, collected: false, value: 1000 },
            { x: 1470, y: 160, width: 20, height: 20, collected: false, value: 1000 },
            { x: 1610, y: 160, width: 20, height: 20, collected: false, value: 1000 },
            { x: 1750, y: 160, width: 20, height: 20, collected: false, value: 1000 },
            { x: 1890, y: 160, width: 20, height: 20, collected: false, value: 1000 },
            { x: 1450, y: 160, width: 20, height: 20, collected: false, value: 1100 },
            { x: 1670, y: 140, width: 20, height: 20, collected: false, value: 1200 },
            { x: 1890, y: 120, width: 20, height: 20, collected: false, value: 1300 },
            { x: 2110, y: 100, width: 20, height: 20, collected: false, value: 1400 },
            { x: 2330, y: 120, width: 20, height: 20, collected: false, value: 1300 },
            { x: 2550, y: 140, width: 20, height: 20, collected: false, value: 1200 },
            { x: 2770, y: 160, width: 20, height: 20, collected: false, value: 1100 },
            { x: 2900, y: 310, width: 20, height: 20, collected: false, value: 1000 },
            { x: 3050, y: 360, width: 20, height: 20, collected: false, value: 900 },
            { x: 3195, y: 400, width: 20, height: 20, collected: false, value: 850 },
            { x: 3335, y: 430, width: 20, height: 20, collected: false, value: 800 },
            { x: 3475, y: 450, width: 20, height: 20, collected: false, value: 750 },
            { x: 3615, y: 470, width: 20, height: 20, collected: false, value: 700 },
            { x: 3755, y: 480, width: 20, height: 20, collected: false, value: 750 },
            { x: 3905, y: 440, width: 20, height: 20, collected: false, value: 800 },
            { x: 4050, y: 400, width: 20, height: 20, collected: false, value: 850 },
            { x: 4190, y: 360, width: 20, height: 20, collected: false, value: 900 },
            { x: 4325, y: 320, width: 20, height: 20, collected: false, value: 950 },
            { x: 4455, y: 280, width: 20, height: 20, collected: false, value: 1000 },
            { x: 4580, y: 320, width: 20, height: 20, collected: false, value: 1050 },
            { x: 4715, y: 380, width: 20, height: 20, collected: false, value: 1100 },
            { x: 4900, y: 460, width: 20, height: 20, collected: false, value: 1500 }
        ]
    }
};

// Current level data (will be set by loadLevel)
let platforms = [];
let fans = [];
let ladders = [];
let ropes = [];
let coins = [];
let currentLevelWidth = 3000;

// Event Listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    keys[e.code] = true;
    
    // Shop toggle
    if (e.key === 's' || e.key === 'S') {
        toggleShop();
    }
    
    // Restart
    if (e.key === 'r' || e.key === 'R') {
        restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    keys[e.code] = false;
});

// Shop Buttons
document.getElementById('buyJumpCoil').addEventListener('click', () => buyItem('jump'));
document.getElementById('buySpeedCoil').addEventListener('click', () => buyItem('speed'));
document.getElementById('buyDoubleJump').addEventListener('click', () => buyItem('doubleJump'));
document.getElementById('buyMagnet').addEventListener('click', () => buyItem('magnet'));
document.getElementById('buyShield').addEventListener('click', () => buyItem('shield'));
document.getElementById('closeShop').addEventListener('click', toggleShop);
document.getElementById('playAgain').addEventListener('click', nextLevelOrRestart);

// Shop scroll arrows
document.getElementById('shopScrollLeft').addEventListener('click', () => {
    document.getElementById('shopItemsRow').scrollBy({ left: -210, behavior: 'smooth' });
});
document.getElementById('shopScrollRight').addEventListener('click', () => {
    document.getElementById('shopItemsRow').scrollBy({ left: 210, behavior: 'smooth' });
});

// Game Functions
function loadLevel(levelNum) {
    const level = levels[levelNum];
    if (!level) return;
    
    // Deep copy level data
    platforms = JSON.parse(JSON.stringify(level.platforms));
    fans = JSON.parse(JSON.stringify(level.fans));
    ladders = JSON.parse(JSON.stringify(level.ladders));
    ropes = JSON.parse(JSON.stringify(level.ropes));
    coins = JSON.parse(JSON.stringify(level.coins));
    currentLevelWidth = level.width || 3000;
    
    // Reset player position
    player.x = 50;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
    
    // Reset camera
    camera.x = 0;
    camera.y = 0;
    
    // Update UI
    updateUI();
}

function update() {
    if (!gameState.gameRunning || gameState.shopOpen) return;
    
    // Apply gravity
    if (!player.onLadder) {
        player.velocityY += player.gravity;
    }
    
    // Check if player is on ladder
    player.onLadder = false;
    for (let ladder of ladders) {
        if (player.x + player.width > ladder.x &&
            player.x < ladder.x + ladder.width &&
            player.y + player.height > ladder.y &&
            player.y < ladder.y + ladder.height) {
            player.onLadder = true;
            break;
        }
    }
    
    // Check if player is on rope
    player.onRope = false;
    for (let rope of ropes) {
        if (player.x + player.width > rope.x &&
            player.x < rope.x + rope.width &&
            Math.abs((player.y + player.height) - rope.y) < 5 &&
            player.velocityY >= 0) {
            player.onRope = true;
            player.y = rope.y - player.height;
            player.velocityY = 0;
            player.onGround = true;
            break;
        }
    }
    
    // Movement controls
    const currentSpeed = player.speed + (gameState.speedCoils * 2);
    
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.velocityX = -currentSpeed;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.velocityX = currentSpeed;
    } else {
        player.velocityX *= 0.8; // Friction
    }
    
    // Ladder climbing
    if (player.onLadder) {
        player.velocityY = 0;
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            player.velocityY = -5;
        } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            player.velocityY = 5;
        }
    }
    
    // Jump (including double jump)
    const currentJumpPower = player.jumpPower + (gameState.jumpCoils * 3);
    if ((keys[' '] || keys['Space'] || keys['ArrowUp']) && !player.onLadder) {
        if (player.onGround || player.onRope) {
            player.velocityY = -currentJumpPower;
            player.onGround = false;
            gameState.hasUsedDoubleJump = false;
        } else if (gameState.doubleJumps > 0 && !gameState.hasUsedDoubleJump) {
            // Check if jump key was just pressed (not held)
            if (!keys['lastJumpState']) {
                player.velocityY = -currentJumpPower * 0.9; // Slightly weaker double jump
                gameState.hasUsedDoubleJump = true;
            }
        }
    }
    
    // Track jump key state for double jump
    keys['lastJumpState'] = keys[' '] || keys['Space'] || keys['ArrowUp'];
    
    // Fan effect
    for (let fan of fans) {
        if (player.x + player.width > fan.x &&
            player.x < fan.x + fan.width &&
            player.y + player.height > fan.y &&
            player.y < fan.y + fan.height) {
            player.velocityY -= fan.power;
        }
    }
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Platform collision
    player.onGround = false;
    for (let platform of platforms) {
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height &&
            player.velocityY >= 0) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.onGround = true;
            gameState.hasUsedDoubleJump = false; // Reset double jump when landing
        }
    }
    
    // Coin collection (with magnet support)
    const magnetRange = gameState.magnets > 0 ? 50 * gameState.magnets : 0;
    for (let coin of coins) {
        if (!coin.collected) {
            const distX = Math.abs((player.x + player.width / 2) - (coin.x + coin.width / 2));
            const distY = Math.abs((player.y + player.height / 2) - (coin.y + coin.height / 2));
            const collectRange = 20 + magnetRange;
            
            if (distX < collectRange && distY < collectRange) {
                coin.collected = true;
                gameState.coins += coin.value;
                updateUI();
            }
        }
    }
    
    // Boundary checks
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > currentLevelWidth) player.x = currentLevelWidth - player.width;
    if (player.y > canvas.height) {
        // Fell off - check for shield
        if (gameState.shields > 0) {
            gameState.shields--;
            updateUI();
            alert('🛡️ Shield saved you from falling!');
        }
        // Respawn
        player.x = 50;
        player.y = 400;
        player.velocityX = 0;
        player.velocityY = 0;
        camera.x = 0;
    }
    
    // Update camera to follow player
    camera.x = player.x - canvas.width / 3;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > currentLevelWidth - canvas.width) {
        camera.x = currentLevelWidth - canvas.width;
    }
    
    // Win condition - reach near the end of the level
    const finishZone = currentLevelWidth - 300;
    if (player.x > finishZone && player.y > 400) {
        winGame();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB'; // Sky blue background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save context for camera transform
    ctx.save();
    ctx.translate(-camera.x, 0);
    
    // Draw ground (extended for full level)
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, 520, currentLevelWidth, 80);
    
    // Draw platforms
    for (let platform of platforms) {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Platform shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 5);
    }
    
    // Draw fans
    for (let fan of fans) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(fan.x, fan.y, fan.width, fan.height);
        ctx.fillStyle = '#333';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🌀', fan.x + fan.width / 2, fan.y + 70);
        
        // Draw wind lines
        const time = Date.now() / 100;
        for (let i = 0; i < 5; i++) {
            const offset = (time + i * 20) % 200;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(fan.x + 10, fan.y - offset);
            ctx.lineTo(fan.x + fan.width - 10, fan.y - offset - 20);
            ctx.stroke();
        }
    }
    
    // Draw ladders
    for (let ladder of ladders) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(ladder.x, ladder.y, ladder.width, ladder.height);
        
        // Ladder rungs
        ctx.fillStyle = '#654321';
        for (let i = 0; i < ladder.height; i += 30) {
            ctx.fillRect(ladder.x, ladder.y + i, ladder.width, 5);
        }
    }
    
    // Draw ropes
    for (let rope of ropes) {
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(rope.x, rope.y);
        ctx.lineTo(rope.x + rope.width, rope.y);
        ctx.stroke();
        
        // Rope texture
        for (let i = 0; i < rope.width; i += 20) {
            ctx.fillStyle = '#654321';
            ctx.fillRect(rope.x + i, rope.y - 2, 3, 4);
        }
    }
    
    // Draw coins
    for (let coin of coins) {
        if (!coin.collected) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Coin shine
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width / 2 - 3, coin.y + coin.height / 2 - 3, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player face
    ctx.fillStyle = '#FFF';
    ctx.fillRect(player.x + 8, player.y + 10, 5, 5); // Left eye
    ctx.fillRect(player.x + 17, player.y + 10, 5, 5); // Right eye
    
    // Player smile
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x + 15, player.y + 25, 8, 0, Math.PI);
    ctx.stroke();
    
    // Draw start indicator (only at beginning)
    if (camera.x < 200) {
        ctx.fillStyle = '#50C878';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('START ➡️', 30, 490);
    }
    
    // Draw finish indicator (only near end)
    const finishX = currentLevelWidth - 200;
    if (camera.x + canvas.width > finishX) {
        ctx.fillStyle = '#FFD700';
        ctx.font = '20px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('🏁 FINISH', currentLevelWidth - 20, 490);
    }
    
    // Restore context
    ctx.restore();
    
    // Draw UI elements (not affected by camera)
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${gameState.currentLevel}: ${levels[gameState.currentLevel].name}`, canvas.width / 2, 30);
    ctx.shadowBlur = 0;
    
    // Progress bar
    const progress = Math.min(player.x / (currentLevelWidth - canvas.width), 1);
    const barWidth = canvas.width - 40;
    const barX = 20;
    const barY = canvas.height - 12;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(barX, barY, barWidth, 8);
    ctx.fillStyle = '#50C878';
    ctx.fillRect(barX, barY, barWidth * progress, 8);
    ctx.fillStyle = '#FFD700';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(progress * 100)}%`, canvas.width - 20, barY - 2);
    ctx.textAlign = 'left';
    ctx.fillText('Progress:', barX, barY - 2);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function updateUI() {
    document.getElementById('coins').textContent = gameState.coins;
    document.getElementById('jumpCoils').textContent = gameState.jumpCoils;
    document.getElementById('speedCoils').textContent = gameState.speedCoils;
    document.getElementById('doubleJumps').textContent = gameState.doubleJumps;
    document.getElementById('magnets').textContent = gameState.magnets;
    document.getElementById('shields').textContent = gameState.shields;
    document.getElementById('currentLevel').textContent = gameState.currentLevel;
    document.getElementById('totalLevels').textContent = gameState.totalLevels;
}

function toggleShop() {
    gameState.shopOpen = !gameState.shopOpen;
    const shopElement = document.getElementById('shop');
    if (gameState.shopOpen) {
        shopElement.classList.remove('hidden');
    } else {
        shopElement.classList.add('hidden');
    }
}

function buyItem(type) {
    if (type === 'jump') {
        if (gameState.coins >= 600) {
            gameState.coins -= 600;
            gameState.jumpCoils += 1;
            updateUI();
            alert('🎉 Jump Coil purchased! You can now jump higher!');
        } else {
            alert('❌ Not enough coins! You need $600.');
        }
    } else if (type === 'speed') {
        if (gameState.coins >= 700) {
            gameState.coins -= 700;
            gameState.speedCoils += 1;
            updateUI();
            alert('🎉 Speed Coil purchased! You can now move faster!');
        } else {
            alert('❌ Not enough coins! You need $700.');
        }
    } else if (type === 'doubleJump') {
        if (gameState.coins >= 1000) {
            gameState.coins -= 1000;
            gameState.doubleJumps += 1;
            updateUI();
            alert('🎉 Double Jump purchased! Press jump again in mid-air!');
        } else {
            alert('❌ Not enough coins! You need $1000.');
        }
    } else if (type === 'magnet') {
        if (gameState.coins >= 800) {
            gameState.coins -= 800;
            gameState.magnets += 1;
            updateUI();
            alert('🎉 Coin Magnet purchased! Coins are collected from farther away!');
        } else {
            alert('❌ Not enough coins! You need $800.');
        }
    } else if (type === 'shield') {
        if (gameState.coins >= 1200) {
            gameState.coins -= 1200;
            gameState.shields += 1;
            updateUI();
            alert('🎉 Shield purchased! You can survive one fall!');
        } else {
            alert('❌ Not enough coins! You need $1200.');
        }
    }
}

function restartGame() {
    // Reset player
    player.x = 50;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
    
    // Keep purchased items but reset to level 1
    gameState.currentLevel = 1;
    gameState.gameRunning = true;
    gameState.shopOpen = false;
    
    // Load level 1
    loadLevel(1);
    
    document.getElementById('shop').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
}

function winGame() {
    gameState.gameRunning = false;
    
    // Check if there's a next level
    if (gameState.currentLevel < gameState.totalLevels) {
        // Show level complete screen
        document.getElementById('gameOverTitle').textContent = `🎉 LEVEL ${gameState.currentLevel} COMPLETE! 🎉`;
        document.getElementById('gameOverMessage').textContent = 'Great job! Ready for the next level?';
        document.getElementById('finalCoins').textContent = gameState.coins;
        document.getElementById('playAgain').textContent = 'Next Level ➡️';
        document.getElementById('gameOver').classList.remove('hidden');
    } else {
        // Beat all levels!
        document.getElementById('gameOverTitle').textContent = '🏆 ALL LEVELS COMPLETE! 🏆';
        document.getElementById('gameOverMessage').textContent = 'Congratulations! You beat all the levels!';
        document.getElementById('finalCoins').textContent = gameState.coins;
        document.getElementById('playAgain').textContent = 'Play Again (R)';
        document.getElementById('gameOver').classList.remove('hidden');
    }
}

function nextLevelOrRestart() {
    document.getElementById('gameOver').classList.add('hidden');
    
    if (gameState.currentLevel < gameState.totalLevels) {
        // Go to next level
        gameState.currentLevel++;
        gameState.gameRunning = true;
        loadLevel(gameState.currentLevel);
    } else {
        // Restart from level 1
        restartGame();
    }
}

// Start the game
loadLevel(1);
updateUI();
gameLoop();

// Touch Controls
(function setupTouchControls() {
    const touchJumpBtn = document.getElementById('touch-jump-btn');
    const joystickBase = document.getElementById('joystick-base');
    const joystickKnob = document.getElementById('joystick-knob');
    const touchShopBtn = document.getElementById('touch-shop-btn');
    const touchRestartBtn = document.getElementById('touch-restart-btn');

    // Jump button
    touchJumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys[' '] = true;
        keys['Space'] = true;
        touchJumpBtn.classList.add('pressed');
    }, { passive: false });

    touchJumpBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys[' '] = false;
        keys['Space'] = false;
        touchJumpBtn.classList.remove('pressed');
    }, { passive: false });

    touchJumpBtn.addEventListener('touchcancel', () => {
        keys[' '] = false;
        keys['Space'] = false;
        touchJumpBtn.classList.remove('pressed');
    });

    // Joystick
    let joystickTouchId = null;
    let joystickCenterX = 0;
    const maxKnobOffset = 38;

    joystickBase.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (joystickTouchId !== null) return;
        const touch = e.changedTouches[0];
        joystickTouchId = touch.identifier;
        const rect = joystickBase.getBoundingClientRect();
        joystickCenterX = rect.left + rect.width / 2;
    }, { passive: false });

    joystickBase.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === joystickTouchId) {
                const dx = touch.clientX - joystickCenterX;
                keys['ArrowLeft'] = dx < -15;
                keys['ArrowRight'] = dx > 15;
                const clampedDx = Math.max(-maxKnobOffset, Math.min(maxKnobOffset, dx));
                joystickKnob.style.transform = `translate(calc(-50% + ${clampedDx}px), -50%)`;
                break;
            }
        }
    }, { passive: false });

    function resetJoystick() {
        keys['ArrowLeft'] = false;
        keys['ArrowRight'] = false;
        joystickKnob.style.transform = 'translate(-50%, -50%)';
        joystickTouchId = null;
    }

    joystickBase.addEventListener('touchend', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === joystickTouchId) {
                resetJoystick();
                break;
            }
        }
    }, { passive: false });

    joystickBase.addEventListener('touchcancel', resetJoystick);

    // Shop and Restart buttons
    touchShopBtn.addEventListener('click', toggleShop);
    touchRestartBtn.addEventListener('click', restartGame);
    touchShopBtn.addEventListener('touchstart', (e) => { e.preventDefault(); toggleShop(); }, { passive: false });
    touchRestartBtn.addEventListener('touchstart', (e) => { e.preventDefault(); restartGame(); }, { passive: false });
})();
