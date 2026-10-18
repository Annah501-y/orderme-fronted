import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SellerSidebar from "../pages/seller/SellerSidebar";
import SellerNavbar from "../pages/seller/SellerNavbar";
import Footer from "../components/Footer";
import "../pages_styles/seller_styles/seller-layout.css";

function SellerLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="seller-layout">
            <SellerNavbar />
            <div className="seller-layout-body">
            <SellerSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            <main
                className={`seller-content ${
                    collapsed ? "sidebar-collapsed" : ""
                }`}
            >
                <Outlet />
            </main>
        </div>
        <Footer/>
        </div>
    );
}

export default SellerLayout;