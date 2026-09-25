import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // User is not logged in
    if (!token || !userData) {
        return <Navigate to="/login" replace />;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return <Navigate to="/login" replace />;
    }

    // Prefer a role that grants access when accounts hold both buyer and seller roles.
    const allowedRoles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    const userRoles = (user.roles || []).map((item) => item?.name).filter(Boolean);
    const role = allowedRoles.find((allowed) => userRoles.includes(allowed)) || userRoles[0];

    // User doesn't have permission
    if (allowedRole && !allowedRoles.includes(role)) {
        if (role === "buyer") {
            return <Navigate to="/" replace />;
        }

        if (role === "seller") {
            return <Navigate to="/seller-dashboard" replace />;
        }

        if (role === "admin") {
            return <Navigate to="/admin-dashboard" replace />;
        }

        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
