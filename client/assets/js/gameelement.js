class GameElement extends Phaser.GameObjects.Container {

    constructor(scene, x, y, children, dataObj, dims, clrid, scl=1, img = 'gems' ) {

        super(scene, x, y, children);
        // ...

        let wd = dataObj.col * dims,
            ht = dataObj.row * dims; 

        this.setSize ( wd, ht );

        this.dims = dims;

        this.dataObj = dataObj;

        this.clrid = clrid;

        this.isDarkened = false;
       
        //...

        for ( var i = 0; i < this.dataObj.row ; i++ ) {

            for ( var j = 0; j < this.dataObj.col ; j++ ) {

                if ( this.dataObj.arr [i][j] == 1 ) {

                    //let rct = this.scene.add.rectangle ( ( j * dims) - wd/2 + (dims/2) , ( i *dims ) - ht/2 + (dims/2),  dims, dims, clr, 1 ).setStrokeStyle (2, 0x000000).setScale(scl);

                    let imga = scene.add.image (  ( j * dims) - wd/2 + (dims/2) , ( i *dims ) - ht/2 + (dims/2), img, this.clrid  ).setScale(scl);

                    this.add ( imga );

                }
    
            }

        }

        scene.add.existing(this);

    }

    darken () 
    {
        this.isDarkened = true;
        
        this.iterate ( function ( child ) {
            child.setFrame ( 0 );
        });
    }

    resetColor () 
    {
        var _this = this;

        if ( this.isDarkened ) {
            this.iterate ( function ( child ) {
                child.setFrame ( _this.clrid );
            });
        }

    }


    
}