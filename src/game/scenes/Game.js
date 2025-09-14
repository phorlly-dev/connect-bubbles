import * as Phaser from "phaser";
import { RemoteEvent } from "../../hooks/remote";
import { engine } from "../consts";

class GameEngine extends Phaser.Scene {
    constructor() {
        super(engine);
        this.score = 0;
        this.ballColors = [
            "red",
            "blue",
            "green",
            "yellow",
            "purple",
            "orange",
        ];
        this.ballSize = 35;
        this.balls = [];
        this.selectedBalls = [];
        this.isDrawing = false;
        this.currentColor = null;
        this.gameOver = false;
        this.lineGraphics = null;
        this.grid = [];
        this.rows = 10;
        this.cols = 8;
        this.moves = 20;
        this.totalMoves = 20;
        this.targetScore = 200;
        this.level = 1;
    }

    init(data) {
        // Get level from previous scene restart, default = 1
        this.level = data.level || 1;

        // Moves: random between 15–25, grows slightly each level
        this.totalMoves =
            Phaser.Math.Between(12, 24) + Math.floor(this.level / 3);
        this.moves = this.totalMoves;

        // Target score: grows with level difficulty
        this.targetScore =
            150 + (this.level - 1) * 50 + Phaser.Math.Between(60, 80);

        // Reset score
        this.score = 0;
    }

    create() {
        // 🔹 Emit lifecycle
        RemoteEvent.emit("current-scene-ready", this);

        this.makeRandomGrid();
        this.setupInput();
        this.lineGraphics = this.add.graphics();

        // Example UI: scores start at 0
        RemoteEvent.emit("level:update", this.level);
        RemoteEvent.emit("moves:update", {
            current: this.moves,
            total: this.moves,
        });
        RemoteEvent.emit("target:update", this.targetScore);
        RemoteEvent.emit("score:update", this.score);
    }

