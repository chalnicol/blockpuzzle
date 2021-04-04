

class Intro extends Phaser.Scene {

    constructor ()
    {
        super('Intro');
    }

    preload ()
    {
        //todo..
    }

    create ()
    {

        // create grid 
        var _this = this;

        this.counter = 0;

        this.boxClicked = 0;

        //this.eldata = 0;

        this.cellCollided = -1;

        this.grid = [];

        this.elementsData = [];

        this.score = 0;

        this.bestScore = 100; // todo..

        this.isBoxClicked = false;

        this.gameIsOver = false;

        let _gW = this.game.config.width,
            _gH = this.game.config.height;

        //create grid..

        const bsize = 130;

        const sx = (_gW - (bsize*8))/2, 
              sy = _gH * 0.15;

        this.cellsCont = this.add.container (0,0);

        for ( var i = 0; i < 64; i++ ) {

            let ix = Math.floor ( i/8 ),
                iy = i%8;
            
            let xp = iy * ( bsize ) + sx,
                yp = ix * ( bsize ) + sy;

            let img = this.add.image ( xp + (bsize/2), yp + (bsize/2), 'cells' ).setName('img'+i);

            let rcta = this.add.rectangle (xp, yp, bsize, bsize, 0x8e8e8e, 0 ).setOrigin (0).setData ('id', i ).setName('cell'+i);

            //let txt = this.add.text (xp +(bsize*0.1), yp + (bsize*0.05), i, { color:'white', fontSize : bsize*0.3, fontFamily : 'Oswald'} );

           

            this.cellsCont.add ( [ img, rcta  ]);

            this.grid.push ( 0 );

        }

        this.trueSize = bsize;

        //create hidden boxes..
        this.bottomCont = this.add.container (0, 0)

        const csize = _gW * 0.3,
              cspace =  ((_gW*0.96) - (csize * 3))/2;

        const sxa = (_gW - (_gW*0.96) )/2 + (csize/2), 
              sya = _gH * 0.8;

        for ( var i = 0; i < 3; i++ ) {

            let box = this.add.rectangle ( i * (csize+cspace) + sxa,  sya, csize, csize, 0x3a3a3a, 0 ).setName ('box' + i ).setData('id', i);

            box.on ('pointerdown', function ( pointer ) {
                
                _this.boxClicked = this.getData('id');

               _this.popElements (pointer);

            });

            this.bottomCont.add ( box );

        }

        this.add.rectangle ( _gW/2, _gH*0.8, 1040, csize, 0x9c9c9c, 1 ).setStrokeStyle (2, 0xffffff);

        this.add.text ( 25, _gH*0.97, 'Version By : Chalnicol', { fontSize: 30, fontFamily:'Oswald', color : 'black'});


        // score..
        
        this.add.rectangle (20, 50, 424, 153, 0x00ffff, 1 ).setStrokeStyle (2, 0x3a3a3a).setOrigin(0);

        this.add.rectangle (462, 50, 424, 153, 0x00ffff, 1 ).setStrokeStyle (2, 0x3a3a3a).setOrigin(0);

        

        this.scoreTxt = this.add.text ( 424, 50, '0', { fontSize: 120, fontFamily:'Oswald', color:'#7e7e7e' }).setOrigin (1, 0);

        this.bestTxt = this.add.text ( 866, 50, '100', { fontSize: 120, fontFamily:'Oswald', color:'#7e7e7e' }).setOrigin (1, 0);

        this.add.text ( 22, 215, 'CURRENT SCORE', { fontSize: 30, fontFamily:'Oswald', color: '#803612' });

        this.add.text ( 464, 215, 'BEST SCORE', { fontSize: 30, fontFamily:'Oswald', color: '#803612' });


        //settings..

        this.musicOff = false;

        this.soundOff = false;

        let cont = this.add.container ( 905 + (153/2), 50 + (153/2) ).setSize ( 153, 153 ).setInteractive();

        let rcte = this.add.rectangle (0, 0, 153, 153, 0x00ffff, 1 ).setStrokeStyle (2, 0x3a3a3a);

        let imge = this.add.image ( 0, 0, 'setting' );

        cont.add ([ rcte, imge ]);

        cont.on ('pointerover', function () {
            this.first.setFillStyle ( 0x99ffff, 1);
        });
        cont.on ('pointerout', function () {
            this.first.setFillStyle ( 0x00ffff, 1);
        });
        cont.on ('pointerup', function () {
            this.first.setFillStyle ( 0x00ffff, 1);
        });
        cont.on ('pointerdown', function () {
            this.first.setFillStyle ( 0x99ff99, 1);
            this.scene.showSettingScreen();
        });
        


        // load elements data.. 
        this.elements = [];

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {

            if (this.readyState == 4 && this.status == 200) {

                _this.elements = JSON.parse(this.responseText);

                _this.createRandomElements();
            }
        };
        xmlhttp.open("GET", "client/assets/json/data.json", true);
        xmlhttp.send();

        //create container for elements..
        this.elementsCont = this.add.container (0, 0);

        //create container for cells fielded..
        this.cellPermanentCont = this.add.container(0, 0);

        //initBgSound
        //this.bgmusic = this.sound.add('bgsound2').setVolume(0.2).setLoop(true);

        //this.bgmusic.play();

        this.music = this.sound.addAudioSprite('sfx');

        //..
        this.input.on ('pointerup', function ( pointer ) {

            if ( this.isBoxClicked ) {

               
                if ( this.cellCollided >= 0 ) {
                    
                    this.setPermanent ();

                }else {
                    this.retract ();

                    this.clearCells ();
                }
                
                this.isBoxClicked = false;

            }

        }, this );

        this.input.on ('pointermove', function ( pointer ) {
            if ( this.isBoxClicked ) {
                this.moveElement ( pointer.x, pointer.y ); 
            }
        }, this);

    }

