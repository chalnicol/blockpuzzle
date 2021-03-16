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

        
        //scene1
        this.load.image('loadImg', 'client/assets/images/load_image.png');

        this.load.image('bgImg', 'client/assets/images/bg.png');

        this.load.image('titleImg', 'client/assets/images/title.png');

        this.load.spritesheet('startBtn', 'client/assets/images/startGame_btn.png', { frameWidth: 455, frameHeight: 107 });

        this.load.spritesheet('select', 'client/assets/images/select.png', { frameWidth: 297, frameHeight: 81 });

        this.load.spritesheet('audioBtns', 'client/assets/images/audio_btns.png', { frameWidth: 60, frameHeight: 50 });

        //scene2
        this.load.image('select2', 'client/assets/images/select2.png');

        this.load.spritesheet('select2_btns', 'client/assets/images/select2_btns.png', { frameWidth: 66, frameHeight: 66 });

        this.load.audioSprite('sfx', 'client/assets/sfx/fx_mixdown.json', [
            'client/assets/sfx/sfx.ogg',
            'client/assets/sfx/sfx.mp3'
        ]);

        this.load.audio ('bgsound', ['client/assets/sfx/puzzlebg.ogg', 'client/assets/sfx/puzzlebg.mp3'] );

        this.load.audio ('bgsound2', ['client/assets/sfx/puzzlebg2.ogg', 'client/assets/sfx/puzzlebg2.mp3'] );


    }
    
}
