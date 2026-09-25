import { useEffect } from "react";

const GOOGLE_ERRORS = {
    invalid_state: "Google sign-in expired. Please try again.",
    authorization_failed: "Google could not authorize this sign-in.",
    token_exchange_failed: "Google sign-in could not be completed. Please try again.",
    provider_unavailable: "Google sign-in is temporarily unavailable.",
    profile_not_verified: "Google did not return a verified email address.",
    account_inactive: "This OrderMe account is inactive. Contact support for help.",
};

export function getGoogleAuthUrl() {
    const configuredUrl = import.meta.env.VITE_GOOGLE_AUTH_URL;
    if (configuredUrl) return configuredUrl;

    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) return null;

    const backendUrl = new URL(apiUrl, window.location.origin);
    backendUrl.pathname = backendUrl.pathname.replace(/\/api\/?$/, "");
    backendUrl.pathname = `${backendUrl.pathname.replace(/\/$/, "")}/auth/google/redirect`;
    backendUrl.search = "";
    backendUrl.hash = "";
    return backendUrl.toString();
}

export function useGoogleAuthCallback(navigate, setError) {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("google_code");
        const providerError = params.get("google_error");
        if (!code && !providerError) return;

        // Remove the one-time code from the address bar before exchanging it.
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);

        if (providerError) {
            setError(GOOGLE_ERRORS[providerError] || "Google sign-in failed. Please try again.");
            return;
        }

        let active = true;
        (async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/exchange`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    body: JSON.stringify({ code }),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || "Google sign-in failed. Please try again.");

                const user = result?.data?.user;
                const token = result?.data?.token;
                if (!user || !token) throw new Error("Google sign-in returned an unexpected response.");

                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
                window.dispatchEvent(new Event("orderme:auth-changed"));

                if (!active) return;
                const role = user.roles?.[0]?.name;
                if (role === "seller") navigate("/seller-dashboard", { replace: true });
                else if (role === "admin") navigate("/admin-dashboard", { replace: true });
                else if (role === "rider") navigate("/rider/dashboard", { replace: true });
                else navigate("/", { replace: true });
            } catch (error) {
                if (active) setError(error.message || "Google sign-in failed. Please try again.");
            }
        })();

        return () => { active = false; };
    }, [navigate, setError]);
}
