import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import TanzaniaPhoneInput from "../components/TanzaniaPhoneInput";
import { getTanzaniaNationalNumber } from "../utils/tanzaniaPhone";
import "../pages_styles/auth.css";
import { getGoogleAuthUrl, useGoogleAuthCallback } from "../hooks/useGoogleAuthCallback";

function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const registeringAsSeller = searchParams.get("account_type") === "seller";
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        account_type: registeringAsSeller ? "seller" : "buyer",
        password: "",
        password_confirmation: "",
    });

    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [loading, setLoading] = useState(false);

    // Separate visibility states for each password field.
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);
    useGoogleAuthCallback(navigate, setGeneralError);

    const handleGoogleSignUp = () => {
        const url = getGoogleAuthUrl();
        if (url) window.location.assign(url);
        else setGeneralError("Google sign-up is not configured. Please contact support.");
    };

    /*
     * Handle input changes.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        // Remove the error for the field currently being edited.
        setErrors((previous) => {
            const updatedErrors = { ...previous };
            delete updatedErrors[name];
            return updatedErrors;
        });

        // Remove general error when user starts correcting the form.
        setGeneralError("");
    };

    /*
     * Laravel normally returns validation errors
     * as arrays, for example:
     *
     * email: ["This email address is already registered."]
     *
     * This helper also handles a string response safely.
     */
    const getErrorMessage = (error) => {
        if (Array.isArray(error)) {
            return error[0] || "";
        }

        if (typeof error === "string") {
            return error;
        }

        return "";
    };

    /*
     * Submit registration form.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent double submission.
        if (loading) {
            return;
        }

        setErrors({});
        setGeneralError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },

                    body: JSON.stringify({
                        ...formData,
                        account_type: registeringAsSeller ? "seller" : "buyer",
                        phone: getTanzaniaNationalNumber(formData.phone),
                    }),
                }
            );

            let data = {};

            /*
             * Safely parse JSON.
             *
             * If Laravel/proxy/server returns something
             * that isn't JSON, we don't want JSON parsing
             * to crash the entire registration flow.
             */
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            /*
             * -----------------------------------------
             * VALIDATION ERROR — HTTP 422
             * -----------------------------------------
             */
            if (response.status === 422) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setGeneralError(
                        data.message ||
                            "Please check the information you entered."
                    );
                }

                return;
            }

            /*
             * -----------------------------------------
             * OTHER SERVER/API ERRORS
             * -----------------------------------------
             */
            if (!response.ok) {
                setGeneralError(
                    data.message ||
                        "Registration failed. Please try again."
                );

                return;
            }

            /*
             * -----------------------------------------
             * SUCCESS — HTTP 201
             * -----------------------------------------
             *
             * Expected Laravel response:
             *
             * data: {
             *     user: {...},
             *     token: "...",
             *     token_type: "Bearer"
             * }
             */
            const user = data?.data?.user;
            const token = data?.data?.token;

            if (!user || !token) {
                setGeneralError(
                    "Your account was created, but the server returned an unexpected response."
                );

                return;
            }

            /*
             * Save authentication information.
             */
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            window.dispatchEvent(new Event("orderme:auth-changed"));

            /*
             * Laravel assigns the account type as a Spatie role:
             *
             * $user->assignRole($request->validated('account_type'));
             *
             * Therefore we read the role from:
             *
             * user.roles
             */
            const role = user?.roles?.[0]?.name;

            if (role === "buyer") {
                navigate("/", { replace: true });
                return;
            }

            if (role === "seller") {
                navigate("/seller-profile-setup", { replace: true });
                return;
            }

            /*
             * Public registration should never create an admin.
             *
             * If the backend somehow returns an unexpected role,
             * don't send the user to a privileged dashboard.
             */
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setGeneralError(
                "Your account was created, but your account role could not be determined."
            );
        } catch (error) {
            console.error("Registration error:", error);

            setGeneralError(
                "Unable to connect to the server. Please check your connection and try again."
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

                    {/* ================================
                        HEADER
                    ================================= */}
                    <div className="auth-header">

                        <span className="auth-label">
                            ORDERME
                        </span>

                        <h1>{registeringAsSeller ? "Create Seller Account" : "Create Account"}</h1>

                        <p>
                            {registeringAsSeller
                                ? "Create your account, then complete your seller application for review."
                                : "Join OrderMe and start shopping today."}
                        </p>

                    </div>

                    {/* ================================
                        GENERAL ERROR
                    ================================= */}
                    {generalError && (
                        <div
                            className="auth-error"
                            role="alert"
                        >
                            {generalError}
                        </div>
                    )}

                    {/* ================================
                        REGISTRATION FORM
                    ================================= */}
                    {!registeringAsSeller && <>
                        <button type="button" className="google-auth-button" onClick={handleGoogleSignUp}>
                            <span className="google-mark" aria-hidden="true">G</span>
                            Continue with Google
                        </button>
                        <div className="auth-divider"><span>or register with email</span></div>
                    </>}
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                    >

                        {/* ============================
                            NAME
                        ============================= */}
                        <div className="auth-input-group">

                            <label htmlFor="name">
                                Full Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                autoComplete="name"
                                disabled={loading}
                                aria-invalid={Boolean(errors.name)}
                                aria-describedby={
                                    errors.name
                                        ? "name-error"
                                        : undefined
                                }
                            />

                            {errors.name && (
                                <div
                                    id="name-error"
                                    className="auth-error"
                                >
                                    {getErrorMessage(errors.name)}
                                </div>
                            )}

                        </div>

                        {/* ============================
                            EMAIL
                        ============================= */}
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
                                placeholder="Enter your email address"
                                autoComplete="email"
                                disabled={loading}
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={
                                    errors.email
                                        ? "email-error"
                                        : undefined
                                }
                            />

                            {errors.email && (
                                <div
                                    id="email-error"
                                    className="auth-error"
                                >
                                    {getErrorMessage(errors.email)}
                                </div>
                            )}

                        </div>

                        {/* ============================
                            PHONE
                        ============================= */}
                        <div className="auth-input-group">

                            <label htmlFor="phone">
                                Phone Number (optional)
                            </label>

                            <TanzaniaPhoneInput
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                autoComplete="tel"
                                disabled={loading}
                                aria-invalid={Boolean(errors.phone)}
                                aria-describedby={
                                    errors.phone
                                        ? "phone-error"
                                        : undefined
                                }
                            />

                            {errors.phone && (
                                <div
                                    id="phone-error"
                                    className="auth-error"
                                >
                                    {getErrorMessage(errors.phone)}
                                </div>
                            )}

                        </div>

                        {/* ============================
                            PASSWORD
                        ============================= */}
                        <div className="auth-input-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="password-confirmation-wrapper">

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    disabled={loading}
                                    aria-invalid={Boolean(
                                        errors.password
                                    )}
                                    aria-describedby={
                                        errors.password
                                            ? "password-error"
                                            : undefined
                                    }
                                />

                                {formData.password && (
                                    <button
                                        type="button"
                                        className="show-password-button"
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) => !previous
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

                            {errors.password && (
                                <div
                                    id="password-error"
                                    className="auth-error"
                                >
                                    {getErrorMessage(
                                        errors.password
                                    )}
                                </div>
                            )}

                        </div>

                        {/* ============================
                            PASSWORD CONFIRMATION
                        ============================= */}
                        <div className="auth-input-group">

                            <label htmlFor="password_confirmation">
                                Confirm Password
                            </label>

                            <div className="password-confirmation-wrapper">

                                <input
                                    id="password_confirmation"
                                    type={
                                        showPasswordConfirmation
                                            ? "text"
                                            : "password"
                                    }
                                    name="password_confirmation"
                                    value={
                                        formData.password_confirmation
                                    }
                                    onChange={handleChange}
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                    disabled={loading}
                                    aria-invalid={Boolean(
                                        errors.password_confirmation
                                    )}
                                    aria-describedby={
                                        errors.password_confirmation
                                            ? "password-confirmation-error"
                                            : undefined
                                    }
                                />

                                {formData.password_confirmation && (
                                    <button
                                        type="button"
                                        className="show-password-button"
                                        onClick={() =>
                                            setShowPasswordConfirmation(
                                                (previous) => !previous
                                            )
                                        }
                                        disabled={loading}
                                        aria-label={
                                            showPasswordConfirmation
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPasswordConfirmation ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>
                                )}

                            </div>

                            {errors.password_confirmation && (
                                <div
                                    id="password-confirmation-error"
                                    className="auth-error"
                                >
                                    {getErrorMessage(
                                        errors.password_confirmation
                                    )}
                                </div>
                            )}

                        </div>

                        {/* ============================
                            SUBMIT
                        ============================= */}
                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>

                    </form>

                    {/* ================================
                        LOGIN LINK
                    ================================= */}
                    <div className="auth-footer">

                        <p>
                            Already have an account?{" "}
                            <Link to="/login">
                                Login
                            </Link>
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;

