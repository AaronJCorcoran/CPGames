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
        width: 36,
        height: 28,
        speed: 3.2,
        hp: 80,
        attackRange: 50,
        attackDamage: 12,
        attackCooldown: 400,   // ms
        color: null,           // set per team
        bodyColor: null,
        sawRadius: 14,
    },
    cannon: {
        name: 'Cannon',
        width: 50,
        height: 36,
        speed: 1.8,
        hp: 150,
        attackRange: 350,
        attackDamage: 25,
        attackCooldown: 1200,
        color: null,
        bodyColor: null,
        bulletSpeed: 6,
        bulletSize: 5,
    }
};

// Team colors
const TEAM_COLORS = {
    player: {
        body: '#3498db',
        accent: '#2980b9',
        turret: '#1a6da3',
        saw: '#5dade2',
    },
    enemy: {
        body: '#e74c3c',
        accent: '#c0392b',
        turret: '#a93226',
        saw: '#ec7063',
    }
};

// ---- GAME STATE ----
let gameState = {
    running: true,
    round: 1,
    score: 0,
    selectedTankIndex: 0,  // 0 = sawblade, 1 = cannon
};

let tanks = [];
let bullets = [];
let particles = [];
let sawSparks = [];

// Input
const keys = {};
let joystickDx = 0;
let joystickDy = 0;
let attackPressed = false;

// ---- TANK CLASS ----
class Tank {
    constructor(type, team, x, y) {
        const template = TANK_TYPES[type];
        this.type = type;
        this.team = team;  // 'player' or 'enemy'
        this.x = x;
        this.y = y;
        this.width = template.width;
        this.height = template.height;
        this.speed = template.speed;
        this.maxHp = template.hp;
        this.hp = template.hp;
        this.attackRange = template.attackRange;
        this.attackDamage = template.attackDamage;
        this.attackCooldown = template.attackCooldown;
        this.lastAttackTime = 0;
        this.angle = team === 'player' ? 0 : Math.PI;  // face right / left
        this.turretAngle = this.angle;
        this.vx = 0;
        this.vy = 0;
        this.alive = true;
        this.sawAngle = 0; // spinning saw animation
        this.selected = false;
        this.flashTimer = 0;

        // AI state
        this.aiTarget = null;
        this.aiMoveTimer = 0;
        this.aiWanderX = 0;
        this.aiWanderY = 0;
    }

    get centerX() { return this.x + this.width / 2; }
    get centerY() { return this.y + this.height / 2; }

    update(dt) {
        if (!this.alive) return;

        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Arena bounds
        this.x = Math.max(0, Math.min(ARENA_W - this.width, this.x));
        this.y = Math.max(0, Math.min(ARENA_H - this.height, this.y));

        // Spinning saw animation
        if (this.type === 'sawblade') {
            this.sawAngle += 0.15;
        }

        // Flash timer (damage flash)
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

        // Damage flash
        const flash = this.flashTimer > 0;

        if (this.type === 'sawblade') {
            this.drawSawblade(ctx, colors, flash);
        } else {
            this.drawCannon(ctx, colors, flash);
        }

        // Health bar above tank
        ctx.restore();
        this.drawHealthBar(ctx);
    }

    drawSawblade(ctx, colors, flash) {
        // Body
        ctx.fillStyle = flash ? '#fff' : colors.body;
        ctx.beginPath();
        ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 5);
        ctx.fill();
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tracks
        ctx.fillStyle = '#333';
        ctx.fillRect(-this.width / 2, -this.height / 2 - 2, this.width, 4);
        ctx.fillRect(-this.width / 2, this.height / 2 - 2, this.width, 4);

        // Saw blade (in front)
        const sawOffset = this.angle === 0 ? this.width / 2 + 8 : -this.width / 2 - 8;
        ctx.save();
        ctx.translate(sawOffset, 0);
        ctx.rotate(this.sawAngle);

        // Saw disc
        ctx.fillStyle = flash ? '#fff' : colors.saw;
        ctx.beginPath();
        ctx.arc(0, 0, TANK_TYPES.sawblade.sawRadius, 0, Math.PI * 2);
        ctx.fill();

