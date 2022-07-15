
// █████╗ ███████╗████████╗███████╗██████╗  ██████╗ ██╗██████╗ ███████╗     ██████╗  █████╗ ███╗   ███╗███████╗
// ██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗██╔═══██╗██║██╔══██╗██╔════╝    ██╔════╝ ██╔══██╗████╗ ████║██╔════╝
// ███████║███████╗   ██║   █████╗  ██████╔╝██║   ██║██║██║  ██║███████╗    ██║  ███╗███████║██╔████╔██║█████╗  
// ██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗██║   ██║██║██║  ██║╚════██║    ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  
// ██║  ██║███████║   ██║   ███████╗██║  ██║╚██████╔╝██║██████╔╝███████║    ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗
// ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝╚═════╝ ╚══════╝     ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝





const ASTEROID_JAGGEDNESS = 0.4 // jaggedness of the asteroids (0 = no jaggedness , 1 = max jaggedness)
const ASTEROID_NUM = 1; // starting number of asteroids 
const ASTEROID_SIZE = 100; // starting size of asteroids in pixels
const ASTEROID_SPEED = 50; // max starting speed of asteroids in pixels per seconds 
const ASTEROID_VERTICES = 10; // average number of vertices on each asteroid
const FPS = 30; // frames per second
const FRICTION = 0.7; // friction coefficient of space (0 = no friction , 1 = max friction)
const LASER_DISTANCE = 0.6 // max distance laser can travel as fraction of screen width
const LASER_MAX = 10; // maximum number of lasers on screen at once
const LASER_SPEED = 500; // speed of lazers in pixels per seconds
const SHIP_BLINK_DURATION = 0.1; // // duration of the ship's blinking during invincibility in seconds  
const SHIP_EXPLODE_DURATION = 0.3; // duration of the ship's explosion 
const SHIP_INVINCIBILITY_DURATION = 3; // duration of the ship's invincibility in seconds 
const SHOW_ASTEROID_CENTER = false; // show or hide all asteroids center
const SHOW_HITBOX = false; // show or hide collision hitbox
const SHOW_SHIP_CENTER = false // show or hide ship center
const SHIP_SIZE = 30; // ship height in pixels
const SHIP_THRUST = 5; // acceleration of ship in pixels per seconds
const TEXT_FADE_TIME = 2.5; // text fade time in seconds
const TEXT_SIZE = 40; // text font height in pixels
const TURN_SPEED = 360; // turn speed in degrees per secpond



/* @type  {HTMLCanvasElement} */
var canv = document.getElementById("gameCanvas")
var ctx = canv.getContext("2d");

// set up the game parameters
var level, asteroids, ship, text, textAlpha;
newGame();


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
    for (var i = 0; i < ASTEROID_NUM + level; i++) {
        do {
            x = Math.floor(Math.random() * canv.width);
            y = Math.floor(Math.random() * canv.height);
        } while (distanceBetweenPoints(ship.x, ship.y, x, y) < ASTEROID_SIZE * 2 + ship.radius);
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 2)));
    }

}

