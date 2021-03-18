
window.onload = function () {
   
    let _gW = 1080, _gH = 1920;

    var config = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            parent: 'game_div',
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: _gW,
            height: _gH
        },
        backgroundColor: '#cacaca',
        scene: [ Preloader, Intro ]
    };

    new Phaser.Game(config);


} 
