
// █████╗ ███████╗████████╗███████╗██████╗  ██████╗ ██╗██████╗ ███████╗     ██████╗  █████╗ ███╗   ███╗███████╗
// ██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗██╔═══██╗██║██╔══██╗██╔════╝    ██╔════╝ ██╔══██╗████╗ ████║██╔════╝
// ███████║███████╗   ██║   █████╗  ██████╔╝██║   ██║██║██║  ██║███████╗    ██║  ███╗███████║██╔████╔██║█████╗  
// ██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗██║   ██║██║██║  ██║╚════██║    ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  
// ██║  ██║███████║   ██║   ███████╗██║  ██║╚██████╔╝██║██████╔╝███████║    ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗
// ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝╚═════╝ ╚══════╝     ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝





const ASTEROID_JAGGEDNESS = 0.4 // jaggedness of the asteroids (0 = no jaggedness , 1 = max jaggedness)
const ASTEROID_NUM = 3; // starting number of asteroids 
const ASTEROID_SIZE = 100; // starting size of asteroids in pixels
const ASTEROID_SPEED = 50; // max starting speed of asteroids in pixels per seconds 
const ASTEROID_VERTICES = 10; // average number of vertices on each asteroid
const FPS = 30; // frames per second
const FRICTION = 0.7; // friction coefficient of space (0 = no friction , 1 = max friction)
const SHIP_EXPLODE_DURATION = 0.3; // duration of the ship's explosion 
const SHOW_HITBOX = true; // show or hide collision bounding
const SHIP_SIZE = 30; // ship height in pixels
const SHIP_THRUST = 5; // acceleration of ship in pixels per seconds
const TURN_SPEED = 360; // turn speed in degrees per secpond

/* @type  {HTMLCanvasElement} */
var canv = document.getElementById("gameCanvas")
var ctx = canv.getContext("2d");

var ship = {
    x: canv.width / 2,
    y: canv.height / 2,
    radius: SHIP_SIZE / 2, // radius
    a: 90 / 180 * Math.PI, // angle converted to radians
    rot: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
}

// set up asteroids
var asteroids = [];
createAsteroidBelt();


// set up event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);


// setting up game loop
setInterval(update, 1000 / FPS)

function createAsteroidBelt() {
    asteroids = [];
    var x, y;
    for (var i = 0; i < ASTEROID_NUM; i++) {
        do {
            x = Math.floor(Math.random() * canv.width);
            y = Math.floor(Math.random() * canv.height);
        } while (distanceBetweenPoints(ship.x, ship.y, x, y) < ASTEROID_SIZE * 2 + ship.radius);
        asteroids.push(newAsteroid(x, y));
    }

}

function distanceBetweenPoints(x1, y1, x2, y2) {
    // using pythagorean theorem

    // when this = 0 , there is no distance
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));



}

function explodeShip() {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DURATION * FPS);
}

function keyDown(/** @type {KeyboardEvent} */ event) {
    switch (event.keyCode) {
        case 37: // left arrow (rotate ship left)
            ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 38: // up arrow (move ship forward)
            ship.thrusting = true;
            break;

        case 39: // right arrow (rotate ship right)
            ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            break;
    }
}

function keyUp(/** @type {KeyboardEvent} */ event) {
    switch (event.keyCode) {
        case 37: // left arrow ( STOP rotate ship left)
            ship.rot = 0;
            break;
        case 38: // up arrow (STOP move ship forward)
            ship.thrusting = false;
            break;

        case 39: // right arrow ( STOP rotate ship right)
            ship.rot = 0;
            break;
    }
}

function newAsteroid(x, y) {
    var asteroid = {
        x: x,
        y: y,
        xvelocity: Math.random() * ASTEROID_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
        yvelocity: Math.random() * ASTEROID_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
        radius: ASTEROID_SIZE / 2,
        angle: Math.random() * Math.PI * 2, // in radians
        vertices: Math.floor(Math.random() * (ASTEROID_VERTICES + 1) + ASTEROID_VERTICES / 2),
        offset: []
    };

    // create the vertex offset array
    for (var i = 0; i < asteroid.vertices; i++) {
        asteroid.offset.push(Math.random() * ASTEROID_JAGGEDNESS * 2 + 1 - ASTEROID_JAGGEDNESS)
    }
    return asteroid;
}

