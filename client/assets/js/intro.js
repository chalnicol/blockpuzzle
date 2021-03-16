

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

        this.eldata = 0;

        this.cellCollided = -1;

        this.isBoxClicked = false;

        let _gW = this.game.config.width,
            _gH = this.game.config.height;

        const bsize = (_gW*0.96)/8;

        const sx = (_gW - (_gW*0.96))/2, 
              sy = _gH * 0.15;

        this.cellsCont = this.add.container (0,0);

        for ( var i = 0; i < 64; i++ ) {

            let ix = Math.floor ( i/8 ),
                iy = i%8;
            
            let xp = iy * ( bsize ) + sx,
                yp = ix * ( bsize ) + sy;

            let rcta = this.add.rectangle (xp, yp, bsize, bsize, 0xff3333, 1 ).setOrigin (0).setStrokeStyle( 2, 0xffffff ).setData ('id', i ).setName('cell'+i);

            let txt = this.add.text (xp +(bsize*0.1), yp + (bsize*0.05), i, { color:'white', fontSize : bsize*0.3, fontFamily : 'Oswald'} );

            this.cellsCont.add ( [rcta, txt] );

        }

        this.trueSize = bsize;


        // create 3 boxes

        this.bottomCont = this.add.container (0, 0)

        const csize = _gW * 0.3,
              cspace =  ((_gW*0.96) - (csize * 3))/2;

        const sxa = (_gW - (_gW*0.96) )/2 + (csize/2), 
              sya = _gH * 0.8;

        for ( var i = 0; i < 3; i++ ) {

            let box = this.add.rectangle ( i * (csize+cspace) + sxa,  sya, csize, csize, 0xff3333, 1 ).setName ('box' + i ).setData('id', i);

            box.on ('pointerdown', function ( pointer ) {
                
                let boxClicked = this.getData('id');;

               _this.popElements (pointer, boxClicked);

               _this.boxClicked = boxClicked;


            });

            this.bottomCont.add ( box );

        }

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

        
        //..

        this.input.on ('pointerup', function ( pointer ) {

            if ( this.isBoxClicked ) {

               
                if ( this.cellCollided >= 0 ) {
                    this.setPermanent ();
                }else {
                    this.retract ();
                }
                
                this.clearCells ();

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
        
        this.eldata = box.getData('eldata') ;

        let totalH = this.elements [this.eldata].row * this.trueSize;

        let bigger = new GameElement ( this, box.x, box.y, null,  this.elements [ this.eldata ], this.trueSize, 0.9 ).setName ('bigEl' + id );

        bigger.setScale ( 0.7 );

        this.tweens.add ({
            targets : bigger,
            scaleX : 1, scaleY : 1,
            y : pointer.y - (totalH/2),
            duration : 30,
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

        let box = this.bottomCont.getByName ('box' + this.boxClicked );
        
        let totalH = this.elements [ box.getData('eldata') ].row * this.trueSize;

        let bigEl = this.children.getByName ( 'bigEl' + this.boxClicked );

        bigEl.setPosition ( x, y - (totalH/2)  );


        for ( var i = 0; i < 64; i++) {

        
            let cell = this.cellsCont.getByName ('cell' + i );

            if ( this.hitTest ( bigEl, cell) ) {

                if ( this.checkField (i) ) {

                    this.cellCollided = i;

                    this.illuminate ( i );

                }else {

                    this.cellCollided = -1;
                }
                

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

    clearCells () {

        this.cellCollided = -1;

        for ( var i = 0; i < 64; i++) {

            let cell = this.cellsCont.getByName ('cell' + i );

            cell.setFillStyle ( 0xff3333, 1);
            
        }   


    }

    illuminate ( cellid ) {

        const mydata = this.elements [ this.eldata ];

        const r = Math.floor ( cellid/8 ), c = cellid % 8;
         
        for ( var i = 0; i < mydata.row ; i++ ) {

            for ( var j = 0; j < mydata.col ; j++ ) {

                if ( (i + r) < 8 && (c+j) < 8  ) {

                    if ( mydata.arr [i][j] == 1 ) {

                        let n =  ((i+r)*8)+(c+j);
                        
                        let cell = this.cellsCont.getByName ( 'cell' + n );

                        cell.setFillStyle (0xffcc55, 1);

                    }
                    
                }
    
            }

        }
    }

    checkField ( cellid ) {

        const mydata = this.elements [ this.eldata ];

        const r = Math.floor ( cellid/8 ), c = cellid % 8;
         
        for ( var i = 0; i < mydata.row ; i++ ) {

            for ( var j = 0; j < mydata.col ; j++ ) {

                if ( (i + r) >= 8 || (c+j) >= 8  ) return false;

            }

        }

        return true;

    }

    setPermanent ()
    {

        let cell = this.cellsCont.getByName ('cell' + this.cellCollided );

        let bigEl = this.children.getByName ( 'bigEl' + this.boxClicked );

        const bx = cell.x + bigEl.width/2,
              by = cell.y + bigEl.height/2;

        
        this.add.tween ({
            targets : bigEl,
            x : bx, y : by,
            duration : 30,
            ease : 'Linear'
        });

        bigEl.iterate ( function (child) {

            this.add.tween ({
                targets : child,
                scaleX : 1, scaleY: 1,
                duration : 30,
                ease : 'Linear'
            });

        }, this );

        

        
        
    }

}
