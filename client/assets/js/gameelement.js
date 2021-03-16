class GameElement extends Phaser.GameObjects.Container {

    constructor(scene, x, y, children, dataObj, dims, scl=1 ) {

        super(scene, x, y, children);
        // ...

        let wd = dataObj.col * dims,
            ht = dataObj.row * dims; 

        this.setSize ( wd, ht );

        this.dims = dims;

        this.dataObj = dataObj;

        this.scl = scl;

       
        //...

        for ( var i = 0; i < this.dataObj.row ; i++ ) {

            for ( var j = 0; j < this.dataObj.col ; j++ ) {

                if ( this.dataObj.arr [i][j] == 1 ) {

                    let rct = this.scene.add.rectangle ( ( j * dims) - wd/2 + (dims/2) , ( i *dims ) - ht/2 + (dims/2),  dims, dims, 0xffff00, 1 ).setStrokeStyle (1, 0x000000).setScale(scl);

                    this.add ( rct );

                }
    
            }

        }


        scene.add.existing(this);

    }
    
}