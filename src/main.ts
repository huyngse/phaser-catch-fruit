import Phaser from "phaser";
import GameScene from "./scenes/GameScene";
import MainMenuScene from "./scenes/MainMenuScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#38bdf8",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300, x: 0 },
      debug: false,
    },
  },
  scene: [MainMenuScene, GameScene],
};

new Phaser.Game(config);