    addScore () {

        this.scoreTxt.text = this.score;

        if ( this.score > this.bestScore ) {

            this.bestTxt.text = this.score;

            this.bestScore = this.score;
        }
        
    }

    playSound ( snd, vol=0.5 ) {
        if ( !this.soundOff ) {
            this.music.play ( snd, { volume : vol } );
        }
    }

    createRandomElements () 
    {
        
        this.elementsData = [];

        for ( var i = 0; i < 3; i++ ) {

            let box = this.bottomCont.getByName ('box' + i );

            box.setInteractive()

            let randNum = Math.floor ( Math.random() * this.elements.length );

            let rndClrId = Math.floor ( Math.random() * 5 ) + 1 ;

            // let dim = box.width * 0.9/5;

            let dim = 60;

            let element = new GameElement ( this, box.x, box.y, null,  this.elements [ randNum ], dim, rndClrId, 1, 'smalls' ).setName ('el' + i );
        
            this.elementsCont.add (element);

            this.elementsData.push ( { 'style' : randNum, 'colorid' : rndClrId, 'used' : false } );

        }

        this.counter = 0;

    }

    popElements ( pointer ) 
    {   

        const edata = this.elementsData [ this.boxClicked ].style;

        const eclr = this.elementsData [ this.boxClicked ].colorid;

        this.isBoxClicked = true;

        //hide element..
        this.elementsCont.getByName ('el' + this.boxClicked ).visible = false;

        //create bigger element..

        let box = this.bottomCont.getByName ('box' + this.boxClicked );

        box.disableInteractive();

        //..
        let totalH = this.elements [edata].row * this.trueSize;

        let bigger = new GameElement ( this, box.x, box.y, null,  this.elements [ edata ], this.trueSize, eclr, 0.9 ).setName ('bigEl' + this.boxClicked );

        bigger.setScale ( 0.7 );

        this.tweens.add ({
            targets : bigger,
            scaleX : 1, scaleY : 1,
            y : pointer.y - (totalH/2) - 150,
            duration : 30,
            ease : 'Linear'
        });

        this.playSound ( 'clicka' );


    }

