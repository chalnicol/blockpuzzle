

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

        this.boxClicked = 0;
        this.isBoxClicked = false;

        let _gW = this.game.config.width,
            _gH = this.game.config.height;

        const bsize = (_gW*0.96)/8;

        const sx = (_gW - (_gW*0.96))/2, 
              sy = _gH * 0.15;

        for ( var i = 0; i < 64; i++ ) {

            let ix = Math.floor ( i/8 ),
                iy = i%8;
            
            let xp = iy * ( bsize ) + sx,
                yp = ix * ( bsize ) + sy;

            this.add.rectangle (xp, yp, bsize, bsize, 0xff3333, 1 ).setOrigin (0).setStrokeStyle( 2, 0xffffff );

            this.add.text (xp +(bsize*0.1), yp + (bsize*0.05), iy+":"+ix, { color:'white', fontSize : bsize*0.3, fontFamily : 'Oswald'} );

        }

        this.trueSize = bsize;


        // create 3 boxes

        this.bottomCont = this.add.container (0, 0)

        const csize = _gW * 0.3,
              cspace =  ((_gW*0.96) - (csize * 3))/2;

        const sxa = (_gW - (_gW*0.96) )/2 + (csize/2), 
              sya = _gH * 0.8;

        for ( var i = 0; i < 3; i++ ) {

            let box = this.add.rectangle ( i * (csize+cspace) + sxa,  sya, csize, csize, 0xff0000, 1 ).setName ('box' + i ).setData('id', i);

            box.on ('pointerdown', function ( pointer ) {
                
                let boxClicked = this.getData('id');;

               _this.popElements (pointer, boxClicked);

               _this.boxClicked = boxClicked;


            });

            this.bottomCont.add ( box );

        }

        // elements 

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

        
        this.input.on ('pointerup', function ( pointer ) {
            if ( this.isBoxClicked ) {
                this.retract ();
                this.isBoxClicked = false;
            }
        }, this );
        this.input.on ('pointermove', function ( pointer ) {
            if ( this.isBoxClicked ) {
                this.moveElement ( pointer.x, pointer.y ); 
            }
        }, this);

    }

    createRandomElements ( node ) 
    {

        this.elementsCont = this.add.container (0, 0);

        for ( var i = 0; i < 3; i++ ) {

            let box = this.bottomCont.getByName ('box' + i );

            let randNum = Math.floor ( Math.random() * this.elements.length );

            let dim = box.width * 0.8/5;

            let element = new GameElement ( this, box.x, box.y, null,  this.elements [ randNum ], dim, 1 ).setName ('el' + i );
        
            this.elementsCont.add (element);


            box.setInteractive().setData('eldata', randNum);

        }

    }

    popElements ( pointer, id ) 
    {   

        this.isBoxClicked = true;

        //hide element..
        this.elementsCont.getByName ('el' + id ).visible = false;

        //create bigger element..

        let box = this.bottomCont.getByName ('box' + id );
        
        let eldata = box.getData('eldata') ;

        let totalH = this.elements [eldata].row * this.trueSize;

        let bigger = new GameElement ( this, box.x, box.y, null,  this.elements [ eldata ], this.trueSize, 0.9 ).setName ('bigEl' + id );

        bigger.setScale ( 0.7 );

        this.tweens.add ({
            targets : bigger,
            scaleX : 1, scaleY : 1,
            y : pointer.y - (totalH/2),
            duration : 50,
            ease : 'Linear'
        });

        box.disableInteractive();


    }

    retract ()
    {   

        let box = this.bottomCont.getByName ('box' + this.boxClicked );

        let bigEl = this.children.getByName ( 'bigEl' + this.boxClicked );

        let smallEl = this.elementsCont.getByName ('el' + this.boxClicked );

        this.tweens.add ({

            targets : bigEl,
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

        let box = this.bottomCont.getByName ('box' + this.boxClicked );
        
        let totalH = this.elements [ box.getData('eldata') ].row * this.trueSize;

        let bigEl = this.children.getByName ( 'bigEl' + this.boxClicked );

        bigEl.setPosition ( x, y - (totalH/2)  );

    }

}
