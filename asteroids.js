        // Asteroids game     

        const FPS = 30; // frames per second
        const FRICTION = 0.7; // friction coefficient of space (0 = no friction , 1 = max friction)
        const SHIP_SIZE = 30; // ship height in pixels
        const TURN_SPEED = 360; // turn speed in degrees per secpond
        const SHIP_THRUST = 5; // acceleration of ship in pixels per seconds

        /* @type  {HTMLCanvasElement} */
        var canv = document.getElementById("gameCanvas")
        var ctx = canv.getContext("2d");

        var ship = {
            x: canv.width / 2,
            y: canv.height / 2,
            r: SHIP_SIZE / 2, // radius
            a: 90 / 180 * Math.PI, // angle converted to radians
            rot: 0,
            thrusting: false,
            thrust: {
                x: 0,
                y: 0
            }
        }

        // set up event handlers
        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp);


        // setting up game loop
        setInterval(update, 1000 / FPS)

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
                    ship.x - ship.r * (Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
                    ship.y + ship.r * (Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
                );

                // rear center behind the ship
                ctx.lineTo(
                    ship.x - ship.r * (1.5 * Math.cos(ship.a)),
                    ship.y + ship.r * (1.5 * Math.sin(ship.a))
                );

                // rear right of the ship
                ctx.lineTo(
                    ship.x - ship.r * (Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
                    ship.y + ship.r * (Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
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
                ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
            );

            // rear left of the ship
            ctx.lineTo(
                ship.x - ship.r * (Math.cos(ship.a) + Math.sin(ship.a)),
                ship.y + ship.r * (Math.sin(ship.a) - Math.cos(ship.a))
            );

            // rear of the ship
            ctx.lineTo(
                ship.x - ship.r * (Math.cos(ship.a) - Math.sin(ship.a)),
                ship.y + ship.r * (Math.sin(ship.a) + Math.cos(ship.a))
            );

            // completes triangle 
            ctx.closePath()


            //draw 
            ctx.stroke();

            // rotate ship
            ship.a += ship.rot;

            // move ship
            ship.x += ship.thrust.x;
            ship.y += ship.thrust.y;

            // handle edge of screen
            if (ship.x < 0 - ship.r) {
                ship.x = canv.width + ship.r;
            } else if (ship.x > canv.width + ship.r) {
                ship.x = 0 - ship.r
            }
            if (ship.y < 0 - ship.r) {
                ship.y = canv.height + ship.r;
            } else if (ship.y > canv.height + ship.r) {
                ship.y = 0 - ship.r
            }

        }
