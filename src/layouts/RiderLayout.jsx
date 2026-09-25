import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import RiderSidebar from "../pages/rider/RiderSidebar";
import "../pages_styles/rider-styles/rider-layout.css";

const RiderLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="rider-layout">

            <RiderSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                isOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />

            <main
                className={`rider-main-content ${
                    collapsed ? "rider-main-collapsed" : ""
                }`}
            >
                {/* Mobile top bar */}
                <div className="rider-mobile-header">
                    <button
                        type="button"
                        className="rider-mobile-menu-button"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu size={22} />
                    </button>

                    <div className="rider-mobile-brand">
                        <span>Order</span>
                        <strong>Me</strong>
                    </div>
                </div>

                <Outlet />
            </main>
        </div>
    );
};

export default RiderLayout;