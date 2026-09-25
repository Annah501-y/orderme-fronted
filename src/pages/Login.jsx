import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "../pages_styles/auth.css";
import { getGoogleAuthUrl, useGoogleAuthCallback } from "../hooks/useGoogleAuthCallback";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    useGoogleAuthCallback(navigate, setError);

    const handleGoogleSignIn = () => {
        const url = getGoogleAuthUrl();
        if (url) window.location.assign(url);
        else setError("Google sign-in is not configured. Please contact support.");
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        // Remove error when the user starts correcting the form.
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0];

                    setError(
                        Array.isArray(firstError)
                            ? firstError[0]
                            : "Login failed."
                    );
                } else {
                    setError(
                        data.message ||
                        "The email address or password is incorrect."
                    );
                }

                return;
            }

            const user = data.data.user;

            localStorage.setItem("token", data.data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );
            window.dispatchEvent(new Event("orderme:auth-changed"));

            const role = user.roles?.[0]?.name;

            if (role === "buyer") {
                navigate("/");
            } else if (role === "seller") {
                navigate("/seller-dashboard");
            } else if (role === "admin") {
                navigate("/admin-dashboard");
            }else if (role === "rider"){
                navigate("/rider/dashboard");
            } else {
                navigate("/");
            }

        } catch (error) {
            console.error("Login error:", error);

            setError(
                "Unable to connect to the server. Please check your connection."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-overlay"></div>

            <div className="auth-container">

                <div className="auth-card">

                    {/* Header */}
                    <div className="auth-header">

                        <span className="auth-label">
                            ORDERME
                        </span>

                        <h1>
                            Welcome Back
                        </h1>

                        <p>
                            Login to your OrderMe account.
                        </p>

                    </div>


                    {/* Error */}
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}


                    {/* Login Form */}
                    <button type="button" className="google-auth-button" onClick={handleGoogleSignIn}>
                        <span className="google-mark" aria-hidden="true">G</span>
                        Continue with Google
                    </button>
                    <div className="auth-divider"><span>or continue with email</span></div>
                    <form onSubmit={handleSubmit}>

                        {/* Email */}
                        <div className="auth-input-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
                                disabled={loading}
                                required
                            />

                        </div>


                        {/* Password */}
                        <div className="auth-input-group">

                            <label htmlFor="login-password">
                                Password
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    id="login-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    disabled={loading}
                                    required
                                />

                                {/* Eye appears only after typing */}
                                {formData.password && (
                                    <button
                                        type="button"
                                        className="toggle-password-visibility"
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                        disabled={loading}
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>
                                )}

                            </div>

                        </div>


                        {/* Login Button */}
                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Logging In..."
                                : "Login"}
                        </button>

                    </form>


                    {/* Register */}
                    <div className="auth-footer">

                        <p>
                            Don't have an account?{" "}
                            <Link to="/register">
                                Register
                            </Link>
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;
