import React from "react";
import { useNavigate } from "react-router-dom";

function SellerPendingApproval() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-sm border-0 text-center">
                        <div className="card-body p-4 p-md-5">
                            <h2 className="mb-3">
                                Seller Application Submitted
                            </h2>

                            <p className="text-muted mb-4">
                                Your store information has been submitted
                                successfully and is currently awaiting admin
                                approval.
                            </p>

                            <p className="mb-4">
                                You will be able to access the Seller Dashboard
                                after your application has been approved.
                            </p>

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SellerPendingApproval;