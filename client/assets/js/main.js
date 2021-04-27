
window.onload = function () {

    var config = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            parent: 'game_div',
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1080,
            height: 1920
        },
        backgroundColor: '#dedede',
        scene: [ Preloader, Intro ]
    };

    new Phaser.Game(config);


} 
