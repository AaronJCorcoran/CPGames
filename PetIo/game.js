// ========================
// PET.IO - game.js
// ========================

// ---- PET DEFINITIONS (32 pets) ----
const PETS = [
    { emoji: '🐛', name: 'Worm' },
    { emoji: '🐌', name: 'Snail' },
    { emoji: '🪲', name: 'Beetle' },
    { emoji: '🐜', name: 'Ant' },
    { emoji: '🦗', name: 'Cricket' },
    { emoji: '🐸', name: 'Frog' },
    { emoji: '🐁', name: 'Mouse' },
    { emoji: '🐹', name: 'Hamster' },
    { emoji: '🐇', name: 'Rabbit' },
    { emoji: '🐿️', name: 'Chipmunk' },
    { emoji: '🦔', name: 'Hedgehog' },
    { emoji: '🐱', name: 'Cat' },
    { emoji: '🐶', name: 'Dog' },
    { emoji: '🦊', name: 'Fox' },
    { emoji: '🐺', name: 'Wolf' },
    { emoji: '🐻', name: 'Bear' },
    { emoji: '🐼', name: 'Panda' },
    { emoji: '🦁', name: 'Lion' },
    { emoji: '🐯', name: 'Tiger' },
    { emoji: '🐴', name: 'Horse' },
    { emoji: '🦄', name: 'Unicorn' },
    { emoji: '🐉', name: 'Dragon' },
    { emoji: '🦅', name: 'Eagle' },
    { emoji: '🐋', name: 'Whale' },
    { emoji: '🦈', name: 'Shark' },
    { emoji: '🐘', name: 'Elephant' },
    { emoji: '🦏', name: 'Rhino' },
    { emoji: '🦩', name: 'Flamingo' },
    { emoji: '🦚', name: 'Peacock' },
    { emoji: '💎', name: 'Gem Pup' },
    { emoji: '👑', name: 'King Pet' },
    { emoji: '🌈', name: 'Rainbow' },
];

// Value: $10 × 2^index
function petValue(index) {
    return 10 * Math.pow(2, index);
}

// Rarity tier
function petRarity(index) {
    if (index <= 7) return 'common';
    if (index <= 15) return 'uncommon';
    if (index <= 23) return 'rare';
    if (index <= 27) return 'epic';
    if (index <= 30) return 'legendary';
    return 'mythic';
}

// ---- GAME STATE ----
let money = 0;
let luckLevel = 0;
let padMultipliers = [1, 1, 1, 1, 1];  // pads 0-4, each upgradeable to 10
let discovered = new Set();
let activePets = [];  // { petIndex, padIndex, progress, element }
let totalCollected = 0;

// ---- CONSTANTS ----
const SPAWN_MIN = 400;        // fastest spawn gap (ms)
const SPAWN_MAX = 6000;       // slowest spawn gap (ms)
const CROSS_TIME = 6000;      // ms to cross a lane
const BASE_RATE = 0.72;       // probability falloff per tier
const LUCK_BONUS = 0.006;     // rate increase per luck level
const MAX_LUCK = 30;
const MAX_PAD_MULT = 10;

// Base costs for each pad's first upgrade (1x→2x). Each subsequent level costs 3x more.
const PAD_MULT_BASE_COST = [500, 5000, 50000, 500000, 5000000]; // all 5 pads

function getPadUpgradeCost(padIndex) {
    const currentLevel = padMultipliers[padIndex]; // 1 means no upgrades yet
    if (currentLevel >= MAX_PAD_MULT) return Infinity;
    return PAD_MULT_BASE_COST[padIndex] * Math.pow(3, currentLevel - 1);
}

// ---- DOM REFS ----
const moneyDisplay = document.getElementById('money-display');
const padLanes = document.querySelectorAll('.pad-lane');
const collectors = document.querySelectorAll('.collector');
const luckBtn = document.getElementById('luck-btn');
const pad1Btn = document.getElementById('pad1-btn');
const pad2Btn = document.getElementById('pad2-btn');
const pad3Btn = document.getElementById('pad3-btn');
const pad4Btn = document.getElementById('pad4-btn');
const pad5Btn = document.getElementById('pad5-btn');
const petGrid = document.getElementById('pet-grid');
const discoveredCountEl = document.getElementById('discovered-count');

// ---- FORMAT MONEY ----
function formatMoney(n) {
    if (n >= 1e15) return '$' + (n / 1e15).toFixed(1) + 'Qa';
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(1) + 'T';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
    return '$' + Math.floor(n);
}

function formatCost(n) {
    return formatMoney(n).replace('$', '$');
}

// ---- PROBABILITY SYSTEM ----
function getSpawnRate() {
    return Math.min(0.95, BASE_RATE + luckLevel * LUCK_BONUS);
}

function getWeights() {
    const rate = getSpawnRate();
    return PETS.map((_, i) => Math.max(1, Math.floor(10000 * Math.pow(rate, i))));
}

