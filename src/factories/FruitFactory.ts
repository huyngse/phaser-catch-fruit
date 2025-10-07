import Phaser from "phaser";

export interface FruitFactoryConfig {
    spawnRate: number;
    fruitLifetime: number;
    fruitTypes: string[];
    scale?: number;
    bounce?: number;
}

export class FruitFactory {
    private scene: Phaser.Scene;
    private group: Phaser.Physics.Arcade.Group;
    private config: FruitFactoryConfig;

    constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group, config: FruitFactoryConfig) {
        this.scene = scene;
        this.group = group;
        this.config = config;

        this.scene.time.addEvent({
            delay: this.config.spawnRate,
            callback: () => this.spawnFruit(),
            loop: true,
        });
    }

    spawnFruit() {
        const randomFruit = Phaser.Utils.Array.GetRandom(this.config.fruitTypes);
        const x = Phaser.Math.Between(50, 750);
        const fruit = this.group.create(x, 0, randomFruit) as Phaser.Physics.Arcade.Sprite;

        const scale = this.config.scale ?? 0.1;
        const bounce = this.config.bounce ?? 0.5;

        fruit.setScale(scale);
        fruit.setBounce(bounce);
        fruit.setCollideWorldBounds(true);

        this.scene.time.delayedCall(this.config.fruitLifetime, () => {
            if (fruit.active) fruit.destroy();
        });
    }
}
