import { makeParticle } from "./objects";
import { getColorHex, showMessage } from "./states";

const Effects = {
    triggerAirplane(scene) {
        const { width, height } = scene.sys.game.config;

        // Create airplane off-screen left
        const airplane = scene.add
            .image(-100, height / 2, "airplane")
            .setScale(0.2);

        scene.tweens.add({
            targets: airplane,
            x: width + 100,
            duration: 1600,
            ease: "Linear",
            onUpdate: () => destroyBallsInSequence(scene),
            onComplete: () => {
                airplane.destroy();

                // After all balls destroyed → go to next level
                scene.time.delayedCall(600, () => {
                    scene.level++;
                    scene.remainingMoves = scene.moves.current;
                    scene.scores.total += scene.scores.current;
                    scene.scene.restart({
                        level: scene.level,
                        remainingMoves: scene.remainingMoves, // ✅ pass leftover
                        gameOver: false,
                        totalScore: scene.scores.total,
                    });
                });
            },
        });
    },
    destroyBallsInSequence(scene) {
        if (!scene.balls.length) return;

        // Take one ball at a time
        const ball = scene.balls.shift();
        if (!ball || !ball.active) return;

        const color = getColorHex(ball.getData("color"));

        // Burst particles
        for (let i = 0; i < 6; i++) {
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

        // Schedule next ball
        scene.time.delayedCall(60, () => destroyBallsInSequence(scene));
    },
    levelCompleted(scene, level) {
        // 🎉 Flash message
        const message = showMessage(
            scene,
            `🎉 You Win!\n\nLevel ${level} Complete!`,
            0x00ff00
        );

        scene.tweens.add({
            targets: message,
            scale: 1.2,
            duration: 800,
            yoyo: true,
            repeat: 3,
            ease: "Sine.easeInOut",
            onComplete: () => message.destroy(),
        });

        // 🎇 Confetti particles using generic "particle"
        const emitterConfig = {
            x: { min: 0, max: scene.sys.game.config.width },
            y: 0,
            lifespan: 1500,
            speedY: { min: 200, max: 400 },
            scale: { start: 0.6, end: 0 },
            quantity: 4,
            blendMode: "ADD",
        };

        // Use colors directly as tints
        scene.ballColors.forEach((c) => {
            const emitter = scene.add.particles(0, 0, "particle", {
                ...emitterConfig,
                tint: getColorHex(c), // ✅ color particles
            });

            scene.time.delayedCall(2000, () => {
                emitter.stop();
                emitter.destroy();
            });
        });
    },
    showBurst(scene, ball) {
        const color = getColorHex(ball.getData("color"));

        for (let i = 0; i < 8; i++) {
            const particle = scene.add.circle(ball.x, ball.y, 4, color);
            const angle = Phaser.Math.DegToRad(45 * i);
            const distance = 30 + Math.random() * 20;

            scene.tweens.add({
                targets: particle,
                x: ball.x + Math.cos(angle) * distance,
                y: ball.y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0,
                duration: 600 + Math.random() * 180,
                ease: "Cubic.easeOut",
                onComplete: () => particle.destroy(),
            });
        }
    },
    showPopup(scene, points) {
        // 👉 Center of the connected group
        const centerX = Phaser.Math.Average(
            scene.selectedBalls.map((b) => b.x)
        );
        const centerY = Phaser.Math.Average(
            scene.selectedBalls.map((b) => b.y)
        );

        // 👉 Score popup text
        const popup = scene.add
            .text(centerX, centerY, `+${points}`, {
                fontSize: "20px",
                fontFamily: "Arial",
                fontStyle: "bold",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);

        scene.tweens.add({
            targets: popup,
            y: centerY / 2,
            alpha: 0,
            duration: 1600,
            ease: "Cubic.easeOut",
            onComplete: () => popup.destroy(),
        });

        // In showPopup()
        const tintColor = getColorHex(scene.currentColor);
        makeParticle(scene, centerX, centerY, tintColor);
    },
};

export const {
    triggerAirplane,
    destroyBallsInSequence,
    levelCompleted,
    showBurst,
    showPopup,
} = Effects;