        // Saw teeth
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
        const teeth = 8;
        for (let i = 0; i < teeth; i++) {
            const a = (Math.PI * 2 / teeth) * i;
            const r = TANK_TYPES.sawblade.sawRadius;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * (r - 4), Math.sin(a) * (r - 4));
            ctx.lineTo(Math.cos(a) * (r + 4), Math.sin(a) * (r + 4));
            ctx.stroke();
        }

        // Center bolt
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawCannon(ctx, colors, flash) {
        // Body (larger)
        ctx.fillStyle = flash ? '#fff' : colors.body;
        ctx.beginPath();
        ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 6);
        ctx.fill();
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tracks
        ctx.fillStyle = '#333';
        ctx.fillRect(-this.width / 2, -this.height / 2 - 3, this.width, 5);
        ctx.fillRect(-this.width / 2, this.height / 2 - 2, this.width, 5);

        // Turret base (circle)
        ctx.fillStyle = flash ? '#fff' : colors.accent;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // Turret barrel
        ctx.save();
        ctx.rotate(this.turretAngle);
        ctx.fillStyle = flash ? '#fff' : colors.turret;
        ctx.fillRect(0, -4, 30, 8);
        // Barrel tip
        ctx.fillStyle = '#555';
        ctx.fillRect(28, -5, 5, 10);
        ctx.restore();
    }

    drawHealthBar(ctx) {
        const barW = 40;
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
    constructor(x, y, angle, team, damage) {
        this.x = x;
        this.y = y;
        this.speed = TANK_TYPES.cannon.bulletSpeed;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.team = team;
        this.damage = damage;
        this.size = TANK_TYPES.cannon.bulletSize;
        this.alive = true;
        this.trail = [];
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 6) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;

        // Out of bounds
        if (this.x < -20 || this.x > ARENA_W + 20 || this.y < -20 || this.y > ARENA_H + 20) {
            this.alive = false;
        }
    }

    draw(ctx) {
        // Trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i / this.trail.length) * 0.4;
            ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;
            const s = this.size * (i / this.trail.length);
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, s, 0, Math.PI * 2);
            ctx.fill();
        }

        // Bullet
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
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 300,
            maxLife: 300,
            size: 3 + Math.random() * 3,
            color
        });
    }
}

function spawnExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 600,
            maxLife: 600,
            size: 4 + Math.random() * 6,
            color: ['#e74c3c', '#f39c12', '#f1c40f', '#ecf0f1'][Math.floor(Math.random() * 4)]
        });
    }
}

function spawnSawSparks(x, y) {
    for (let i = 0; i < 3; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 150,
            maxLife: 150,
            size: 2 + Math.random() * 2,
            color: '#f1c40f'
        });
    }
}

// ---- INITIALIZATION ----
function initGame() {
    tanks = [];
    bullets = [];
    particles = [];

    // Player team (left side)
    const playerSaw = new Tank('sawblade', 'player', 80, ARENA_H / 2 - 60);
    const playerCannon = new Tank('cannon', 'player', 40, ARENA_H / 2 + 30);
    playerSaw.selected = true;

    // Enemy team (right side)
    const enemySaw = new Tank('sawblade', 'enemy', ARENA_W - 120, ARENA_H / 2 - 60);
    const enemyCannon = new Tank('cannon', 'enemy', ARENA_W - 90, ARENA_H / 2 + 30);
    enemySaw.angle = Math.PI;
    enemyCannon.angle = Math.PI;
    enemyCannon.turretAngle = Math.PI;

    tanks = [playerSaw, playerCannon, enemySaw, enemyCannon];
    gameState.running = true;
    gameState.selectedTankIndex = 0;

    updateSelectionUI();
    updateHUD();
}

// ---- PLAYER CONTROL ----
function getPlayerTanks() {
    return tanks.filter(t => t.team === 'player');
}

function getEnemyTanks() {
    return tanks.filter(t => t.team === 'enemy');
}

