import * as React from "react";
import { RemoteEvent } from "../hooks/remote";

const Header = ({ isTailwind = true }) => {
    const [score, setScore] = React.useState(0);
    const [moves, setMoves] = React.useState({ current: 0, total: 0 });
    const [target, setTarget] = React.useState(0);
    const [level, setLevel] = React.useState(1);

    // Listen for Phaser events
    React.useEffect(() => {
        const updateScore = (data) => setScore(data);
        const updateMoves = (data) => setMoves(data);
        const updateTarget = (data) => setTarget(data);
        const updateLevel = (data) => setLevel(data);

        RemoteEvent.on("score:update", updateScore);
        RemoteEvent.on("moves:update", updateMoves);
        RemoteEvent.on("target:update", updateTarget);
        RemoteEvent.on("level:update", updateLevel);

        return () => {
            RemoteEvent.off("score:update", updateScore);
            RemoteEvent.off("moves:update", updateMoves);
            RemoteEvent.off("target:update", updateTarget);
            RemoteEvent.off("level:update", updateLevel);
        };
    }, []);

    return (
        <header className="px-6 py-3 border-b border-gray-200 bg-white/80">
            {/* First Row */}
            <section className="flex items-center justify-between">
                <span className="text-gray-600">
                    Score:
                    <span className="text-green-600 font-bold text-lg ml-1">
                        {score}
                    </span>
                </span>

                <span className="text-gray-600">
                    Level:
                    <span className="text-orange-500 font-bold text-lg ml-1">
                        {level}
                    </span>
                </span>

                <button className="btn w-9 h-9 flex items-center justify-center bg-green-500 text-white cursor-pointer rounded-full shadow hover:bg-green-600 transition">
                    <i className="fa fa-volume-up"></i>
                </button>
            </section>

            {/* Second Row */}
            <section className="flex items-center justify-between mt-3">
                <span className="text-gray-600">
                    Moves:
                    <span className="text-blue-600 font-bold text-md ml-1">
                        {moves.current}/{moves.total}
                    </span>
                </span>

                <span className="text-gray-600 ">
                    Target:
                    <span className="text-purple-600 font-bold text-md ml-1">
                        {target}
                    </span>
                </span>
            </section>
        </header>
    );
};

export default Header;
