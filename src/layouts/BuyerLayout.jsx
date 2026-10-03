import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


function BuyerLayout() {
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
