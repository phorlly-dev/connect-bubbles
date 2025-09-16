import * as Phaser from "phaser";
import { engine, preload } from "../consts";
import { getColorHex } from "../utils/states";

class Preload extends Phaser.Scene {
    constructor() {
        super(preload);
        this.ballColors = [
            "red",
            "blue",
            "green",
            "yellow",
            "purple",
            "orange",
        ];
    }

    preload() {
        this.load.image("airplane", "assets/airplane.png");

        // Generate ball textures once here
        this.ballColors.forEach((color) => {
            const graphics = this.add.graphics();

            // Outer glow
            graphics.fillStyle(getColorHex(color), 0.15);
            graphics.fillCircle(17.5, 17.5, 18); // was 20

            // Main ball
            graphics.fillStyle(getColorHex(color));
            graphics.fillCircle(17.5, 17.5, 16);

            // Highlight
            graphics.fillStyle(0xffffff, 0.6);
            graphics.fillCircle(14, 13, 5);

            // Save texture
            graphics.generateTexture(color, 35, 35);
            graphics.destroy();

            //Effect
            const grap = this.add.graphics();
            grap.fillStyle(getColorHex(color), 1);
            grap.fillCircle(8, 8, 8);
            grap.generateTexture(`particle_${color}`, 16, 16);
            grap.destroy();
        });
    }

    create() {
        this.scene.start(engine);
    }
}

export default Preload;