function rollPet() {
    const weights = getWeights();
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return i;
    }
    return 0;
}

function getProbability(index) {
    const weights = getWeights();
    const total = weights.reduce((a, b) => a + b, 0);
    return (weights[index] / total) * 100;
}

// ---- SPAWN PET ----
function spawnPet() {
    const petIndex = rollPet();
    const padIndex = Math.floor(Math.random() * 5);
    const pet = PETS[petIndex];
    const rarity = petRarity(petIndex);

    // Create DOM element
    const el = document.createElement('div');
    el.className = `pet ${rarity}`;
    el.innerHTML = `<span class="pet-emoji">${pet.emoji}</span>`;
    el.style.left = '-30px';

    padLanes[padIndex].appendChild(el);

    activePets.push({
        petIndex,
        padIndex,
        progress: 0,
        element: el,
    });
}

// ---- COLLECT PET ----
function collectPet(petObj) {
    const baseVal = petValue(petObj.petIndex);
    const mult = padMultipliers[petObj.padIndex];
    const earned = baseVal * mult;

    money += earned;
    totalCollected++;

    // Track discovery
    if (!discovered.has(petObj.petIndex)) {
        discovered.add(petObj.petIndex);
        updateCollection();
    }

    // Money popup
    showMoneyPopup(petObj.padIndex, earned);

    // Collection animation
    petObj.element.classList.add('collecting');
    setTimeout(() => {
        if (petObj.element.parentNode) {
            petObj.element.parentNode.removeChild(petObj.element);
        }
    }, 300);

    // Pulse money display
    moneyDisplay.classList.add('pulse');
    setTimeout(() => moneyDisplay.classList.remove('pulse'), 150);
}

// ---- MONEY POPUP ----
function showMoneyPopup(padIndex, amount) {
    const pop = document.createElement('div');
    pop.className = 'money-pop';
    pop.textContent = '+' + formatMoney(amount);

    const collector = collectors[padIndex];
    collector.style.position = 'relative';
    collector.appendChild(pop);

    setTimeout(() => {
        if (pop.parentNode) pop.parentNode.removeChild(pop);
    }, 1200);
}

// ---- UPGRADE SYSTEM ----
function getLuckCost() {
    return 1000 * Math.pow(2, luckLevel);
}

function buyLuck() {
    const cost = getLuckCost();
    if (money < cost || luckLevel >= MAX_LUCK) return;
    money -= cost;
    luckLevel++;
    updateShop();
    updateHUD();
}

function buyPadMultiplier(padIndex) {
    const cost = getPadUpgradeCost(padIndex);
    if (money < cost || padMultipliers[padIndex] >= MAX_PAD_MULT) return;
    money -= cost;
    padMultipliers[padIndex]++;

    // Update pad label next to lane
    const label = document.getElementById('mult-' + padIndex);
    if (label) {
        label.textContent = padMultipliers[padIndex] + 'x';
        label.classList.add('active');
    }

    updateShop();
    updateHUD();
}

// ---- COLLECTION GRID ----
function buildCollection() {
    petGrid.innerHTML = '';
    for (let i = 0; i < PETS.length; i++) {
        const cell = document.createElement('div');
        const rarity = petRarity(i);
        cell.className = `pet-cell undiscovered rarity-${rarity}`;
        cell.dataset.index = i;
        cell.textContent = '?';

        // Tooltip
        const tip = document.createElement('div');
        tip.className = 'pet-tooltip';
        cell.appendChild(tip);

        cell.addEventListener('click', () => {
            // Toggle tooltip
            document.querySelectorAll('.pet-cell.show-tooltip').forEach(c => {
                if (c !== cell) c.classList.remove('show-tooltip');
            });
            cell.classList.toggle('show-tooltip');
        });

        petGrid.appendChild(cell);
    }
}

function updateCollection() {
    const cells = petGrid.querySelectorAll('.pet-cell');
    cells.forEach(cell => {
        const i = parseInt(cell.dataset.index);
        const rarity = petRarity(i);
        if (discovered.has(i)) {
            cell.classList.remove('undiscovered');
            cell.classList.add('discovered');
            cell.childNodes[0].textContent = PETS[i].emoji;

            const tip = cell.querySelector('.pet-tooltip');
            const prob = getProbability(i);
            tip.innerHTML = `<b>${PETS[i].name}</b><br>${formatMoney(petValue(i))}<br>${prob < 0.01 ? '<0.01' : prob.toFixed(2)}%`;
        } else {
            const tip = cell.querySelector('.pet-tooltip');
            tip.innerHTML = `<b>???</b><br>Undiscovered<br>${petRarity(i)}`;
        }
    });
    discoveredCountEl.textContent = discovered.size;
}

// ---- HUD ----
function updateHUD() {
    moneyDisplay.textContent = '💰 ' + formatMoney(money);
}