    retract ()
    {   

        let box = this.bottomCont.getByName ('box' + this.boxClicked );

        let bigEl = this.children.getByName ( 'bigEl' + this.boxClicked );

        let smallEl = this.elementsCont.getByName ('el' + this.boxClicked );

        this.tweens.add ({

            targets : bigEl,
            x : box.x,
            y : box.y,
            scaleX : 0.7,
            scaleY : 0.7,
            duration : 100,
            ease : 'Linear',
            onComplete : function () {
                bigEl.destroy();
                smallEl.visible = true;
                box.setInteractive();
            }

        });

        


    }
    
    moveElement ( x, y ) 
    {
        
        this.clearCells ();

        this.resetLines();

        let box = this.bottomCont.getByName ('box' + this.boxClicked );
        
        let totalH = this.elements [ this.elementsData [this.boxClicked].style ].row * this.trueSize;

        let bigEl = this.children.getByName ( 'bigEl' + this.boxClicked );

        bigEl.setPosition ( x, y - (totalH/2) - 150  );


        let cellHit = this.getHit ();

        if ( cellHit != null ) {

            if ( this.checkField ( cellHit, this.boxClicked ) ) {

                this.cellCollided = cellHit;

                this.illuminate ( cellHit );

                this.tempCheckLines ();

            }
            
        }
       
    }

    hitTest ( el, cell ) 
    {
        return (el.x - el.width/2) >= (cell.x - cell.width/2) 
            && (el.y - el.height/2) >= (cell.y - cell.height/2)
            && (el.x - el.width/2) < ( cell.x + cell.width/2)
            && (el.y - el.height/2) < ( cell.y + cell.height/2);

    }

    getHit () {

        let bigEl = this.children.getByName ( 'bigEl' + this.boxClicked );

        for ( var i = 0; i < 64; i++) {
        
            let cell = this.cellsCont.getByName ('cell' + i );

            if ( this.hitTest ( bigEl, cell )) {
                return i;
            }

        }   

        return null;

    }

    clearCells () {

        this.cellCollided = -1;

        for ( var i = 0; i < 64; i++) {

            let cell = this.cellsCont.getByName ('img' + i );

            cell.setFrame ( 0 );
            
        }   


    }

    illuminate ( cellid ) {

        const mydata = this.elements [ this.elementsData [ this.boxClicked ].style ];

        const r = Math.floor ( cellid/8 ), c = cellid % 8;
         
        for ( var i = 0; i < mydata.row ; i++ ) {

            for ( var j = 0; j < mydata.col ; j++ ) {

                if ( (i + r) < 8 && (c+j) < 8  ) {

                    if ( mydata.arr [i][j] == 1 ) {

                        let n =  ((i+r)*8)+(c+j);
                        
                        let cell = this.cellsCont.getByName ( 'img' + n );

                        cell.setFrame (1);

                        //cell.setFillStyle (0xcecece, 1);

                    }
                    
                }
    
            }

        }
    }

    checkField ( cellid, el ) {

        const mydata = this.elements [ this.elementsData [ el ].style  ];

        const r = Math.floor ( cellid/8 ), c = cellid % 8;
         
        for ( var i = 0; i < mydata.row ; i++ ) {

            for ( var j = 0; j < mydata.col ; j++ ) {

                if ( (i + r) >= 8 || (c+j) >= 8  ) return false;

                if ( mydata.arr [i][j] == 1 ) {

                    let cellnmbr = ( i+r) * 8 + ( c+j );

                    if ( this.grid [ cellnmbr ] == 1 ) return false;

                }
               
            }

        }

        return true;

    }

