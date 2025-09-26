import {
    finishConnection,
    startConnection,
    tryConntion,
    updateConnectionLine,
} from "./payloads";
import { fillGrid, getGridPosition, getRandomColor, initGrid } from "./states";

const Objects = {
    makeInput(scene) {
        // Mouse/touch down - start drawing
        scene.input.on("pointerdown", (_pointer, currentlyOver) => {
            if (scene.gameOver || currentlyOver.length === 0) return;

            // Change cursor when drawing starts
            scene.input.setDefaultCursor("crosshair");

            startConnection(scene, currentlyOver[0]);
        });

        // Mouse/touch move - continue drawing
        scene.input.on("pointermove", (pointer, currentlyOver) => {
            if (!scene.isDrawing) return;

            // Update line to cursor position
            updateConnectionLine(scene, pointer.x, pointer.y);

            // Check if over a new ball
            if (currentlyOver.length > 0) tryConntion(scene, currentlyOver[0]);
        });

        // Mouse/touch up - finish drawing
        scene.input.on("pointerup", () => {
            // Reset cursor back to normal
            scene.input.setDefaultCursor("default");

            if (scene.isDrawing) finishConnection(scene);
        });
    },
    makeRandomGrid(scene) {
        // Initialize grid
        initGrid(scene);

        // Fill grid completely with smart distribution
        fillGrid(scene);

        // Create visual balls from grid
        for (let row = 0; row < scene.rows; row++) {
            for (let col = 0; col < scene.cols; col++) {
                const color = scene.grid[row][col];
                const { x, y } = getGridPosition(scene, row, col);
                const ball = scene.add.image(x, y, color);

                ball.setData("color", color);
                ball.setData("row", row);
                ball.setData("col", col);
                ball.setInteractive();

                // Add subtle pulse animation
                scene.tweens.add({
                    targets: ball,
                    scale: 1.05,
                    duration: 1600 + Math.random() * 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut",
                });

                scene.balls.push(ball);
            }
        }
    },
    makeCluster(scene) {
        const color = getRandomColor(scene);
        const startRow = Math.floor(Math.random() * (scene.rows - 2));
        const startCol = Math.floor(Math.random() * (scene.cols - 2));

        // Create different cluster patterns
        const getPatterns = makePatterns();
        const patterns =
            getPatterns[Math.floor(Math.random() * getPatterns.length)];

        patterns.forEach(([dr, dc]) => {
            const row = startRow + dr;
            const col = startCol + dc;
            if (row < scene.rows && col < scene.cols) {
                scene.grid[row][col] = color;
            }
        });
    },
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
    },
    makeParticle(scene, x, y, color) {
        const particles = scene.add.particles(x, y, "particle", {
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            lifespan: 600,
            quantity: 12,
            tint: color,
            blendMode: "ADD",
        });

        scene.time.delayedCall(1000, () => particles.destroy());
    },
    makeGridWithWave(scene) {
        const delayStep = 60; // ms delay per ball

        // Initialize grid
        initGrid(scene);

        // Fill grid completely with smart distribution
        fillGrid(scene);

        for (let row = 0; row < scene.rows; row++) {
            for (let col = 0; col < scene.cols; col++) {
                const color = getRandomColor(scene);
                scene.grid[row][col] = color;

                const { x, y } = getGridPosition(scene, row, col);

                // Spawn ball invisible
                const ball = scene.add.image(x, y, color);
                ball.setData("color", color);
                ball.setData("row", row);
                ball.setData("col", col);
                ball.setInteractive();
                ball.setScale(0).setAlpha(0);

                scene.balls.push(ball);

                // Wave delay = sum of row+col (diagonal wave effect)
                const delay = (row + col) * delayStep;

                scene.tweens.add({
                    targets: ball,
                    scale: { from: 0, to: 1 },
                    alpha: { from: 0, to: 1 },
                    ease: "Back.easeOut",
                    duration: 600,
                    delay: delay,
                });
            }
        }
    },
};

export const {
    makeInput,
    makeRandomGrid,
    makeCluster,
    makePatterns,
    makeParticle,
    makeGridWithWave,
} = Objects;
