import * as React from "react";
import { PhaserGame } from "./components/PhaserGame";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { isLoaded } from "./hooks/load";

const App = () => {
    const phaserRef = React.useRef();
    const [isTailwind, setIsTailwind] = React.useState(false);

    React.useEffect(() => setIsTailwind(isLoaded()), []);

    return (
        <div className="flex">
            {isTailwind ? (
                <div className="min-h-screen w-full flex flex-col items-center justify-center px-2">
                    {/* Card Frame */}
                    <div className="bg-white/90 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                        {/* HEADER */}
                        <Header />

                        {/* GAME BOARD */}
                        <main className="flex items-center justify-center bg-gray-900 p-2 sm:p-3">
                            <section className="w-full flex justify-center">
                                <PhaserGame ref={phaserRef} />
                            </section>
                        </main>

                        {/* FOOTER */}
                        <Footer />
                    </div>
                </div>
            ) : (
                <div className="card-header d-flex flex-column align-items-center justify-content-center min-vh-100 px-2">
                    {/* Card Frame */}
                    <div
                        className="card bg-white bg-opacity-90 rounded-4 shadow-lg w-100 p-1 m-auto"
                        style={{ maxWidth: "460px", width: "100%" }}
                    >
                        {/* HEADER */}
                        <Header isTailwind={false} />

                        {/* GAME BOARD */}
                        <main className="card-body d-flex align-items-center justify-content-center bg-dark p-1 p-sm-2">
                            <section className="w-100 d-flex justify-content-center">
                                <PhaserGame ref={phaserRef} />
                            </section>
                        </main>

                        {/* FOOTER */}
                        <Footer isTailwind={false} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
