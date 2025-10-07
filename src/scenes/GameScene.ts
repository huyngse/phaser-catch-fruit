import Phaser from "phaser";

interface GameConfig {
    spawnRate: number;
    fruitLifetime: number;
}

class Fruit extends Phaser.Physics.Arcade.Sprite {
    collectable: boolean = true;
}

class GameScene extends Phaser.Scene {
    private fruits!: Phaser.Physics.Arcade.Group;
    private config!: GameConfig;
    private basket!: Phaser.Physics.Arcade.Sprite;
    private speed: number = 300;

    private score: number = 0;
    private scoreText!: Phaser.GameObjects.Text;

    private readonly fruitTypes = ["apple", "banana", "cherries"];

    constructor() {
        super("GameScene");
        this.config = {
            spawnRate: 2000,
            fruitLifetime: 5000,
        };
    }

    preload() {
        this.load.image("apple", "/assets/apple.png");
        this.load.image("banana", "/assets/banana.png");
        this.load.image("cherries", "/assets/cherries.png");
        this.load.image("wicker-basket", "/assets/wicker-basket.png");
    }

    create() {
        this.physics.world.setBounds(0, 0, 800, 600);
        this.fruits = this.physics.add.group({
            classType: Fruit,
            runChildUpdate: true,
        });

        this.basket = this.physics.add.sprite(400, 550, "wicker-basket");
        this.basket.setScale(0.2);
        this.basket.setCollideWorldBounds(true);
        this.basket.setImmovable(true);

        if (this.basket.body) {
            const basketWidth = this.basket.displayWidth * 5;
            const basketHeight = this.basket.displayHeight / 2 * 5;
            this.basket.body.setSize(basketWidth, basketHeight);
            this.basket.body.setOffset(0, this.basket.displayHeight * 5 / 2);
        }

        this.physics.add.overlap(
            this.fruits,
            this.basket,
            this.catchFruit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this);

        this.time.addEvent({
            delay: this.config.spawnRate,
            callback: () => this.spawnFruit(),
            loop: true,
        });

        this.input.keyboard?.addKeys('A,D');

        this.scoreText = this.add.text(10, 10, "Score: 0", {
            font: "24px Arial",
            color: "#ffffff",
        }).setDepth(1);
    }

    update(time: number, delta: number) {

        const keys = this.input.keyboard?.addKeys({ A: Phaser.Input.Keyboard.KeyCodes.A, D: Phaser.Input.Keyboard.KeyCodes.D }) as any;
        const moveAmount = this.speed * (delta / 1000);


        if (keys.A.isDown) {
            this.basket.x -= moveAmount;
        } else if (keys.D.isDown) {
            this.basket.x += moveAmount;
        }

        this.fruits.getChildren().forEach((fruitObj) => {
            const fruit = fruitObj as Fruit;
            if (fruit.active && fruit.body) {
                const bottomY = this.physics.world.bounds.bottom;
                if (fruit.y + fruit.displayHeight / 2 >= bottomY) {
                    fruit.collectable = false;
                }
            }
        });
    }

    spawnFruit() {
        const randomFruit = Phaser.Utils.Array.GetRandom(this.fruitTypes);
        const x = Phaser.Math.Between(50, 750);
        const fruit = this.fruits.create(x, 0, randomFruit) as Fruit;

        fruit.setScale(0.1);
        fruit.setBounce(0.5);
        fruit.setCollideWorldBounds(true);

        this.time.delayedCall(this.config.fruitLifetime, () => {
            if (fruit.active) fruit.destroy();
        });
    }

    catchFruit(basket: Phaser.GameObjects.GameObject, fruit: Phaser.GameObjects.GameObject) {
        const f = fruit as Fruit;
        if (f.collectable) {
            f.destroy();
            this.score += 1;
            this.scoreText.setText(`Score: ${this.score}`);
        }
    }
}

export default GameScene;