    makeRandomGrid() {
        // Initialize grid
        this.grid = [];
        for (let row = 0; row < this.rows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col] = null;
            }
        }

        // Fill grid completely with smart distribution
        this.fillGrid();

        // Create visual balls from grid
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const color = this.grid[row][col];
                const { x, y } = this.getGridPosition(row, col);
                const ball = this.add.image(x, y, color);

                ball.setData("color", color);
                ball.setData("row", row);
                ball.setData("col", col);
                ball.setInteractive();

                // Add subtle pulse animation
                this.tweens.add({
                    targets: ball,
                    scale: 1.05,
                    duration: 1500 + Math.random() * 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut",
                });

                this.balls.push(ball);
            }
        }
    }

    fillGrid() {
        // Strategy: Fill grid ensuring there are always valid moves
        // 1. First pass: Random fill
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col] = this.getRandomColor();
            }
        }

        // 2. Second pass: Ensure clusters exist by creating guaranteed matches
        this.ensurePlayability();
    }

    ensurePlayability() {
        // Create several guaranteed clusters of 3+ balls
        const clustersToCreate = 8 + Math.floor(Math.random() * 4);

        for (let i = 0; i < clustersToCreate; i++) {
            this.makeCluster();
        }
    }

    makeCluster() {
        const color = this.getRandomColor();
        const startRow = Math.floor(Math.random() * (this.rows - 2));
        const startCol = Math.floor(Math.random() * (this.cols - 2));

        // Create different cluster patterns
        const patterns = this.makePatterns();
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];

        pattern.forEach(([dr, dc]) => {
            const row = startRow + dr;
            const col = startCol + dc;
            if (row < this.rows && col < this.cols) {
                this.grid[row][col] = color;
            }
        });
    }

    setupInput() {
        // Mouse/touch down - start drawing
        this.input.on("pointerdown", (_pointer, currentlyOver) => {
            if (this.gameOver || currentlyOver.length === 0) return;

            const ball = currentlyOver[0];
            this.startConnection(ball);

            // Change cursor when drawing starts
            this.input.setDefaultCursor("crosshair");
        });

        // Mouse/touch move - continue drawing
        this.input.on("pointermove", (pointer, currentlyOver) => {
            if (!this.isDrawing) return;

            // Update line to cursor position
            this.updateConnectionLine(pointer.x, pointer.y);

            // Check if over a new ball
            if (currentlyOver.length > 0) {
                const ball = currentlyOver[0];
                this.tryAddBallToConnection(ball);
            }
        });

        // Mouse/touch up - finish drawing
        this.input.on("pointerup", () => {
            if (this.isDrawing) this.finishConnection();

            // Reset cursor back to normal
            this.input.setDefaultCursor("default");
        });
    }

    startConnection(ball) {
        this.isDrawing = true;
        this.currentColor = ball.getData("color");
        this.selectedBalls = [ball];
        this.highlightBall(ball, true);
    }

    highlightBall(ball, highlight) {
        if (highlight) {
            ball.setTint(0xffffff);
            ball.setScale(1.2);

            // Add glowing aura effect
            if (!ball.getData("aura")) {
                const aura = this.add.circle(
                    ball.x,
                    ball.y,
                    25,
                    this.getColorHex(ball.getData("color")),
                    0.3
                );
                aura.setBlendMode(Phaser.BlendModes.ADD);
                ball.setData("aura", aura);

                // Pulsing aura animation
                this.tweens.add({
                    targets: aura,
                    scaleX: 1.3,
                    scaleY: 1.3,
                    alpha: 0.1,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut",
                });
            }
        } else {
            ball.clearTint();
            ball.setScale(1.0);

            // Remove aura effect
            const aura = ball.getData("aura");
            if (aura) {
                this.tweens.killTweensOf(aura);
                aura.destroy();
                ball.setData("aura", null);
            }
        }
    }

    tryAddBallToConnection(ball) {
        if (!ball || this.selectedBalls.includes(ball)) return;

        const ballColor = ball.getData("color");
        if (ballColor !== this.currentColor) return;

        // More flexible connection - allow connections within reasonable distance
        const lastBall = this.selectedBalls[this.selectedBalls.length - 1];
        const distance = Phaser.Math.Distance.Between(
            ball.x,
            ball.y,
            lastBall.x,
            lastBall.y
        );

        // Allow connection to nearby balls (not just adjacent)
        if (distance < 80) {
            this.selectedBalls.push(ball);
            this.updateConnectionLine();
            this.highlightBall(ball, true);
        }
    }

    updateConnectionLine(endX = null, endY = null) {
        this.lineGraphics.clear();
        if (this.selectedBalls.length < 1) return;

        const color = this.getColorHex(this.currentColor);

        // Function to offset point slightly toward center
        const adjust = (x1, y1, x2, y2, offset = 16) => {
            const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);
            return {
                x: x1 + Math.cos(angle) * offset,
                y: y1 + Math.sin(angle) * offset,
            };
        };

        // Draw connection
        this.lineGraphics.lineStyle(6, color, 0.9);
        for (let i = 0; i < this.selectedBalls.length - 1; i++) {
            const b1 = this.selectedBalls[i];
            const b2 = this.selectedBalls[i + 1];

            const p1 = adjust(b1.x, b1.y, b2.x, b2.y);
            const p2 = adjust(b2.x, b2.y, b1.x, b1.y);

            this.lineGraphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
        }

        // Optional line to cursor
        if (endX && endY && this.selectedBalls.length > 0) {
            const lastBall = this.selectedBalls[this.selectedBalls.length - 1];
            const p = adjust(lastBall.x, lastBall.y, endX, endY);
            this.lineGraphics.lineBetween(p.x, p.y, endX, endY);
        }
    }

    finishConnection() {
        this.isDrawing = false;

        // Remove aura/highlight before destroy
        this.selectedBalls.forEach((ball) => {
            this.highlightBall(ball, false);
        });

        if (this.selectedBalls.length >= 3) {
            this.clearConnectedBalls();
            // Deduct move only if a valid connection was made
            this.moves--;

            RemoteEvent.emit("moves:update", {
                current: this.moves, // remaining
                total: this.totalMoves, // fixed max for level
            });
        } else {
            this.selectedBalls = [];
            this.currentColor = null;
        }

        // Clear the line immediately
        this.lineGraphics.clear();
    }

    clearConnectedBalls() {
        let points = 10;
        if (this.selectedBalls.length > 3) {
            points = this.selectedBalls.length * 5;
        }

        this.score += points;
        RemoteEvent.emit("score:update", this.score);

        this.showPopup(points);

        // Remove balls from grid and visual
        this.selectedBalls.forEach((ball, index) => {
            const row = ball.getData("row");
            const col = ball.getData("col");
            this.grid[row][col] = null;

            // 🎇 Particle burst effect
            this.showBurstEffect(ball);

            // 🎬 Clear animation
            this.tweens.add({
                targets: ball,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                rotation: Math.PI * 2,
                duration: 400,
                delay: index * 60,
                ease: "Back.easeIn",
                onComplete: () => {
                    ball.destroy();
                    this.balls = this.balls.filter((b) => b !== ball);
                },
            });
        });

        this.selectedBalls = [];

        // Apply gravity and refill
        this.time.delayedCall(400, () => {
            this.applyGravity();
            this.refillEmptySpaces();
            this.checkLevelStatus();
        });
    }

    showBurstEffect(ball) {
        const color = this.getColorHex(ball.getData("color"));

        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(ball.x, ball.y, 4, color);
            const angle = Phaser.Math.DegToRad(45 * i);
            const distance = 30 + Math.random() * 20;

            this.tweens.add({
                targets: particle,
                x: ball.x + Math.cos(angle) * distance,
                y: ball.y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0,
                duration: 500 + Math.random() * 200,
                ease: "Cubic.easeOut",
                onComplete: () => particle.destroy(),
            });
        }
    }

    applyGravity() {
        for (let col = 0; col < this.cols; col++) {
            // Get all balls in this column from bottom to top
            const columnBalls = [];
            for (let row = this.rows - 1; row >= 0; row--) {
                if (this.grid[row][col] !== null) {
                    const ball = this.balls.find(
                        (b) =>
                            b.getData("row") === row && b.getData("col") === col
                    );
                    if (ball) {
                        columnBalls.push({ ball, color: this.grid[row][col] });
                        this.grid[row][col] = null;
                    }
                }
            }

            // Place balls at bottom
            columnBalls.forEach((item, index) => {
                const newRow = this.rows - 1 - index;
                const { y } = this.getGridPosition(newRow, col);
                this.grid[newRow][col] = item.color;
                item.ball.setData("row", newRow);
                item.ball.setData("col", col);

                // Animate falling
                this.tweens.add({
                    targets: item.ball,
                    y,
                    duration: 300,
                    ease: "Bounce.easeOut",
                });
            });
        }
    }

    refillEmptySpaces() {
        // Fill empty spaces with new balls
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col] === null) {
                    const color = this.getRandomColor();
                    this.grid[row][col] = color;

                    const { x, y } = this.getGridPosition(row, col);
                    const ball = this.add.image(x, y - 200, color);
                    ball.setData("color", color);
                    ball.setData("row", row);
                    ball.setData("col", col);
                    ball.setInteractive();
                    ball.setAlpha(0);

                    // Animate falling in
                    this.tweens.add({
                        targets: ball,
                        y,
                        alpha: 1,
                        duration: 400,
                        delay: Math.random() * 200,
                        ease: "Bounce.easeOut",
                    });

                    this.balls.push(ball);
                }
            }
        }

        // Ensure new arrangement is still playable
        this.time.delayedCall(500, () => this.ensurePlayability());
    }

    showMessage(message, color) {
        const { width, height } = this.sys.game.config;
        const text = this.add
            .text(width / 2, height / 2, message, {
                fontSize: "28px",
                fill: `#${color.toString(16).padStart(6, "0")}`,
                fontFamily: "Arial",
                align: "center",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);

        // Tap anywhere to restart
        this.input.once("pointerdown", () => {
            this.scene.restart({ level: this.level });
        });

        return text; // ✅ return text so caller can tween it
    }

    getRandomColor() {
        return this.ballColors[
            Math.floor(Math.random() * this.ballColors.length)
        ];
    }

    checkLevelStatus() {
        if (this.score >= this.targetScore) {
            // Move to next level
            this.levelCompleted(this.level);
        } else if (this.moves <= 0) {
            // ❌ Out of moves & didn’t reach target
            this.showMessage("❌ You lose!\n\nTap to play again", 0xff0000);
            this.gameOver = true;
        }
    }

    getColorHex(color) {
        const colors = {
            red: 0xff6b6b,
            blue: 0x4ecdc4,
            green: 0x45b7d1,
            yellow: 0xf9ca24,
            purple: 0x6c5ce7,
            orange: 0xfd79a8,
        };
        return colors[color] || 0x000000;
    }

    getGridPosition(row, col) {
        const spacing = 42;
        const offsetX =
            (this.sys.game.config.width - (this.cols - 1) * spacing) / 2;
        const offsetY =
            (this.sys.game.config.height - (this.rows - 1) * spacing) / 2;
        return {
            x: col * spacing + offsetX,
            y: row * spacing + offsetY,
        };
    }

    makePatterns() {
        return [
            // Horizontal line
            [
                [0, 0],
                [0, 1],
                [0, 2],
            ],
            // Vertical line
            [
                [0, 0],
                [1, 0],
                [2, 0],
            ],
            // L shape
            [
                [0, 0],
                [0, 1],
                [1, 0],
            ],
            // Square
            [
                [0, 0],
                [0, 1],
                [1, 0],
                [1, 1],
            ],
            // T shape
            [
                [0, 0],
                [0, 1],
                [0, 2],
                [1, 1],
            ],
        ];
    }

    showPopup(points) {
        // 👉 Center of the connected group
        const centerX = Phaser.Math.Average(this.selectedBalls.map((b) => b.x));
        const centerY = Phaser.Math.Average(this.selectedBalls.map((b) => b.y));

        // 👉 Score popup text
        const popup = this.add
            .text(centerX, centerY, `+${points}`, {
                fontSize: "22px",
                fontFamily: "Arial",
                fontStyle: "bold",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);

        this.tweens.add({
            targets: popup,
            y: centerY / 2,
            alpha: 0,
            duration: 2000,
            ease: "Cubic.easeOut",
            onComplete: () => popup.destroy(),
        });

        // In showPopup()
        const tintColor = this.getColorHex(this.currentColor);
        this.makeParticle(centerX, centerY, tintColor);
    }

    makeParticle(x, y, color) {
        const particles = this.add.particles(x, y, "particle", {
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            lifespan: 600,
            quantity: 12,
            tint: color,
            blendMode: "ADD",
        });

        this.time.delayedCall(1000, () => particles.destroy());
    }

    levelCompleted(level) {
        // 🎉 Flash message
        const message = this.showMessage(
            `🎉 You Win!\nLevel ${level} Complete!`,
            0x00ff00
        );

        this.tweens.add({
            targets: message,
            scale: 1.2,
            duration: 300,
            yoyo: true,
            repeat: 2,
            onComplete: () => message.destroy(),
        });

        // 🎇 Confetti particles using generic "particle"
        const emitterConfig = {
            x: { min: 0, max: this.sys.game.config.width },
            y: 0,
            lifespan: 1500,
            speedY: { min: 200, max: 400 },
            scale: { start: 0.6, end: 0 },
            quantity: 4,
            blendMode: "ADD",
        };

        // Use colors directly as tints
        this.ballColors.forEach((c) => {
            const emitter = this.add.particles(0, 0, "particle", {
                ...emitterConfig,
                tint: this.getColorHex(c), // ✅ color particles
            });

            this.time.delayedCall(2000, () => {
                emitter.stop();
                emitter.destroy();
            });
        });

        // Delay level increment/restart to let animation show
        this.time.delayedCall(2200, () => {
            level++;
            this.scene.restart({ level: level });
        });
    }
}

export default GameEngine;
