import Phaser from 'phaser'

export default class UIScene extends Phaser.Scene
{
	constructor()
	{
		super('ui-scene')
	}

    platforms!: Phaser.Physics.Arcade.Group
    bananas!: Phaser.Physics.Arcade.Group
    palms!: Phaser.Physics.Arcade.Group
    clouds!: Phaser.Physics.Arcade.Group
    parrots!:Phaser.Physics.Arcade.Group
    player!:Phaser.Physics.Arcade.Sprite
    playButton!:Phaser.Physics.Arcade.Sprite
    muteButton!:Phaser.Physics.Arcade.Sprite
    collect!:Phaser.Sound.BaseSound
    tileWidth = 0
    tileHeight = 0
    canvas:any
    monkeyDirection = -1

    preload() {


        this.load.image('tile', 'img/tile.png')
        this.load.image('palm', 'img/palmier.png')
        this.load.image('banana', 'img/banane.png')
        this.load.image('cloud', 'img/cloud.png')
        this.load.image('sign', 'img/gametitle.png')

        this.load.audio('collect', 'fx/monkey_happy.mp3')

        this.load.spritesheet('parrot', 'img/parrot.png', {frameWidth:342, frameHeight:300})
        this.load.spritesheet('monkey', 'img/monkey_run.png', {frameWidth:140, frameHeight:150})
        this.load.spritesheet('buttons', 'img/buttons.png', {frameWidth:970, frameHeight:970})

        this.canvas = this.sys.canvas
        
    }
	create() {

    if (localStorage.getItem("MonkeyJumpSound") !== null) {
        console.log(Boolean(localStorage.getItem("MonkeyJumpSound")))
        this.game.sound.mute = Boolean(parseInt((localStorage.getItem("MonkeyJumpSound") || '0')));
    }

    window.addEventListener('resize', this.resizeApp);
    this.tileWidth = this.textures.get('tile').getSourceImage().width
    this.tileHeight = this.textures.get('tile').getSourceImage().height

    //sound
    this.collect = this.sound.add('collect')


    //anims
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('monkey', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key:'fly',
        frames: this.anims.generateFrameNumbers('parrot', {start:0, end:8}),
        frameRate:10,
        repeat: -1
    })

    this.anims.create({
        key:'play',
        frames: this.anims.generateFrameNumbers('buttons', {start:0, end:0}),
        frameRate:10,
    })

    this.anims.create({
        key:'restart',
        frames: this.anims.generateFrameNumbers('buttons', {start:6, end:6}),
        frameRate:10,
    })

    this.anims.create({
        key:'mute',
        frames: this.anims.generateFrameNumbers('buttons', {start:2, end:2}),
        frameRate:10,
    })

    this.anims.create({
        key:'restart',
        frames: this.anims.generateFrameNumbers('buttons', {start:6, end:6}),
        frameRate:10,
    })

    this.platforms = this.physics.add.group({key:'tile',active: true,visible:false,immovable:true})
    this.bananas = this.physics.add.group({key:'banana', active: true,visible:false,immovable:false})
    this.palms = this.physics.add.group({key:'palm', active: true, visible:false,immovable:true})
    this.parrots = this.physics.add.group({key:'parrot', quantity:10, visible:false, active:false})

    for(var i = 0; i<9; i++) {
        this.platforms.create(this.canvas.width/2 - this.tileWidth*i, this.canvas.height/2 + 2*this.tileWidth, 'tile').setDepth(2)
        this.platforms.create(this.canvas.width/2 + this.tileWidth*i, this.canvas.height/2 + 2*this.tileWidth, 'tile').setDepth(2)
        }
    this.palms.create(this.canvas.width/2 - 8*this.tileWidth, this.canvas.height/2 + this.tileHeight/7, 'palm').setScale(1.5).setDepth(2)
    this.palms.create(this.canvas.width/2 + 8*this.tileWidth, this.canvas.height/2 + this.tileHeight/7, 'palm').setScale(1.5).setDepth(2)
    this.bananas.create(this.canvas.width/2, this.canvas.height/2, 'banana').setScale(0.8).setBounce(1).setGravityY(300).setDepth(2)
    this.parrots.create(this.canvas.width + 100, Phaser.Math.Between(50, this.canvas.height - 50)).setScale(0.3).setActive(true).setFlipX(true).setVelocityX(-300).anims.play('fly')

