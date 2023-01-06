const defaultFont = '21px Arial';

let canvas;
let ctx;
let keys = [];

let ship;
let bullets = [];
let asteroids = [];
let lives = 3;
let score = 0;
let healedScore = 0;
let highScore = 0;
let scoreStorage = "Score";


document.addEventListener('DOMContentLoaded', setupCanvas);


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


function setupCanvas() {
    canvas = document.getElementById("game-canvas");
    ctx = canvas.getContext("2d");
    canvas.width = 1400;
    canvas.height = 800;
    ctx.fillStyle = "black";
    ctx.textBaseline = "middle";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ship = new Ship();

    for (let i = 0; i < 8; i++) {
        asteroids.push(new Asteroid());
    }

    document.body.addEventListener("keydown", function (e) {
        keys.push(e.key);
    });
    document.body.addEventListener("keyup", function (e) {
        keys = keys.filter(key => key !== e.key);
    });

    // Retrieves locally stored high scores
    if (localStorage.getItem(scoreStorage) == null) {
        highScore = 0;
    } else {
        highScore = localStorage.getItem(scoreStorage);
    }

    Render();
}

class Ship {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.movingForward = false;
        this.speed = 0.1;
        this.velX = 0;
        this.velY = 0;
        this.rotateSpeed = 0.001;
        this.radius = 15;
        this.angle = 0;
        // Used to know where to fire the bullet from
        this.noseX = canvas.width / 2 + 15;
        this.noseY = canvas.height / 2;
    }

    Rotate(dir) {
        this.angle += this.rotateSpeed * dir;
    }

    Update() {
        // Get current direction ship is facing
        let radians = toRadians(this.angle);

        // If moving forward calculate changing values of x & y
        // If you want to find the new point x use the
        // formula oldX + cos(radians) * distance
        // Forumla for y oldY + sin(radians) * distance
        if (this.movingForward) {
            this.velX += Math.cos(radians) * this.speed;
            this.velY += Math.sin(radians) * this.speed;
        } else {
            // Slow ship speed when not holding key
            this.velX *= 0.99;
            this.velY *= 0.99;
        }
        this.x -= this.velX;
        this.y -= this.velY;

        // Daca nava trece de ecran, teleporteaz-o in partea cealalta
        this.x = wrapScreen(this.x, canvas.width);
        this.y = wrapScreen(this.y, canvas.height);
    }

    Draw() {
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        // Angle between vertices of the ship
        let vertAngle = ((Math.PI * 2) / 3);

        let radians = toRadians(this.angle);
        // Where to fire bullet from
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

class Bullet {
    constructor(angle) {
        this.x = ship.noseX;
        this.y = ship.noseY;
        this.angle = angle;
        this.height = 4;
        this.width = 4;
        this.speed = 5;
    }

    Update() {
        let radians = toRadians(this.angle);
        this.x -= Math.cos(radians) * this.speed;
        this.y -= Math.sin(radians) * this.speed;

        this.x = wrapScreen(this.x, canvas.width);
        this.y = wrapScreen(this.y, canvas.height);
    }

    Draw() {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Asteroid {
    constructor() {
        this.level = Math.floor(Math.random() * 4) + 1;
        this.x = Math.floor(Math.random() * canvas.width);
        this.y = Math.floor(Math.random() * canvas.height);
        this.speed = 2;
        this.radius = 30 + this.level * 5;
        this.angle = Math.floor(Math.random() * 359);
        this.collisionRadius = 46;
    }

    Update() {
        let radians = toRadians(this.angle);
        this.x += Math.cos(radians) * this.speed;
        this.y += Math.sin(radians) * this.speed;

        this.x = wrapScreen(this.x, canvas.width);
        this.y = wrapScreen(this.y, canvas.height);
    }

    Draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.textAlign = "center";
        ctx.fillText(this.level, this.x, this.y);
        ctx.textAlign = "start";
        ctx.closePath();
        ctx.stroke();
    }
}

function CircleCollision(p1x, p1y, r1, p2x, p2y, r2) {
    let radiusSum = r1 + r2;
    let xDiff = p1x - p2x;
    let yDiff = p1y - p2y;

    return radiusSum > Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
}

// Handles drawing life ships on screen
function DrawLifeShips() {
    ctx.font = '30px Arial';
    ctx.fillText('❤️'.repeat(lives), 1200, 40);
    ctx.font = defaultFont;
}

function Render() {
    // Check if the ship is moving forward
    ship.movingForward = (keys.find(key => key === 'ArrowUp'));

    if (keys.find(key => key === 'c')) {
        // d key rotate right
        ship.Rotate(1);
    }
    if (keys.find(key => key === 'x')) {
        // a key rotate left
        ship.Rotate(-1);
    }

    // Lanseaza racheta
    if (keys.find(key => key === ' ') && bullets.length < 3) {
        bullets.push(new Bullet(ship.angle));
        keys = keys.filter(key => key !== ' ');
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If no lives signal game over
    if (lives <= 0) {


        ctx.fillStyle = 'white';
        ctx.font = '100px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('AI MURIT 🕹️', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Scor: ' + score, canvas.width / 2, canvas.height / 2 + 100);
        ctx.font = defaultFont;
        ctx.textAlign = 'start';
    }

    // If you beat this level, create a new one
    if (asteroids.length === 0) resetLevel();

    // Draw life ships
    DrawLifeShips();

    // Check for collision of ship with asteroid
    if (asteroids.length !== 0) {
        for (let k = 0; k < asteroids.length; k++) {
            if (CircleCollision(ship.x, ship.y, 11, asteroids[k].x, asteroids[k].y, asteroids[k].collisionRadius)) {
                resetShip();
                lives -= 1;
            }
        }
    }

    // Check for collision with bullet and asteroid
    if (asteroids.length !== 0 && bullets.length !== 0) {
        loop1:
            for (let l = 0; l < asteroids.length; l++) {
                for (let m = 0; m < bullets.length; m++) {
                    if (CircleCollision(bullets[m].x, bullets[m].y, 3, asteroids[l].x, asteroids[l].y, asteroids[l].collisionRadius)) {
                        asteroids[l].level -= 1;
                        if (asteroids[l].level <= 0) {
                            asteroids.splice(l, 1);
                        }
                        bullets.splice(m, 1);
                        score += 20;

                        // Used to break out of loops because splicing arrays
                        // you are looping through will break otherwise
                        break loop1;
                    }
                }
            }
    }

    // Deseneaza nava
    ship.Update();
    ship.Draw();

    // Deseneaza rachetele
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].Update();
        bullets[i].Draw();
    }

    // Deseneaza asteroizii
    for (let j = 0; j < asteroids.length; j++) {
        asteroids[j].Update();
        asteroids[j].Draw();
    }

    // Afiseaza scor
    ctx.fillStyle = 'white';
    ctx.font = defaultFont;
    ctx.fillText("SCOR : " + score.toString(), 20, 40);

    // Adauga o viata la fiecare interval de puncte facute
    if (score - healedScore > 20 && lives < 4) {
        healedScore = score;
        lives += 1
    }

    // Stocheaza scor maxim
    highScore = Math.max(score, highScore);
    localStorage.setItem(scoreStorage, highScore);
    ctx.fillText("SCOR MAXIM : " + highScore.toString(), 20, 80);


    requestAnimationFrame(Render);
}