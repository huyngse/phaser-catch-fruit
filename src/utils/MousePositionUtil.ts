import type { GameObjects, Scene } from "phaser";

export default class MousePositionUtil {
    private scene: Scene;
    private text: GameObjects.Text

    constructor(scene: Scene) {
        this.scene = scene;

        this.text = scene.add.text(10, 10, '', {
            font: '16px Arial',
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 5, y: 5 }
        });
        this.text.setDepth(1000);
    }

    update() {
        const pointer = this.scene.input.activePointer;
        this.text.setText(`x: ${pointer.x.toFixed(1)}, y: ${pointer.y.toFixed(1)}`);
    }
}
