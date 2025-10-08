import Phaser from "phaser";
import MousePositionUtil from "../utils/MousePositionUtil";

class MainMenuScene extends Phaser.Scene {
    private mouseUtil!: MousePositionUtil;

    constructor() {
        super("MainMenuScene");
    }

    preload() {

    }

    create() {
        this.mouseUtil = new MousePositionUtil(this);
        this.add.text(400, 150, "Catch Fruit!", {
            fontSize: "48px",
            color: "#fff"
        }).setOrigin(0.5)

        const startText = this.add.text(400, 300, "Start Game", {
            fontSize: "32px",
            color: "#fff"
        }).setOrigin(0.5).setInteractive();

        startText.on("pointerdown", () => {
            this.scene.start("GameScene");
        })

        startText.on("pointerover", () => {
            startText.setStyle({
                color: "#ddd"
            })
        })

        startText.on("pointerout", () => {
            startText.setStyle({
                color: "#fff"
            })
        })
    }

    update() {
        this.mouseUtil.update();
    }
}

export default MainMenuScene;