import Phaser from 'phaser'

export default class InfiniteScrollcene extends Phaser.Scene {
	constructor() {
		super('playGame')
    }

    tileWidth = 0
    tileheight = 0
    platforms!: Phaser.Physics.Arcade.Group
    bananas!: Phaser.Physics.Arcade.Group
    palms!: Phaser.Physics.Arcade.Group
    totems!:Phaser.Physics.Arcade.Group
    statues!:Phaser.Physics.Arcade.Group
    clouds!: Phaser.Physics.Arcade.Group
    parrots!:Phaser.Physics.Arcade.Group
    player!:Phaser.Physics.Arcade.Sprite
    playbutton!:Phaser.Physics.Arcade.Sprite
    quitbutton!:Phaser.Physics.Arcade.Sprite
    gonr!:Phaser.Physics.Arcade.Sprite
    canvas:any
    cursors!:Phaser.Types.Input.Keyboard.CursorKeys
    pointer!:Phaser.Input.Pointer
    timer = 0
    playerJumps = 0
    maxJumps = 2
    spacing = 300
    score = 0
    highscore = 0
    newHighScore = false
    paused = false
    safe = false
    scoreText:any
    highscoreText:any
    statueheight = 0
    //gameOverText:any
    isGameOver = false
    jump!:Phaser.Sound.BaseSound
    collect!:Phaser.Sound.BaseSound
    hit!:Phaser.Sound.BaseSound
    stone!:Phaser.Sound.BaseSound

preload() {

    this.load.image('tile', 'img/tile.png')
    this.load.image('cloud', 'img/cloud.png')
    this.load.image('palm', 'img/palmier.png')
    this.load.image('banana', 'img/banane.png')
    this.load.image('totem', 'img/totem.png')
    this.load.image('gameover', 'img/gameover.png')

    
    this.load.spritesheet('monkey_dead', 'img/monkey_dead.png', {frameWidth:95, frameHeight:145})
    this.load.spritesheet('monkey_idle', 'img/monkey_idle.png', {frameWidth:92, frameHeight:150})
    this.load.spritesheet('monkey', 'img/monkey_run.png', {frameWidth:140, frameHeight:150})
    this.load.spritesheet('monkey_jump', 'img/monkey_jump.png', {frameWidth:140, frameHeight:150})
    this.load.spritesheet('parrot', 'img/parrot.png', {frameWidth:342, frameHeight:300})
    this.load.spritesheet('buttons', 'img/buttons.png', {frameWidth:970, frameHeight:970})
    this.load.spritesheet('statue', 'img/statue.png', {frameWidth:210,frameHeight:295})
    this.load.spritesheet('gameover_nr', 'img/gameover_nr.png', {frameWidth:1200,frameHeight:678})

    this.load.audio('jump', 'fx/jump.mp3')
	this.load.audio('collect', 'fx/monkey_happy.mp3')
	this.load.audio('hit', 'fx/monkey-cry.mp3')
    this.load.audio('stone', 'fx/stone.mp3')
    this.canvas = this.sys.game.canvas;

}

create() {

    this.paused = false
    this.isGameOver = false

    if (localStorage.getItem("MonkeyJumpScore") !== null) {
        this.highscore = parseInt(localStorage.getItem("MonkeyJumpScore") ||'0');
    }
    else {
        this.highscore = 0
    }

    window.addEventListener('resize', this.resizeApp);
    this.tileWidth = this.textures.get('tile').getSourceImage().width
    this.tileheight = this.textures.get('tile').getSourceImage().height

    this.statueheight = this.textures.get('tile').getSourceImage().height

    //input handlers
    this.input.on("pointerdown", this.playerJump, this)
    this.input.keyboard.on("keydown-SPACE", this.gamePause, this)

    //clouds in the background
    this.clouds = this.physics.add.group()
    for(var i = 0; i< 30; i++) {
        var x = Phaser.Math.Between(0, this.canvas.width)
        var y = Phaser.Math.Between(0, this.canvas.height)
        var sc = Phaser.Math.FloatBetween(0.2, 1.5)

        var v = Phaser.Math.Between(0, 100)

        this.clouds.create(x,y,'cloud').setScale(sc).setVelocityX(-v)
    }

    //group of game objects
    this.platforms = this.physics.add.group({key:'tile', quantity:50, visible:false, active:false, immovable:true})
    this.palms = this.physics.add.group({key:'palm', quantity:10, visible:false, active:false, immovable:true})
    this.totems = this.physics.add.group({key:'totem', quantity:10, visible:false, active:false, immovable:true})
    this.bananas = this.physics.add.group({key:'banana', quantity:10, visible:false, active:false})
    this.parrots = this.physics.add.group({key:'parrot', quantity:10, visible:false, active:false})
    this.statues = this.physics.add.group({key:'statue', quantity:10, visible:false, active:false, immovable:true})

    //animations
    this.anims.create({
        key: 'hurt',
        frames: [ { key: 'monkey_dead', frame: 0 } ],
        frameRate: 20
    })

    this.anims.create({
        key: 'idle',
        frames: [ { key: 'monkey_idle', frame: 0 } ],
        frameRate: 20
    })

    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('monkey', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'crumble',
        frames: this.anims.generateFrameNumbers('statue', { start: 0, end: 5 }),
        frameRate: 10,
    })

