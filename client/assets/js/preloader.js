class Preloader extends Phaser.Scene {

    constructor ()
    {
        super('Preloader');
    }
    preload ()
    {
        
        let _gW = this.game.config.width,
            _gH = this.game.config.height;

        this.add.text ( _gW/2, _gH/2, '', { fontSize: 36, fontFamily:'Oswald', color:'#fff'}).setOrigin(0.5);

        let txt = this.add.text (_gW/2, 500, 'Loading : 0%', { color:'#333', fontFamily:'Oswald', fontSize:34 }).setOrigin(0.5);

        //..
        let brct = this.add.rectangle ( (_gW - 350 )/2, 560, 350, 40 ).setStrokeStyle (3, 0x0a0a0a).setOrigin(0, 0.5);
        //..
        let rW = 340, rH = 30;

        let rct = this.add.rectangle ( (_gW - rW)/2, 560, 5, rH, 0x6a6a6a, 1 ).setOrigin(0, 0.5);

        this.load.on ('complete', function () {
            this.scene.start('Intro');
        }, this);

        this.load.on ('progress', function (progress) {

            txt.setText ( 'Loading : ' + Math.ceil( progress * 100 ) + '%' );

            if ( (rW * progress) > 5) rct.setSize ( rW * progress, rH );

        });

        

        //scene2
        this.load.image('setting', 'client/assets/images/setting.png');

        this.load.image('gameOver', 'client/assets/images/gameOverScreen.png');
        
        this.load.image('scoresbg', 'client/assets/images/scoresbg.png');

        this.load.image('bga', 'client/assets/images/bg.png');

        this.load.spritesheet('bigs', 'client/assets/images/big.png', { frameWidth: 130, frameHeight: 130 });

        this.load.spritesheet('gems', 'client/assets/images/gems.png', { frameWidth: 150, frameHeight: 150 });

        this.load.spritesheet('smalls', 'client/assets/images/sm.png', { frameWidth: 60, frameHeight: 60 });

        this.load.spritesheet('controls', 'client/assets/images/controls.png', { frameWidth: 150, frameHeight: 150 });

        this.load.spritesheet('cells', 'client/assets/images/cells.png', { frameWidth: 150, frameHeight: 150 });
        

        this.load.audioSprite('sfx', 'client/assets/sfx/fx_mixdown.json', [
            'client/assets/sfx/sfx.ogg',
            'client/assets/sfx/sfx.mp3'
        ]);

        this.load.audio ('bgsound', ['client/assets/sfx/puzzlebg.ogg', 'client/assets/sfx/puzzlebg.mp3'] );

        this.load.audio ('bgsound2', ['client/assets/sfx/puzzlebg2.ogg', 'client/assets/sfx/puzzlebg2.mp3'] );


    }
    
}
