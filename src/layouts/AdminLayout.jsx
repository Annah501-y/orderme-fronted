import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../pages/admin/AdminSidebar";
import AdminNavbar from "../pages/admin/AdminNavbar";

function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="admin-layout">

            <AdminNavbar />

            <div className="admin-layout-body">

                <AdminSidebar
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                />

                <main
                    className={`admin-content ${
                        collapsed ? "sidebar-collapsed" : ""
                    }`}
                >
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AdminLayout;