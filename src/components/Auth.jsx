import * as React from "react";

const Auth = ({ onAuth, isTailwind }) => {
    const [name, setName] = React.useState("");
    const [touched, setTouched] = React.useState(false);

    const isTooShort = name.trim().length > 0 && name.trim().length < 2;
    const isValid = name.trim().length >= 2;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValid) return;
        onAuth(name.trim());
    };

    return (
        <div className="flex">
            {isTailwind ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-gray-800/90 p-8 rounded-2xl shadow-2xl text-center w-full max-w-sm">
                        {/* Title */}
                        <h2 className="text-cyan-400 font-extrabold text-2xl sm:text-3xl mb-2">
                            My Bubble Game
                        </h2>
                        <p className="text-gray-300 text-sm mb-6">
                            Enter your name to start playing!
                        </p>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Enter your name"
                                className={`w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 
              focus:outline-none focus:ring-2 ${
                  isTooShort ? "focus:ring-red-400" : "focus:ring-cyan-400"
              }`}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={() => setTouched(true)}
                            />

                            {/* Warning */}
                            {touched && isTooShort && (
                                <p className="text-red-400 text-sm -mt-2">
                                    Name must be at least 2 characters
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={!isValid}
                                className={`w-full btn py-3 rounded-lg font-semibold shadow-lg transition
              ${
                  isValid
                      ? "bg-cyan-500 hover:bg-cyan-600 text-white cursor-pointer"
                      : "bg-gray-600 text-gray-300 cursor-not-allowed"
              }`}
                            >
                                Start Game
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="d-flex align-items-center justify-content-center min-vh-100">
                    <div
                        className="card shadow-lg border-0 rounded-4 p-4 bg-secondary bg-opacity-75 text-center"
                        style={{ maxWidth: "400px", width: "100%" }}
                    >
                        {/* Title */}
                        <h2 className="fw-bold text-info mb-2">
                            My Bubble Game
                        </h2>
                        <p className="text-light mb-4">
                            Enter your name to start playing!
                        </p>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="d-grid gap-3">
                            <input
                                type="text"
                                placeholder="Enter your name"
                                className={`form-control ${
                                    touched && isTooShort
                                        ? "is-invalid"
                                        : isValid
                                        ? "is-valid"
                                        : ""
                                }`}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={() => setTouched(true)}
                            />

                            {/* Warning */}
                            {touched && isTooShort && (
                                <div className="invalid-feedback d-block">
                                    Name must be at least 2 characters
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!isValid}
                                className={`btn btn-lg fw-semibold shadow-sm ${
                                    isValid
                                        ? "btn-info text-white"
                                        : "btn-secondary"
                                }`}
                            >
                                Start Game
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Auth;