    this.anims.create({
        key: 'fixed',
        frames: this.anims.generateFrameNumbers('statue', { start: 0, end: 0 }),
        frameRate: 10,
    })

    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('monkey_jump', { start: 0, end: 3 }),
        frameRate: 10,
    })

    this.anims.create({
        key:'fly',
        frames: this.anims.generateFrameNumbers('parrot', {start:0, end:8}),
        frameRate:10,
        repeat: -1
    })

    this.anims.create({
        key:'retry',
        frames: this.anims.generateFrameNumbers('buttons', {start:6, end:6}),
        frameRate:10,
    })

    this.anims.create({
        key:'quit',
        frames: this.anims.generateFrameNumbers('buttons', {start:1, end:1}),
        frameRate:10,
    })

    this.anims.create({
        key:'nr',
        frames: this.anims.generateFrameNumbers('gameover_nr', {start:0, end:3}),
        frameRate:4,
        repeat: -1
    })

    //sound creation
    this.jump = this.sound.add('jump')
	this.collect = this.sound.add('collect')
	this.hit = this.sound.add('hit')
    this.stone = this.sound.add('stone')

    //initialize 
    this.initPlatforms()
    this.createPlayer()

    //collision handlers
    this.physics.add.collider(this.player, this.platforms,this.isOnPlatform, function (_x:any) {}, this)
    this.physics.add.overlap(this.player, this.bananas, this.collectBanana, function (_x:any) {}, this)
    this.physics.add.overlap(this.player, this.parrots, this.hitParrot, function (_x:any) {}, this)
    this.physics.add.overlap(this.player, this.statues, this.hitStatue, function (_x:any) {}, this)
    this.physics.add.collider(this.bananas, this.platforms)

    //score
    this.score = 0
    this.scoreText = this.add.text(this.tileheight/2, this.tileheight, 'Score: 0',{font: '50px Arial', align:'center', color: "#fff"}).setDepth(5)
    this.highscoreText = this.add.text(this.tileheight/2, 2*this.tileheight, 'Record: ' + this.highscore,{font: '50px Arial', align:'center', color: "#fff"}).setDepth(5)

    //camera effect
    this.cameras.main.fadeIn()
}

//pause game
gamePause() {

        if(this.paused) {
            this.physics.resume()
            this.paused = false
        } else if(!this.paused) {
            this.paused = true 
            this.physics.pause() 
        }
}

// jump (handle double jump with counter)
playerJump() {
    if((!this.isGameOver) && (this.player.body.touching.down || (this.playerJumps < this.maxJumps))){
        this.player.setVelocityY(-600);
        this.playerJumps += 1
        this.jump.play()
        this.player.anims.play('jump')
    }
}

