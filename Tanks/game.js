// ========================
// TANK BATTLE - game.js
// ========================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ---- CONSTANTS ----
const ARENA_W = 1200;
const ARENA_H = 600;

const TANK_TYPES = {
    sawblade: {
        name: 'Sawblade',
        icon: '🔧',
        width: 36,
        height: 28,
        speed: 3.2,
        hp: 80,
        attackRange: 50,
        attackDamage: 12,
        attackCooldown: 400,
        sawRadius: 14,
        bulletSpeed: 0,
        bulletSize: 0,
    },
    cannon: {
        name: 'Cannon',
        icon: '💥',
        width: 50,
        height: 36,
        speed: 1.8,
        hp: 150,
        attackRange: 350,
        attackDamage: 25,
        attackCooldown: 1200,
        sawRadius: 0,
        bulletSpeed: 6,
        bulletSize: 5,
    },
    mega: {
        name: 'Mega',
        icon: '⭐',
        width: 58,
        height: 44,
        speed: 2.5,
        hp: 300,
        attackRange: 380,
        attackDamage: 35,
        attackCooldown: 800,
        sawRadius: 18,
        bulletSpeed: 7,
        bulletSize: 6,
    }
};

// Team colors
const TEAM_COLORS = {
    player: { body: '#3498db', accent: '#2980b9', turret: '#1a6da3', saw: '#5dade2', mega: '#f1c40f' },
    enemy:  { body: '#e74c3c', accent: '#c0392b', turret: '#a93226', saw: '#ec7063', mega: '#e67e22' }
};

// ---- LEVEL DEFINITIONS ----
const LEVELS = [
    {
        name: 'Skirmish',
        player: ['sawblade', 'cannon'],
        enemy: ['sawblade', 'cannon'],
    },
    {
        name: 'Reinforcements',
        player: ['sawblade', 'cannon'],
        enemy: ['sawblade', 'sawblade', 'cannon'],
    },
    {
        name: 'Outnumbered',
        player: ['sawblade', 'cannon', 'sawblade'],
        enemy: ['sawblade', 'sawblade', 'cannon', 'cannon'],
    },
    {
        name: 'Heavy Armor',
        player: ['sawblade', 'cannon', 'sawblade'],
        enemy: ['sawblade', 'cannon', 'cannon', 'mega'],
    },
    {
        name: 'Final Stand',
        player: ['sawblade', 'cannon', 'sawblade', 'cannon'],
        enemy: ['sawblade', 'sawblade', 'cannon', 'cannon', 'mega', 'mega'],
    },
];

// ---- GAME STATE ----
let gameState = {
    running: false,
    level: 0,
    round: 1,
    score: 0,
    selectedTankIndex: 0,
    money: 0,
    extraTanks: [],  // additional tanks bought from shop
    loopCount: 0,    // how many times all 5 levels have been beaten
};

const SHOP_ITEMS = [
    { type: 'sawblade', name: '🔧 Sawblade', desc: 'Fast melee attacker', cost: 150 },
    { type: 'cannon', name: '💥 Cannon', desc: 'Ranged shooter', cost: 250 },
    { type: 'mega', name: '⭐ Mega Tank', desc: 'Ranged + melee powerhouse', cost: 500 },
];

let tanks = [];
let bullets = [];
let particles = [];

// Input
const keys = {};
let joystickDx = 0;
let joystickDy = 0;

// ---- TANK CLASS ----
class Tank {
    constructor(type, team, x, y) {
        const t = TANK_TYPES[type];
        this.type = type;
        this.team = team;
        this.x = x;
        this.y = y;
        this.width = t.width;
        this.height = t.height;
        this.speed = t.speed;
        this.maxHp = t.hp;
        this.hp = t.hp;
        this.attackRange = t.attackRange;
        this.attackDamage = t.attackDamage;
        this.attackCooldown = t.attackCooldown;
        this.lastAttackTime = 0;
        this.angle = team === 'player' ? 0 : Math.PI;
        this.turretAngle = this.angle;
        this.vx = 0;
        this.vy = 0;
        this.alive = true;
        this.sawAngle = 0;
        this.selected = false;
        this.flashTimer = 0;
        this.name = t.name;
        this.icon = t.icon;
    }

    get centerX() { return this.x + this.width / 2; }
    get centerY() { return this.y + this.height / 2; }

