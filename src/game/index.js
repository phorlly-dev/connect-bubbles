import * as Phaser from "phaser";
import GameEngine from "./scenes/Game";
import { height, width } from "./consts";
import Preload from "./scenes/Preload";

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: Phaser.AUTO,
    // backgroundColor: "#028af8",
    scale: {
        mode: Phaser.Scale.FIT, // auto scale to fit
        autoCenter: Phaser.Scale.CENTER_BOTH, // center horizontally + vertically
        width: width,
        height: height,
    },
    scene: [Preload, GameEngine],
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;