//main loop
update(_time:number, delta:number) {
    
    this.pointer = this.input.activePointer


    if(this.isGameOver) {

        this.player.anims.play('hurt')
        //this.gameOverText.setText('GAME OVER')

        this.playbutton = this.physics.add.sprite(this.canvas.width/2 - 2*this.tileWidth, this.canvas.height/2 + 4*this.tileheight,'buttons').setScale(0.2).setDepth(3).setInteractive()
        this.playbutton.anims.play('retry')
        this.playbutton.on('pointerdown', (_event:any, _gameObjects:any) =>
        {
            this.startGame()
        });

        this.quitbutton = this.physics.add.sprite(this.canvas.width/2 + 2*this.tileWidth, this.canvas.height/2 + 4*this.tileheight,'buttons').setScale(0.2).setDepth(3).setInteractive()
        this.quitbutton.anims.play('quit')
        this.quitbutton.on('pointerdown', (_event:any, _gameObjects:any) =>
        {
            this.quitGame()
        });

    }

    //every 2.5s add a new platform and a new parrot ennemy depending on score
    if(!this.paused && !this.isGameOver) {
        this.timer += delta
        while(this.timer > 2500) {
            this.addPlatform()
            //add a parrot depending on score
            var birdratio = Math.ceil(this.score/10)
            if(Phaser.Math.Between(0,100) <= birdratio)
            {
                this.addParrot(this.canvas.width, Phaser.Math.Between(50, this.canvas.height - 50))
            }
            this.timer -=2500 
        }
    }

    //destroy objects that are out of bounds

    this.platforms.children.iterate(
        (tile) => {
            if(tile.body.position.x < 0) {
                tile.setActive(false)
            }
        }
    )

    this.bananas.children.iterate(
        (banana) => {
            if(banana.body.position.x < 0) {
                banana.setActive(false)
            }
        }
    )

    this.palms.children.iterate(
        (palm) => {
            if(palm.body.position.x < 0) {
                palm.setActive(false)
            }
        }
    )

    this.totems.children.iterate(
        (totem) => {
            if(totem.body.position.x < 0) {
                totem.setActive(false)
            }
        }
    )

    this.parrots.children.iterate(
        (parrot) => {
            if(parrot.body.position.x < - 2*this.tileWidth) {
                parrot.setActive(false)
            }
        }
    )

    this.clouds.children.iterate(
        (cloud) => {
            if(cloud.body.position.x < - 2*this.tileWidth) {
                cloud.setActive(false)
                var x = this.canvas.width
                var y = Phaser.Math.Between(0, this.canvas.height)
                var v = Phaser.Math.Between(10, 300)
                cloud.body.position.x = x
                cloud.body.position.y = y
                cloud.body.velocity.x = -v
                cloud.setActive(true)
                        }
        }
    )

    //detect if player falled (only game over case not handled by a collision)
    if(this.player.body.position.y >= this.canvas.height - this.player.body.height && !this.isGameOver) {
        this.player.anims.play('hurt')
        this.hit.play()
        this.gameOver()
    }
}

//create a banana object on the platform. Bananas are collectible by the player and bounce for visual effect
addBanana(x:number, y:number) {
    var banana = this.bananas.getFirstDead()
    banana.setActive(true)
    banana.visible = true
    banana.body.reset(x,y)
    banana.setVelocityX(-300)
    banana.setScale(0.8)
    banana.setGravityY(200)
    banana.setBounce(0,1)
}

//create a totem object on the platform. Player goes behind the totem for visual effect but it's just decorative
addTotem(x:number, y:number) {
    var totem = this.totems.getFirstDead()
    totem.setActive(true)
    totem.visible = true
    totem.body.immovable = true
    totem.body.reset(x,y)
    totem.setScale(1.5)
    totem.setDepth(4)
    totem.setVelocityX(-300)
}

//create a Statue object on the platform. Statue kills the player unless he steps on them from above
addStatue(x:number, y:number) {
    var statue = this.statues.getFirstDead()
    statue.setActive(true)
    statue.visible = true
    statue.body.immovable = true
    statue.body.reset(x,y)
    statue.setScale(0.5)
    statue.setVelocityX(-300)
    statue.anims.play('fixed')
}

