import * as Phaser from "phaser";
import { makeCluster } from "./objects";

const States = {
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
    },
    fillGrid(scene) {
        // Strategy: Fill grid ensuring there are always valid moves
        // 1. First pass: Random fill
        for (let row = 0; row < scene.rows; row++) {
            for (let col = 0; col < scene.cols; col++) {
                scene.grid[row][col] = getRandomColor(scene);
            }
        }

        // 2. Second pass: Ensure clusters exist by creating guaranteed matches
        playability(scene);
    },
    highlightBall(scene, ball, isHighlight) {
        if (isHighlight) {
            ball.setTint(0xffffff);
            ball.setScale(1.2);

            // Add glowing aura effect
            if (!ball.getData("aura")) {
                const aura = scene.add.circle(
                    ball.x,
                    ball.y,
                    25,
                    getColorHex(ball.getData("color")),
                    0.3
                );
                aura.setBlendMode(Phaser.BlendModes.ADD);
                ball.setData("aura", aura);

                // Pulsing aura animation
                scene.tweens.add({
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
                scene.tweens.killTweensOf(aura);
                aura.destroy();
                ball.setData("aura", null);
            }
        }
    },
    applyGravity(scene) {
        for (let col = 0; col < scene.cols; col++) {
            // Get all balls in scene column from bottom to top
            const columnBalls = [];
            for (let row = scene.rows - 1; row >= 0; row--) {
                if (scene.grid[row][col] !== null) {
                    const ball = scene.balls.find(
                        (b) =>
                            b.getData("row") === row && b.getData("col") === col
                    );
                    if (ball) {
                        columnBalls.push({ ball, color: scene.grid[row][col] });
                        scene.grid[row][col] = null;
                    }
                }
            }

            // Place balls at bottom
            columnBalls.forEach((item, index) => {
                const newRow = scene.rows - 1 - index;
                const { x, y } = getGridPosition(scene, newRow, col);
                scene.grid[newRow][col] = item.color;
                item.ball.setData("row", newRow);
                item.ball.setData("col", col);

                // Animate falling
                scene.tweens.add({
                    targets: item.ball,
                    x,
                    y,
                    duration: 300,
                    ease: "Bounce.easeOut",
                });
            });
        }
    },
    playability(scene) {
        // Create several guaranteed clusters of 3+ balls
        const clustersToCreate = 8 + Math.floor(Math.random() * 4);

        for (let i = 0; i < clustersToCreate; i++) {
            makeCluster(scene);
        }
    },
    showMessage(scene, message, color) {
        const { width, height } = scene.sys.game.config;
        return scene.add
            .text(width / 2, height / 2, message, {
                fontSize: "28px",
                fill: `#${color.toString(16).padStart(6, "0")}`,
                fontFamily: "Arial",
                align: "center",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);
    },
    getGridPosition(scene, row, col) {
        const spacing = 46;
        const { width, height } = scene.sys.game.config;
        const offsetX = (width - (scene.cols - 1) * spacing) / 2;
        const offsetY = (height - (scene.rows - 1) * spacing) / 2;

        return {
            x: col * spacing + offsetX,
            y: row * spacing + offsetY,
        };
    },
    getRandomColor(scene) {
        return scene.ballColors[
            Math.floor(Math.random() * scene.ballColors.length)
        ];
    },
    destroyAllBalls(scene, callback) {
        if (!scene.balls.length) {
            if (callback) callback();
            return;
        }

        scene.balls.forEach((ball, i) => {
            if (!ball.active) return;

            const color = getColorHex(ball.getData("color"));

            // Small delay for cascade effect
            scene.time.delayedCall(i * 60, () => {
                // Particle burst
                for (let j = 0; j < 6; j++) {
                    const particle = scene.add.circle(ball.x, ball.y, 4, color);
                    scene.tweens.add({
                        targets: particle,
                        x: ball.x + Phaser.Math.Between(-40, 40),
                        y: ball.y + Phaser.Math.Between(-40, 40),
                        alpha: 0,
                        duration: 400,
                        onComplete: () => particle.destroy(),
                    });
                }

                // Shrink + destroy ball
                scene.tweens.add({
                    targets: ball,
                    scale: 0,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => ball.destroy(),
                });
            });
        });

        // After all animations finish → run callback
        scene.time.delayedCall(scene.balls.length * 60, () => {
            if (callback) callback();
        });
    },
    initGrid(scene) {
        scene.grid = [];
        for (let row = 0; row < scene.rows; row++) {
            scene.grid[row] = Array(scene.cols).fill(null);
        }
    },
    clearHighlightBalls(scene) {
        scene.selectedBalls.forEach((ball) => {
            highlightBall(scene, ball, false);
        });
    },
};

export const {
    getColorHex,
    fillGrid,
    highlightBall,
    clearHighlightBalls,
    applyGravity,
    showMessage,
    getGridPosition,
    getRandomColor,
    playability,
    destroyAllBalls,
    initGrid,
} = States;