    update(dt) {
        if (!this.alive) return;
        this.x += this.vx;
        this.y += this.vy;
        this.x = Math.max(0, Math.min(ARENA_W - this.width, this.x));
        this.y = Math.max(0, Math.min(ARENA_H - this.height, this.y));
        if (this.type === 'sawblade' || this.type === 'mega') {
            this.sawAngle += 0.15;
        }
        if (this.flashTimer > 0) this.flashTimer -= dt;
    }

    draw(ctx) {
        if (!this.alive) return;
        const cx = this.centerX;
        const cy = this.centerY;
        const colors = TEAM_COLORS[this.team];

        ctx.save();
        ctx.translate(cx, cy);

        // Selection indicator
        if (this.selected && this.team === 'player') {
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(this.width, this.height) * 0.8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        const flash = this.flashTimer > 0;

        if (this.type === 'mega') {
            this.drawMega(ctx, colors, flash);
        } else if (this.type === 'sawblade') {
            this.drawSawblade(ctx, colors, flash);
        } else {
            this.drawCannon(ctx, colors, flash);
        }

        ctx.restore();
        this.drawHealthBar(ctx);
    }

    drawSawblade(ctx, colors, flash) {
        ctx.fillStyle = flash ? '#fff' : colors.body;
        ctx.beginPath();
        ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 5);
        ctx.fill();
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.fillRect(-this.width / 2, -this.height / 2 - 2, this.width, 4);
        ctx.fillRect(-this.width / 2, this.height / 2 - 2, this.width, 4);

        const sawOffset = this.angle >= -Math.PI / 2 && this.angle <= Math.PI / 2 ? this.width / 2 + 8 : -this.width / 2 - 8;
        ctx.save();
        ctx.translate(sawOffset, 0);
        ctx.rotate(this.sawAngle);

        ctx.fillStyle = flash ? '#fff' : colors.saw;
        ctx.beginPath();
        ctx.arc(0, 0, TANK_TYPES.sawblade.sawRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const a = (Math.PI * 2 / 8) * i;
            const r = TANK_TYPES.sawblade.sawRadius;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * (r - 4), Math.sin(a) * (r - 4));
            ctx.lineTo(Math.cos(a) * (r + 4), Math.sin(a) * (r + 4));
            ctx.stroke();
        }
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawCannon(ctx, colors, flash) {
        ctx.fillStyle = flash ? '#fff' : colors.body;
        ctx.beginPath();
        ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 6);
        ctx.fill();
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.fillRect(-this.width / 2, -this.height / 2 - 3, this.width, 5);
        ctx.fillRect(-this.width / 2, this.height / 2 - 2, this.width, 5);

        ctx.fillStyle = flash ? '#fff' : colors.accent;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.rotate(this.turretAngle);
        ctx.fillStyle = flash ? '#fff' : colors.turret;
        ctx.fillRect(0, -4, 30, 8);
        ctx.fillStyle = '#555';
        ctx.fillRect(28, -5, 5, 10);
        ctx.restore();
    }

    drawMega(ctx, colors, flash) {
        // Big armored body with golden border
        ctx.fillStyle = flash ? '#fff' : colors.body;
        ctx.beginPath();
        ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 8);
        ctx.fill();
        ctx.strokeStyle = colors.mega;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Tracks
        ctx.fillStyle = '#333';
        ctx.fillRect(-this.width / 2, -this.height / 2 - 3, this.width, 6);
        ctx.fillRect(-this.width / 2, this.height / 2 - 3, this.width, 6);

        // Star emblem
        ctx.fillStyle = colors.mega;
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', 0, 0);

        // Cannon turret
        ctx.save();
        ctx.rotate(this.turretAngle);
        ctx.fillStyle = flash ? '#fff' : colors.turret;
        ctx.fillRect(0, -5, 35, 10);
        ctx.fillStyle = '#555';
        ctx.fillRect(33, -6, 6, 12);
        ctx.restore();

        // Saw on front
        const sawOff = this.angle >= -Math.PI / 2 && this.angle <= Math.PI / 2 ? this.width / 2 + 10 : -this.width / 2 - 10;
        ctx.save();
        ctx.translate(sawOff, 0);
        ctx.rotate(this.sawAngle);
        ctx.fillStyle = flash ? '#fff' : colors.mega;
        ctx.beginPath();
        ctx.arc(0, 0, TANK_TYPES.mega.sawRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
            const a = (Math.PI * 2 / 10) * i;
            const r = TANK_TYPES.mega.sawRadius;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * (r - 4), Math.sin(a) * (r - 4));
            ctx.lineTo(Math.cos(a) * (r + 5), Math.sin(a) * (r + 5));
            ctx.stroke();
        }
        ctx.fillStyle = '#95a5a6';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawHealthBar(ctx) {
        const barW = Math.max(40, this.width);
        const barH = 5;
        const x = this.centerX - barW / 2;
        const y = this.y - 10;
        const hpPct = Math.max(0, this.hp / this.maxHp);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(x, y, barW, barH);

        const hpColor = hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillStyle = hpColor;
        ctx.fillRect(x, y, barW * hpPct, barH);

        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barW, barH);
    }

    takeDamage(amount) {
        if (!this.alive) return;
        this.hp -= amount;
        this.flashTimer = 150;
        spawnDamageParticles(this.centerX, this.centerY, this.team);
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
            spawnExplosion(this.centerX, this.centerY);
        }
    }

    canAttack() {
        return this.alive && (Date.now() - this.lastAttackTime) >= this.attackCooldown;
    }

    distanceTo(other) {
        const dx = this.centerX - other.centerX;
        const dy = this.centerY - other.centerY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    angleTo(other) {
        return Math.atan2(other.centerY - this.centerY, other.centerX - this.centerX);
    }
}

