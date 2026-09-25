import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "ordermeTheme";
const THEME_EVENT = "orderme:theme-changed";

export function getStoredTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || localStorage.getItem("adminTheme");
    return savedTheme === "dark" ? "dark" : "light";
}

export function applyTheme(theme, notify = false) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    document.body.classList.toggle("om-dark-mode", nextTheme === "dark");
    // Keep the old admin setting synchronized so saved preferences survive upgrades.
    document.body.classList.toggle("admin-dark-mode", nextTheme === "dark");
    localStorage.setItem(THEME_KEY, nextTheme);
    localStorage.setItem("adminTheme", nextTheme);
    if (notify) window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: nextTheme }));
}

export function useTheme() {
    const [theme, setTheme] = useState(getStoredTheme);

    useEffect(() => {
        const syncTheme = (event) => setTheme(event.detail || getStoredTheme());
        const syncStorage = (event) => {
            if (event.key === THEME_KEY || event.key === "adminTheme") setTheme(getStoredTheme());
        };
        window.addEventListener(THEME_EVENT, syncTheme);
        window.addEventListener("storage", syncStorage);
        return () => {
            window.removeEventListener(THEME_EVENT, syncTheme);
            window.removeEventListener("storage", syncStorage);
        };
    }, []);

    const toggleTheme = useCallback(() => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        applyTheme(nextTheme, true);
        setTheme(nextTheme);
    }, [theme]);

    return [theme, toggleTheme];
}
