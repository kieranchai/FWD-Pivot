import 'phaser';
import config from '../Config/config';
import MalePlayer from '../Objects/MalePlayer';
import FemalePlayer from '../Objects/FemalePlayer';

export default class Level2 extends Phaser.Scene {
    constructor() {
        super('Level2');
    }

    init(data) {
        this.gender = data.gender;
        this.moneyBags = data.moneyBags;
        this.clockTime = data.clockTime;
    }

    preload() {
        this.load.image("gymCorridors", "assets/tiled/corridors.png");
        this.load.image("gymSports", "assets/tiled/sports.png");
        this.load.image("livingRoom", "assets/tiled/Living Room.png");
        this.load.tilemapTiledJSON("level2", "assets/tiled/level2.json");
        // this.csMarker = this.add.tileSprite(360, 215, 0, 0, "marker").setScale(0.1).setDepth(1);
    }

    create() {
        this.cameras.main.fadeIn(500);
        // Add player to current scene
        if (this.gender == "male") {
            this.player = new MalePlayer(this, 210, 200);
        } else if (this.gender == "female") {
            this.player = new FemalePlayer(this, 210, 200);
        }
        this.cameras.main.startFollow(this.player);

        //map
        this.level2 = this.add.tilemap("level2");
        this.physics.world.setBounds(0, 0, this.level2.widthInPixels, this.level2.heightInPixels);
        this.gymCorridors = this.level2.addTilesetImage("corridors", "gymCorridors", 32, 32);
        this.gymSports = this.level2.addTilesetImage("sports", "gymSports", 32, 32);
        this.schoolFloor = this.level2.addTilesetImage("floor", "schoolFloor", 32, 32);
        this.livingRoom = this.level2.addTilesetImage("livingroom", "livingRoom", 32, 32);
        this.floorLayer = this.level2.createStaticLayer("floor", this.schoolFloor, 0, 0).setDepth(-3);
        this.wallsLayer = this.level2.createStaticLayer("wall", this.gymCorridors, 0, 0).setDepth(-3);
        this.sportsLayer = this.level2.createStaticLayer("sports", this.gymSports, 0, 0).setDepth(-1);
        this.bbLayer = this.level2.createStaticLayer("bb", this.gymSports, 0, 0).setDepth(-1);
        this.rimsLayer = this.level2.createStaticLayer("rims", this.gymSports, 0, 0);
        this.stuffLayer = this.level2.createStaticLayer("stuff", this.gymSports, 0, 0).setDepth(-1);
        this.lockersLayer = this.level2.createStaticLayer("lockers", this.gymCorridors, 0, 0);
        this.cabinetLayer = this.level2.createStaticLayer("cabinet", this.livingRoom, 0, 0);
        this.phoneLayer = this.level2.createStaticLayer("phone", this.livingRoom, 0, 0);
        // Collisions based on layer.
        this.wallsLayer.setCollisionByProperty({ collides: true });
        this.bbLayer.setCollisionByProperty({ collides: true });
        this.rimsLayer.setCollisionByProperty({ collides: true });
        this.stuffLayer.setCollisionByProperty({ collides: true });
        this.lockersLayer.setCollisionByProperty({ collides: true });
        this.cabinetLayer.setCollisionByProperty({ collides: true });
        // Add collisions.
        this.physics.add.collider(this.player, this.wallsLayer);
        this.physics.add.collider(this.player, this.bbLayer);
        this.physics.add.collider(this.player, this.rimsLayer);
        this.physics.add.collider(this.player, this.stuffLayer);
        this.physics.add.collider(this.player, this.lockersLayer);
        this.physics.add.collider(this.player, this.cabinetLayer);
        //end map

        // KEY INTERACTION
        this.interacted = false;
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.endGame = false;
        //Initialize moneybags and amount insured
        this.scoreBoard = this.add.text(600, 40, "FWD$: " + this.moneyBags, { fontSize: '24px', fontFamily: "arcade_classic", fill: '#fff' }).setScrollFactor(0);
        this.clock = this.plugins.get('rexClock').add(this);
        this.clock.start(this.clockTime);
        this.clockTimer = this.add.text(100, 40, '', { fontSize: '24px', fontFamily: "arcade_classic", fill: '#fff' }).setScrollFactor(0);
        // this.amountInsuredH = 0;
    }
    update() {
        if (this.moneyBags < 0 && this.endGame == false) {
            this.endGame = true;
            var self = this;
            this.player.vel = 0;
            var createLabel = function (scene, text, backgroundColor) {
                return scene.rexUI.add.label({
                    background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x6a4f4b),
                    text: scene.add.text(0, 0, text, {
                        fontSize: '24px'
                    }),
                    space: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    }
                });
            };

            var dialog = self.rexUI.add.dialog({
                x: 400,
                y: 300,
                background: self.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x3e2723),
                title: self.rexUI.add.label({
                    background: self.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x1b0000),
                    text: self.add.text(0, 0, 'GAME OVER!', {
                        fontSize: '24px'
                    }),
                    space: {
                        left: 15,
                        right: 15,
                        top: 10,
                        bottom: 10
                    }
                }),
                content: self.add.text(0, 0, 'You are in debt', {
                    fontSize: '24px'
                }),
                choices: [
                    createLabel(self, 'RETRY')
                ],
                space: {
                    title: 25,
                    content: 25,
                    choice: 15,
                    left: 25,
                    right: 25,
                    top: 25,
                    bottom: 25,
                },
                expand: {
                    content: false,  // Content is a pure text object
                }
            })
                .layout()
                .setScrollFactor(0)
                .popUp(1000);
            dialog
                .on('button.click', function (button, groupName, index) {
                    dialog.destroy();
                    location.reload();
                }, this)
                .on('button.over', function (button, groupName, index) {
                    button.getElement('background').setStrokeStyle(1, 0xffffff);
                })
                .on('button.out', function (button, groupName, index) {
                    button.getElement('background').setStrokeStyle();
                });
        }
        function msConversion(millis) {
            let sec = Math.floor(millis / 1000);
            let hrs = Math.floor(sec / 3600);
            sec -= hrs * 3600;
            let min = Math.floor(sec / 60);
            sec -= min * 60;

            sec = '' + sec;
            sec = ('00' + sec).substring(sec.length);

            if (hrs > 0) {
                min = '' + min;
                min = ('00' + min).substring(min.length);
                return hrs + ":" + min + ":" + sec;
            }
            else {
                return min + ":" + sec;
            }
        }
        this.clockTimer.setText(msConversion(this.clock.now));
        //callback loop
    }

};
