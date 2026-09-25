import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import BuyerLayout from "../layouts/BuyerLayout";
import SellerLayout from "../layouts/SellerLayout";
import AdminLayout from "../layouts/AdminLayout";

// Public pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";


// Buyer pages
import BuyerProfile from "../pages/buyer/BuyerProfile";
import BuyerOrders from "../pages/buyer/BuyerOrders";
import BuyerWishlist from "../pages/buyer/BuyerWishlist";


// Seller pages
import SellerDashboard from "../pages/seller/SellerDashboard";
import SellerProfileSetup from "../pages/seller/SellerProfileSetup";
import SellerPendingApproval from "../pages/seller/SellerPendingApproval";
import SellerOrders from "../pages/seller/SellerOrders";
import SellerProducts from "../pages/seller/SellerProducts";
import SellerSettings from "../pages/seller/SellerSettings";

import SellerEarnings from "../pages/seller/SellerEarnings";


// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminCategories from "../pages/admin/AdminCategories";

// Authentication protection
import ProtectedRoute from "../components/ProtectedRoute";
import Products from "../pages/Products";
import Cart from "../pages/Cart";
import SellerOrderDetails from "../pages/seller/SellerOrderDetails";
import SellerStoreProfile from "../pages/seller/SellerStoreProfile";
import AllCategories from "../pages/AllCategories";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminSellerApplication from "../pages/admin/AdminSellerApplication";
import AdminOrders from "../pages/admin/AdminOrders";
import RiderActivate from "../pages/rider/RiderActivate";
import AdminRiders from "../pages/admin/AdminRiders";
import AdminDelivery from "../pages/admin/AdminDelivery";
import AdminSettings from "../pages/admin/AdminSettings";
import RiderLayout from "../layouts/RiderLayout";
import RiderDashboard from "../pages/rider/RiderDashboard";
import RiderOrder from "../pages/rider/RiderOrders";
import RiderOrders from "../pages/rider/RiderOrders";
import ProductDetails from "../components/ProductDetails";
import Checkout from "../pages/buyer/Checkout";
import OrderPayment from "../pages/buyer/OrderPayment";
import Sellers from "../pages/Sellers";
import HelpCenter from "../pages/HelpCenter";
import Terms from "../pages/Terms";
import Privacy from "../pages/Privacy";
import SellerApprovalGate from "../components/SellerApprovalGate";
import Deals from "../components/Deals";
import BeRider from "../pages/rider/BeRider";


function AppRoutes() {

    return (
        <Routes>

            {/* =========================
                PUBLIC ROUTES
            ========================== */}

            <Route element={<MainLayout />}>

                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="/become-rider" element={<BeRider />} />
                <Route path="/sellers" element={<Sellers />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/allcategories" element={<AllCategories/>} />
                <Route path="/rider/activate" element={<RiderActivate/>}/>
                <Route path="/products/:id" element={<ProductDetails/>}/>
                <Route path="/checkout" element={<Checkout/>}/>
                <Route path="/orders/:id/payment" element={<OrderPayment/>}/>

            </Route>


            {/* =========================
                BUYER ROUTES
            ========================== */}

            <Route
                element={
                    <ProtectedRoute allowedRole="buyer">
                        <BuyerLayout />
                    </ProtectedRoute>
                }
            >

                <Route
                    path="/buyer-dashboard"
                    element={<Navigate to="/" replace />}
                />
                <Route
                    path="/buyer/cart"
                    element={<Cart />}
                />
                <Route
                    path="/buyer/profile"
                    element={<BuyerProfile />}
                />

                <Route
                    path="/buyer/orders"
                    element={<BuyerOrders />}
                />

                <Route
                    path="/buyer/wishlist"
                    element={<BuyerWishlist />}
                />

               
                <Route path="/cart" 
                element={<Cart />} />
            </Route>
            {/* =========================
                SELLER ROUTES
            ========================== */}

            <Route
                path="/seller-profile-setup"
                element={
                    <ProtectedRoute allowedRole={["buyer", "seller"]}>
                        <SellerProfileSetup />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/seller-pending-approval"
                element={
                    <ProtectedRoute allowedRole="seller">
                        <SellerPendingApproval />
                    </ProtectedRoute>
                }
            />
            
            <Route
                element={
                    <ProtectedRoute allowedRole="seller">
                    <SellerApprovalGate><SellerLayout /></SellerApprovalGate>
                    </ProtectedRoute>
                }
            >

                <Route
                    path="/seller-dashboard"
                    element={<SellerDashboard />}
                />
                <Route
                    path="/seller/orders"
                    element={<SellerOrders />}
                />
                <Route
                path="/seller/orders/:sellerOrderId"
                element={<SellerOrderDetails/>}
                />
                <Route
                    path="/seller/products"
                    element={<SellerProducts />}
                />

                <Route
                    path="/seller/store-profile"
                    element={<SellerStoreProfile />}
                />

                <Route
                    path="/seller/earnings"
                    element={<SellerEarnings />}
                />

               
                <Route path="/seller/settings"
                 element={<SellerSettings />} />
            </Route>


            {/* ADMIN ROUTES */}
            <Route
    element={
        <ProtectedRoute allowedRole="admin">
            <AdminLayout />
        </ProtectedRoute>
    }
>
    <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
    />

    <Route
        path="/admin/users"
        element={<AdminUsers/>}
    />

    <Route
        path="/admin/seller-applications"
        element={<AdminSellerApplication/>}
    />

    <Route
        path="/admin/categories"
        element={<AdminCategories/>}
    />

    <Route
        path="/admin/products"
        element={<AdminProducts/>}
    />

    <Route
        path="/admin/orders"
        element={<AdminOrders/>}
    />
     <Route
        path="/admin/riders"
        element={<AdminRiders/>}
    />
    

    <Route
        path="/admin/delivery"
        element={<AdminDelivery/>}
    />

    <Route
        path="/admin/payments"
        element={<div>Payments</div>}
    />

    <Route
        path="/admin/settings"
        element={<AdminSettings/>}
    />
</Route>


{/* RIDER ROUTES */}
{/* RIDER ROUTES */}

<Route
    path="/rider"
    element={
        <ProtectedRoute allowedRole="rider">
            <RiderLayout />
        </ProtectedRoute>
    }
>
    <Route
        path="dashboard"
        element={<RiderDashboard />}
    />

    <Route
        path="orders"
        element={<RiderOrders/>}
    />

    <Route
        path="earnings"
        element={<div>RiderEarnings</div>}
    />

    <Route
        path="profile"
        element={<div>RiderProfile </div>}
    />

    <Route
        path="settings"
        element={<div>RiderSettings </div>}
    />
</Route>


        </Routes>
    );
}

export default AppRoutes;