function getSelectedTank() {
    const pt = getPlayerTanks();
    const tank = pt[gameState.selectedTankIndex];
    if (tank && tank.alive) return tank;
    // Fallback to any alive player tank
    const alive = pt.find(t => t.alive);
    if (alive) {
        gameState.selectedTankIndex = pt.indexOf(alive);
        updateSelectionUI();
    }
    return alive || null;
}

function updatePlayerInput() {
    const tank = getSelectedTank();
    if (!tank) return;

    let dx = 0, dy = 0;

    // Keyboard
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1;

    // Joystick overrides
    if (Math.abs(joystickDx) > 0.1 || Math.abs(joystickDy) > 0.1) {
        dx = joystickDx;
        dy = joystickDy;
    }

    // Normalize
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag > 0) {
        tank.vx = (dx / mag) * tank.speed;
        tank.vy = (dy / mag) * tank.speed;
        tank.angle = Math.atan2(dy, dx);
        if (tank.type === 'cannon') {
            tank.turretAngle = tank.angle;
        }
    } else {
        tank.vx *= 0.7;
        tank.vy *= 0.7;
    }

    // Auto-attack always
    playerAttack(tank);
}

function playerAttack(tank) {
    if (!tank.canAttack()) return;

    // Find closest enemy
    const enemies = getEnemyTanks().filter(e => e.alive);
    if (enemies.length === 0) return;

    let closest = enemies[0];
    let closestDist = tank.distanceTo(enemies[0]);
    for (let i = 1; i < enemies.length; i++) {
        const d = tank.distanceTo(enemies[i]);
        if (d < closestDist) {
            closestDist = d;
            closest = enemies[i];
        }
    }

    if (tank.type === 'sawblade') {
        // Melee attack — only if in range
        if (closestDist <= tank.attackRange + closest.width / 2) {
            closest.takeDamage(tank.attackDamage);
            spawnSawSparks(closest.centerX, closest.centerY);
            tank.lastAttackTime = Date.now();
        }
    } else {
        // Shoot bullet toward closest enemy
        const angle = tank.angleTo(closest);
        tank.turretAngle = angle;
        const bx = tank.centerX + Math.cos(angle) * 35;
        const by = tank.centerY + Math.sin(angle) * 35;
        bullets.push(new Bullet(bx, by, angle, 'player', tank.attackDamage));
        tank.lastAttackTime = Date.now();
    }
}

// ---- ALLY AI (unselected player tank auto-fights) ----
function updateAllyAI(dt) {
    const pt = getPlayerTanks();
    const enemies = getEnemyTanks().filter(e => e.alive);
    for (const tank of pt) {
        if (!tank.alive || tank.selected || enemies.length === 0) continue;
        // Find closest enemy
        let target = enemies[0];
        let targetDist = tank.distanceTo(enemies[0]);
        for (let i = 1; i < enemies.length; i++) {
            const d = tank.distanceTo(enemies[i]);
            if (d < targetDist) { targetDist = d; target = enemies[i]; }
        }
        const angle = tank.angleTo(target);
        if (tank.type === 'sawblade') {
            // Rush toward enemy
            tank.vx = Math.cos(angle) * tank.speed;
            tank.vy = Math.sin(angle) * tank.speed;
            tank.angle = angle;
            if (targetDist <= tank.attackRange + target.width / 2 && tank.canAttack()) {
                target.takeDamage(tank.attackDamage);
                spawnSawSparks(target.centerX, target.centerY);
                tank.lastAttackTime = Date.now();
            }
        } else {
            // Keep distance and shoot
            const idealDist = 220;
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
            if (tank.canAttack() && targetDist <= tank.attackRange) {
                const bx = tank.centerX + Math.cos(angle) * 35;
                const by = tank.centerY + Math.sin(angle) * 35;
                bullets.push(new Bullet(bx, by, angle, 'player', tank.attackDamage));
                tank.lastAttackTime = Date.now();
            }
        }
    }
}