// ---- BULLET CLASS ----
class Bullet {
    constructor(x, y, angle, team, damage, speed, size) {
        this.x = x;
        this.y = y;
        this.speed = speed || 6;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.team = team;
        this.damage = damage;
        this.size = size || 5;
        this.alive = true;
        this.trail = [];
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 6) this.trail.shift();
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -20 || this.x > ARENA_W + 20 || this.y < -20 || this.y > ARENA_H + 20) {
            this.alive = false;
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i / this.trail.length) * 0.4;
            ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;
            const s = this.size * (i / this.trail.length);
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, s, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// ---- PARTICLES ----
function spawnDamageParticles(x, y, team) {
    const color = team === 'player' ? '#3498db' : '#e74c3c';
    for (let i = 0; i < 6; i++) {
        particles.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 300, maxLife: 300, size: 3 + Math.random() * 3, color });
    }
}

function spawnExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 600, maxLife: 600, size: 4 + Math.random() * 6, color: ['#e74c3c', '#f39c12', '#f1c40f', '#ecf0f1'][Math.floor(Math.random() * 4)] });
    }
}

function spawnCombineEffect(x, y) {
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 800, maxLife: 800, size: 5 + Math.random() * 8, color: ['#f1c40f', '#e67e22', '#fff', '#2ecc71'][Math.floor(Math.random() * 4)] });
    }
}

function spawnSawSparks(x, y) {
    for (let i = 0; i < 3; i++) {
        particles.push({ x, y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 150, maxLife: 150, size: 2 + Math.random() * 2, color: '#f1c40f' });
    }
}

// ---- COMBINE MECHANIC ----
const COMBINE_DIST = 65;

function checkCombineReady() {
    const pt = getPlayerTanks().filter(t => t.alive);
    const saw = pt.find(t => t.type === 'sawblade');
    const can = pt.find(t => t.type === 'cannon');
    if (!saw || !can) return false;
    return saw.distanceTo(can) <= COMBINE_DIST;
}

function doCombine() {
    const pt = getPlayerTanks().filter(t => t.alive);
    const saw = pt.find(t => t.type === 'sawblade');
    const can = pt.find(t => t.type === 'cannon');
    if (!saw || !can) return;

    const mx = (saw.centerX + can.centerX) / 2;
    const my = (saw.centerY + can.centerY) / 2;

    spawnCombineEffect(mx, my);

    // Remove old tanks
    saw.alive = false;
    can.alive = false;

    // Create mega tank
    const mega = new Tank('mega', 'player', mx - TANK_TYPES.mega.width / 2, my - TANK_TYPES.mega.height / 2);
    mega.selected = true;
    tanks.push(mega);

    // Select the new mega
    const alivePT = getPlayerTanks().filter(t => t.alive);
    gameState.selectedTankIndex = alivePT.indexOf(mega);
    if (gameState.selectedTankIndex < 0) gameState.selectedTankIndex = 0;
    updateSelectionUI();
    updateHUDBars();
    hideCombineUI();
}