    setPermanent ()
    {   

        let _this = this;

        let cll = this.cellsCont.getByName ('cell' + this.cellCollided);

        let bigEl = this.children.getByName ('bigEl' + this.boxClicked);

        const bx = cll.x + bigEl.width/2,
              by = cll.y + bigEl.height/2;

        this.add.tween ({
            targets : bigEl,
            x : bx, y : by,
            duration : 30,
            ease : 'Linear',
            onComplete: function () {
                bigEl.destroy ();
                _this.showPermanent ();
            }
        });

        bigEl.iterate ( function ( child ) {
            _this.add.tween ({
                targets : child,
                scaleX : 1, scaleY : 1,
                duration : 30,
                ease : 'Linear'  
            })
        });

        //destroy        
        this.elementsCont.getByName ('el' + this.boxClicked ).destroy();

        this.elementsData [ this.boxClicked ].used = true;

        this.playSound ('clickc');


    }

    showPermanent () 
    {

        const mydata = this.elements [ this.elementsData [ this.boxClicked ].style ];

        const r = Math.floor ( this.cellCollided/8 ), c = this.cellCollided % 8;

        let clr = 0;

        let clrid = this.elementsData [ this.boxClicked ].colorid;

        for ( var i = 0; i < mydata.row ; i++ ) {

            for ( var j = 0; j < mydata.col ; j++ ) {

                if ( mydata.arr [i][j] == 1 ){

                    let cellid = (( i+r ) * 8)  +  ( c+j );

                    let cll = this.cellsCont.getByName ('cell' + cellid );

                    //let cellP = this.add.rectangle ( cll.x + this.trueSize/2, cll.y + this.trueSize/2, this.trueSize, this.trueSize, clr, 1 ).setStrokeStyle ( 2, 0x1a1a1a ).setName ('cp' + cellid ).setData('origClr', clrid );

                    let cellP = this.add.image ( cll.x + this.trueSize/2, cll.y + this.trueSize/2, 'bigs', clrid ).setName ('cp' + cellid ).setData('origClr', clrid );

                    this.cellPermanentCont.add ( cellP );

                    this.grid [ cellid ] = 1;

                    this.score += 1;
                }

            }

        }

        this.clearCells ();

        this.time.delayedCall( 200, function () {

            this.checkLines ();

            this.counter += 1;

            if ( this.counter >= 3 ) {
                this.counter = 0;
                this.createRandomElements ();
            }

            this.checkElementsAvailability ();

        }, [], this);  // delay in ms
    


        



    }

    getLines ( mygrid ) 
    {

        let fin = [];

        let lines = 0;

        //check by rows..
        for ( var i = 0; i < 8; i++ ) {

            let myCounter = 0;

            for ( var j = 0; j < 8; j++ ) {
                if ( mygrid [ (i*8)+j ] == 1 ) {
                    myCounter += 1;
                }
            }

            if ( myCounter >= 8 ) {
                lines += 1 ;
                myCounter = 0;

                for ( var k = 0; k < 8; k++ ) {
                    fin.push (  (i*8)+k );
                }

            }
            
        }

        //check by cols 
        for ( var j = 0; j < 8; j++ ) {

            let myCounter = 0;

            for ( var i = 0; i < 8; i++ ) {

                if ( mygrid [ (i*8)+j ] == 1 ) {
                    myCounter += 1;
                }

            }

            if ( myCounter >= 8 ) {

                lines += 1 ;
                myCounter = 0;

                for ( var k = 0; k < 8; k++ ) {
                    if ( !fin.includes ( (k*8)+j ) ) {
                        fin.push ( (k*8)+j );
                    }
                }

            }
            
        }

        return { 'fin' : fin, 'lines' : lines }

    }

    checkLines () {

        let linesdata = this.getLines ( this.grid );

        if ( linesdata.lines > 0 ) {

            if ( linesdata.lines == 1 ) {
                this.score += 10;
            }else if ( linesdata.lines == 2 ) {
                this.score += 30;
            }else if ( linesdata.lines == 3 ) {
                this.score += 60;
            }else if ( linesdata.lines == 4 ) {
                this.score += 100;
            }else if ( linesdata.lines > 4 ) {
                this.score += 160;
            }
            
            for ( var i = 0; i < linesdata.fin.length; i++ ) {

                let cell = this.cellPermanentCont.getByName ('cp' + linesdata.fin[i] );

                this.add.tween ({
                    targets : cell,
                    scaleX : 0.5, scaleY : 0.5,
                    duration : 80,
                    yoyo : true,
                    repeat : 2,
                    ease : 'Linear',
                    onComplete : function () {
                        this.targets [0].destroy ();
                    }

                });

                this.grid [ linesdata.fin[i] ] = 0;
            }

            this.playSound ('clashdraw')

        }

        //this.scoreTxt.text = this.score;

        this.addScore ();

    }

