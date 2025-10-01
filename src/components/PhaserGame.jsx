import * as React from "react";
import StartGame from "../game";
import { emitEvent, offEvent, onEvent } from "../hooks/remote";
import { loadData } from "../hooks/storage";

const PhaserGame = React.forwardRef(({ player, props }, ref) => {
    const game = React.useRef();

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
        const handleSceneReady = async (scene) => {
            if (ref && ref.current && player) {
                ref.current.scene = scene;
                if (player) {
                    const value = await loadData(player);

                    // Fire event to Phaser with Firebase data
                    emitEvent("firebase-data-loaded", {
                        player,
                        score: value?.score || 0,
                        move: value?.move || 0,
                        level: value?.level || 1,
                    });
                }
            }
        };

        onEvent("current-scene-ready", handleSceneReady);
        return () => offEvent("current-scene-ready", handleSceneReady);
    }, [ref, player]);

    return <div id="game-container" {...props}></div>;
});

export default PhaserGame;
