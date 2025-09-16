import * as Phaser from "phaser";
import { emitEvent, emitEvents } from "../../hooks/remote";
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
        this.targetScore = 0;
        this.remainingMoves = 0;
        this.scores = { current: 0, total: 0 };
        this.moves = { current: 0, total: 0 };

        // 🆕 Track last emitted values
        this._lastSent = {
            moves: {},
            scores: {},
            level: 0,
            target: 0,
        };
    }

    init(data) {
        this.resetGame(data);
    }

    create() {
        // 🔹 Lifecycle hook
        emitEvent("current-scene-ready", this);
        emitEvent("sound", (mute) => (this.sound.mute = mute));

        // 🔹 Setup gameplay visuals
        // makeRandomGrid(this);
        makeGridWithWave(this);
        makeInput(this);
        this.lineGraphics = this.add.graphics();

        // 🔹 Sync UI
        this.syncUI();
    }

    resetGame(data = {}) {
        // ✅ Reset core state
        this.level = data.level || 1;
        this.gameOver = data.gameOver || false;

        const targetChecking = this.level - 1 <= 3 ? 90 : 60;
        const baseTarget =
            (this.level - 1) * targetChecking +
            Phaser.Math.Between(180, 360) +
            120;

        // ✅ Base moves for level
        const moveChecking = baseTarget >= 400 ? 12 : 7;
        const baseMoves =
            Phaser.Math.Between(12, 24) +
            moveChecking +
            Math.floor(this.level / 4);

        // ✅ Carry over leftover moves from previous level
        this.moves.total = baseMoves + (data.remainingMoves || 0);
        this.moves.current = this.moves.total;
        this.targetScore = baseTarget;

        // ✅ Reset scores
        this.scores = {
            current: 0,
            total: data.totalScore || 0, // keep accumulated total if passed
        };

        // ✅ Reset game objects
        this.selectedBalls = [];
        this.currentColor = null;
        this.balls = [];
        this.grid = [];

        // ✅ Reset graphics
        if (this.lineGraphics) this.lineGraphics.clear();

        // ✅ Emit UI events
        this.syncUI();
    }

    syncUI() {
        emitEvents({
            events: ["level", "target", "moves", "scores"],
            args: [
                this.level,
                this.targetScore,
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
}

export default GameEngine;