    tempCheckLines ()
    {

        let tempGrid = this.getTempGrid ();

        const mydata = this.elements [ this.elementsData [ this.boxClicked ].style ];

        const r = Math.floor ( this.cellCollided/8 ), c = this.cellCollided % 8;

        for ( var i = 0; i < mydata.row ; i++ ) {

            for ( var j = 0; j < mydata.col ; j++ ) {

                if ( mydata.arr [i][j] == 1 ){

                    let cellid = (( i+r ) * 8)  +  ( c+j );

                    tempGrid [ cellid ] = 1;
                }

            }

        }

        let linesdata = this.getLines ( tempGrid );

        //console.log ( 'lines',  linesdata.lines );

        if ( linesdata.lines > 0 ) {

            const clrid =  this.elementsData [ this.boxClicked ].colorid;

            for ( var i = 0; i < linesdata.fin.length; i++ ) {

                if ( this.grid [ linesdata.fin[i]  ] == 1 ){

                    let cell = this.cellPermanentCont.getByName ('cp' + linesdata.fin[i] );

                    cell.setFrame ( clrid );
                }

            }

        }

    }

    resetLines () {

        this.cellPermanentCont.iterate ( function ( child ) {
            
            let clr = 0;

            child.setFrame ( child.getData ('origClr') );
        });

    }

    getTempGrid () {

        let arr = [];

        for ( var i = 0; i < this.grid.length; i++ ) {
            arr.push ( this.grid[i] );
        }

        return arr;

    }

    checkFit ( el ) 
    {

        let  mydata = this.elements [ this.elementsData [ el ].style  ];

        let counter = 0;

        for ( var cs = 0; cs < 64; cs++) {

            if ( this.checkField ( cs, el ) ) {
                counter += 1;
            }
    
        }

        return counter > 0;
    
    }

    checkElementsAvailability ()
    {

        let activeCounter = 0;

        for ( var i = 0; i < 3; i++ ) {

            if ( !this.elementsData [ i ].used ) {

                let el = this.elementsCont.getByName ('el' + i );

                el.resetColor();

                let bx =  this.bottomCont.getByName ('box' + i);

                bx.setInteractive();

                if ( !this.checkFit ( i ) ) {

                    bx.disableInteractive ();

                    el.darken();

                }else {

                    activeCounter += 1;

                }

            }

        }

        if ( activeCounter == 0 ) {

            this.time.delayedCall( 1000, function () {
                this.showGameOverScreen ();
            }, [], this);  // delay in ms
            
        } 

    }

    showGameOverScreen ()
    {

        var _this = this;

        let _gW = this.game.config.width,
            _gH = this.game.config.height;

        this.gameOverScreen = this.add.container(0, 0);


        let bgBlack = this.add.rectangle ( _gW/2, _gH/2, _gW, _gH, 0x0a0a0a, 0.5 ).setInteractive ();

        bgBlack.on ('pointerdown', function () {
            _this.closeGameOverScreen ();
            _this.gameReset ();
        });


        let gameOverCont = this.add.container (0, _gH/2);

        let srct = this.add.image ( _gW/2, _gH*0.4, 'gameOver' );

        let txt = this.add.text ( _gW/2, _gH*0.38, 'Game Over', { fontFamily:'Oswald', fontSize: _gH*0.04, color : 'black'} ).setOrigin(0.5);

        let txt2 = this.add.text ( _gW/2, _gH*0.425, 'Click Anywhere To Play Again', { fontFamily:'Oswald', fontSize: _gH*0.018, color : '#ff0000'} ).setOrigin(0.5);

        gameOverCont.add ([ srct, txt, txt2 ]);

        this.add.tween ({
            targets : gameOverCont,
            y : 0,
            duration : 150,
            ease : 'Linear'
        });

        this.gameOverScreen.add ([ bgBlack, gameOverCont ]);

        this.gameIsOver = true;

        this.playSound ('ending');

    }