// ---- LEVEL INITIALIZATION ----
function initLevel() {
    tanks = [];
    bullets = [];
    particles = [];

    const level = LEVELS[gameState.level];

    // Player tanks = base level roster + extra purchased tanks
    const pTypes = [...level.player, ...gameState.extraTanks];
    const pSpacing = ARENA_H / (pTypes.length + 1);
    for (let i = 0; i < pTypes.length; i++) {
        const t = new Tank(pTypes[i], 'player', 40 + Math.random() * 60, pSpacing * (i + 1) - 20);
        tanks.push(t);
    }

    // Spawn enemy tanks on right side (scale with loop count)
    const eBase = [...level.enemy];
    // Each loop adds extra enemy tanks
    for (let loop = 0; loop < gameState.loopCount; loop++) {
        eBase.push('sawblade');
        if (loop % 2 === 0) eBase.push('cannon');
        if (loop >= 2) eBase.push('mega');
    }
    const eTypes = eBase;
    const eSpacing = ARENA_H / (eTypes.length + 1);
    for (let i = 0; i < eTypes.length; i++) {
        const t = new Tank(eTypes[i], 'enemy', ARENA_W - 100 - Math.random() * 60, eSpacing * (i + 1) - 20);
        t.angle = Math.PI;
        t.turretAngle = Math.PI;
        tanks.push(t);
    }

    // Select first player tank
    gameState.selectedTankIndex = 0;
    const pt = getPlayerTanks();
    if (pt.length > 0) pt[0].selected = true;

    gameState.running = true;

    updateSelectionUI();
    updateHUDBars();
    updateHUD();
    hideCombineUI();
    document.getElementById('gameOverOverlay').classList.add('hidden');
}

// ---- PLAYER CONTROL ----
function getPlayerTanks() {
    return tanks.filter(t => t.team === 'player');
}

function getEnemyTanks() {
    return tanks.filter(t => t.team === 'enemy');
}

function getSelectedTank() {
    const pt = getPlayerTanks().filter(t => t.alive);
    if (pt.length === 0) return null;
    if (gameState.selectedTankIndex >= pt.length) gameState.selectedTankIndex = 0;
    return pt[gameState.selectedTankIndex];
}

function updatePlayerInput() {
    const tank = getSelectedTank();
    if (!tank) return;

    let dx = 0, dy = 0;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1;

    if (Math.abs(joystickDx) > 0.1 || Math.abs(joystickDy) > 0.1) {
        dx = joystickDx;
        dy = joystickDy;
    }

    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag > 0) {
        tank.vx = (dx / mag) * tank.speed;
        tank.vy = (dy / mag) * tank.speed;
        tank.angle = Math.atan2(dy, dx);
        if (tank.type === 'cannon' || tank.type === 'mega') {
            tank.turretAngle = tank.angle;
        }
    } else {
        tank.vx *= 0.7;
        tank.vy *= 0.7;
    }

    // Auto-attack nearest enemy
    doAttack(tank, getEnemyTanks().filter(e => e.alive));
}

function doAttack(tank, enemies) {
    if (!tank.canAttack() || enemies.length === 0) return;

    let closest = enemies[0];
    let closestDist = tank.distanceTo(enemies[0]);
    for (let i = 1; i < enemies.length; i++) {
        const d = tank.distanceTo(enemies[i]);
        if (d < closestDist) { closestDist = d; closest = enemies[i]; }
    }

    if (tank.type === 'sawblade') {
        if (closestDist <= tank.attackRange + closest.width / 2) {
            closest.takeDamage(tank.attackDamage);
            spawnSawSparks(closest.centerX, closest.centerY);
            tank.lastAttackTime = Date.now();
        }
    } else if (tank.type === 'cannon') {
        const angle = tank.angleTo(closest);
        tank.turretAngle = angle;
        const bx = tank.centerX + Math.cos(angle) * 35;
        const by = tank.centerY + Math.sin(angle) * 35;
        bullets.push(new Bullet(bx, by, angle, tank.team, tank.attackDamage, TANK_TYPES.cannon.bulletSpeed, TANK_TYPES.cannon.bulletSize));
        tank.lastAttackTime = Date.now();
    } else if (tank.type === 'mega') {
        const angle = tank.angleTo(closest);
        tank.turretAngle = angle;
        // Ranged shot
        const bx = tank.centerX + Math.cos(angle) * 40;
        const by = tank.centerY + Math.sin(angle) * 40;
        bullets.push(new Bullet(bx, by, angle, tank.team, tank.attackDamage, TANK_TYPES.mega.bulletSpeed, TANK_TYPES.mega.bulletSize));
        // Bonus melee if close
        if (closestDist <= 70) {
            closest.takeDamage(10);
            spawnSawSparks(closest.centerX, closest.centerY);
        }
        tank.lastAttackTime = Date.now();
    }
}

