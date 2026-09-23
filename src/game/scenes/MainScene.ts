import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
    private ants!: Phaser.GameObjects.Group;
    private termites!: Phaser.GameObjects.Group;
    private eggs!: Phaser.GameObjects.Group;
    private speed: number = 200;
    private termiteSpeed: number = 100;
    private eggZones: Phaser.GameObjects.Arc[] = [];
    private smellLocation: Phaser.Math.Vector2 | null = null;

    constructor() {
        super('MainScene');
    }

    preload() {
        // No external assets needed for now as we generate the ant texture procedurally
    }

    create() {
        this.createAntTexture();
        this.createEggTexture();
        this.createTermiteTexture();
        
        this.ants = this.add.group();
        this.termites = this.add.group();
        this.eggs = this.add.group();
        this.spawnAnt(this.scale.width / 2, this.scale.height / 2);
        
        // Click to create egg zone
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const zone = this.add.circle(pointer.x, pointer.y, 30, 0xffffff, 0.2);
            this.eggZones.push(zone);
        });

        // Spawn termite periodically
        this.time.addEvent({
            delay: 4000,
            callback: this.spawnTermite,
            callbackScope: this,
            loop: true
        });
    }

    private spawnAnt(x: number, y: number) {
        const ant = this.add.sprite(x, y, 'ant');
        ant.setAngle(Math.random() * 360);
        
        // New ants start in refractory period (20 seconds)
        ant.setData('isRefractory', true);
        ant.setAlpha(0.5);
        this.time.delayedCall(20000, () => {
            if (ant.active) {
                ant.setData('isRefractory', false);
                ant.setAlpha(1);
            }
        });

        // Ant lifespan (10 minutes)
        this.time.delayedCall(600000, () => {
            if (ant.active) {
                ant.destroy();
            }
        });

        this.ants.add(ant);
        return ant;
    }

    private spawnEgg(x: number, y: number) {
        const egg = this.add.sprite(x, y, 'egg');
        this.eggs.add(egg);
        
        // Hatch after 10 seconds
        this.time.delayedCall(10000, () => {
            if (egg.active) {
                const eggX = egg.x;
                const eggY = egg.y;
                egg.destroy();
                this.spawnAnt(eggX, eggY);
            }
        });
    }

    private spawnTermite() {
        const width = this.scale.width;
        const height = this.scale.height;
        let x = 0;
        let y = 0;
        let angle = 0;

        const side = Math.floor(Math.random() * 4);
        const offset = 50;

        switch (side) {
            case 0: // Left
                x = -offset;
                y = Math.random() * height;
                angle = (Math.random() * 120) - 60; // -60 to 60 degrees
                break;
            case 1: // Right
                x = width + offset;
                y = Math.random() * height;
                angle = 180 + (Math.random() * 120 - 60); // 120 to 240 degrees
                break;
            case 2: // Top
                x = Math.random() * width;
                y = -offset;
                angle = 90 + (Math.random() * 120 - 60); // 30 to 150 degrees
                break;
            case 3: // Bottom
                x = Math.random() * width;
                y = height + offset;
                angle = 270 + (Math.random() * 120 - 60); // 210 to 330 degrees
                break;
        }

        const termite = this.add.sprite(x, y, 'termite');
        termite.setData('hasReachedScent', false);
        if (this.smellLocation) {
            angle = Phaser.Math.Angle.Between(x, y, this.smellLocation.x, this.smellLocation.y);
            termite.setRotation(angle);
        } else {
            termite.setAngle(angle);
        }
        this.termites.add(termite);
    }

    update(_time: number, delta: number) {
        if (this.ants) {
            this.ants.getChildren().forEach((gameObject) => {
                const ant = gameObject as Phaser.GameObjects.Sprite;
                this.updateAnt(ant, delta);
            });
        }

        if (this.termites) {
            this.termites.getChildren().forEach((gameObject) => {
                const termite = gameObject as Phaser.GameObjects.Sprite;
                this.updateTermite(termite, delta);
            });
        }
    }

    private updateTermite(termite: Phaser.GameObjects.Sprite, delta: number) {
        // Head towards smell if it exists and hasn't been reached by this termite
        if (this.smellLocation && !termite.getData('hasReachedScent')) {
            const targetAngle = Phaser.Math.Angle.Between(termite.x, termite.y, this.smellLocation.x, this.smellLocation.y);
            termite.rotation = targetAngle;
        }

        // Move forward linearly
        termite.x += Math.cos(termite.rotation) * this.termiteSpeed * (delta / 1000);
        termite.y += Math.sin(termite.rotation) * this.termiteSpeed * (delta / 1000);

        // Encounter egg laying area to emit smell
        for (const zone of this.eggZones) {
            const distance = Phaser.Math.Distance.Between(termite.x, termite.y, zone.x, zone.y);
            if (distance < zone.radius) {
                this.smellLocation = new Phaser.Math.Vector2(zone.x, zone.y);
                termite.setData('hasReachedScent', true);
                break;
            }
        }

        // Eat eggs
        if (this.eggs) {
            const eggs = this.eggs.getChildren();
            for (let i = eggs.length - 1; i >= 0; i--) {
                const egg = eggs[i] as Phaser.GameObjects.Sprite;
                const distance = Phaser.Math.Distance.Between(termite.x, termite.y, egg.x, egg.y);
                if (distance < 30) {
                    egg.destroy();
                }
            }
        }

        // Disappear when far out of bounds
        const width = this.scale.width;
        const height = this.scale.height;
        const margin = 100;

        if (termite.x < -margin || termite.x > width + margin || 
            termite.y < -margin || termite.y > height + margin) {
            termite.destroy();
        }
    }

    private updateAnt(ant: Phaser.GameObjects.Sprite, delta: number) {
        // Random direction change (approx. 2% chance per frame)
        if (Math.random() < 0.02) {
            const turnRange = 90;
            const change = (Math.random() * 2 - 1) * turnRange;
            ant.angle += change;
        }

        // Move forward based on current rotation
        ant.x += Math.cos(ant.rotation) * this.speed * (delta / 1000);
        ant.y += Math.sin(ant.rotation) * this.speed * (delta / 1000);

        // Egg laying logic
        if (!ant.getData('isRefractory')) {
            for (let i = this.eggZones.length - 1; i >= 0; i--) {
                const zone = this.eggZones[i];
                const distance = Phaser.Math.Distance.Between(ant.x, ant.y, zone.x, zone.y);
                if (distance < zone.radius) {
                    // Lay egg
                    this.spawnEgg(ant.x, ant.y);
                    
                    // Start refractory period
                    ant.setData('isRefractory', true);
                    ant.setAlpha(0.5);
                    this.time.delayedCall(20000, () => {
                        if (ant.active) {
                            ant.setData('isRefractory', false);
                            ant.setAlpha(1);
                        }
                    });
                    break;
                }
            }
        }

        // Boundary detection and turn right (90 degrees)
        const margin = 20; // Half of ant texture size
        const width = this.scale.width;
        const height = this.scale.height;

        let hitBoundary = false;

        if (ant.x > width - margin) {
            ant.x = width - margin;
            hitBoundary = true;
        } else if (ant.x < margin) {
            ant.x = margin;
            hitBoundary = true;
        }

        if (ant.y > height - margin) {
            ant.y = height - margin;
            hitBoundary = true;
        } else if (ant.y < margin) {
            ant.y = margin;
            hitBoundary = true;
        }

        if (hitBoundary) {
            ant.angle += 90;
        }
    }

    private createAntTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0x000000, 1);
        
        // Body parts (centered around 20, 20)
        // Abdomen
        graphics.fillEllipse(12, 20, 16, 10);
        // Thorax
        graphics.fillCircle(22, 20, 5);
        // Head
        graphics.fillCircle(30, 20, 4);
        
        // Legs
        graphics.lineStyle(1, 0x000000, 1);
        
        // Thorax is at 22, 20. Legs attach here.
        // Left legs
        graphics.lineBetween(22, 20, 18, 12);
        graphics.lineBetween(22, 20, 22, 12);
        graphics.lineBetween(22, 20, 26, 12);
        
        // Right legs
        graphics.lineBetween(22, 20, 18, 28);
        graphics.lineBetween(22, 20, 22, 28);
        graphics.lineBetween(22, 20, 26, 28);

        // Antennae
        graphics.lineBetween(30, 20, 34, 16);
        graphics.lineBetween(30, 20, 34, 24);
        
        graphics.generateTexture('ant', 40, 40);
        graphics.destroy();
    }

    private createEggTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0xffffff, 1);
        
        // Simple oval egg
        graphics.fillEllipse(10, 10, 10, 14);
        
        graphics.generateTexture('egg', 20, 20);
        graphics.destroy();
    }

    private createTermiteTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0xff0000, 1);
        
        // Body parts (centered around 30, 30)
        // Abdomen
        graphics.fillEllipse(18, 30, 24, 15);
        // Thorax
        graphics.fillCircle(33, 30, 8);
        // Head
        graphics.fillCircle(45, 30, 6);
        
        // Legs
        graphics.lineStyle(2, 0xff0000, 1);
        
        // Thorax is at 33, 30. Legs attach here.
        // Left legs
        graphics.lineBetween(33, 30, 27, 18);
        graphics.lineBetween(33, 30, 33, 18);
        graphics.lineBetween(33, 30, 39, 18);
        
        // Right legs
        graphics.lineBetween(33, 30, 27, 42);
        graphics.lineBetween(33, 30, 33, 42);
        graphics.lineBetween(33, 30, 39, 42);

        // Antennae
        graphics.lineBetween(45, 30, 51, 24);
        graphics.lineBetween(45, 30, 51, 36);
        
        graphics.generateTexture('termite', 60, 60);
        graphics.destroy();
    }
}
