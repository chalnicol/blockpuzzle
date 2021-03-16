class Box extends Phaser.GameObjects.Container {


    constructor(scene, x, y, children, id, size, sx, sy ) {

        super(scene, x, y, children);
        // ...

        this.setName ('box' + id );

        //this.setSize(width, height);

        let boxsize = size/5;

        for ( var i = 0; i < 25; i++ ) {

            var ix = Math.floor ( i/5 ),
                iy = i%5;

            var xp = sx + iy * boxsize, yp = sy + ix * boxsize;

            let rect = scene.add.rectangle ( xp, yp, boxsize, boxsize, 0xff3333, 0 ).setOrigin( 0 ).setName ( 'child' +  i);//.setStrokeStyle ( 2, 0x000000 );

            this.add ( rect );

            // let txt = scene.add.text ( xp + (boxsize*0.1), yp + (boxsize*0.1), i, { color:"white", fontSize: boxsize*0.3, fontFamily:"Oswald"}  );

            // this.add ( txt );

           
        }
        

        scene.add.existing(this);
    }
    // ...

    // preUpdate(time, delta) {}
}