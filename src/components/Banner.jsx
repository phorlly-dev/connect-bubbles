import * as React from "react";

const Banner = ({ onClose, isTailwind }) => {
    const [visible, setVisible] = React.useState(true);

    const handleClose = () => {
        setVisible(false);
        onClose(); // notify parent that game can start
    };

    if (!visible) return null;

    return (
        <div className="flex">
            {isTailwind ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="relative bg-white/95 rounded-xl shadow-2xl p-1">
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="btn cursor-pointer absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold"
                        >
                            ✕
                        </button>

                        {/* Banner Image with Link */}
                        <a
                            href="https://konohatoto78scatter.com/register?referral_code=hambajackpot"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src="/assets/images/banner.webp"
                                alt="Promote Banner"
                                className="max-w-xs sm:max-w-md rounded-lg shadow cursor-pointer"
                            />
                        </a>
                    </div>
                </div>
            ) : (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75"
                    style={{ zIndex: 1050 }}
                >
                    <div className="btn position-relative bg-white rounded shadow-lg p-1">
                        {/* Close Button */}
                        <button
                            type="button"
                            className="btn btn-close position-absolute top-0 end-0 m-2"
                            aria-label="Close"
                            onClick={handleClose}
                        ></button>

                        {/* Banner Image with Link */}
                        <a
                            href="https://konohatoto78scatter.com/register?referral_code=hambajackpot"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src="/assets/images/banner.webp"
                                alt="Promote Banner"
                                className="img-fluid rounded"
                                style={{ maxWidth: "460px", cursor: "pointer" }}
                            />
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Banner;
