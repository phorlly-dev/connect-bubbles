import * as Phaser from "phaser";
import {
    levelCompleted,
    showBurst,
    showPopup,
    triggerAirplane,
} from "./effects";

import {
    applyGravity,
    clearHighlightBalls,
    destroyAllBalls,
    getColorHex,
    getGridPosition,
    getRandomColor,
    highlightBall,
    playability,
    showMessage,
} from "./states";

const Payloads = {
    startConnection(scene, ball) {
        if (scene.gameOver) return;

        scene.isDrawing = true;
        scene.currentColor = ball.getData("color");
        scene.selectedBalls = [ball];
        highlightBall(scene, ball, true);
    },
    tryConntion(scene, ball) {
        if (!ball || scene.gameOver) return;

        const ballColor = ball.getData("color");
        if (ballColor !== scene.currentColor) return;

        // More flexible connection - allow connections within reasonable distance
        const lastBall = scene.selectedBalls[scene.selectedBalls.length - 1];
        const prevBall = scene.selectedBalls[scene.selectedBalls.length - 2];

        // ✅ Backtracking: If touching the previous ball, remove last one
        if (prevBall && ball === prevBall) {
            const removed = scene.selectedBalls.pop();
            highlightBall(scene, removed, false);
            updateConnectionLine(scene);
            scene.sound.play("cancel");
            return;
        }

        // 🚫 Already used in chain (but not backtrack)
        if (scene.selectedBalls.includes(ball)) return;

        const distance = Phaser.Math.Distance.Between(
            ball.x,
            ball.y,
            lastBall.x,
            lastBall.y
        );

        // Allow connection to nearby balls (not just adjacent)
        if (distance < 80) {
            scene.selectedBalls.push(ball);
            updateConnectionLine(scene);
            highlightBall(scene, ball, true);
        } else if (distance >= 80) {
            scene.sound.play("empty");
        }
    },
    updateConnectionLine(scene, endX = null, endY = null) {
        scene.lineGraphics.clear();
        if (scene.selectedBalls.length < 1) return;

        const color = getColorHex(scene.currentColor);

        // Function to offset point slightly toward center
        const adjust = (x1, y1, x2, y2, offset = 16) => {
            const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);
            return {
                x: x1 + Math.cos(angle) * offset,
                y: y1 + Math.sin(angle) * offset,
            };
        };

        // Draw connection
        scene.lineGraphics.lineStyle(6, color, 0.9);
        for (let i = 0; i < scene.selectedBalls.length - 1; i++) {
            const b1 = scene.selectedBalls[i];
            const b2 = scene.selectedBalls[i + 1];

            const p1 = adjust(b1.x, b1.y, b2.x, b2.y);
            const p2 = adjust(b2.x, b2.y, b1.x, b1.y);

            scene.lineGraphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
        }

        // Optional line to cursor
        if (endX && endY && scene.selectedBalls.length > 0) {
            const lastBall =
                scene.selectedBalls[scene.selectedBalls.length - 1];
            const p = adjust(lastBall.x, lastBall.y, endX, endY);
            scene.lineGraphics.lineBetween(p.x, p.y, endX, endY);
        }
    },
    finishConnection(scene) {
        scene.isDrawing = false;
        if (scene.selectedBalls.length >= 3) clearConnectedBalls(scene);

        // Clear the line immediately
        clearHighlightBalls(scene);
        scene.selectedBalls = [];
        scene.currentColor = null;
        scene.lineGraphics.clear();
    },
    clearConnectedBalls(scene) {
        let points = 0;

        // Sum points based on each ball's color
        scene.selectedBalls.forEach((ball) => {
            const color = ball.getData("color"); // color must be stored on ball
            const value = scene.colorScores[color] || 5; // fallback = 5
            points += Math.floor(value / 5);
        });

        // Update score
        scene.scores.current += points;
        scene.safeEmit("scores", { ...scene.scores });

        // Decrease moves
        scene.moves.current--;
        scene.safeEmit("moves", { ...scene.moves });
        scene.sound.play("connect");

        // Animate each ball with stagger delay
        scene.selectedBalls.forEach((ball, index) => {
            const row = ball.getData("row");
            const col = ball.getData("col");
            scene.grid[row][col] = null;

            //Show efffects
            showPopup(scene, points);
            showBurst(scene, ball);

            scene.tweens.add({
                targets: ball,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                rotation: Math.PI * 2,
                duration: 400,
                delay: index * 60, // ✅ keep stagger effect
                ease: "Back.easeIn",
                onComplete: () => {
                    ball.destroy();
                    scene.balls = scene.balls.filter((b) => b !== ball);
                },
            });
        });

        // ✅ Wait until the longest delay finishes before refill
        const totalDelay = scene.selectedBalls.length * 60;
        scene.time.delayedCall(totalDelay, () => {
            applyGravity(scene);
            checkLevelStatus(scene);
            refillEmptySpaces(scene);
        });
    },
    refillEmptySpaces(scene) {
        // Fill empty spaces with new balls
        for (let row = 0; row < scene.rows; row++) {
            for (let col = 0; col < scene.cols; col++) {
                if (scene.grid[row][col] === null) {
                    const color = getRandomColor(scene);
                    scene.grid[row][col] = color;

                    const { x, y } = getGridPosition(scene, row, col);
                    const ball = scene.add.image(x, y - 200, color);
                    ball.setData("color", color);
                    ball.setData("row", row);
                    ball.setData("col", col);
                    ball.setInteractive();
                    ball.setAlpha(0);

                    // Animate falling in
                    scene.tweens.add({
                        targets: ball,
                        y,
                        alpha: 1,
                        duration: 400,
                        delay: Math.random() * 200,
                        ease: "Bounce.easeOut",
                    });

                    scene.balls.push(ball);
                }
            }
        }

        // Ensure new arrangement is still playable
        scene.time.delayedCall(600, () => playability(scene));
    },
    checkLevelStatus(scene) {
        if (scene.scores.current >= scene.target) {
            scene.gameOver = true;
            levelCompleted(scene, scene.level);
            scene.sound.play("win");

            scene.time.delayedCall(600, () => triggerAirplane(scene));
        } else if (scene.moves.current <= 0) {
            scene.gameOver = true;
            // ❌ Out of moves & didn’t reach target
            const message = showMessage(
                scene,
                "❌ You lose!\n\nTap to play again",
                0xff0000
            );
            scene.sound.play("lose");
            scene.input.once("pointerdown", () => {
                message.destroy();
                scene.sound.play("click");

                // Destroy all balls before restart
                destroyAllBalls(scene, () => {
                    scene.scene.restart({
                        level: scene.level,
                        gameOver: false,
                    });
                });
            });
        }
    },
};

export const {
    startConnection,
    tryConntion,
    updateConnectionLine,
    finishConnection,
    refillEmptySpaces,
    checkLevelStatus,
    clearConnectedBalls,
} = Payloads;
