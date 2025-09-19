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
                        <section className="flex justify-end items-center">
                            <button
                                onClick={handleClose}
                                className="btn cursor-pointer bg-red-500 absolute rounded-full w-8 h-8 top-2 right-2 text-white/80 hover:text-white"
                            >
                                <i className="fa fa-close"></i>
                            </button>
                        </section>

                        {/* Banner Image with Link */}
                        <section className="flex justify-center item-center">
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
                        </section>
                    </div>
                </div>
            ) : (
                <div
                    className="position-fixed top-0 start-0 w-100 px-2 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75"
                    style={{ zIndex: 1050 }}
                >
                    <div className="btn position-relative bg-white rounded shadow-lg p-0">
                        {/* Close Button */}
                        <button
                            type="button"
                            className="btn btn-danger position-absolute top-0 end-0 m-2 border rounded-circle"
                            aria-label="Close"
                            onClick={handleClose}
                        >
                            <i className="fa fa-close"></i>
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
                                className="img-fluid rounded"
                                style={{ maxWidth: "360px", cursor: "pointer" }}
                            />
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Banner;
