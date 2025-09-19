import * as React from "react";
import { emitEvent, offEvents, onEvents } from "../hooks/remote";
import { formatNumber } from "../hooks/format";

const Header = ({ isTailwind = true }) => {
    const [muted, setMuted] = React.useState(false);
    const [scores, setScores] = React.useState({ current: 0, total: 0 });
    const [moves, setMoves] = React.useState({ current: 0, total: 0 });
    const [target, setTarget] = React.useState(0);
    const [level, setLevel] = React.useState(1);

    // Listen for Phaser events and update state
    React.useEffect(() => {
        const events = ["scores", "moves", "target", "level"];
        const callbacks = [
            (data = {}) => setScores({ ...data }),
            (data = {}) => setMoves({ ...data }),
            (data = 0) => setTarget(data),
            (data = 1) => setLevel(data),
        ];

        onEvents({ events, callbacks });
        return () => offEvents({ events, callbacks });
    }, [scores, moves, target, level]);

    const toggle = () => {
        const newMute = !muted;
        setMuted(newMute);
        emitEvent("sound", newMute);
    };

    return isTailwind ? (
        <header className="px-6 py-4 border-b border-gray-200 bg-white/80">
            {/* First Row */}
            <section className="flex items-center justify-between">
                <span className="text-gray-600">
                    Score:
                    <span className="text-green-600 font-simibold text-lg ml-1">
                        {scores.current}
                    </span>
                </span>

                <span className="text-gray-600">
                    Level:
                    <span className="text-orange-500 font-simibold text-lg ml-1">
                        {level}
                    </span>
                </span>

                <button
                    onClick={toggle}
                    className={`w-10 h-10 flex cursor-pointer items-center p-4 justify-center rounded-full ${
                        muted ? "bg-red-500" : "bg-green-600"
                    }  text-white shadow-lg hover:scale-110 hover:shadow-xl transition`}
                    title="Toggle sound on/off"
                    aria-label="Toggle sound"
                >
                    <i
                        className={`fa ${
                            muted ? "fa-volume-mute" : "fa-volume-up"
                        }`}
                    ></i>
                </button>
            </section>
            {/* Second Row */}
            <section className="flex items-center justify-between mt-3">
                <span className="text-gray-500">
                    Moves:
                    <span className="text-purple-400 font-simibold text-md ml-1">
                        {moves.current}/
                        <b className="text-purple-400">{moves.total}</b>
                    </span>
                </span>

                {scores.total > 0 && (
                    <span className="text-gray-500 ">
                        Total:
                        <span className="text-purple-400 font-bold text-md ml-1">
                            {formatNumber(scores.total)}
                        </span>
                    </span>
                )}

                <span className="text-gray-500 ">
                    Target:
                    <span className="text-blue-400 font-bold text-md ml-1">
                        {target}
                    </span>
                </span>
            </section>
        </header>
    ) : (
        <header className="px-4 py-2 border-bottom bg-white bg-opacity-75">
            {/* First Row */}
            <section className="d-flex align-items-center justify-content-between">
                <span className="text-muted">
                    Score:
                    <span className="text-success fw-semibold fs-5 ms-1">
                        {scores.current}
                    </span>
                </span>

                <span className="text-muted">
                    Level:
                    <span className="text-warning fw-semibold fs-5 ms-1">
                        {level}
                    </span>
                </span>

                <button
                    onClick={toggle}
                    title="Toggle sound on/off"
                    aria-label="Toggle sound"
                    className={`btn btn-sm rounded-circle shadow ${
                        muted ? "btn-dark" : "btn-success"
                    }`}
                >
                    <i
                        className={`fa ${
                            muted ? "fa-volume-mute" : "fa-volume-up"
                        }`}
                    ></i>
                </button>
            </section>

            {/* Second Row */}
            <section className="d-flex align-items-center justify-content-between mt-3">
                <span className="text-muted">
                    Moves:
                    <span className="text-danger fw-semibold ms-1">
                        {moves.current}/
                        <b className="text-primary">{moves.total}</b>
                    </span>
                </span>

                {scores.total > 0 && (
                    <span className="text-muted">
                        Total:
                        <span className="text-info fw-bold ms-1">
                            {formatNumber(scores.total)}
                        </span>
                    </span>
                )}

                <span className="text-muted">
                    Target:
                    <span className="text-primary fw-bold ms-1">{target}</span>
                </span>
            </section>
        </header>
    );
};

export default Header;