// ---- ALLY AI ----
function updateAllyAI(dt) {
    const pt = getPlayerTanks();
    const enemies = getEnemyTanks().filter(e => e.alive);
    for (const tank of pt) {
        if (!tank.alive || tank.selected || enemies.length === 0) continue;
        let target = enemies[0];
        let targetDist = tank.distanceTo(enemies[0]);
        for (let i = 1; i < enemies.length; i++) {
            const d = tank.distanceTo(enemies[i]);
            if (d < targetDist) { targetDist = d; target = enemies[i]; }
        }
        const angle = tank.angleTo(target);
        if (tank.type === 'sawblade') {
            tank.vx = Math.cos(angle) * tank.speed;
            tank.vy = Math.sin(angle) * tank.speed;
            tank.angle = angle;
        } else {
            const idealDist = tank.type === 'mega' ? 180 : 220;
            if (targetDist < idealDist - 40) {
                tank.vx = -Math.cos(angle) * tank.speed;
                tank.vy = -Math.sin(angle) * tank.speed;
            } else if (targetDist > idealDist + 60) {
                tank.vx = Math.cos(angle) * tank.speed * 0.8;
                tank.vy = Math.sin(angle) * tank.speed * 0.8;
            } else {
                tank.vx *= 0.85;
                tank.vy *= 0.85;
            }
            tank.turretAngle = angle;
            tank.angle = angle;
        }
        doAttack(tank, enemies);
    }
}

// ---- ENEMY AI ----
function updateEnemyAI(dt) {
    const enemies = getEnemyTanks();
    const playerAlive = getPlayerTanks().filter(t => t.alive);

    for (const tank of enemies) {
        if (!tank.alive || playerAlive.length === 0) {
            tank.vx = 0;
            tank.vy = 0;
            continue;
        }

        let target = playerAlive[0];
        let targetDist = tank.distanceTo(playerAlive[0]);
        for (let i = 1; i < playerAlive.length; i++) {
            const d = tank.distanceTo(playerAlive[i]);
            if (d < targetDist) { targetDist = d; target = playerAlive[i]; }
        }

        const angleToTarget = tank.angleTo(target);

        if (tank.type === 'sawblade') {
            tank.vx = Math.cos(angleToTarget) * tank.speed;
            tank.vy = Math.sin(angleToTarget) * tank.speed;
            tank.angle = angleToTarget;
        } else {
            const idealDist = tank.type === 'mega' ? 200 : 250;
            if (targetDist < idealDist - 50) {
                tank.vx = -Math.cos(angleToTarget) * tank.speed;
                tank.vy = -Math.sin(angleToTarget) * tank.speed;
            } else if (targetDist > idealDist + 80) {
                tank.vx = Math.cos(angleToTarget) * tank.speed * 0.8;
                tank.vy = Math.sin(angleToTarget) * tank.speed * 0.8;
            } else {
                tank.vx *= 0.85;
                tank.vy *= 0.85;
            }
            tank.turretAngle = angleToTarget;
            tank.angle = angleToTarget;
        }

        doAttack(tank, playerAlive);
    }
}

// ---- COLLISION ----
function checkBulletCollisions() {
    for (const bullet of bullets) {
        if (!bullet.alive) continue;
        for (const tank of tanks) {
            if (!tank.alive || tank.team === bullet.team) continue;
            const dx = bullet.x - tank.centerX;
            const dy = bullet.y - tank.centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < Math.max(tank.width, tank.height) / 2 + bullet.size) {
                tank.takeDamage(bullet.damage);
                bullet.alive = false;
                break;
            }
        }
    }
}

function checkTankCollisions() {
    for (let i = 0; i < tanks.length; i++) {
        for (let j = i + 1; j < tanks.length; j++) {
            const a = tanks[i];
            const b = tanks[j];
            if (!a.alive || !b.alive) continue;
            const dx = a.centerX - b.centerX;
            const dy = a.centerY - b.centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = (a.width + b.width) / 2;
            if (dist < minDist && dist > 0) {
                const overlap = minDist - dist;
                const nx = dx / dist;
                const ny = dy / dist;
                a.x += nx * overlap / 2;
                a.y += ny * overlap / 2;
                b.x -= nx * overlap / 2;
                b.y -= ny * overlap / 2;
            }
        }
    }
}

