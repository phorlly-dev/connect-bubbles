import * as Phaser from "phaser";
import { emitEvent, emitEvents, onEvent } from "../../hooks/remote";
import { engine } from "../consts";
import { makeInput, makeGridWithWave } from "../utils/objects";

class GameEngine extends Phaser.Scene {
    constructor() {
        super(engine);
        this.ballColors = [
            "red",
            "blue",
            "green",
            "yellow",
            "purple",
            "orange",
        ];
        this.balls = [];
        this.selectedBalls = [];
        this.isDrawing = false;
        this.currentColor = null;
        this.gameOver = false;
        this.lineGraphics = null;
        this.grid = [];
        this.rows = 9;
        this.cols = 8;
        this.level = 1;
        this.target = 0;
        this.scores = { current: 0, total: 0 };
        this.moves = { current: 0, total: 0 };
        this.player = null;

        // 🆕 Track last emitted values
        this._lastSent = {
            moves: {},
            scores: {},
            level: 0,
            target: 0,
        };

        this.colorScores = {
            red: 10,
            blue: 15,
            green: 20,
            yellow: 25,
            purple: 30,
            orange: 40,
        };
    }

    init() {
        emitEvent("current-scene-ready", this);
        onEvent("firebase-data-loaded", (data) => this.resetGame(data));

        // clear old events
        if (this.input) this.input.removeAllListeners();
    }

    create() {
        onEvent("sound", (mute) => {
            this.sound.mute = mute;
            this.sound.play("close");
        });

        // 🔹 Setup gameplay visuals
        // makeRandomGrid(this);
        makeGridWithWave(this);
        makeInput(this);
        this.lineGraphics = this.add.graphics();
    }

    resetGame(data = {}) {
        // Player
        this.player = data.player;

        // Core state
        this.level = data.level || 1;
        this.gameOver = data.gameOver || false;

        // 🔹 Always compute target first (once only)
        this.target = this.genBaseTarget();

        // Moves (carry over remaining moves if given)
        const baseMoves = this.genBaseMoves(this.target);
        this.moves = {
            current: (data.move || 0) + baseMoves,
            total: (data.move || 0) + baseMoves,
        };

        // Scores
        this.scores = {
            current: 0,
            total: data.score || 0,
        };
    }

    genBaseTarget() {
        // 🔹 Early levels = gentler target, later = harder
        const scale = this.level <= 6 ? 90 : 60;

        // Add random element + base scaling
        const base = (this.level - 1) * scale + Phaser.Math.Between(180, 360);

        return base;
    }

    genBaseMoves(target) {
        // 🔹 Fewer moves if target is small, more if higher
        const moveBoost = target >= 400 ? 12 : 7;

        // Scale with level to avoid feeling too punishing later
        const baseMoves =
            Phaser.Math.Between(12, 24) +
            moveBoost +
            Math.floor(this.level / 3);

        return baseMoves;
    }

    update() {
        emitEvents({
            events: ["level", "target", "moves", "scores"],
            args: [
                this.level,
                this.target,
                { ...this.moves },
                { ...this.scores },
            ],
        });
    }

    safeEmit(key, value) {
        const str = JSON.stringify(value);
        if (this._lastSent[key] !== str) {
            this._lastSent[key] = str;
            emitEvent(key, value);
        }
    }

    // --- Cleanup when scene stops ---
    shutdown() {
        this.input.removeAllListeners();
        this.sound.stopAll();
    }
}

export default GameEngine;
