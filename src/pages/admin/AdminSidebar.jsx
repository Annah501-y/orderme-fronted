import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    Store,
    Tags,
    Package,
    ShoppingBag,
    Truck,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    ChevronLeft,
} from "lucide-react";

import "../../pages_styles/admin-styles/admin-sidebar.css";

function AdminSidebar({ collapsed, setCollapsed }) {
    const navigate = useNavigate();

    const storedUser = localStorage.getItem("user");

    let user = null;

    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Unable to read admin user:", error);
    }

    const adminName = user?.name || "Admin";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    const menuItems = [
        {
            name: "Dashboard",
            path: "/admin-dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Users",
            path: "/admin/users",
            icon: Users,
        },
        {
            name: "Seller Applications",
            path: "/admin/seller-applications",
            icon: Store,
        },
        {
            name: "Categories",
            path: "/admin/categories",
            icon: Tags,
        },
        {
            name: "Products",
            path: "/admin/products",
            icon: Package,
        },
        {
            name: "Orders",
            path: "/admin/orders",
            icon: ShoppingBag,
        },
        {
            name: "Riders",
            path: "/admin/riders",
            icon: Truck,
        },
        {
            name: "Delivery",
            path: "/admin/delivery",
            icon: Truck,
        },
        {
            name: "Payments",
            path: "/admin/payments",
            icon: CreditCard,
        },
        {
            name: "Settings",
            path: "/admin/settings",
            icon: Settings,
        },
    ];

    return (
        <aside
            className={`admin-sidebar ${
                collapsed ? "admin-sidebar-collapsed" : ""
            }`}
        >
            {/* Sidebar Header */}
            <div className="admin-sidebar-header">
                {!collapsed && (
                    <div className="admin-sidebar-title">
                        <span className="admin-sidebar-title-main">
                            OrderMe
                        </span>

                        <span className="admin-sidebar-title-sub">
                            Admin Panel
                        </span>
                    </div>
                )}

                <button
                    type="button"
                    className="admin-sidebar-toggle"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    title={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                >
                    {collapsed ? (
                        <Menu size={20} />
                    ) : (
                        <ChevronLeft size={20} />
                    )}
                </button>
            </div>

            {/* Admin Profile */}
            <div className="admin-sidebar-profile">
                <div className="admin-profile-avatar">
                    {adminName.charAt(0).toUpperCase()}
                </div>

                {!collapsed && (
                    <div className="admin-profile-info">
                        <span className="admin-profile-name">
                            {adminName}
                        </span>

                        <span className="admin-profile-role">
                            Administrator
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="admin-sidebar-nav">
                <div className="admin-sidebar-section-title">
                    {!collapsed && "MANAGEMENT"}
                </div>

                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `admin-sidebar-link ${
                                    isActive ? "active" : ""
                                }`
                            }
                            title={collapsed ? item.name : ""}
                        >
                            <Icon size={20} />

                            {!collapsed && (
                                <span>{item.name}</span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Sidebar Footer */}
            <div className="admin-sidebar-footer">
                <button
                    type="button"
                    className="admin-sidebar-link admin-logout-button"
                    onClick={handleLogout}
                    title={collapsed ? "Logout" : ""}
                >
                    <LogOut size={20} />

                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}

export default AdminSidebar;