// ---- ENEMY AI ----
function updateAI(dt) {
    const enemies = getEnemyTanks();
    const playerAlive = getPlayerTanks().filter(t => t.alive);

    for (const tank of enemies) {
        if (!tank.alive || playerAlive.length === 0) {
            tank.vx = 0;
            tank.vy = 0;
            continue;
        }

        // Pick target: closest player tank
        let target = playerAlive[0];
        let targetDist = tank.distanceTo(playerAlive[0]);
        for (let i = 1; i < playerAlive.length; i++) {
            const d = tank.distanceTo(playerAlive[i]);
            if (d < targetDist) {
                targetDist = d;
                target = playerAlive[i];
            }
        }

        const angleToTarget = tank.angleTo(target);

        if (tank.type === 'sawblade') {
            // Rush toward target
            tank.vx = Math.cos(angleToTarget) * tank.speed;
            tank.vy = Math.sin(angleToTarget) * tank.speed;
            tank.angle = angleToTarget;

            // Attack if in range
            if (targetDist <= tank.attackRange + target.width / 2 && tank.canAttack()) {
                target.takeDamage(tank.attackDamage);
                spawnSawSparks(target.centerX, target.centerY);
                tank.lastAttackTime = Date.now();
            }
        } else {
            // Cannon AI: keep distance, shoot
            const idealDist = 250;

            if (targetDist < idealDist - 50) {
                // Too close, back away
                tank.vx = -Math.cos(angleToTarget) * tank.speed;
                tank.vy = -Math.sin(angleToTarget) * tank.speed;
            } else if (targetDist > idealDist + 80) {
                // Too far, approach
                tank.vx = Math.cos(angleToTarget) * tank.speed * 0.8;
                tank.vy = Math.sin(angleToTarget) * tank.speed * 0.8;
            } else {
                // Good range, slow down
                tank.vx *= 0.85;
                tank.vy *= 0.85;
            }

            tank.turretAngle = angleToTarget;
            tank.angle = angleToTarget;

            // Shoot
            if (tank.canAttack() && targetDist <= tank.attackRange) {
                const bx = tank.centerX + Math.cos(angleToTarget) * 35;
                const by = tank.centerY + Math.sin(angleToTarget) * 35;
                bullets.push(new Bullet(bx, by, angleToTarget, 'enemy', tank.attackDamage));
                tank.lastAttackTime = Date.now();
            }
        }
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
                // Push apart
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

// ---- WIN/LOSE CHECK ----
function checkGameEnd() {
    const playerAlive = getPlayerTanks().some(t => t.alive);
    const enemyAlive = getEnemyTanks().some(t => t.alive);

    if (!playerAlive) {
        gameState.running = false;
        document.getElementById('gameOverTitle').textContent = '💀 DEFEAT 💀';
        document.getElementById('gameOverMsg').textContent = 'Your tanks were destroyed!';
        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('gameOverOverlay').classList.remove('hidden');
    } else if (!enemyAlive) {
        gameState.running = false;
        gameState.score += 100 * gameState.round;
        document.getElementById('gameOverTitle').textContent = '🏆 VICTORY! 🏆';
        document.getElementById('gameOverMsg').textContent = `Round ${gameState.round} complete!`;
        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('gameOverOverlay').classList.remove('hidden');
    }
}

// ---- DRAWING ----
function drawArena() {
    // Grass background
    ctx.fillStyle = '#5a8a3c';
    ctx.fillRect(0, 0, ARENA_W, ARENA_H);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < ARENA_W; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ARENA_H);
        ctx.stroke();
    }
    for (let y = 0; y < ARENA_H; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ARENA_W, y);
        ctx.stroke();
    }

    // Center line
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(ARENA_W / 2, 0);
    ctx.lineTo(ARENA_W / 2, ARENA_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Team zones
    ctx.fillStyle = 'rgba(52, 152, 219, 0.06)';
    ctx.fillRect(0, 0, ARENA_W / 2, ARENA_H);
    ctx.fillStyle = 'rgba(231, 76, 60, 0.06)';
    ctx.fillRect(ARENA_W / 2, 0, ARENA_W / 2, ARENA_H);
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

// ---- HUD ----
function updateHUD() {
    const pt = getPlayerTanks();
    const et = getEnemyTanks();

    document.getElementById('playerSawHp').style.width = `${Math.max(0, pt[0].hp / pt[0].maxHp * 100)}%`;
    document.getElementById('playerCannonHp').style.width = `${Math.max(0, pt[1].hp / pt[1].maxHp * 100)}%`;
    document.getElementById('enemySawHp').style.width = `${Math.max(0, et[0].hp / et[0].maxHp * 100)}%`;
    document.getElementById('enemyCannonHp').style.width = `${Math.max(0, et[1].hp / et[1].maxHp * 100)}%`;
    document.getElementById('roundNum').textContent = gameState.round;
    document.getElementById('score').textContent = gameState.score;
}

function updateSelectionUI() {
    const pt = getPlayerTanks();
    const sawBtn = document.getElementById('selectSaw');
    const cannonBtn = document.getElementById('selectCannon');

    sawBtn.classList.toggle('selected', gameState.selectedTankIndex === 0);
    cannonBtn.classList.toggle('selected', gameState.selectedTankIndex === 1);
    sawBtn.classList.toggle('dead', !pt[0].alive);
    cannonBtn.classList.toggle('dead', !pt[1].alive);

    pt.forEach((t, i) => t.selected = (i === gameState.selectedTankIndex && t.alive));
}

// ---- GAME LOOP ----
let lastTime = performance.now();

function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    if (gameState.running) {
        // Input
        updatePlayerInput();
        updateAllyAI(dt);
        updateAI(dt);

        // Update tanks
        for (const tank of tanks) {
            tank.update(dt);
        }

        // Update bullets
        for (const bullet of bullets) {
            bullet.update();
        }

        // Collisions
        checkBulletCollisions();
        checkTankCollisions();

        // Particles
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.life -= dt;
        }

        // Cleanup
        bullets = bullets.filter(b => b.alive);
        particles = particles.filter(p => p.life > 0);

        // Win/lose
        checkGameEnd();

        // HUD
        updateHUD();
    }

    // Draw
    ctx.clearRect(0, 0, ARENA_W, ARENA_H);
    drawArena();

    for (const bullet of bullets) {
        bullet.draw(ctx);
    }
    for (const tank of tanks) {
        tank.draw(ctx);
    }
    drawParticles();

    requestAnimationFrame(gameLoop);
}