// ---- WIN / LOSE ----
function checkGameEnd() {
    const playerAlive = getPlayerTanks().some(t => t.alive);
    const enemyAlive = getEnemyTanks().some(t => t.alive);

    if (!playerAlive) {
        gameState.running = false;
        const defeatMoney = 25 + 25 * gameState.level;
        gameState.money += defeatMoney;
        document.getElementById('gameOverTitle').textContent = '💀 DEFEAT 💀';
        document.getElementById('gameOverMsg').textContent = 'Your tanks were destroyed! Retry the level or visit the shop.';
        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('moneyEarned').textContent = '+' + defeatMoney + ' coins (defeat bonus)';
        document.getElementById('shopBtn').style.display = '';
        document.getElementById('nextRoundBtn').style.display = 'none';
        document.getElementById('playAgainBtn').style.display = '';
        document.getElementById('playAgainBtn').textContent = '🔄 Retry Level';
        document.getElementById('playAgainBtn').dataset.action = 'retry';
        document.getElementById('gameOverOverlay').classList.remove('hidden');
    } else if (!enemyAlive) {
        gameState.running = false;
        const moneyEarned = 100 + 50 * gameState.level;
        gameState.money += moneyEarned;
        gameState.score += 100 * (gameState.level + 1);
        const isLastLevel = gameState.level >= LEVELS.length - 1;
        document.getElementById('gameOverTitle').textContent = isLastLevel ? '🎉 YOU WIN THE GAME! 🎉' : '🏆 VICTORY! 🏆';
        const lvl = LEVELS[gameState.level];
        document.getElementById('gameOverMsg').textContent = isLastLevel
            ? 'All 5 levels complete! Final Score: ' + gameState.score
            : '"' + lvl.name + '" complete! Next: "' + LEVELS[gameState.level + 1].name + '"';
        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('moneyEarned').textContent = '+' + moneyEarned + ' coins earned!';
        document.getElementById('shopBtn').style.display = '';
        if (isLastLevel) {
            document.getElementById('nextRoundBtn').style.display = 'none';
            document.getElementById('playAgainBtn').style.display = '';
            document.getElementById('playAgainBtn').textContent = '🔄 Play Again (Keep Tanks)';
            document.getElementById('playAgainBtn').dataset.action = 'newgameplus';
        } else {
            document.getElementById('nextRoundBtn').style.display = '';
            document.getElementById('playAgainBtn').style.display = 'none';
        }
        document.getElementById('gameOverOverlay').classList.remove('hidden');
    }
}

// ---- DRAWING ----
function drawArena() {
    ctx.fillStyle = '#5a8a3c';
    ctx.fillRect(0, 0, ARENA_W, ARENA_H);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < ARENA_W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ARENA_H); ctx.stroke(); }
    for (let y = 0; y < ARENA_H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ARENA_W, y); ctx.stroke(); }

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(ARENA_W / 2, 0);
    ctx.lineTo(ARENA_W / 2, ARENA_H);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(52, 152, 219, 0.06)';
    ctx.fillRect(0, 0, ARENA_W / 2, ARENA_H);
    ctx.fillStyle = 'rgba(231, 76, 60, 0.06)';
    ctx.fillRect(ARENA_W / 2, 0, ARENA_W / 2, ARENA_H);

    // Level name watermark
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(LEVELS[gameState.level].name, ARENA_W / 2, ARENA_H / 2);
}

