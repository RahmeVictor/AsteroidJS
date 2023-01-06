// let canvasWidth = 1000;
// let canvasHeight = 800;
// let ship;
// let asteroids = [];
// let ctx;
//
// document.addEventListener('DOMContentLoaded', SetupCanvas);
//
// document.addEventListener("keydown", event => {
//     if (event.keyCode === 37) {
//         // Left arrow key pressed
//         ship.turnLeft();
//     } else if (event.keyCode === 38) {
//         // Up arrow key pressed
//         ship.moveForward();
//     } else if (event.keyCode === 39) {
//         // Right arrow key pressed
//         ship.turnRight();
//     } else if (event.keyCode === 40) {
//         // Down arrow key pressed
//         ship.moveBackward();
//     }
// });
//
//
// class SpaceShip {
//     constructor() {
//         this.x = canvasWidth / 2;
//         this.y = canvasHeight / 2;
//         this.thrust = 0.1;
//         this.direction = 0;
//         this.velocity = 0;
//         this.radius = 15;
//         this.angle = 0;
//         this.rotateSpeed = 0.001;
//     }
//
//     moveForward() {
//         // Increase the velocity in the direction the ship is facing
//         this.velocity += this.thrust * Math.cos(this.direction);
//         this.velocity += this.thrust * Math.sin(this.direction);
//     }
//
//     moveBackward() {
//         // Decrease the velocity in the direction the ship is facing
//         this.velocity -= this.thrust * Math.cos(this.direction);
//         this.velocity -= this.thrust * Math.sin(this.direction);
//     }
//
//     turnLeft() {
//         // Decrease the direction by a small amount
//         this.direction -= 0.1;
//         this.rotate(-1)
//     }
//
//     turnRight() {
//         // Increase the direction by a small amount
//         this.rotate(1)
//     }
//
//     rotate(dir) {
//         this.angle += this.rotateSpeed * dir;
//     }
//
//     update() {
//         // Get current direction ship is facing
//         let radians = this.direction / Math.PI * 180;
//
//         // Update the position based on the velocity
//         this.x += this.velocity * Math.cos(radians);
//         this.y += this.velocity * Math.sin(radians);
//     }
//
//     Draw() {
//         ctx.strokeStyle = 'white';
//         ctx.beginPath();
//         let radians = this.angle / Math.PI * 180;
//
//         // Angle between vertices of the ship
//         let vertAngle = ((Math.PI * 2) / 3);
//
//         // Where to fire bullet from
//         // this.noseX = this.x - this.radius * Math.cos(radians);
//         // this.noseY = this.y - this.radius * Math.sin(radians);
//
//         for (let i = 0; i < 3; i++) {
//             ctx.lineTo(this.x - this.radius * Math.cos(vertAngle * i + radians),
//                 this.y - this.radius * Math.sin(vertAngle * i + radians));
//         }
//         ctx.closePath();
//         ctx.stroke();
//     }
// }
//
// function SetupCanvas() {
//     ship = new SpaceShip();
//     canvas = document.getElementById("my-canvas");
//     ctx = canvas.getContext("2d");
//     canvas.width = canvasWidth;
//     canvas.height = canvasHeight;
//     ctx.fillStyle = "black";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//
//     // for (let i = 0; i < 8; i++) {
//     //     asteroids.push(new Asteroid());
//     // }
//
//     // document.body.addEventListener("keydown", HandleKeyDown);
//     // document.body.addEventListener("keyup", HandleKeyUp);
//
//     // Retrieves locally stored high scores
//     // if (localStorage.getItem(localStorageName) == null) {
//     //     highScore = 0;
//     // } else {
//     //     highScore = localStorage.getItem(localStorageName);
//     // }
//
//     Render();
// }
//
// function Render() {
//     ctx.clearRect(0, 0, canvasWidth, canvasHeight);
//     ship.update();
//     ship.Draw();
//
//     // Display score
//     ctx.fillStyle = 'white';
//     ctx.font = '21px Arial';
//     ctx.fillText("SCORE : " + ship.velocity, 20, 35);
//
//     requestAnimationFrame(Render);
// }