//create a palm tree object on the platform. Player goes in front of the palm tree for visual effect but it's just decorative
addPalm(x:number, y:number) {
    var palm = this.palms.getFirstDead()
    palm.setActive(true)
    palm.visible = true
    palm.body.immovable = true
    palm.body.reset(x,y)
    palm.setScale(1.5)
    palm.setVelocityX(-300)
}

// create a parrot enemy that flies in the opposite direction as the player. Collision with parrot will kill player
addParrot(x:number, y:number) {
    var parrot = this.parrots.getFirstDead()
    parrot.setActive(true)
    parrot.visible = true
    parrot.body.reset(x,y)
    parrot.setFlipX(true)
    parrot.setScale(0.3)
    parrot.anims.play('fly')
    parrot.setVelocityX(-350)
}

//the basic brick of any platform
addTile(x:number, y:number) {

    var tile = this.platforms.getFirstDead()
    tile.setActive(true)
    tile.body.immovable = true
    tile.visible = true
    tile.body.reset(x,y)
    tile.body.checkCollision.down = false
    tile.body.checkCollision.left = false
    tile.setVelocityX(-300);
}


// a platform is a line of tiles (between 4 and 6 tiles) that will appear at an random height every 2.5s. 
//On each platform there should be a collectible banana, a decorative palm tree or totem and, depending on the score, an ennemy statue

addPlatform(x?:number, y?:number, tilesNeeded?:number) {


    // you can specifiy the length of the platgform, otherwise random number of tiles between 4 and 6
    if(typeof(tilesNeeded) == 'undefined') {
        tilesNeeded = Phaser.Math.Between(4, 6)
    }

    // random height of the next platform if not specified. Randomly above or below the previous platform by a maximum of 1.5 times the pl ayers height
    if(typeof(y) == 'undefined') {

        let flipCoin = Phaser.Math.Between(0,1)
        if(flipCoin == 0) {
            y = this.canvas.height/2 - Phaser.Math.Between(0, 1.5*this.player.body.height)
        } else {
            y = this.canvas.height/2 + Phaser.Math.Between(0, 1.5*this.player.body.height)
        }

    }

    // platforms always appear at the border of the screen unless specified
    if(typeof(x) == 'undefined' && tilesNeeded) (
        x = this.canvas.width + tilesNeeded*this.tileheight
    )
    

    //random position of palm tree and bananas.
    var palmpos = Phaser.Math.Between(0, tilesNeeded-1)
    var bananapos = Phaser.Math.Between(0, tilesNeeded)

    // make banana and palm tree not in the same position (for visual clarity)
    while(bananapos == palmpos) {
        bananapos = Phaser.Math.Between(0, tilesNeeded)
    }
    
    //the higher the score gets, the more frequently statues encounter happen
    var statueratio = Math.ceil(this.score/100)

    for (var i = 0; i < tilesNeeded; i++){
        if(typeof(x) !== 'undefined'){
            this.addTile(x - i*this.tileWidth, y);
            if(i == bananapos) {
                this.addBanana(x - i*this.tileWidth, y - 2*(this.tileheight * 0.8))
            }
            if(i == palmpos) {
                //replace palm by totem randomly
                if(Phaser.Math.Between(1,6) == 6) {
                    this.addTotem(x - i*this.tileWidth, y - (this.tileheight * 1.8))
                } 
                //add a statue in place of a palm tree depending on the score
                else if(Phaser.Math.Between(0,100) <= statueratio) {
                    this.addStatue(x - i*this.tileWidth, y - (this.tileheight * 1.5))
                }
                else {
                    // add a palm tree on each platform
                    this.addPalm(x - i*this.tileWidth, y - (this.tileheight * 1.8))
                }
            }
        }
    }
}