function destroyAsteroid(index) {
    var x = asteroids[index].x;
    var y = asteroids[index].y;
    var r = asteroids[index].radius;

    // split the asteroid in two if necessisary
    if (r == Math.ceil(ASTEROID_SIZE / 2)) {
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 4)));
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 4)));
    } else if (r == Math.ceil(ASTEROID_SIZE / 4)) {
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 8)));
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 8)));
    }

    // destroy asteroids
    asteroids.splice(index, 1);

    // new level when no more asteroids

    if (asteroids.length == 0) {
        level++;
        newLevel();
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
        case 32: // space arrow (shoot laser)
            shootLaser();
            break;
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
        case 32: // space arrow (allow shooting again / therefore stopping shooting in the process)
            ship.canShoot = true
            break;
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

function newAsteroid(x, y, r) {
    var lvlMultiplyer = 1 + 0.1 * level;
    var asteroid = {
        x: x,
        y: y,
        xvelocity: Math.random() * ASTEROID_SPEED * lvlMultiplyer / FPS * (Math.random() < 0.5 ? 1 : -1),
        yvelocity: Math.random() * ASTEROID_SPEED * lvlMultiplyer / FPS * (Math.random() < 0.5 ? 1 : -1),
        radius: r,
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

function shootLaser() {
    // create laser object
    if (ship.canShoot && ship.lasers.length < LASER_MAX) {
        ship.lasers.push({
            x: ship.x + 4 / 3 * ship.radius * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.radius * Math.sin(ship.a),
            xvelocity: LASER_SPEED * Math.cos(ship.a) / FPS,
            yvelocity: -LASER_SPEED * Math.sin(ship.a) / FPS,
            distance: 0
        });
    }

    // prevent further shooting
    ship.canShoot = false;
}

function newGame() {
    level = 0;
    // set up spaceship
    ship = newShip();
    newLevel();
}

function newLevel() {
    text = "Level " + (level + 1);
    textAlpha = 1.0;
    createAsteroidBelt();
}

function newShip() {
    return {
        x: canv.width / 2,
        y: canv.height / 2,
        radius: SHIP_SIZE / 2, // radius
        a: 90 / 180 * Math.PI, // angle converted to radians
        blinkNumber: Math.ceil(SHIP_INVINCIBILITY_DURATION / SHIP_BLINK_DURATION),
        blinkTime: Math.ceil(SHIP_BLINK_DURATION * FPS),
        canShoot: true,
        lasers: [],
        explodeTime: 0,
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
}

function update() {
    var blinkOn = ship.blinkNumber % 2 == 0; // even number
    var exploding = ship.explodeTime > 0;

    // draw background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height)

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

        if (SHOW_ASTEROID_CENTER) {
            ctx.fillStyle = "red";
            ctx.fillRect(asteroids[i].x, asteroids[i].y, 1, 1)
        }
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

    }

    if (SHOW_HITBOX) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    // thrust the ship
    if (ship.thrusting && !exploding && blinkOn) {

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
    if (!exploding) {
        if (blinkOn) {
            //draw 
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
            ctx.stroke();
        }

        // handle blinking
        if (ship.blinkNumber > 0) {
            // reduce the blink time
            ship.blinkTime--;

            // reduce the blink number
            if (ship.blinkTime == 0) {
                ship.blinkTime = Math.ceil(SHIP_BLINK_DURATION * FPS);
                ship.blinkNumber--;
            }
        }

    } else {
        // draw the explosion
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.radius * 1.7, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.radius * 1.4, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.radius * 1.1, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.radius * 0.8, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.radius * 0.5, 0, Math.PI * 2, false);
        ctx.fill();


    }


    if (SHOW_HITBOX) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.radius * 1.4, 0, Math.PI * 2, false);
        ctx.stroke();
    }




    // draw lasers 
    for (var i = 0; i < ship.lasers.length; i++) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false)
        ctx.fill()
    }

    // draw the game text 
    if (textAlpha >= 0) {
        ctx.fillStyle = "rbga(255,255,255, " + textAlpha + ")";
        ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono";
        ctx.fillText(text, canv.width / 2, canv.height * 0.75);
        textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
    }
    // dectect laser hits asteroid

    var asteroidx, asteroidy, radius, laserx, lasery;
    for (var i = asteroids.length - 1; i >= 0; i--) {

        // grab the asteroid properties 
        asteroidx = asteroids[i].x;
        asteroidy = asteroids[i].y;
        asteroidradius = asteroids[i].radius;

        // loop over the lasers 
        for (var j = ship.lasers.length - 1; j >= 0; j--) {

            // grab the laser properties 
            laserx = ship.lasers[j].x;
            lasery = ship.lasers[j].y;


            // detect hits 
            if (distanceBetweenPoints(asteroidx, asteroidy, laserx, lasery) < asteroidradius) {

                // draw the explosion
                ctx.fillStyle = "orangered";
                ctx.beginPath();
                ctx.arc(laserx, lasery, ship.radius * 0.75, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "salmon";
                ctx.beginPath();
                ctx.arc(laserx, lasery, ship.radius * 0.5, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "pink";
                ctx.beginPath();
                ctx.arc(laserx, lasery, ship.radius * 0.25, 0, Math.PI * 2, false);
                ctx.fill();

                

                // remove the laser
                ship.lasers.splice(j, 1);

                // remove the asteroid
                destroyAsteroid(i);

                

                break;
            }
        }
    }


    // check for asteroid collisions

    if (!exploding) {
        // if blink number equals 0 then handle collision detection (only check when not blinking)
        if (ship.blinkNumber == 0) {
            for (var i = 0; i < asteroids.length; i++) {
                if (distanceBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.radius + asteroids[i].radius) {
                    explodeShip();
                    destroyAsteroid(i);
                    break;
                }
            }
        }


        // rotate ship
        ship.a += ship.rot;

        // move ship
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;
    } else {
        ship.explodeTime--;

        if (ship.explodeTime == 0) {
            ship = newShip()
        }
    }


    // draw shipx, shipy
    if (SHOW_SHIP_CENTER) {
        ctx.fillStyle = "red";
        ctx.fillRect(ship.x, ship.y, 1, 1)
    }



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

    // move the lasers 

    for (var i = ship.lasers.length - 1; i >= 0; i--) {
        // check distance travelled
        if (ship.lasers[i].distance > LASER_DISTANCE * canv.width) {
            ship.lasers.splice(i, 1);
            continue;
        }


        // move laser 
        ship.lasers[i].x += ship.lasers[i].xvelocity
        ship.lasers[i].y += ship.lasers[i].yvelocity

        // calculate distance travelled w/ pythagorean theorem


        ship.lasers[i].distance += Math.sqrt(Math.pow(ship.lasers[i].xvelocity, 2) + Math.pow(ship.lasers[i].xvelocity, 2))

        // handle edge of screen for lasers
        if (ship.lasers[i].x < 0) {
            ship.lasers[i].x = canv.width;
        } else if (ship.lasers[i].x > canv.width) {
            ship.lasers[i].x = 0;
        }
        if (ship.lasers[i].y < 0) {
            ship.lasers[i].y = canv.height;
        } else if (ship.lasers[i].y > canv.height) {
            ship.lasers[i].y = 0;
        }
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