function drawParticles() {
    for (const p of particles) {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// ---- DYNAMIC HUD ----
function updateHUDBars() {
    const playerContainer = document.getElementById('playerHpBars');
    const enemyContainer = document.getElementById('enemyHpBars');
    playerContainer.innerHTML = '';
    enemyContainer.innerHTML = '';

    for (const tank of getPlayerTanks()) {
        playerContainer.appendChild(createHpRow(tank, 'player'));
    }
    for (const tank of getEnemyTanks()) {
        enemyContainer.appendChild(createHpRow(tank, 'enemy'));
    }
}

function createHpRow(tank, team) {
    const row = document.createElement('div');
    row.className = 'tank-health';
    row.dataset.tankId = tanks.indexOf(tank);
    row.innerHTML =
        '<span class="tank-icon">' + tank.icon + '</span>' +
        '<span class="tank-name">' + tank.name + '</span>' +
        '<div class="health-bar"><div class="health-fill ' + team + '-hp-fill" style="width:100%"></div></div>';
    return row;
}

function updateHUD() {
    document.getElementById('levelNum').textContent = gameState.level + 1;
    document.getElementById('roundNum').textContent = gameState.round;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('moneyDisplay').textContent = gameState.money;

    // Update HP bars
    document.querySelectorAll('.tank-health').forEach(row => {
        const idx = parseInt(row.dataset.tankId);
        if (isNaN(idx) || !tanks[idx]) return;
        const tank = tanks[idx];
        const fill = row.querySelector('.health-fill');
        if (fill) {
            fill.style.width = Math.max(0, tank.hp / tank.maxHp * 100) + '%';
            if (!tank.alive) fill.style.background = '#555';
        }
    });
}

function updateSelectionUI() {
    const container = document.getElementById('tankSelectBtns');
    container.innerHTML = '';
    const pt = getPlayerTanks().filter(t => t.alive);

    pt.forEach((tank, i) => {
        tank.selected = (i === gameState.selectedTankIndex);
        const btn = document.createElement('button');
        btn.className = 'tank-select-btn' + (i === gameState.selectedTankIndex ? ' selected' : '');
        btn.textContent = tank.icon + ' ' + tank.name;
        btn.addEventListener('click', () => {
            gameState.selectedTankIndex = i;
            updateSelectionUI();
        });
        container.appendChild(btn);
    });
}

function showCombineUI() {
    document.getElementById('combine-hint').classList.remove('hidden');
    document.getElementById('combine-btn').classList.remove('hidden');
    document.getElementById('combine-label').classList.remove('hidden');
}

function hideCombineUI() {
    document.getElementById('combine-hint').classList.add('hidden');
    document.getElementById('combine-btn').classList.add('hidden');
    document.getElementById('combine-label').classList.add('hidden');
}

// ---- GAME LOOP ----
let lastTime = performance.now();

function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    if (gameState.running) {
        updatePlayerInput();
        updateAllyAI(dt);
        updateEnemyAI(dt);

        for (const tank of tanks) tank.update(dt);
        for (const bullet of bullets) bullet.update();

        checkBulletCollisions();
        checkTankCollisions();

        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.life -= dt;
        }

        bullets = bullets.filter(b => b.alive);
        particles = particles.filter(p => p.life > 0);

        // Combine check
        if (checkCombineReady()) {
            showCombineUI();
        } else {
            hideCombineUI();
        }

        checkGameEnd();
        updateHUD();
    }

    ctx.clearRect(0, 0, ARENA_W, ARENA_H);
    drawArena();
    for (const bullet of bullets) bullet.draw(ctx);
    for (const tank of tanks) tank.draw(ctx);
    drawParticles();

    requestAnimationFrame(gameLoop);
}

// ---- EVENT LISTENERS ----

// Keyboard
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    keys[e.code] = true;
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) {
        const pt = getPlayerTanks().filter(t => t.alive);
        if (num - 1 < pt.length) {
            gameState.selectedTankIndex = num - 1;
            updateSelectionUI();
        }
    }
    if (e.key === 'c' || e.key === 'C') {
        if (checkCombineReady()) doCombine();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    keys[e.code] = false;
});

// Combine button
document.getElementById('combine-btn').addEventListener('click', () => {
    if (checkCombineReady()) doCombine();
});

// Attack button (not needed for auto-attack but keeps UI)
const attackBtn = document.getElementById('attack-btn');
if (attackBtn) {
    attackBtn.addEventListener('touchstart', (e) => { e.preventDefault(); attackBtn.classList.add('pressed'); }, { passive: false });
    attackBtn.addEventListener('touchend', (e) => { e.preventDefault(); attackBtn.classList.remove('pressed'); }, { passive: false });
    attackBtn.addEventListener('touchcancel', () => { attackBtn.classList.remove('pressed'); });
    attackBtn.addEventListener('mousedown', () => { attackBtn.classList.add('pressed'); });
    attackBtn.addEventListener('mouseup', () => { attackBtn.classList.remove('pressed'); });
}

// Joystick
const joystickBase = document.getElementById('joystick-base');
const joystickKnob = document.getElementById('joystick-knob');
let joystickTouchId = null;
let joystickCenterX = 0;
let joystickCenterY = 0;
const maxKnobOffset = 38;

joystickBase.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (joystickTouchId !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchId = touch.identifier;
    const rect = joystickBase.getBoundingClientRect();
    joystickCenterX = rect.left + rect.width / 2;
    joystickCenterY = rect.top + rect.height / 2;
}, { passive: false });

