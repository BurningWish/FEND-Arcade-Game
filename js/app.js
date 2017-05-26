'use strict'

// Enemies our player must avoid
var Enemy = function(x, y, speed) {
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    // The x and y refers to the coordinate of the enemy(bug)
    this.x = x;
    this.y = y;

    // This is the speed of the enemy(bug)
    this.speed = speed;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {

    // Move the enemy(bug) along the x axis by increasing its x coordinate
    this.x += dt * this.speed;

    // If enemy moves out of screen, then re-position it to the very left
    // And reset its speed using a random integer between 150 - 350
    if (this.x >= 505) {
        this.x = -101;
        this.speed = Math.floor(Math.random() * 201) + 150;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// The constructor for the player
var Player = function(x, y) {
    this.sprite = 'images/char-boy.png';
    this.x = x;
    this.y = y;

    // The game score for the player
    this.score = 0;
};


// The render function for the player
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// The handleInput function will react to key board input to change game state
Player.prototype.handleInput = function(key) {
    switch (key) {
        case 'left':
            // If left key got pressed
            if (this.x >= 101 && !game.isPaused) {
                // If player will not move out of canvas, and game is not being paused, let player move left
                this.x -= 101;
            }
            break;

        case 'right':
            // If right key got pressed
            if (this.x <= 303 && !game.isPaused) {
                // If player will not move out of canvas, and game is not being paused, let player move right
                this.x += 101;
            }
            break;

        case 'up':
            // If up key got pressed
            if (this.y >= 72 && !game.isPaused) {
                // If player will not move out of canvas, and game is not being paused, let player move up
                this.y -= 83;
            }
            break;

        case 'down':
            // If up key got pressed
            if (this.y <= 322 && !game.isPaused) {
                // If player will not move out of canvas, and game is not being paused, let player move down
                this.y += 83;
            }
            break;

        case 'togglePause':
            // If space key got pressed, this will make game either pause or continue, depending on if game is being paused
            if (!game.isPaused) {
                // If game is not being paused, then pause the game
                game.pause();
            } else {
                // If game is being paused, then continue the game
                game.continue();
            }
            break;

        default:
            break;
    }
};

// The reset function will re-position the player to its initial position
Player.prototype.reset = function() {
    this.x = 202;
    this.y = 405;
};

// The constructor for the game object
// a game object will have 4 properties to keep track of the game state
var Game = function() {

    // isPause property is used to track if game is being paused
    this.isPaused = false;

    // victory property is used to track if the player wins the game (gaining more than 100 pts) at this moment
    this.victory = false;

    // enemySpeedArray will store the enemies speeds when the game get paused
    // when the game get paused, actually what happen here is I set each enemy's speed to zero
    // therefore, when player want to continue the game, this array stores neccessary data to restore enemy speed
    this.enemySpeedArray = [];

    // floatingScoreChanges is an array storing the score change, caused by either
    // colliding with an enemy, or successfully collecting an gem.
    // "+10", "+15", "+20", or "-20" text will flying around in the game,
    // and each one is a floatingScoreChange object (see below for details).
    // In short, this floatingScoreChanges array stores all the current floatingScoreChange objects existing in the game.
    this.floatingScoreChanges = [];
};

// The pause function for the game object
Game.prototype.pause = function() {

    // First, record speed of each enemy into game.enemySpeedArray
    for (var i = 0; i < allEnemies.length; i++) {
        game.enemySpeedArray[i] = allEnemies[i].speed;
    }

    // Then set all the enemies speed to zero
    allEnemies.forEach(function(enemy) {
        enemy.speed = 0;
    });

    // Set game.isPaused to true
    this.isPaused = true;
};


// The continue function for the game object
Game.prototype.continue = function() {
    // Re-store the speed for enemy using game.enemySpeedArray
    for (var i = 0; i < allEnemies.length; i++) {
        allEnemies[i].speed = game.enemySpeedArray[i];
    }

    // Set game.isPaused to false
    this.isPaused = false;

    // In here I need to check if the game is previously paused because player press space key,
    // or if it is because the player has earned enought points (pause automatically caused by victory)
    if (game.victory) {
        // Only do the following things, if we continue from game victory pause

        // Move the player to initial position
        player.reset();

        // Reset player score to zero
        player.score = 0;

        // Reset game.victory to false
        game.victory = false;
    }
};

// The constructor for the gem object
// Basically, everytime when the game is running, there will be one and only one gem existing
var Gem = function() {

    // Initial gem (first gem in the game) is the green gem, when the player run the game at the very beginning
    this.sprite = 'images/Gem Green.png';

    // bonus is the points player get, when he collects this gem
    this.bonus = 10;

    // Initial gem is generated at a random position
    this.x = Math.floor(Math.random() * 5) * 101 + 15;
    this.y = 10;
};

// The regenerate function for the gem object
// This function will be called each time when the player collects the current gem
// The newly generated gem can either be green, blue or orange, and has corresponding bonus
// The newly generated gem will locate in a random position
Gem.prototype.regenerate = function() {
    var randomIndex = Math.floor(Math.random() * 3);
    this.sprite = ['images/Gem Green.png', 'images/Gem Blue.png', 'images/Gem Orange.png'][randomIndex];
    this.bonus = [10, 15, 20][randomIndex];
    this.x = Math.floor(Math.random() * 5) * 101 + 15;
};

// The render function for the gem object
Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 71, 120);
};

// As mentioned earlier, the constructor for floatingScoreChange object
var FloatingScoreChange = function(x, y, scoreChange) {

    // each floatingScoreChange object is allowed to exist for 1 second (1000 milliseconds)
    // therefore, I need a property to record when this object is created
    // or in other words, when a collision (to either the enemy or the gem) happen
    this.createdAt = Date.now();

    // scoreChange property can be 10, 15, or 20, depending on if the player collides with a gem
    // or it can be -20, if the player collide with an enemy
    this.scoreChange = scoreChange;

    // the position of the floatingScoreChange object
    this.x = x;
    this.y = y;
};

// Initiate the player object at the initial position
var player = new Player(202, 405);

// Initiate all the enemies and store them in an array
var allEnemies = [];
var enemy1 = new Enemy(0, 63, 150);
var enemy2 = new Enemy(0, 146, 150);
var enemy3 = new Enemy(0, 229, 200);
allEnemies = [enemy1, enemy2, enemy3];

// Initiate the game object
var game = new Game();

// Initiate the gem object
var gem = new Gem();

// If the player press either up, down, left, right or space, the event will be processed
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'togglePause'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});