resizeApp ()
{
    // Width-height-ratio of game resolution
    // Replace 360 with your game width, and replace 640 with your game height
    let game_ratio = 900 / 1600;
	
    // Make div full height of browser and keep the ratio of game resolution
    let div = document.getElementById('app');
    div!.style.width = (window.innerHeight * game_ratio) + 'px';
    div!.style.height = window.innerHeight + 'px';
	
    // Check if device DPI messes up the width-height-ratio
    let canvas	= document.getElementsByTagName('canvas')[0];
	
    let dpi_w	= parseInt(div!.style.width) / canvas.width;
    let dpi_h	= parseInt(div!.style.height) / canvas.height;		
	
    let height	= window.innerHeight * (dpi_w / dpi_h);
    let width	= height * game_ratio;
	
    // Scale canvas	
    canvas.style.width	= width + 'px';
    canvas.style.height	= height + 'px';
}

//creates the first 3 platform in fixed position and length to initialize the game
initPlatforms() {

    this.addPlatform(800,800, 5)
    this.addPlatform(1400, 600, 5)
    this.addPlatform(1800,400, 5)

}

//drop the player above the first platform and sets it's physics properties
createPlayer() {

    this.player = this.physics.add.sprite(
        this.physics.world.bounds.centerX,
        this.physics.world.bounds.centerY - (this.spacing*2 + (3*this.tileheight)), 'monkey').setScale(0.8)
    
    this.player.setGravityY(900)
    this.player.setBounce(0, 0.2 )
    this.player.setCollideWorldBounds(false)
    this.player.setDepth(2)
    this.player.anims.play('run')
    this.maxJumps = 2
    this.playerJumps = 0
}

//when overlapping with a banana, play a sound, increment score and destroy it
collectBanana(_player:any, banana:any) {

    banana.destroy()
    this.bananas.create(-100,-100,'banana').setActive(false)

    this.collect.play()

    this.incrementScore(25)
}

// when colliding with a parrot, player is dead. Do not destroy the parrot for better understanding of the player.
hitParrot(_player:any, _parrot:any) {

    this.hit.play()
    this.gameOver()
}

// when colliding with a statue, the player is dead, unless he steps on it from above. In that case he scores and jumps from the statue
hitStatue(player:any, statue:any) {

    var deltah = player.body.position.y - statue.body.position.y

    if(deltah < -this.tileheight*1.5) {
        this.safe = true
        this.incrementScore(100)
        this.playerJumps = 0
        this.playerJump()
        if(statue.anims.getName() != 'crumble') {
            statue.play('crumble')
            this.stone.play()
            statue.once('animationcomplete', ()=>  {
                statue.destroy();
                this.statues.create(-100, -100, 'statue').setActive(false)
                this.safe = false
            })
        }
    } else if (!this.safe){
        player.anims.play('hurt')
        this.hit.play()
        this.gameOver()
    }
}

//basic collision with the platforms : don't fall through and play the wakling animaiton
isOnPlatform(_player:any, _platform:any) {

    if(this.player.body.touching.down) {
        if(!this.player.anims.isPlaying){
            this.player.anims.play("run");
        }
        this.playerJumps = 0
    }

}

//restart game directly after game over
startGame() {
    this.scene.restart()
}

//go back to main menu after game over
quitGame() {
    this.scene.stop()
    this.sys.game.scene.run('ui-scene')
}

// handles score update and high score update on local storage
incrementScore(s:number) {
    this.score +=s
    this.scoreText.setText('Score: '+ this.score)

    if(this.score > this.highscore) {
        this.highscore = this.score
        localStorage.setItem("MonkeyJumpScore", this.highscore.toString());
        this.highscoreText.setText('Record: '+ this.highscore)
        this.newHighScore = true
    }
 }

// handles game over : change the player animation, display UI buttons and pause physics.
gameOver() { 
    this.player.anims.play('hurt')
    
    if(this.newHighScore) {
        this.gonr = this.physics.add.sprite(this.canvas.width/2, 6*this.tileheight, 'gameover_nr').setScale(0.5).setDepth(6)
        this.gonr.anims.play('nr')
    } else {
        this.physics.add.image(this.canvas.width/2, 6*this.tileheight, 'gameover').setScale(0.5).setDepth(6)
    }
    this.isGameOver = true
    this.physics.pause()
    this.newHighScore = false
}

}