    closeGameOverScreen ()
    {
        this.gameOverScreen.destroy ();
    }

    showSettingScreen () 
    {
        var _this = this;

        this.playSound ('clicka');

        
        this.settingScreen = this.add.container ( 0, 0 );

        let bgRect = this.add.rectangle ( 1080/2, 1920/2, 1080, 1920, 0x0a0a0a, 0.5 ).setInteractive();

        bgRect.on('pointerdown', function () {
            _this.closeSettingScreen ();
        });

        let txte = this.add.text ( 1080/2, 580, 'Settings', { color:'white', fontSize: 60, fontFamily:'Oswald' }).setOrigin(0.5);

        
        this.settingScreen.add ( [ bgRect, txte ] );
        
        const btns = ['sound', 'music', 'restart'];

        const bs = 30, bsz = (620 - (2*bs))/3;

        const bx = (1080 - 620)/2 + (bsz/2), by = 750;
        
        for ( var i = 0; i < btns.length; i++) {

            let mnicont = this.add.container ( bx + i * ( bsz+bs), by ).setSize ( bsz, bsz ).setData('id', i).setInteractive();

            let rct = this.add.rectangle ( 0, 0, bsz, bsz, 0xffffff, 1 ).setStrokeStyle ( 1, 0x3a3a3a );

            let imgs = this.add.image ( 0, 0, 'controls', i );

            if ( i == 0 && this.musicOff ) imgs.setFrame ( i + 3 );

            if ( i == 1 && this.soundOff ) imgs.setFrame ( i + 3 );
            
            mnicont.add ( [ rct, imgs ]);

            mnicont.on('pointerover', function () {
                this.first.setFillStyle (0xcacaca, 1 );
            });
            mnicont.on('pointerout', function () {
                this.first.setFillStyle (0xffffff, 1 );
            });
            mnicont.on('pointerup', function () {
                this.first.setFillStyle (0xffffff, 1 );
            });
            
            mnicont.on('pointerdown', function () {

                _this.playSound ('clicka');

                this.first.setFillStyle (0xff9999, 1 );

                switch ( this.getData('id')) {

                    case 0:
                        _this.musicOff = !_this.musicOff;
                        this.last.setFrame ( !_this.musicOff  ? this.getData('id') :  this.getData('id') + 3 ) ;

                        break;
                    case 1 : 
                        _this.soundOff = !_this.soundOff;
                        this.last.setFrame ( !_this.soundOff  ? this.getData('id') :  this.getData('id') + 3 ) ;
                        
                        break;
                    case 2 :
                        if ( _this.score > 0 ) {
                            _this.closeSettingScreen ();
                            _this.gameReset ();
                        }
                    default:
                        break;
                }

            });

            this.settingScreen.add ( mnicont );
        
        }

        
    }

    closeSettingScreen () 
    {
        this.settingScreen.destroy();
    }

    gameReset ()
    {

        this.playSound ('warp');

        this.score = 0;

        this.cellCollided = -1;

        this.gameIsOver = false;
        
        //resetGrid 
        for ( var i = 0; i < this.grid.length; i++) {
            this.grid [i] = 0;
        }

        this.cellPermanentCont.each ( function ( child ) {
            child.destroy ();
        });

        this.elementsCont.each ( function ( child ) {
            child.destroy ();
        });

        this.scoreTxt.text = "0";

        this.counter = 0;

        this.time.delayedCall( 1000, function () {
            this.createRandomElements ();
        }, [], this);  // delay in ms
    

    }


}
