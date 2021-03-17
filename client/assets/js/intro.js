

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

        this.isBoxClicked = false;

        let _gW = this.game.config.width,
            _gH = this.game.config.height;


        this.scoreTxt = this.add.text ( 10, 10, 'Score : 0', { fontSize: _gH*0.03, fontFamily:'Oswald', color:'black' });

        //create grid..
        const bsize = (_gW*0.96)/8;

        const sx = (_gW - (_gW*0.96))/2, 
              sy = _gH * 0.15;

        this.cellsCont = this.add.container (0,0);

        for ( var i = 0; i < 64; i++ ) {

            let ix = Math.floor ( i/8 ),
                iy = i%8;
            
            let xp = iy * ( bsize ) + sx,
                yp = ix * ( bsize ) + sy;

            let rcta = this.add.rectangle (xp, yp, bsize, bsize, 0x8e8e8e, 1 ).setOrigin (0).setStrokeStyle( 2, 0xffffff ).setData ('id', i ).setName('cell'+i);

            let txt = this.add.text (xp +(bsize*0.1), yp + (bsize*0.05), i, { color:'white', fontSize : bsize*0.3, fontFamily : 'Oswald'} );

            this.cellsCont.add ( [rcta, txt] );

            this.grid.push ( 0 );

        }

        this.trueSize = bsize;



        //create 3 boxes..
        this.bottomCont = this.add.container (0, 0)

        const csize = _gW * 0.3,
              cspace =  ((_gW*0.96) - (csize * 3))/2;

        const sxa = (_gW - (_gW*0.96) )/2 + (csize/2), 
              sya = _gH * 0.8;

        for ( var i = 0; i < 3; i++ ) {

            let box = this.add.rectangle ( i * (csize+cspace) + sxa,  sya, csize, csize, 0x3a3a3a, 1 ).setName ('box' + i ).setData('id', i);

            box.on ('pointerdown', function ( pointer ) {
                
                _this.boxClicked = this.getData('id');

               _this.popElements (pointer);

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

        //create container for elements..
        this.elementsCont = this.add.container (0, 0);

        //create container for cells fielded..
        this.cellPermanentCont = this.add.container(0, 0);

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

    createRandomElements () 
    {
        
        this.elementsData = [];

        for ( var i = 0; i < 3; i++ ) {

            let box = this.bottomCont.getByName ('box' + i );

            box.setInteractive()

            let randNum = Math.floor ( Math.random() * this.elements.length );

            let rndClrId = Math.floor ( Math.random() * 3 );

            let dim = box.width * 0.9/5;

            let element = new GameElement ( this, box.x, box.y, null,  this.elements [ randNum ], dim, rndClrId, 1 ).setName ('el' + i );
        
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
            y : pointer.y - (totalH/2),
            duration : 30,
            ease : 'Linear'
        });


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

        bigEl.setPosition ( x, y - (totalH/2)  );


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

            let cell = this.cellsCont.getByName ('cell' + i );

            cell.setFillStyle (0x8e8e8e, 1);
            
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
                        
                        let cell = this.cellsCont.getByName ( 'cell' + n );

                        cell.setFillStyle (0xcecece, 1);

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

    }

    showPermanent () 
    {

        const mydata = this.elements [ this.elementsData [ this.boxClicked ].style ];

        const r = Math.floor ( this.cellCollided/8 ), c = this.cellCollided % 8;

        let clr = 0;

        let clrid = this.elementsData [ this.boxClicked ].colorid;

        switch ( clrid ) {
            case 0:
                clr = 0x33ff33;
                break;
            case 1:
                clr = 0x33ffff;
                break;
            case 2:
                clr = 0xff33ff;
                break;
            default:
                //clr = '0xffff00';
                break;
        }


        for ( var i = 0; i < mydata.row ; i++ ) {

            for ( var j = 0; j < mydata.col ; j++ ) {

                if ( mydata.arr [i][j] == 1 ){

                    let cellid = (( i+r ) * 8)  +  ( c+j );

                    let cll = this.cellsCont.getByName ('cell' + cellid );

                    let cellP = this.add.rectangle ( cll.x + this.trueSize/2, cll.y + this.trueSize/2, this.trueSize, this.trueSize, clr, 1 ).setStrokeStyle ( 2, 0x1a1a1a ).setName ('cp' + cellid ).setData('origClr', clrid );

                    this.cellPermanentCont.add ( cellP );

                    this.grid [ cellid ] = 1;

                    this.score += 1;
                }

            }

        }

        this.clearCells ();

        this.checkLines ();

        this.counter += 1;

        if ( this.counter >= 3 ) {
            this.counter = 0;
            this.createRandomElements ();
        }

        this.checkElementsAvailability ();



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

        if ( linesdata.lines == 1 ) {
            this.score += 10;
        }else if ( linesdata.lines == 2 ) {
            this.score += 30;
        }else if ( linesdata.lines == 3 ) {
            this.score += 60;
        }else if ( linesdata.lines == 4 ) {
            this.score += 100;
        }else if ( linesdata.lines > 4 ) {
            this.score += 200;
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

        this.scoreTxt.text = 'Score : ' + this.score;

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

            let clr = 0;

            switch ( this.elementsData [ this.boxClicked ].colorid ) {
                case 0:
                    clr = 0x33ff33;
                    break;
                case 1:
                    clr = 0x33ffff;
                    break;
                case 2:
                    clr = 0xff33ff;
                    break;
                default:
                    //clr = '0xffff00';
                    break;
            }


            for ( var i = 0; i < linesdata.fin.length; i++ ) {

                if ( this.grid [ linesdata.fin[i]  ] == 1 ){

                    let cell = this.cellPermanentCont.getByName ('cp' + linesdata.fin[i] );

                    cell.setFillStyle ( clr, 1 );
                }

            }

        }

    }

    resetLines () {

        this.cellPermanentCont.iterate ( function ( child ) {
            
            let clr = 0;

            //console.log ( child.getData ('origClr')  );

            switch ( child.getData ('origClr')) {
                case 0:
                    clr = 0x33ff33;
                    break;
                case 1:
                    clr = 0x33ffff;
                    break;
                case 2:
                    clr = 0xff33ff;
                    break;
                default:
                    //clr = '0xffff00';
                    break;
            }

            child.setFillStyle (clr, 1 );



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

            console.log ( 'Game Over' );
        } 

    }


}
