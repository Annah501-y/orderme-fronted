import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect } from "react";
import { getStoredTheme } from "../theme";

function BuyerLayout() {
    useEffect(() => {
        // Buyer pages are intentionally light, even if another dashboard saved dark mode.
        const previousTheme = getStoredTheme();
        const setDocumentTheme = (theme) => {
            document.documentElement.dataset.theme = theme;
            document.documentElement.style.colorScheme = theme;
            document.body.classList.toggle("om-dark-mode", theme === "dark");
            document.body.classList.toggle("admin-dark-mode", theme === "dark");
        };
        setDocumentTheme("light");
        return () => setDocumentTheme(previousTheme);
    }, []);

    return (
        <div className="public-site-shell">
            <Navbar />
            <main>
                    <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default BuyerLayout;