joystickBase.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchId) {
            const dx = touch.clientX - joystickCenterX;
            const dy = touch.clientY - joystickCenterY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const clamp = Math.min(dist, maxKnobOffset);
            const angle = Math.atan2(dy, dx);
            joystickDx = (dist > 10) ? Math.cos(angle) : 0;
            joystickDy = (dist > 10) ? Math.sin(angle) : 0;
            const kx = Math.cos(angle) * clamp;
            const ky = Math.sin(angle) * clamp;
            joystickKnob.style.transform = 'translate(calc(-50% + ' + kx + 'px), calc(-50% + ' + ky + 'px))';
            break;
        }
    }
}, { passive: false });

function resetJoystick() {
    joystickDx = 0;
    joystickDy = 0;
    joystickKnob.style.transform = 'translate(-50%, -50%)';
    joystickTouchId = null;
}

joystickBase.addEventListener('touchend', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickTouchId) { resetJoystick(); break; }
    }
}, { passive: false });
joystickBase.addEventListener('touchcancel', resetJoystick);

// Next Round button
document.getElementById('nextRoundBtn').addEventListener('click', () => {
    document.getElementById('gameOverOverlay').classList.add('hidden');
    gameState.level++;
    gameState.round++;
    initLevel();
});

// Play Again / Restart button
document.getElementById('playAgainBtn').addEventListener('click', () => {
    document.getElementById('gameOverOverlay').classList.add('hidden');
    const action = document.getElementById('playAgainBtn').dataset.action;
    if (action === 'retry') {
        // Retry same level — keep money and extra tanks
        initLevel();
    } else if (action === 'newgameplus') {
        // Beat all 5 levels — restart from level 1 but keep tanks and money
        gameState.loopCount++;
        gameState.level = 0;
        gameState.round = 1;
        gameState.score = 0;
        initLevel();
    } else {
        // Full restart from level 1
        gameState.level = 0;
        gameState.round = 1;
        gameState.score = 0;
        gameState.money = 0;
        gameState.extraTanks = [];
        gameState.loopCount = 0;
        initLevel();
    }
});

// ---- SHOP SYSTEM ----
function openShop() {
    document.getElementById('gameOverOverlay').classList.add('hidden');
    document.getElementById('shopOverlay').classList.remove('hidden');
    renderShop();
}

function renderShop() {
    document.getElementById('shopMoney').textContent = gameState.money;

    // Roster display
    const rosterEl = document.getElementById('rosterDisplay');
    const level = LEVELS[Math.min(gameState.level + 1, LEVELS.length - 1)];
    const allPlayerTanks = [...level.player, ...gameState.extraTanks];
    rosterEl.innerHTML = '';
    allPlayerTanks.forEach(t => {
        const tag = document.createElement('span');
        tag.className = 'roster-tank';
        tag.textContent = TANK_TYPES[t].icon + ' ' + TANK_TYPES[t].name;
        rosterEl.appendChild(tag);
    });

    // Shop items
    const itemsEl = document.getElementById('shopItems');
    itemsEl.innerHTML = '';
    SHOP_ITEMS.forEach(item => {
        const div = document.createElement('div');
        div.className = 'shop-item';
        const canAfford = gameState.money >= item.cost;
        div.innerHTML =
            '<div class="shop-item-info">' +
                '<span class="shop-item-icon">' + TANK_TYPES[item.type].icon + '</span>' +
                '<div>' +
                    '<div class="shop-item-name">' + TANK_TYPES[item.type].name + '</div>' +
                    '<div class="shop-item-stats">HP: ' + TANK_TYPES[item.type].hp + ' · DMG: ' + TANK_TYPES[item.type].attackDamage + ' · ' + item.desc + '</div>' +
                '</div>' +
            '</div>' +
            '<button class="shop-buy-btn' + (canAfford ? '' : ' disabled') + '">' + item.cost + ' 💰</button>';
        const btn = div.querySelector('.shop-buy-btn');
        btn.addEventListener('click', () => {
            if (gameState.money >= item.cost) {
                gameState.money -= item.cost;
                gameState.extraTanks.push(item.type);
                renderShop();
            }
        });
        itemsEl.appendChild(div);
    });
}

document.getElementById('shopBtn').addEventListener('click', openShop);

document.getElementById('shopCloseBtn').addEventListener('click', () => {
    document.getElementById('shopOverlay').classList.add('hidden');
    document.getElementById('gameOverOverlay').classList.remove('hidden');
});

// ---- START ----
initLevel();
requestAnimationFrame(gameLoop);
