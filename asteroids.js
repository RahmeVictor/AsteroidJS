const defaultFont = '21px Arial';

let canvas;
let ctx;
let canvasWidth = 1400;
let canvasHeight = 800;
let keys = [];

let ship;
let bullets = [];
let asteroids = [];
let score = 0;
let lives = 3;
let highScore;
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
    ship.x = canvasWidth / 2;
    ship.y = canvasHeight / 2;
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
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillStyle = "black";
    ctx.textBaseline = "middle";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ship = new Ship();

    for (let i = 0; i < 8; i++) {
        asteroids.push(new Asteroid());
    }

    // Store all possible keycodes in an array so that
    // multiple keys can work at the same time
    // document.body.addEventListener("keydown", function(e) {
    //     keys[e.keyCode] = true;
    // });
    // document.body.addEventListener("keyup", function(e) {
    //     keys[e.keyCode] = false;
    //     if (e.keyCode === 32){
    //         bullets.push(new Bullet(ship.angle));
    //     }
    // });
    document.body.addEventListener("keydown", onKeyDown);
    document.body.addEventListener("keyup", onKeyUp);

    // Retrieves locally stored high scores
    if (localStorage.getItem(scoreStorage) == null) {
        highScore = 0;
    } else {
        highScore = localStorage.getItem(scoreStorage);
    }

    Render();
}

// Move event handling functions so that we can turn off
// event handling if game over is reached
function onKeyDown(e) {
    keys[e.keyCode] = true;
}

function onKeyUp(e) {
    keys[e.keyCode] = false;
}

class Ship {
    constructor() {
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.movingForward = false;
        this.speed = 0.1;
        this.velX = 0;
        this.velY = 0;
        this.rotateSpeed = 0.001;
        this.radius = 15;
        this.angle = 0;
        // Used to know where to fire the bullet from
        this.noseX = canvasWidth / 2 + 15;
        this.noseY = canvasHeight / 2;
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

        // If ship goes off board place it on the opposite side
        this.x = wrapScreen(this.x, canvas.width);
        this.y = wrapScreen(this.y, canvas.height);

        // Change value of x & y while accounting for air friction
        this.x -= this.velX;
        this.y -= this.velY;
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
        this.x = Math.floor(Math.random() * canvasWidth);
        this.y = Math.floor(Math.random() * canvasHeight);
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
    ship.movingForward = (keys[87]);

    if (keys[68]) {
        // d key rotate right
        ship.Rotate(1);
    }
    if (keys[65]) {
        // a key rotate left
        ship.Rotate(-1);
    }

    // Lanseaza racheta
    if (keys[32] && bullets.length < 3) {
        bullets.push(new Bullet(ship.angle));
        keys[32] = false;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // If no lives signal game over
    if (lives <= 0) {
        // If Game over remove event listeners to stop getting keyboard input
        document.body.removeEventListener("keydown", onKeyDown);
        document.body.removeEventListener("keyup", onKeyUp);

        ctx.fillStyle = 'white';
        ctx.font = '100px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('AI MURIT 🕹️', canvasWidth / 2, canvasHeight / 2);
        ctx.fillText('Scor: ' + score, canvasWidth / 2, canvasHeight / 2 + 100);
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

    // Updateaza nava
    ship.Update();
    ship.Draw();

    // Updateaza rachetele
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].Update();
        bullets[i].Draw();
    }

    // Updateaza asteroizii
    for (let j = 0; j < asteroids.length; j++) {
        asteroids[j].Update();
        asteroids[j].Draw();
    }

    // Display score
    ctx.fillStyle = 'white';
    ctx.font = defaultFont;
    ctx.fillText("SCOR : " + score.toString(), 20, 40);

    // Updates the high score using local storage
    highScore = Math.max(score, highScore);
    localStorage.setItem(scoreStorage, highScore);
    ctx.fillText("SCOR MAXIM : " + highScore.toString(), 20, 80);


    requestAnimationFrame(Render);
}