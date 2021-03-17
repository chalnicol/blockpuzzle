class GameElement extends Phaser.GameObjects.Container {

    constructor(scene, x, y, children, dataObj, dims, clrid, scl=1 ) {

        super(scene, x, y, children);
        // ...

        let wd = dataObj.col * dims,
            ht = dataObj.row * dims; 

        this.setSize ( wd, ht );

        this.dims = dims;

        this.dataObj = dataObj;

        this.clrid = clrid;

        this.scl = scl;
       
        //const randClrNmbr = Math.floor ( Math.random() * 3 );

        let clr = 0;

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

        this.myClr = clr;

        //...

        for ( var i = 0; i < this.dataObj.row ; i++ ) {

            for ( var j = 0; j < this.dataObj.col ; j++ ) {

                if ( this.dataObj.arr [i][j] == 1 ) {

                    let rct = this.scene.add.rectangle ( ( j * dims) - wd/2 + (dims/2) , ( i *dims ) - ht/2 + (dims/2),  dims, dims, clr, 1 ).setStrokeStyle (2, 0x000000).setScale(scl);

                    this.add ( rct );

                }
    
            }

        }

        scene.add.existing(this);

    }

    darken () 
    {
        this.iterate ( function ( child ) {
            child.setFillStyle ( 0x9e9e9e, 1 );
        });

    }

    resetColor () 
    {

        let _this = this;

        this.iterate ( function ( child ) {
            child.setFillStyle ( _this.myClr, 1 );
        });

    }


    
}