function update() {

    // draw background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height)

    // thrust the ship
    if (ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;



        // draw thruster

        ctx.strokeStyle = "white",
            ctx.lineWidth = SHIP_SIZE / 20;
        ctx.beginPath();

        // rear left of the ship
        ctx.moveTo(
            ship.x - ship.radius * (Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
            ship.y + ship.radius * (Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
        );

        // rear center behind the ship
        ctx.lineTo(
            ship.x - ship.radius * (1.5 * Math.cos(ship.a)),
            ship.y + ship.radius * (1.5 * Math.sin(ship.a))
        );

        // rear right of the ship
        ctx.lineTo(
            ship.x - ship.radius * (Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
            ship.y + ship.radius * (Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
        );

        // completes triangle 
        ctx.closePath();

        //draw 
        ctx.stroke();
    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    // draw ship
    ctx.strokeStyle = "white";
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();

    // nose of the ship
    ctx.moveTo(
        ship.x + 4 / 3 * ship.radius * Math.cos(ship.a),
        ship.y - 4 / 3 * ship.radius * Math.sin(ship.a)
    );

    // rear left of the ship
    ctx.lineTo(
        ship.x - ship.radius * (Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.radius * (Math.sin(ship.a) - Math.cos(ship.a))
    );

    // rear of the ship
    ctx.lineTo(
        ship.x - ship.radius * (Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.radius * (Math.sin(ship.a) + Math.cos(ship.a))
    );

    // completes triangle 
    ctx.closePath()


    //draw 
    ctx.stroke();

    if (SHOW_HITBOX) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.radius * 1.4, 0, Math.PI * 2, false);
        ctx.stroke();
    }


    // draw the asteroids

    var x, y, radius, angle, vertices, offset;
    for (var i = 0; i < asteroids.length; i++) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = SHIP_SIZE / 20;

        // get asteroid properties
        x = asteroids[i].x;
        y = asteroids[i].y;
        radius = asteroids[i].radius;
        angle = asteroids[i].angle;
        vertices = asteroids[i].vertices;
        offset = asteroids[i].offset;

        ctx.fillStyle = "red";
        ctx.fillRect(asteroids[i].x, asteroids[i].y, 1, 1)

        // draw a path
        ctx.beginPath();
        ctx.moveTo(
            x + radius * offset[0] * Math.cos(angle),
            y + radius * offset[0] * Math.sin(angle)
        );

        // draw the polygon
        for (var j = 1; j < vertices; j++) {
            ctx.lineTo(
                x + radius * offset[j] * Math.cos(angle + j * Math.PI * 2 / vertices),
                y + radius * offset[j] * Math.sin(angle + j * Math.PI * 2 / vertices)
            );
        }
        ctx.closePath();
        ctx.stroke();

        if (SHOW_HITBOX) {
            ctx.strokeStyle = "lime";
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2, false);
            ctx.stroke();
        }


    }
    // check for asteroid collisions
    for (var i = 0; i < asteroids.length; i++) {
        if (distanceBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.radius + asteroids[i].radius) {
            explodeShip();
        }
    }

    // draw shipx, shipy
    ctx.fillStyle = "red";
    ctx.fillRect(ship.x, ship.y, 1, 1)


    // rotate ship
    ship.a += ship.rot;

    // move ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    // handle edge of screen
    if (ship.x < 0 - ship.radius) {
        ship.x = canv.width + ship.radius;
    } else if (ship.x > canv.width + ship.radius) {
        ship.x = 0 - ship.radius
    }
    if (ship.y < 0 - ship.radius) {
        ship.y = canv.height + ship.radius;
    } else if (ship.y > canv.height + ship.radius) {
        ship.y = 0 - ship.radius
    }

    // move the asteroid
    for (var i = 0; i < asteroids.length; i++) {

        asteroids[i].x += asteroids[i].xvelocity;
        asteroids[i].y += asteroids[i].yvelocity;

        // handle edge of screen 

        if (asteroids[i].x < 0 - asteroids[i].radius) {
            asteroids[i].x = canv.width + asteroids[i].radius;
        } else if (asteroids[i].x > canv.width + asteroids[i].radius) {
            asteroids[i].x = 0 - asteroids[i].radius
        }
        if (asteroids[i].y < 0 - asteroids[i].radius) {
            asteroids[i].y = canv.height + asteroids[i].radius;
        } else if (asteroids[i].y > canv.height + asteroids[i].radius) {
            asteroids[i].y = 0 - asteroids[i].radius
        }
    }

}
