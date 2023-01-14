const defaultFont = '21px Arial';

let canvas;
let ctx;
let keys = [];

let ship;
let rockets = [];
let asteroids = [];
let lives = 3;
let score = 0;
let healedScore = 0;
let highScore = 0;
const scoreStorage = 'Score';


document.addEventListener('DOMContentLoaded', setupCanvas);


function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function toRadians(angle) {
    return angle / Math.PI * 180;
}

function wrapScreen(value, screenLimit) {
    if (value < 0) {
        return screenLimit;
    }
    if (value > screenLimit) {
        return 0;
    }
    return value;
}

function resetShip() {
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
    ship.velX = 0;
    ship.velY = 0;
}


function resetLevel() {
    resetShip();
    for (let i = 0; i < 8; i++) {
        let asteroid = new Asteroid();
        asteroids.push(asteroid);
    }
}

function circleCollision(p1x, p1y, r1, p2x, p2y, r2) {
    let px = p1x - p2x;
    let py = p1y - p2y;

    return r1 + r2 > Math.sqrt(px * px + py * py);
}

function setupCanvas() {
    document.body.addEventListener('keydown', function (e) {
        keys.push(e.key);
    });
    document.body.addEventListener('keyup', function (e) {
        keys = keys.filter(key => key !== e.key);
    });

    canvas = document.getElementById('game-canvas');
    canvas.width = 1400;
    canvas.height = 800;
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'middle';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ship = new Ship();

    for (let i = 0; i < 8; i++) {
        asteroids.push(new Asteroid());
    }

    // Preia scorul maxim din local storage
    if (localStorage.getItem(scoreStorage) == null) {
        highScore = 0;
    } else {
        highScore = localStorage.getItem(scoreStorage);
    }

    render();
}

class Ship {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speed = 0.1;
        this.maxSpeed = 2;
        this.rotateSpeed = 0.001;
        this.velX = 0;
        this.velY = 0;
        this.radius = 15;
        this.angle = 0;

        // De unde trage nava
        this.noseX = canvas.width / 2 + this.radius;
        this.noseY = canvas.height / 2;
    }

    rotate(dir) {
        this.angle += this.rotateSpeed * dir;
    }

    update() {
        if (keys.find(key => key === 'ArrowLeft'))
            this.velX += this.speed
        if (keys.find(key => key === 'ArrowRight'))
            this.velX -= this.speed
        if (keys.find(key => key === 'ArrowUp'))
            this.velY += this.speed
        if (keys.find(key => key === 'ArrowDown'))
            this.velY -= this.speed
        if (keys.find(key => key === 'c'))
            this.rotate(1);
        if (keys.find(key => key === 'x'))
            this.rotate(-1);


        this.velX = clamp(this.velX, -this.maxSpeed, this.maxSpeed)
        this.velY = clamp(this.velY, -this.maxSpeed, this.maxSpeed)
        this.x -= this.velX;
        this.y -= this.velY;
        this.velX = this.velX * 0.97;
        this.velY = this.velY * 0.97;

        // Daca nava trece de ecran, pune-o in partea cealalta
        this.x = wrapScreen(this.x, canvas.width);
        this.y = wrapScreen(this.y, canvas.height);
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        // Unghiul dintre liniile navei (triunghi echilateral)
        let vertAngle = ((Math.PI * 2) / 3);

        let radians = toRadians(this.angle);
        // De unde va trage nava  racheta
        this.noseX = this.x - this.radius * Math.cos(radians);
        this.noseY = this.y - this.radius * Math.sin(radians);

        for (let i = 0; i < 3; i++) {
            ctx.lineTo(this.x - this.radius * Math.cos(vertAngle * i + radians),
                this.y - this.radius * Math.sin(vertAngle * i + radians));
        }
        ctx.closePath();
        ctx.stroke();
    }
}

class Rocket {
    constructor() {
        this.x = ship.noseX;
        this.y = ship.noseY;
        this.angle = ship.angle;
        this.size = 6;
        this.speed = 5;
    }

