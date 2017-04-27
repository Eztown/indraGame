var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('enemyBullet', 'assets/enemy-bullet.png');
	game.load.image('invader', 'assets/dragon.png');
    game.load.image('indra', 'assets/indra.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    game.load.image('starfield', 'assets/starfield.png');
}

var player;
var bullets;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var starfield;
var lives = 3;
var enemyBullet;
var firingTimer = 0;
var stateText;
var dragon;
var life;
var lifeText;

function create() {
	
	life = 100;

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  The hero!
    player = game.add.sprite(400, 500, 'indra');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);

    //  The dragon!
    dragon = game.add.sprite(50,100,'invader');
    //dragon.enableBody = true;
	game.physics.enable(dragon, Phaser.Physics.ARCADE);

    createDragon();

    //  Lives
    lives = 3;
    lifeText = game.add.text(game.world.width - 130, 10, 'Lives : '+lives, { font: '34px Arial', fill: '#fff' });

    //  Text
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '30px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    setupAnimations();

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
}

function createDragon () {

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
	var tween = game.add.tween(dragon).to( { x: 700 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);
}

function setupAnimations () {

    dragon.anchor.x = 0.5;
    dragon.anchor.y = 0.5;
    //dragon.animations.add('kaboom');
	//player.animations.add('kaboom');
}

function descend() {

}

function render(){
	
}

function update() {

    //  Scroll the background
    starfield.tilePosition.y += 2;

    if (player.alive)
    {
        //  Reset the player, then check for movement keys
        player.body.velocity.setTo(0, 0);

        if (cursors.left.isDown)
        {
            player.body.velocity.x = -200;
        }
        if (cursors.right.isDown)
        {
            player.body.velocity.x = 200;
        }

        //  Firing?
        if (fireButton.isDown)
        {
            fireBullet();
        }

        if (game.time.now > firingTimer && life>0)
        {
            enemyFires();
        }

        //  Run collision
        game.physics.arcade.overlap(bullets, dragon, collisionHandler, null, this);
        game.physics.arcade.collide(enemyBullets, player, enemyHitsPlayer, null, this);
    }

}

function collisionHandler (bullet, dragon) {

    bullets.removeAll();
	bullets.createMultiple(30, 'bullet');
	bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
	
	

    //  And create an explosion :)
	life-=10;
	
    if (life <= 0)
    {
        enemyBullets.callAll('kill',this);
        stateText.text = " YOU WON! Now water can be restored to the land!";
        stateText.visible = true;
		
		game.tweens.removeAll();
    }

}

function enemyHitsPlayer (player,bullet) {
    
    bullet.kill();

        lives=lives-1;
		lifeText.text = "Lives: "+lives;
		

    //  And create an explosion :)
    //player.animations.play('kaboom', 30, false, true);

    // When the player dies
    if (lives < 1)
    {
        player.kill();
        enemyBullets.callAll('kill');

        stateText.text=" GAME OVER! The humans will now suffer famine's wrath \n Click to restart";
        stateText.visible = true;
    }

}

function enemyFires () {
	
	enemyBullet = enemyBullets.getFirstExists(false);
        enemyBullet.reset(dragon.x, dragon.y);

        game.physics.arcade.moveToObject(enemyBullet,player,120);
		if(life>30)
			firingTimer = game.time.now + 1500;
		else
			firingTimer = game.time.now + 500;

}

function fireBullet () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            //  And fire it
            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 200;
        }
    }

}

function resetBullet (bullet) {

    //  Called if the bullet goes out of the screen
    bullet.kill();

}

function restart () {
    //resets the life count
    lives = 3;
	life = 100;
	lifeText.text = "Lives: "+lives;
    //  And brings the aliens back from the dead :)
    createDragon();

    //revives the player
    player.revive();
    //hides the text
    stateText.visible = false;

}