function updateShop() {
    // Luck button
    if (luckLevel >= MAX_LUCK) {
        luckBtn.querySelector('.btn-label').textContent = 'Luck MAX';
        luckBtn.querySelector('.btn-cost').textContent = 'Maxed!';
        luckBtn.classList.add('purchased');
    } else {
        const cost = getLuckCost();
        luckBtn.querySelector('.btn-label').textContent = `Luck Lv.${luckLevel}`;
        luckBtn.querySelector('.btn-cost').textContent = formatMoney(cost);
        luckBtn.classList.toggle('disabled', money < cost);
        luckBtn.classList.remove('purchased');
    }

    // Pad multiplier buttons
    const btns = [pad1Btn, pad2Btn, pad3Btn, pad4Btn, pad5Btn];
    for (let i = 0; i < 5; i++) {
        const btn = btns[i];
        const lvl = padMultipliers[i];
        if (lvl >= MAX_PAD_MULT) {
            btn.querySelector('.btn-label').textContent = `Pad ${i + 1}: 10x MAX`;
            btn.querySelector('.btn-cost').textContent = 'Maxed!';
            btn.classList.add('purchased');
            btn.classList.remove('disabled');
        } else {
            const cost = getPadUpgradeCost(i);
            btn.querySelector('.btn-label').textContent = `Pad ${i + 1}: ${lvl}x → ${lvl + 1}x`;
            btn.querySelector('.btn-cost').textContent = formatMoney(cost);
            btn.classList.toggle('disabled', money < cost);
            btn.classList.remove('purchased');
        }
    }
}

// ---- GAME LOOP ----
let lastTime = performance.now();
let spawnTimer = 0;
let nextSpawnAt = randomSpawnDelay();

function randomSpawnDelay() {
    // Weighted random: sometimes quick bursts, sometimes long waits
    return SPAWN_MIN + Math.random() * Math.random() * (SPAWN_MAX - SPAWN_MIN);
}

function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    // Spawn timer with random intervals
    spawnTimer += dt;
    if (spawnTimer >= nextSpawnAt) {
        spawnTimer = 0;
        nextSpawnAt = randomSpawnDelay();
        spawnPet();
    }

    // Move pets
    for (let i = activePets.length - 1; i >= 0; i--) {
        const p = activePets[i];
        p.progress += dt / CROSS_TIME;

        // Position the pet in the lane
        const lane = padLanes[p.padIndex];
        const laneWidth = lane.offsetWidth;
        const pxPos = p.progress * (laneWidth + 30) - 30; // start offscreen left
        p.element.style.left = pxPos + 'px';

        // Reached collector
        if (p.progress >= 1) {
            collectPet(p);
            activePets.splice(i, 1);
        }
    }

    // Update HUD & shop button states periodically
    updateHUD();
    updateShop();
    updateCollection();

    requestAnimationFrame(gameLoop);
}

// ---- EVENT LISTENERS ----
luckBtn.addEventListener('click', buyLuck);
pad1Btn.addEventListener('click', () => buyPadMultiplier(0));
pad2Btn.addEventListener('click', () => buyPadMultiplier(1));
pad3Btn.addEventListener('click', () => buyPadMultiplier(2));
pad4Btn.addEventListener('click', () => buyPadMultiplier(3));
pad5Btn.addEventListener('click', () => buyPadMultiplier(4));

// Close tooltips when tapping elsewhere
document.addEventListener('click', (e) => {
    if (!e.target.closest('.pet-cell')) {
        document.querySelectorAll('.pet-cell.show-tooltip').forEach(c => {
            c.classList.remove('show-tooltip');
        });
    }
});

// ---- SAVE / LOAD ----
function saveGame() {
    const data = {
        money,
        luckLevel,
        padMultipliers,
        discovered: [...discovered],
        totalCollected,
    };
    try {
        localStorage.setItem('petio_save', JSON.stringify(data));
    } catch (e) { /* ignore */ }
}

function loadGame() {
    try {
        const raw = localStorage.getItem('petio_save');
        if (!raw) return;
        const data = JSON.parse(raw);
        money = data.money || 0;
        luckLevel = data.luckLevel || 0;
        padMultipliers = data.padMultipliers || [1, 1, 1, 1, 1];
        discovered = new Set(data.discovered || []);
        totalCollected = data.totalCollected || 0;

        // Restore pad multiplier labels
        for (let i = 0; i < 5; i++) {
            if (padMultipliers[i] > 1) {
                const label = document.getElementById('mult-' + i);
                if (label) {
                    label.textContent = padMultipliers[i] + 'x';
                    label.classList.add('active');
                }
            }
        }
    } catch (e) { /* ignore */ }
}

// Auto-save every 5 seconds
setInterval(saveGame, 5000);

// ---- INIT ----
loadGame();
buildCollection();
updateHUD();
updateShop();
updateCollection();
requestAnimationFrame(gameLoop);
