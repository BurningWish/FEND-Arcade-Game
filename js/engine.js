/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */
var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        // canvas = doc.createElement('canvas'),
        canvas = doc.querySelector('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    // canvas.width = 505;
    // canvas.height = 606;
    // doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {

        // update all the entities - including all the enemies and all the floatingScoreChange objects
        updateEntities(dt);

        // check if the player collides with an enemy
        checkEnemyCollision();

        // check if the player collides with a gem
        checkGemCollision();
    }


    // The function used to check if the player collide with an enemy
    function checkEnemyCollision() {

        // use a variable called collision to record if collision happens
        var collision = false;

        // iterate through allEnemies array
        for (var i = 0; i < allEnemies.length; i++) {
            var enemy = allEnemies[i];
            // if an enemy and the player are in the same row, and they are close in x coordinate
            if ((Math.abs(enemy.y - player.y) == 10) & (Math.abs(enemy.x - player.x) <= 40)) {
                // we can jump out of the loop if we find one collision event, since that's enough
                collision = true;

                // initiate a flotingScoreChange object to record this collision
                var floatingScoreChange = new FloatingScoreChange(enemy.x, enemy.y + 100, -20);

                // And push this floatingScoreChange object to game.floatingScoreChanges array
                game.floatingScoreChanges.push(floatingScoreChange);

                break;
            }
        }

        // if we find collision at this moment, reset the player to the initial position, and player loses points
        if (collision) {

            // player only loses points if we don't get a negative result:)
            if (player.score >= 20) {
                player.score -= 20;
            }

            // reposition the player to the initial position
            player.reset();
        }
    }

    // The function used to check if a player successfully collects (collides with) a gem
    function checkGemCollision() {

        // If the player and the gem are in the same row and close in x coordiate, the collision happens
        if ((Math.abs(player.y - gem.y) == 20) & (Math.abs(player.x - gem.x) <= 40) & !game.victory) {

            // add the corresponding bonus of the gem to the player score
            player.score += gem.bonus;

            // initiate a flotingScoreChange object to record this collision
            var floatingScoreChange = new FloatingScoreChange(gem.x, gem.y + 100, gem.bonus);

            // And push this floatingScoreChange object to game.floatingScoreChanges array
            game.floatingScoreChanges.push(floatingScoreChange);


            // Now let's check if the player has earned enough points for victory
            if (player.score < 100) {
                // If player has less than 100 points, that means he hasn't won yet
                // Reset the player to initial position
                player.reset();

                // Regenerate a gem
                gem.regenerate();
            } else {
                // which means the player has enough points for victory
                // set game.victory to true
                game.victory = true;

                // And pause the game
                game.pause();
            }
        }
    }
    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        // update the all the enemy objects
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });

        // update all the floatingScoreChange objects
        updateFloatingScoreChange(dt);
    }

    // The function for updating all the floatingScoreChange objects
    function updateFloatingScoreChange(dt) {

        // First, make all the floatingScoreChange object move downwards for a small distance
        game.floatingScoreChanges.forEach(function(floatingScoreChange) {
            floatingScoreChange.y += 30 * dt;
        });

        // Then this is a very important step, which is checking if a floatingScoreChange object has existed for too long.
        // The general idea is that each floatingScoreChange object can only exist for 1 second, or 1000 milliseconds.
        if (game.floatingScoreChanges.length >= 1) {
            // If there are at least one floatingScoreChange object remaining in the game

            // Check the existing time for the 1st floatingScoreChange object in game.floatingScoreChanges,
            // The reason to only check the 1st element (index is 0) in the array, is because
            // it is the earliest element in the array, becasue I use game.floatingScoreChanges.push() to add element to the array
            // Therefore, there is only need to check the very first element in the array
            var existTime = Date.now() - game.floatingScoreChanges[0].createdAt;

            if (existTime > 1000) {
                // If that floatingScoreChange element exists for more than 1 second, remove it from the array
                game.floatingScoreChanges.shift();
            }
        }
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png', // Top row is water
                'images/stone-block.png', // Row 1 of 3 of stone
                'images/stone-block.png', // Row 2 of 3 of stone
                'images/stone-block.png', // Row 3 of 3 of stone
                'images/grass-block.png', // Row 1 of 2 of grass
                'images/grass-block.png' // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        // render all the entities, including enemies, floatingScoreChange objects, player and the gem
        renderEntities();

        // render all the texts associated with the game
        renderText();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        // render all the enemies
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        // render the gem
        gem.render();

        // render the player
        player.render();

        // render all the floatingScoreChange objects
        renderFloatingScoreChange();
    }

    // The function for rendering all the floatingScoreChange objects
    function renderFloatingScoreChange() {
        game.floatingScoreChanges.forEach(function(floatingScoreChange) {
            ctx.font = '30px Helvetica';

            if (floatingScoreChange.scoreChange > 0) {
                // if the score change is positive, i.e, if it is because of colliding with a gem
                ctx.fillStyle = '#fff';
                ctx.fillText('+ ' + floatingScoreChange.scoreChange.toString(), floatingScoreChange.x, floatingScoreChange.y);
            } else {
                // If the score change is negative, i.e, if it is because of colliding with an enemy
                ctx.fillStyle = '#f2112f';
                ctx.fillText('- 20', floatingScoreChange.x, floatingScoreChange.y);
            }
        });
    };

    // The function for render all the text
    function renderText() {

        // render the text occuring, when game is being paused by the player
        renderPauseText();

        // render the text occuring, when game is automatically paused for victory
        renderVictoryText();

        // render the current socre for the player
        renderScore();
    }

    // The function for rendering text, when game is paused by the player
    function renderPauseText() {
        if (game.isPaused & !game.victory) {
            // Only render the following text, if game is being paused, and player hasn't won yet
            ctx.font = '30pt Impact';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.fillStyle = 'white';

            ctx.fillText('The game is being paused', 257, 200);
            ctx.strokeText('The game is being paused', 257, 200);
            ctx.fillText('Press space to continue', 257, 300);
            ctx.strokeText('Press space to continue', 257, 300);
        }
    }

    // The function for rendering text, when game is paused by the victory
    function renderVictoryText() {
        if (game.isPaused & game.victory) {
            // Only render the following text, if game is being paused, and player has won
            ctx.font = '30pt Impact';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.fillStyle = 'white';

            ctx.fillText('Congratulations for your win', 257, 200);
            ctx.strokeText('Congratulations for your win', 257, 200);
            ctx.fillText('Press space to restart', 257, 300);
            ctx.strokeText('Press space to restart', 257, 300);
        }
    }

    // The function for rendering player score at the top left corner
    function renderScore() {
        ctx.clearRect(0, 0, 200, 30)
        ctx.font = '30px Helvetica';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#000';
        ctx.lineWidth = 0;
        ctx.fillText('Score: ' + player.score, 0, 30);
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);