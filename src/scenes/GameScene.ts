import Phaser from "phaser";

interface GameConfig {
    spawnRate: number;
    fruitLifetime: number;
}

class Fruit extends Phaser.Physics.Arcade.Sprite {
    collectable = true;
}

class GameScene extends Phaser.Scene {
    private fruits!: Phaser.Physics.Arcade.Group;
    private basket!: Phaser.Physics.Arcade.Sprite;
    private scoreText!: Phaser.GameObjects.Text;
    private gameOverText!: Phaser.GameObjects.Text;

    private lifeIcons: Phaser.GameObjects.Image[] = [];

    private config: GameConfig = {
        spawnRate: 2000,
        fruitLifetime: 5000,
    };

    private readonly fruitTypes = ["apple", "banana", "cherries"];
    private speed = 300;
    private score = 0;
    private lives = 3;
    private highScore = 0;
    private spawnTimer!: Phaser.Time.TimerEvent;
    private keys!: { A: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };

    constructor() {
        super("GameScene");
    }

    preload() {
        this.load.image("apple", "/assets/apple.png");
        this.load.image("banana", "/assets/banana.png");
        this.load.image("cherries", "/assets/cherries.png");
        this.load.image("wicker-basket", "/assets/wicker-basket.png");
        this.load.image("heart", "/assets/heart.png");
    }

    create() {
        this.resetGameState();
        this.createWorld();
        this.createBasket();
        this.createUI();
        this.setupControls();
        this.startFruitSpawner();
    }

    update(_: number, delta: number) {
        if (this.lives <= 0) return;

        const moveAmount = this.speed * (delta / 1000);
        if (this.keys.A.isDown) this.basket.x -= moveAmount;
        if (this.keys.D.isDown) this.basket.x += moveAmount;

        this.checkFruitBounds();
    }

    // ─── Initialization Helpers ─────────────────────────────

    private resetGameState() {
        this.lives = 3;
        this.score = 0;
        this.lifeIcons = [];
    }

    private createWorld() {
        this.physics.world.setBounds(0, 0, 800, 600);
        this.fruits = this.physics.add.group({ classType: Fruit, runChildUpdate: true });
    }

    private createBasket() {
        this.basket = this.physics.add.sprite(400, 550, "wicker-basket")
            .setScale(0.2)
            .setCollideWorldBounds(true)
            .setImmovable(true);

        // Adjust basket collision hitbox
        if (this.basket.body) {
            const scaleFactor = 5;
            const basketWidth = this.basket.displayWidth * scaleFactor;
            const basketHeight = (this.basket.displayHeight / 2) * scaleFactor;
            this.basket.body.setSize(basketWidth, basketHeight);
            this.basket.body.setOffset(0, (this.basket.displayHeight * scaleFactor) / 2);
        }

        // Handle catching fruits
        this.physics.add.overlap(this.fruits, this.basket, this.catchFruit as any, undefined, this);
    }

    private createUI() {
        this.scoreText = this.add.text(10, 10, "Score: 0", {
            font: "24px Arial",
            color: "#ffffff",
        }).setDepth(1);

        for (let i = 0; i < this.lives; i++) {
            const heart = this.add.image(700 + i * 40, 30, "heart").setScale(0.05);
            this.lifeIcons.push(heart);
        }

        this.gameOverText = this.add.text(400, 300, "", {
            font: "32px Arial",
            color: "#fff",
            backgroundColor: "#000",
            padding: { x: 20, y: 20 },
            align: "center",
        })
            .setOrigin(0.5)
            .setDepth(2)
            .setVisible(false);
    }

    private setupControls() {
        this.keys = this.input.keyboard!.addKeys({
            A: Phaser.Input.Keyboard.KeyCodes.A,
            D: Phaser.Input.Keyboard.KeyCodes.D,
        }) as any;
    }

    private startFruitSpawner() {
        this.spawnTimer = this.time.addEvent({
            delay: this.config.spawnRate,
            callback: this.spawnFruit,
            callbackScope: this,
            loop: true,
        });
    }

    // ─── Game Mechanics ─────────────────────────────

    private spawnFruit() {
        const fruitType = Phaser.Utils.Array.GetRandom(this.fruitTypes);
        const x = Phaser.Math.Between(50, 750);
        const fruit = this.fruits.create(x, 0, fruitType) as Fruit;

        fruit.setScale(0.1)
            .setBounce(0.5)
            .setCollideWorldBounds(true);

        this.time.delayedCall(this.config.fruitLifetime, () => {
            if (fruit.active) fruit.destroy();
        });
    }

    private catchFruit(_: Phaser.GameObjects.GameObject, fruitObj: Phaser.GameObjects.GameObject) {
        const fruit = fruitObj as Fruit;
        if (!fruit.collectable) return;

        fruit.destroy();
        this.updateScore(1);
    }

    private updateScore(amount: number) {
        this.score += amount;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    private checkFruitBounds() {
        const bottomY = this.physics.world.bounds.bottom;
        this.fruits.getChildren().forEach((obj) => {
            const fruit = obj as Fruit;
            if (fruit.active && fruit.collectable && fruit.y + fruit.displayHeight / 2 >= bottomY) {
                fruit.collectable = false;
                this.loseLife();
            }
        });
    }

    private loseLife() {
        if (this.lives <= 0) return;

        this.lives--;
        const heart = this.lifeIcons.pop();
        heart?.destroy();

        if (this.lives <= 0) this.endGame();
    }

    private endGame() {
        this.highScore = Math.max(this.highScore, this.score);

        this.physics.pause();
        this.spawnTimer.remove(false);

        this.gameOverText.setText(
            `Game Over\nScore: ${this.score}\nHigh Score: ${this.highScore}\n\nPress any key to restart`
        ).setVisible(true);

        this.input.keyboard?.once("keydown", () => this.scene.start("MainMenuScene"));
    }
}

export default GameScene;