    checkCollision(rocketIndex) {
        for (let l = 0; l < asteroids.length; l++) {
            if (circleCollision(this.x, this.y, 3, asteroids[l].x, asteroids[l].y, asteroids[l].radius)) {
                asteroids[l].lives -= 1;
                if (asteroids[l].lives <= 0) {
                    asteroids.splice(l, 1);
                }
                rockets.splice(rocketIndex, 1);
                score += 20;
                return;
            }
        }
    }

    update() {
        let radians = toRadians(this.angle);
        this.x -= Math.cos(radians) * this.speed;
        this.y -= Math.sin(radians) * this.speed;

        this.x = wrapScreen(this.x, canvas.width);
        this.y = wrapScreen(this.y, canvas.height);
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class Asteroid {
    constructor() {
        this.lives = Math.floor(Math.random() * 4) + 1;
        this.x = Math.floor(Math.random() * canvas.width);
        this.y = Math.floor(Math.random() * canvas.height);
        this.speed = randomBetween(0.5, 2.3);
        this.radius = 30 + this.lives * 5;
        this.angle = Math.floor(Math.random() * 359);
    }

    getColor() {
        switch (this.lives) {
            case 1:
                return 'green'
            case 2:
                return 'blue'
            case 3:
                return 'yellow'
            case 4:
                return 'white'
        }
    }

    update() {
        let radians = toRadians(this.angle);
        this.x += Math.cos(radians) * this.speed;
        this.y += Math.sin(radians) * this.speed;

        this.x = wrapScreen(this.x, canvas.width);
        this.y = wrapScreen(this.y, canvas.height);
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.getColor();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.textAlign = 'center';
        ctx.fillText(this.lives, this.x, this.y);
        ctx.textAlign = 'start';
        ctx.closePath();
        ctx.stroke();
    }
}

function render() {
    // Lanseaza racheta
    if (keys.find(key => key === ' ') && rockets.length < 3) {
        rockets.push(new Rocket());
        keys = keys.filter(key => key !== ' ');
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Daca nu mai ai vieti
    if (lives <= 0) {
        ctx.fillStyle = 'white';
        ctx.font = '100px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('AI MURIT 🕹️', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Scor: ' + score, canvas.width / 2, canvas.height / 2 + 100);
        ctx.font = defaultFont;
        ctx.textAlign = 'start';
        requestAnimationFrame(render);
        return;
    }

    // Daca ai terminat nivelul
    if (asteroids.length === 0) resetLevel();

    // Coliziune nava cu asteroizi
    if (asteroids.length !== 0) {
        for (let k = 0; k < asteroids.length; k++) {
            if (circleCollision(ship.x, ship.y, 11, asteroids[k].x, asteroids[k].y, asteroids[k].radius)) {
                resetShip();
                if (lives > 0) lives -= 1;
            }
        }
    }

    // Coliziune intre asteroizi si rachete
    for (let m = 0; m < rockets.length; m++) {
        rockets[m].checkCollision(m);
    }

    // Adauga o viata la fiecare interval de puncte facute
    if (score - healedScore >= 100 && lives < 4) {
        healedScore = score;
        lives += 1;
    }

    // Deseneaza nava
    ship.update();
    ship.draw();

    // Deseneaza rachetele
    for (let i = 0; i < rockets.length; i++) {
        rockets[i].update();
        rockets[i].draw();
    }

    // Deseneaza asteroizii
    for (let j = 0; j < asteroids.length; j++) {
        asteroids[j].update();
        asteroids[j].draw();
    }

    // Afiseaza scor
    ctx.fillStyle = 'white';
    ctx.font = defaultFont;
    ctx.fillText('SCOR : ' + score, 20, 40);


    // Stocheaza scor maxim
    highScore = Math.max(score, highScore);
    localStorage.setItem(scoreStorage, highScore);
    ctx.fillText('SCOR MAXIM : ' + highScore, 20, 80);

    // Deseneaza vietile ramase
    ctx.font = '30px Arial';
    ctx.fillText('❤️'.repeat(lives), 1200, 40);
    ctx.font = defaultFont;

    requestAnimationFrame(render);
}