    this.player = this.physics.add.sprite(this.canvas.width/2, this.canvas.height/2+ this.tileHeight*0.4, 'monkey')
    this.player.setBounce(0,0.2)
    this.player.setVelocityX(-150)
    this.player.setFlipX(true)
    this.player.setDepth(2)
    this.player.anims.play('run')

    this.playButton = this.physics.add.sprite(this.canvas.width/2 - 2*this.tileWidth, this.canvas.height/2 + 4*this.tileHeight,'buttons').setScale(0.2).setDepth(3).setInteractive()
    this.playButton.anims.play('play')

    this.muteButton = this.physics.add.sprite(this.canvas.width/2 + 2*this.tileWidth, this.canvas.height/2 + 4*this.tileHeight,'buttons').setScale(0.2).setDepth(3).setInteractive()
    this.muteButton.anims.play('mute')

        this.playButton.on('pointerdown', (_event:any, _gameObjects:any) =>
        {
            this.collect.play()
            this.startGame()
        });

        this.muteButton.on('pointerdown', (_pointer:any) =>
        {
            this.toggleMute()
        });

        this.add.image(this.canvas.width/2, 3*this.tileHeight, 'sign').setScale(0.5).setDepth(5)
        
        //clouds in the background
        this.clouds = this.physics.add.group()
        for(var i = 0; i< 30; i++) {
            var x = Phaser.Math.Between(0, this.canvas.width)
            var y = Phaser.Math.Between(0, this.canvas.height)
            var sc = Phaser.Math.FloatBetween(0.2, 1.5)
    
            var v = Phaser.Math.Between(0, 100)
    
            this.clouds.create(x,y,'cloud').setScale(sc).setVelocityX(-v)
        }

    this.physics.add.collider(this.bananas, this.platforms)
    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.collider(this.player, this.palms,this.hitpalm, function (_x:any) {}, this)

    this.cameras.main.fadeIn(2000)

    }

    update() {

        if (!this.game.sound.mute) {
            this.muteButton.tint = 16777215;
        } else {
            this.muteButton.tint = 16711680;
        }

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

        this.parrots.children.iterate(
            (p) => {
                if(p.body.position.x< - 2*this.tileWidth) {
                    p.setActive(false)
                    p.body.position.x =this.canvas.width + 100
                    p.body.position.y = Phaser.Math.Between(this.tileHeight, this.canvas.height - this.tileHeight)
                    p.body.velocity.x = - 250
                    p.setActive(true)
                }
            }
        )

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

startGame() {
    //go to next scene...
    this.cameras.main.fadeOut(2000)
    this.scene.stop()
    this.sys.game.scene.run('playGame')
}

toggleMute() {
    if (!this.game.sound.mute) {
        this.game.sound.mute = true;
        localStorage.setItem("MonkeyJumpSound", '1')
        this.muteButton.tint = 16711680;
    } else {
        this.game.sound.mute = false;
        localStorage.setItem("MonkeyJumpSound", '0')
        this.muteButton.tint = 16777215;
    }
}

hitpalm(player:any,_palm:any) {
    if(player.body.checkCollision.left) {
        if(this.monkeyDirection < 0) {
            player.setFlipX(false);
            player.setVelocityX(150);
            this.monkeyDirection = 1;
            } else if(this.monkeyDirection > 0) {
                player.setFlipX(true);
                player.setVelocityX(-150);
                this.monkeyDirection = -1;
            }
    }
}

}