// ---- EVENT LISTENERS ----

// Keyboard
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    keys[e.code] = true;

    if (e.key === '1') {
        gameState.selectedTankIndex = 0;
        updateSelectionUI();
    } else if (e.key === '2') {
        gameState.selectedTankIndex = 1;
        updateSelectionUI();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    keys[e.code] = false;
});

// Tank selection buttons
document.getElementById('selectSaw').addEventListener('click', () => {
    const pt = getPlayerTanks();
    if (pt[0].alive) {
        gameState.selectedTankIndex = 0;
        updateSelectionUI();
    }
});
document.getElementById('selectCannon').addEventListener('click', () => {
    const pt = getPlayerTanks();
    if (pt[1].alive) {
        gameState.selectedTankIndex = 1;
        updateSelectionUI();
    }
});

// Attack button
const attackBtn = document.getElementById('attack-btn');
attackBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    attackPressed = true;
    attackBtn.classList.add('pressed');
}, { passive: false });
attackBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    attackPressed = false;
    attackBtn.classList.remove('pressed');
}, { passive: false });
attackBtn.addEventListener('touchcancel', () => {
    attackPressed = false;
    attackBtn.classList.remove('pressed');
});
attackBtn.addEventListener('mousedown', () => { attackPressed = true; attackBtn.classList.add('pressed'); });
attackBtn.addEventListener('mouseup', () => { attackPressed = false; attackBtn.classList.remove('pressed'); });

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
            joystickKnob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
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
        if (e.changedTouches[i].identifier === joystickTouchId) {
            resetJoystick();
            break;
        }
    }
}, { passive: false });
joystickBase.addEventListener('touchcancel', resetJoystick);

// Play Again
document.getElementById('playAgainBtn').addEventListener('click', () => {
    document.getElementById('gameOverOverlay').classList.add('hidden');
    gameState.round++;
    initGame();
});

// ---- START ----
initGame();
requestAnimationFrame(gameLoop);
