import * as React from "react";
import StartGame from "../game";
import { offEvent, onEvent } from "../hooks/remote";
import { engine } from "../game/consts";

const PhaserGame = React.forwardRef(({ player, data }, ref) => {
    const game = React.useRef();

    React.useEffect(() => {
        if (data && game.current) {
            const scene = game.current.scene.keys[engine];
            if (scene) {
                scene.init({
                    player,
                    level: data.level,
                    remainingMoves: data.move,
                    totalScore: data.score,
                });
                console.log("✅ Synced game with DB data:", data);
            }
        }
    }, [data, player]);

    React.useLayoutEffect(() => {
        if (!game.current) {
            game.current = StartGame("game-container");

            if (ref) {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }
        };
    }, [ref]);

    // listen for scene ready event
    React.useEffect(() => {
        const handleSceneReady = (scene) => {
            if (ref) ref.current.scene = scene;
        };

        onEvent("current-scene-ready", handleSceneReady);
        return () => offEvent("current-scene-ready", handleSceneReady);
    }, [ref]);

    return <div id="game-container"></div>;
});

export default PhaserGame;
