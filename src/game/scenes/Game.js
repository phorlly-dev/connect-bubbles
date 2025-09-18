import * as Phaser from "phaser";
import { emitEvent, emitEvents, onEvent } from "../../hooks/remote";
import { engine } from "../consts";
import { makeInput, makeGridWithWave } from "../utils/objects";
import { updateProgress } from "../../hooks/storage";

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
        this.playerName = "";

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
        onEvent("sound", (mute) => {
            this.sound.mute = mute;
            this.sound.play("close");
        });

        // 🔹 Setup gameplay visuals
        // makeRandomGrid(this);
        makeGridWithWave(this);
        makeInput(this);
        this.lineGraphics = this.add.graphics();

        // 🔹 Sync UI
        this.syncUI();
    }

    resetGame(data = {}) {
        // Player
        this.playerName = data.player || this.playerName;

        // Core state
        this.level = data.level || 1;
        this.gameOver = data.gameOver || false;

        // Moves
        const targetChecking = this.level - 1 <= 3 ? 90 : 60;
        const baseTarget =
            (this.level - 1) * targetChecking +
            Phaser.Math.Between(180, 360) +
            120;

        const moveChecking = baseTarget >= 400 ? 12 : 7;
        const baseMoves =
            Phaser.Math.Between(12, 24) +
            moveChecking +
            Math.floor(this.level / 4);

        this.moves.total = baseMoves + (data.remainingMoves || 0);
        this.moves.current = this.moves.total;

        // Scores
        this.scores = {
            current: 0,
            total: data.totalScore || 0,
        };

        this.targetScore = baseTarget;

        //Save data to DB
        if (this.playerName)
            updateProgress(this.playerName, {
                score: data.totalScore,
                move: data.remainingMoves,
                level: data.level,
            });

        //Auto sync UI
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
