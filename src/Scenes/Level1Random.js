import 'phaser';
import config from '../Config/config';
import MalePlayer from '../Objects/MalePlayer';
import FemalePlayer from '../Objects/FemalePlayer';
import GoldCoin from '../Objects/GoldCoin';

export default class Level1Random extends Phaser.Scene {
    constructor() {
        super('Level1Random');
    }

    init(data) {
        this.gender = data.gender;
        this.moneyBags = data.moneyBags;
        this.amountInsuredCS = data.amountInsuredCS;
        this.amountInsuredEP = data.amountInsuredEP;
        this.clockTime = data.clockTime;
    }

    preload() {
        this.load.image("treesLayer", "assets/tiled/Tile4.png");
        this.load.image("grassLayer", "assets/tiled/Tile A2.png");
        this.load.image("roadLayer", "assets/tiled/A5.png");
        this.load.image("hotDogLayer", "assets/tiled/Tile3.png");
        this.load.tilemapTiledJSON("level1random", "assets/tiled/level1random.json");
    }

    create() {
        this.cameras.main.fadeIn(500);
        // Add player to current scene
        if (this.gender == "male") {
            this.player = new MalePlayer(this, 70, 100);
        } else if (this.gender == "female") {
            this.player = new FemalePlayer(this, 70, 100);
        }
        this.cameras.main.startFollow(this.player);
        //map
        this.level1random = this.add.tilemap("level1random");
        this.physics.world.setBounds(0, 0, this.level1random.widthInPixels, this.level1random.heightInPixels);
        this.grassLayer = this.level1random.addTilesetImage("A2", "grassLayer", 32, 32);
        this.roadLayer = this.level1random.addTilesetImage("A5", "roadLayer", 32, 32);
        this.treesLayer = this.level1random.addTilesetImage("Tile4", "treesLayer", 32, 32);
        this.hotDogLayer = this.level1random.addTilesetImage("Tile3", "hotDogLayer", 32, 32);
        this.grassFloor = this.level1random.createStaticLayer("grass", this.grassLayer, 0, 0).setDepth(-3);
        this.roadFloor = this.level1random.createStaticLayer("road", this.roadLayer, 0, 0).setDepth(-3);
        this.treesGround = this.level1random.createStaticLayer("tree", this.treesLayer, 0, 0);
        this.lightsGround = this.level1random.createStaticLayer("lights", this.treesLayer, 0, 0);
        this.hotDogGround = this.level1random.createStaticLayer("deco", this.hotDogLayer, 0, 0);
        // Collisions based on layer.
        this.grassFloor.setCollisionByProperty({ collides: true });
        this.hotDogGround.setCollisionByProperty({ collides: true });
        // Add collisions.
        this.physics.add.collider(this.player, this.grassFloor);
        this.physics.add.collider(this.player, this.hotDogGround);
        //end map

        //Initialize moneybags and amount insured
        this.arr = ["nH", "minorA", "minorA", "minorA", "minorA", "minorA", "minorA", "minorA", "majorA", "majorA"]
        this.item1 = Phaser.Math.RND.pick(this.arr);
        this.item2 = Phaser.Math.RND.pick(this.arr);
        this.popUp = false;
        this.popUp2 = false;
        this.endMap = false;
        this.endGame = false;
        this.scoreBoard = this.add.text(600, 40, "FWD$: " + this.moneyBags, { fontSize: '24px', fontFamily: "arcade_classic", fill: '#fff' }).setScrollFactor(0).setDepth(2);
        this.clock = this.plugins.get('rexClock').add(this);
        this.clock.start(this.clockTime);
        this.clockTimer = this.add.text(100, 40, '', { fontSize: '24px', fontFamily: "arcade_classic", fill: '#fff' }).setScrollFactor(0).setDepth(2);

        //Coin spawning
        let coins = this.physics.add.group();
        const createCoin = (x, y) => {
            let c = new GoldCoin(this, x, y);
            coins.add(c);
        }
        createCoin(140, 100);
        createCoin(320, 100);
        createCoin(446, 100);
        createCoin(311, 248);
        createCoin(302, 480);
        const getCoin = (p, c) => {
            this.moneyBags += 200;
            this.scoreBoard.setText('FWD$: ' + this.moneyBags);
            this.moneyChange = this.add.text(600, 60, "+ 200", { fontSize: '24px', fontFamily: "arcade_classic", fill: '#00ff4a' }).setScrollFactor(0);
            this.tweens.add({
                targets: this.moneyChange,
                alpha: { from: 1, to: 0 },
                duration: 4000,
                ease: 'Power2'
            });
            c.destroy();
        }
        this.physics.add.overlap(this.player, coins, getCoin);
        //End coin spawning
    }
    update() {
        if (this.moneyBags < 0) {
            this.player.vel = 0;
        }
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
        if (this.popUp === false) {
            var self = this;
            this.grassFloor.setTileLocationCallback(13, 4, 5, 1, function () {
                if (self.amountInsuredCS == 0 && self.popUp === false) {
                    self.popUp = true;
                    self.player.vel = 0;
                    if (self.item1 == "nH") {
                        self.moneyBags = self.moneyBags;
                        self.player.vel = 200;
                    } else if (self.item1 == "minorA") {
                        self.cameras.main.shake(200);
                        self.moneyBags -= 1250;
                        self.moneyChange = self.add.text(600, 60, "- 1250", { fontSize: '24px', fontFamily: "arcade_classic", fill: '#fb0909' }).setScrollFactor(0);
                        self.tweens.add({
                            targets: self.moneyChange,
                            alpha: { from: 1, to: 0 },
                            duration: 4000,
                            ease: 'Power2'
                        });
                        // dialog pop up, close on click and set player vel back to 200
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
                                text: self.add.text(0, 0, 'Minor accident occured', {
                                    fontSize: '24px'
                                }),
                                space: {
                                    left: 15,
                                    right: 15,
                                    top: 10,
                                    bottom: 10
                                }
                            }),
                            content: self.add.text(0, 0, 'Your laptop has been hacked and some of your files are corrupted!\n\nUnfortunately, you did not insure at all and lost a bit of money.', {
                                fontSize: '24px',
                                wordWrap: { width: 450, useAdvancedWrap: false }
                            }),
                            choices: [
                                createLabel(self, 'Close')
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
                                self.player.vel = 200;
                            }, this)
                            .on('button.over', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle(1, 0xffffff);
                            })
                            .on('button.out', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle();
                            });
                    } else if (self.item1 == "majorA") {
                        self.cameras.main.shake(200);
                        self.moneyBags -= 2500;
                        self.moneyChange = self.add.text(600, 60, "- 2500", { fontSize: '24px', fontFamily: "arcade_classic", fill: '#fb0909' }).setScrollFactor(0);
                        self.tweens.add({
                            targets: self.moneyChange,
                            alpha: { from: 1, to: 0 },
                            duration: 4000,
                            ease: 'Power2'
                        });
                        // dialog pop up, close on click and set player vel back to 200
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
                                text: self.add.text(0, 0, 'Major accident occured', {
                                    fontSize: '24px'
                                }),
                                space: {
                                    left: 15,
                                    right: 15,
                                    top: 10,
                                    bottom: 10
                                }
                            }),
                            content: self.add.text(0, 0, 'Your laptop has been hacked and all of your files are corrupted!\n\nUnfortunately, you did not insure at all and lost a lot of money.', {
                                fontSize: '24px',
                                wordWrap: { width: 450, useAdvancedWrap: false }
                            }),
                            choices: [
                                createLabel(self, 'Close')
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
                                self.player.vel = 200;
                            }, this)
                            .on('button.over', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle(1, 0xffffff);
                            })
                            .on('button.out', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle();
                            });
                    }
                } else if (self.amountInsuredCS == 1250 && self.popUp === false) {
                    self.popUp = true;
                    self.player.vel = 0;
                    if (self.item1 == "nH") {
                        self.moneyBags = self.moneyBags;
                        self.player.vel = 200;
                    } else if (self.item1 == "minorA") {
                        self.cameras.main.shake(200);
                        self.moneyBags += 1825;
                        self.moneyChange = self.add.text(600, 60, "+ 1825", { fontSize: '24px', fontFamily: "arcade_classic", fill: '#00ff4a' }).setScrollFactor(0);
                        self.tweens.add({
                            targets: self.moneyChange,
                            alpha: { from: 1, to: 0 },
                            duration: 4000,
                            ease: 'Power2'
                        });
                        // dialog pop up, close on click and set player vel back to 200
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
                                text: self.add.text(0, 0, 'Minor accident occured', {
                                    fontSize: '24px'
                                }),
                                space: {
                                    left: 15,
                                    right: 15,
                                    top: 10,
                                    bottom: 10
                                }
                            }),
                            content: self.add.text(0, 0, 'Your laptop has been hacked and some of your files are corrupted!\n\nLucky for you, you insured the right amount and got back more money!', {
                                fontSize: '24px',
                                wordWrap: { width: 450, useAdvancedWrap: false }
                            }),
                            choices: [
                                createLabel(self, 'Close')
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
                                self.player.vel = 200;
                            }, this)
                            .on('button.over', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle(1, 0xffffff);
                            })
                            .on('button.out', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle();
                            });
                    } else if (self.item1 == "majorA") {
                        self.cameras.main.shake(200);
                        self.moneyBags -= 250;
                        self.moneyChange = self.add.text(600, 60, "- 250", { fontSize: '24px', fontFamily: "arcade_classic", fill: '#fb0909' }).setScrollFactor(0);
                        self.tweens.add({
                            targets: self.moneyChange,
                            alpha: { from: 1, to: 0 },
                            duration: 4000,
                            ease: 'Power2'
                        });
                        // dialog pop up, close on click and set player vel back to 200
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
                                text: self.add.text(0, 0, 'Major accident', {
                                    fontSize: '24px'
                                }),
                                space: {
                                    left: 15,
                                    right: 15,
                                    top: 10,
                                    bottom: 10
                                }
                            }),
                            content: self.add.text(0, 0, 'Your laptop has been hacked and all of your files are corrupted!\n\nUnfortunately, you did not insure enough and lost more money.', {
                                fontSize: '24px',
                                wordWrap: { width: 450, useAdvancedWrap: false }
                            }),
                            choices: [
                                createLabel(self, 'Close')
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
                                self.player.vel = 200;
                            }, this)
                            .on('button.over', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle(1, 0xffffff);
                            })
                            .on('button.out', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle();
                            });
                    }
                } else if (self.amountInsuredCS == 2500 && self.popUp === false) {
                    self.popUp = true;
                    self.player.vel = 0;
                    if (self.item1 == "nH") {
                        self.moneyBags = self.moneyBags;
                        self.player.vel = 200;
                    } else if (self.item1 == "minorA") {
                        self.cameras.main.shake(200);
                        self.moneyBags += 1500;
                        self.moneyChange = self.add.text(600, 60, "+ 1500", { fontSize: '24px', fontFamily: "arcade_classic", fill: '#00ff4a' }).setScrollFactor(0);
                        self.tweens.add({
                            targets: self.moneyChange,
                            alpha: { from: 1, to: 0 },
                            duration: 4000,
                            ease: 'Power2'
                        });
                        // dialog pop up, close on click and set player vel back to 200
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
                                text: self.add.text(0, 0, 'Minor accident occurred', {
                                    fontSize: '24px'
                                }),
                                space: {
                                    left: 15,
                                    right: 15,
                                    top: 10,
                                    bottom: 10
                                }
                            }),
                            content: self.add.text(0, 0, 'Your laptop has been hacked and some of your files are corrupted!\n\nUnfortunately, you insured more than needed but at least you got some of the money back!', {
                                fontSize: '24px',
                                wordWrap: { width: 450, useAdvancedWrap: false }
                            }),
                            choices: [
                                createLabel(self, 'Close')
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
                                self.player.vel = 200;
                            }, this)
                            .on('button.over', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle(1, 0xffffff);
                            })
                            .on('button.out', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle();
                            });
                    } else if (self.item1 == "majorA") {
                        self.cameras.main.shake(200);
                        self.moneyBags += 3750;
                        self.moneyChange = self.add.text(600, 60, "+ 3750", { fontSize: '24px', fontFamily: "arcade_classic", fill: '#00ff4a' }).setScrollFactor(0);
                        self.tweens.add({
                            targets: self.moneyChange,
                            alpha: { from: 1, to: 0 },
                            duration: 4000,
                            ease: 'Power2'
                        });
                        // dialog pop up, close on click and set player vel back to 200
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
                                text: self.add.text(0, 0, 'Major accident occurred', {
                                    fontSize: '24px'
                                }),
                                space: {
                                    left: 15,
                                    right: 15,
                                    top: 10,
                                    bottom: 10
                                }
                            }),
                            content: self.add.text(0, 0, 'Your laptop has been hacked and all of your files are corrupted!\n\nLucky for you, you insured heavily and got back more money!', {
                                fontSize: '24px',
                                wordWrap: { width: 450, useAdvancedWrap: false }
                            }),
                            choices: [
                                createLabel(self, 'Close')
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
                                self.player.vel = 200;
                            }, this)
                            .on('button.over', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle(1, 0xffffff);
                            })
                            .on('button.out', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle();
                            });
                    }
                }
                self.scoreBoard.setText('FWD$: ' + self.moneyBags);
            });
            this.grassFloor.setTileLocationCallback(16, 18, 5, 1, function () {
                self.cameras.main.fadeOut(1000);
                if (self.endMap === false) {
                    self.endMap = true;
                    self.cameras.main.on('camerafadeoutcomplete', function () {
                        self.scene.start('Level2', { gender: self.gender, moneyBags: self.moneyBags, clockTime: self.clock.now });
                    });
                }
            });
        };
        if (this.popUp2 === false) {
            var self = this;
            this.grassFloor.setTileLocationCallback(4, 12, 5, 1, function () {
                if (self.amountInsuredEP == 0 && self.popUp2 === false) {
                    self.popUp2 = true;
                    self.player.vel = 0;
                    if (self.item2 == "nH") {
                        self.moneyBags = self.moneyBags;
                        self.player.vel = 200;
                    } else if (self.item2 == "minorA") {
                        self.cameras.main.shake(200);
                        self.moneyBags -= 1250;
                        self.moneyChange = self.add.text(600, 60, "- 1250", { fontSize: '24px', fontFamily: "arcade_classic", fill: '#fb0909' }).setScrollFactor(0);
                        self.tweens.add({
                            targets: self.moneyChange,
                            alpha: { from: 1, to: 0 },
                            duration: 4000,
                            ease: 'Power2'
                        });
                        // dialog pop up, close on click and set player vel back to 200
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
                                text: self.add.text(0, 0, 'Minor accident occured', {
                                    fontSize: '24px'
                                }),
                                space: {
                                    left: 15,
                                    right: 15,
                                    top: 10,
                                    bottom: 10
                                }
                            }),
                            content: self.add.text(0, 0, 'You do not have any endowment payout and had to pay the university fees!', {
                                fontSize: '24px',
                                wordWrap: { width: 450, useAdvancedWrap: false }
                            }),
                            choices: [
                                createLabel(self, 'Close')
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
                                self.player.vel = 200;
                            }, this)
                            .on('button.over', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle(1, 0xffffff);
                            })
                            .on('button.out', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle();
                            });
                    } else if (self.item2 == "majorA") {
                        self.cameras.main.shake(200);
                        self.moneyBags -= 2500;
                        self.moneyChange = self.add.text(600, 60, "- 2500", { fontSize: '24px', fontFamily: "arcade_classic", fill: '#fb0909' }).setScrollFactor(0);
                        self.tweens.add({
                            targets: self.moneyChange,
                            alpha: { from: 1, to: 0 },
                            duration: 4000,
                            ease: 'Power2'
                        });
                        // dialog pop up, close on click and set player vel back to 200
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
                                text: self.add.text(0, 0, 'Major accident occured', {
                                    fontSize: '24px'
                                }),
                                space: {
                                    left: 15,
                                    right: 15,
                                    top: 10,
                                    bottom: 10
                                }
                            }),
                            content: self.add.text(0, 0, 'You do not have any endowment payout and had to pay the significant university fees!', {
                                fontSize: '24px',
                                wordWrap: { width: 450 }
                            }),
                            choices: [
                                createLabel(self, 'Close')
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
                                self.player.vel = 200;
                            }, this)
                            .on('button.over', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle(1, 0xffffff);
                            })
                            .on('button.out', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle();
                            });
                    }
                } else if (self.amountInsuredEP == 1250 && self.popUp2 === false) {
                    self.popUp2 = true;
                    self.player.vel = 0;
                    if (self.item2 == "nH") {
                        self.moneyBags = self.moneyBags;
                        self.player.vel = 200;
                    } else if (self.item2 == "minorA") {
                        self.cameras.main.shake(200);
                        self.moneyBags += 1825;
                        self.moneyChange = self.add.text(600, 60, "+ 1825", { fontSize: '24px', fontFamily: "arcade_classic", fill: '#00ff4a' }).setScrollFactor(0);
                        self.tweens.add({
                            targets: self.moneyChange,
                            alpha: { from: 1, to: 0 },
                            duration: 4000,
                            ease: 'Power2'
                        });
                        // dialog pop up, close on click and set player vel back to 200
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
                                text: self.add.text(0, 0, 'Minor accident occured', {
                                    fontSize: '24px'
                                }),
                                space: {
                                    left: 15,
                                    right: 15,
                                    top: 10,
                                    bottom: 10
                                }
                            }),
                            content: self.add.text(0, 0, 'Your endowment payout exceeds the needed university fees by a significant sum and you profitted!', {
                                fontSize: '24px',
                                wordWrap: { width: 450 }
                            }),
                            choices: [
                                createLabel(self, 'Close')
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
                                self.player.vel = 200;
                            }, this)
                            .on('button.over', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle(1, 0xffffff);
                            })
                            .on('button.out', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle();
                            });
                    } else if (self.item2 == "majorA") {
                        self.cameras.main.shake(200);
                        self.moneyBags -= 250;
                        self.moneyChange = self.add.text(600, 60, "- 250", { fontSize: '24px', fontFamily: "arcade_classic", fill: '#fb0909' }).setScrollFactor(0);
                        self.tweens.add({
                            targets: self.moneyChange,
                            alpha: { from: 1, to: 0 },
                            duration: 4000,
                            ease: 'Power2'
                        });
                        // dialog pop up, close on click and set player vel back to 200
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
                                text: self.add.text(0, 0, 'Major accident occured', {
                                    fontSize: '24px'
                                }),
                                space: {
                                    left: 15,
                                    right: 15,
                                    top: 10,
                                    bottom: 10
                                }
                            }),
                            content: self.add.text(0, 0, 'Your endowment payout falls below the needed university fees by a significant sum and you had to top up the difference!', {
                                fontSize: '24px',
                                wordWrap: { width: 450 }
                            }),
                            choices: [
                                createLabel(self, 'Close')
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
                                self.player.vel = 200;
                            }, this)
                            .on('button.over', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle(1, 0xffffff);
                            })
                            .on('button.out', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle();
                            });
                    }
                } else if (self.amountInsuredEP == 2500 && self.popUp2 === false) {
                    self.popUp2 = true;
                    self.player.vel = 0;
                    if (self.item2 == "nH") {
                        self.moneyBags = self.moneyBags;
                        self.player.vel = 200;
                    } else if (self.item2 == "minorA") {
                        self.cameras.main.shake(200);
                        self.moneyBags += 1500;
                        self.moneyChange = self.add.text(600, 60, "+ 1500", { fontSize: '24px', fontFamily: "arcade_classic", fill: '#00ff4a' }).setScrollFactor(0);
                        self.tweens.add({
                            targets: self.moneyChange,
                            alpha: { from: 1, to: 0 },
                            duration: 4000,
                            ease: 'Power2'
                        });
                        // dialog pop up, close on click and set player vel back to 200
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
                                text: self.add.text(0, 0, 'Minor accident occured', {
                                    fontSize: '24px'
                                }),
                                space: {
                                    left: 15,
                                    right: 15,
                                    top: 10,
                                    bottom: 10
                                }
                            }),
                            content: self.add.text(0, 0, 'Your endowment payout exceeds the needed university fees by a significant sum and you got back some money!', {
                                fontSize: '24px',
                                wordWrap: { width: 450 }
                            }),
                            choices: [
                                createLabel(self, 'Close')
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
                                self.player.vel = 200;
                            }, this)
                            .on('button.over', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle(1, 0xffffff);
                            })
                            .on('button.out', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle();
                            });
                    } else if (self.item2 == "majorA") {
                        self.cameras.main.shake(200);
                        self.moneyBags += 3750;
                        self.moneyChange = self.add.text(600, 60, "+ 3750", { fontSize: '24px', fontFamily: "arcade_classic", fill: '#00ff4a' }).setScrollFactor(0);
                        self.tweens.add({
                            targets: self.moneyChange,
                            alpha: { from: 1, to: 0 },
                            duration: 4000,
                            ease: 'Power2'
                        });
                        // dialog pop up, close on click and set player vel back to 200
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
                                text: self.add.text(0, 0, 'Major accident occured', {
                                    fontSize: '24px'
                                }),
                                space: {
                                    left: 15,
                                    right: 15,
                                    top: 10,
                                    bottom: 10
                                }
                            }),
                            content: self.add.text(0, 0, 'Your endowment payout exceeds the needed university fees by a significant sum and you profitted a lot!', {
                                fontSize: '24px',
                                wordWrap: { width: 450 }
                            }),
                            choices: [
                                createLabel(self, 'Close')
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
                                self.player.vel = 200;
                            }, this)
                            .on('button.over', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle(1, 0xffffff);
                            })
                            .on('button.out', function (button, groupName, index) {
                                button.getElement('background').setStrokeStyle();
                            });
                    }
                }
                self.scoreBoard.setText('FWD$: ' + self.moneyBags);
            });
        };
    }
};
