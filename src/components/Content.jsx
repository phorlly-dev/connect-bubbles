import * as React from "react";

// Lazy load the Phaser game
const PhaserGame = React.lazy(() => import("./PhaserGame"));
const Header = React.lazy(() => import("./Header"));
const Footer = React.lazy(() => import("./Footer"));

const Content = ({ player, isTailwind, onLogout }) => {
    const phaserRef = React.useRef();
    const maxWidth = "400px";

    return (
        <div className="flex">
            {isTailwind ? (
                <div className="min-h-screen w-full flex flex-col items-center justify-center px-4">
                    <section className="flex flex-row items-center mb-3 justify-center text-white/75">
                        <h4>
                            Welcome{" "}
                            <b className="text-blue-400 capitalize">{player}</b>
                            , enjoy the game 🎮!
                        </h4>
                        <button
                            onClick={onLogout}
                            title="Logout game"
                            aria-label="Logout game"
                            className="btn text-white h-8 w-8 ml-4 cursor-pointer bg-red-400 px-2 py-1 rounded-full"
                        >
                            <i className="fa fa-power-off"></i>
                        </button>
                    </section>
                    {/* Card Frame */}
                    <section
                        className="bg-white/90 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden items-center"
                        style={{ maxWidth, width: "100%" }}
                    >
                        {/* HEADER */}
                        <Header isTailwind={true} />

                        {/* GAME BOARD */}
                        <main className="flex items-center justify-center bg-gray-900 p-1 sm:p-1">
                            <PhaserGame ref={phaserRef} player={player} />
                        </main>

                        {/* FOOTER */}
                        <Footer isTailwind={true} />
                    </section>
                </div>
            ) : (
                <div className="w-100 d-flex flex-column align-items-center justify-content-center px-4">
                    <section className="d-flex flex-row align-items-center justify-content-center text-light mb-2">
                        <h5 className="mb-0 h6">
                            Welcome{" "}
                            <b className="text-info fs-5 text-capitalize">
                                {player}
                            </b>
                            , enjoy the game.
                        </h5>
                        <button
                            onClick={onLogout}
                            title="Exit from game"
                            aria-label="Exit"
                            className="btn btn-danger btn-sm rounded-circle shadow ms-4"
                        >
                            <i className="fa fa-power-off"></i>
                        </button>
                    </section>
                    <section
                        className="bg-white bg-opacity-90 w-auto rounded-4 shadow-lg p-1 mx-2"
                        style={{ maxWidth, width: "100%" }}
                    >
                        {/* HEADER */}
                        <Header isTailwind={false} />

                        {/* GAME BOARD */}
                        <main className="d-flex align-items-center justify-content-center bg-dark p-1 p-sm-1">
                            <PhaserGame ref={phaserRef} player={player} />
                        </main>

                        {/* FOOTER */}
                        <Footer isTailwind={false} />
                    </section>
                </div>
            )}
        </div>
    );
};

export default Content;
