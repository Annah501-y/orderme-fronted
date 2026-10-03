import { useEffect, useState } from "react";
import {
  ShoppingCart,
  User,
  Heart,
  Percent,
  Truck,
  ChevronDown,
  Menu,
  X,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import "../components_styles/navbar.css";

const API_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });
  const navigate = useNavigate();
  const role = user?.roles?.find((item) => item?.name === "seller")?.name || user?.roles?.[0]?.name;

  //
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const syncUser = () => {
      try { setUser(JSON.parse(localStorage.getItem("user") || "null")); } catch { setUser(null); }
    };
    window.addEventListener("storage", syncUser);
    window.addEventListener("focus", syncUser);
    window.addEventListener("orderme:auth-changed", syncUser);
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories.");
        }

        const data = await response.json();

        // Handles common  API response structure
        const categoryData = data.data?.categories || data.data || [];

        setCategories(categoryData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
      window.removeEventListener("orderme:auth-changed", syncUser);
    };
  }, []);

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("orderme:auth-changed"));
    setAccountOpen(false);
    navigate("/");
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    setMobileOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg border-bottom sticky-top orderme-navbar">
      <div className="container px-lg-4">

        {/* Logo */}
        <a className="navbar-brand d-flex align-items-center" href="/">
          <img
            src="/src/assets/images/orderme-logo.jpg"
            alt="OrderMe"
            className="orderme-logo"
          />

          <span className="orderme-brand">
            Order<span>Me</span>
          </span>
        </a>

        {/* Compact marketplace actions shown in a separate mobile top row. */}
        <div className="mobile-navbar-actions">
          <div className="account-menu-wrap">
            <button type="button" className="mobile-nav-action" title="Account" aria-label="Account" onClick={() => setAccountOpen(!accountOpen)} aria-expanded={accountOpen}>
              <User size={19} /><span>Account</span>
            </button>
            {accountOpen && <div className="account-dropdown">
              {user ? <>
                <div className="account-dropdown-heading">{user.name || "Your account"}<small>{user.email}</small></div>
                <Link to="/buyer/profile" onClick={() => setAccountOpen(false)}>Account settings</Link>
                <Link to="/buyer/orders" onClick={() => setAccountOpen(false)}>Purchases and orders</Link>
                <Link to="/buyer/wishlist" onClick={() => setAccountOpen(false)}>Favorites</Link>
                {role === "buyer" && <Link to="/seller-profile-setup" onClick={() => setAccountOpen(false)}>Become a Seller</Link>}
                {role === "seller" && <Link to="/seller/store-profile" onClick={() => setAccountOpen(false)}>Seller account</Link>}
                {role === "admin" && <Link to="/admin-dashboard" onClick={() => setAccountOpen(false)}>Admin dashboard</Link>}
                {role === "rider" && <Link to="/rider/dashboard" onClick={() => setAccountOpen(false)}>Rider dashboard</Link>}
                <button type="button" onClick={signOut}>Sign out</button>
              </> : <><Link to="/login" onClick={() => setAccountOpen(false)}>Sign in</Link><Link to="/register" onClick={() => setAccountOpen(false)}>Create account</Link><Link to="/register?account_type=seller" onClick={() => setAccountOpen(false)}>Become a Seller</Link></>}
            </div>}
          </div>
          <Link className="mobile-nav-action" to="/buyer/wishlist" title="Favorites" aria-label="Favorites"><Heart size={19} /><span>Favorites</span></Link>
          <Link className="mobile-nav-action" to="/deals" title="Deals" aria-label="Deals"><Percent size={19} /><span>Deals</span></Link>
          <Link className="mobile-nav-action" to="/cart" title="Cart" aria-label="Cart"><ShoppingCart size={19} /><span>Cart</span></Link>
          <Link className="mobile-nav-action mobile-rider-action" to="/become-rider" title="Become a Rider" aria-label="Become a Rider"><Truck size={19} /><span>Become a Rider</span></Link>
        </div>

        {/* Second mobile row: categories menu and marketplace search. */}
        <div className="mobile-navbar-tools">
          <div className="mobile-categories-wrap">
            <button type="button" className="mobile-categories-button" onClick={() => setCategoriesOpen(!categoriesOpen)} aria-expanded={categoriesOpen}>
              <Menu size={19} /> <span>Categories</span> <ChevronDown size={15} />
            </button>
            {categoriesOpen && <div className="mobile-category-menu">
              <strong>Shop by Category</strong>
              {categories.map((category) => <Link key={category.id} to={`/products?category=${category.id}`} onClick={() => { setCategoriesOpen(false); setMobileOpen(false); }}>{category.name}</Link>)}
              <Link to="/sellers" onClick={() => { setCategoriesOpen(false); setMobileOpen(false); }}>Stores</Link>
            </div>}
          </div>
          <form className="mobile-marketplace-search" onSubmit={submitSearch} role="search">
            <input type="search" placeholder="Search for anything" aria-label="Search products" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            <button type="submit" aria-label="Search products"><Search size={19} /></button>
          </form>
        </div>

        {/* Mobile menu button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

        {/* Navigation */}
        <div
          className={`collapse navbar-collapse ${mobileOpen ? "show" : ""
            }`}
        >
          <form className="navbar-marketplace-search" onSubmit={submitSearch} role="search">
            <input type="search" placeholder="Search for anything" aria-label="Search products" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            <button type="submit" aria-label="Search products"><Search size={19} /></button>
          </form>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">

            {/* Categories */}
            <li
              className="nav-item position-relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                className="nav-link category-button d-flex align-items-center gap-1"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
              >
                Categories
                <ChevronDown size={16} />
              </button>

              {/* Mega Menu */}
              <div
                className={`category-menu ${categoriesOpen ? "category-menu-show" : ""
                  }`}
              >
                <div className="row g-4">

                  {/* Laravel Categories */}
                  <div className="col-md-4">
                    <h6>Shop by Category</h6>

                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <Link
                          to={`/products?category=${category.id}`}
                          key={category.id}
                          className="category-link"
                          onClick={() => {
                            setCategoriesOpen(false);
                            setMobileOpen(false);
                          }}
                        >
                          {category.name}
                        </Link>
                      ))
                    ) : (
                      <span className="category-link">
                        Loading categories...
                      </span>
                    )}
                  </div>

               
                </div>
              </div>
            </li>

            {/* Deals */}
            <li className="nav-item">
              <Link className="nav-link" to="/deals" onClick={() => setMobileOpen(false)}>
                Deals
              </Link>
            </li>

            {/* Rider application */}
            <li className="nav-item">
              <Link className="nav-link" to="/become-rider" onClick={() => setMobileOpen(false)}>Become a Rider</Link>
            </li>

            {/* Stores */}
            <li className="nav-item">
              <a className="nav-link" href="/stores">
                Stores
              </a>
            </li>

          </ul>

          {/* Right side actions */}
          <div className="d-flex align-items-center gap-3">

            {/* Account */}
            <div className="account-menu-wrap">
              <button type="button" className="nav-action account-trigger" onClick={() => setAccountOpen(!accountOpen)} aria-expanded={accountOpen}>
                <User size={21} /><span>{user?.name || "Account"}</span><ChevronDown size={15} />
              </button>
              {accountOpen && <div className="account-dropdown">
                {user ? <>
                  <div className="account-dropdown-heading">{user.name || "Your account"}<small>{user.email}</small></div>
                  <Link to="/buyer/profile" onClick={() => setAccountOpen(false)}>Account settings</Link>
                  <Link to="/buyer/orders" onClick={() => setAccountOpen(false)}>Purchases and orders</Link>
                  <Link to="/buyer/wishlist" onClick={() => setAccountOpen(false)}>Favorites</Link>
                  {role === "buyer" && <Link to="/seller-profile-setup" onClick={() => setAccountOpen(false)}>Become a Seller</Link>}
                  {role === "seller" && <Link to="/seller/store-profile" onClick={() => setAccountOpen(false)}>Seller account</Link>}
                  {role === "admin" && <Link to="/admin-dashboard" onClick={() => setAccountOpen(false)}>Admin dashboard</Link>}
                  {role === "rider" && <Link to="/rider/dashboard" onClick={() => setAccountOpen(false)}>Rider dashboard</Link>}
                  <button type="button" onClick={signOut}>Sign out</button>
                </> : <><Link to="/login" onClick={() => setAccountOpen(false)}>Sign in</Link><Link to="/register" onClick={() => setAccountOpen(false)}>Create account</Link><Link to="/register?account_type=seller" onClick={() => setAccountOpen(false)}>Become a Seller</Link></>}
              </div>}
            </div>

            {/* Cart */}
            <a href="/cart" className="nav-action position-relative">
              <ShoppingCart size={21} />
              <span>Cart</span>

              <span className="cart-count">
                0
              </span>
            </a>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
