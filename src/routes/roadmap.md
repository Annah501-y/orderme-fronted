# OrderMe Frontend — Project Task List

**Stack:** React (Vite) + Bootstrap — Laravel REST API — PostgreSQL/MySQL

---

## Phase 1 — Project Foundation ✅ Completed
- I set up the React + Vite frontend project structure.
- I integrated Bootstrap and Lucide React for UI and icons.
- I configured React Router for navigation.
- I connected the frontend to the Laravel API via `VITE_API_URL`.
- I established a clean separation between frontend and backend architecture.

## Phase 2 — Public Website ✅ Mostly Completed
- I built the public-facing pages: Home, Categories, Deals, New Arrivals, Stores, Login, Register.
- I designed the Home page with a Navbar, Hero section, Categories, Featured Products, Deals, Top Sellers, Benefits, and Footer.
- I established the visual identity: a professional Bootstrap-first design with a grey/dark navbar, golden/yellow OrderMe accent, and full responsiveness.

## Phase 3 — Navbar 🔄 In Progress
- I built the reusable Navbar (logo, Categories dropdown, Deals, New Arrivals, Stores, Become a Seller, Search, Account, Cart, mobile menu).
- I need to replace the hardcoded categories with live data from the Laravel API, so the dropdown reflects real backend categories.

## Phase 4 — Authentication ✅ Completed
- I implemented Register and Login flows connected to the Laravel API with Sanctum tokens.
- I implemented logout, protected routes, and role-based redirection.
- I supported public self-registration for both Buyers and Sellers.

## Phase 5 — Protected Layouts ✅ Completed
- I separated the application into Public, Buyer, Seller, Admin, and Rider layouts.
- I implemented protected routing so users cannot access dashboards outside their role.

## Phase 6 — Buyer Frontend 🔄 Mostly Completed
- I built the Buyer sidebar (Dashboard, Products, Categories, Cart, Orders, Wishlist, Settings, Logout, Collapse).
- I built the Buyer dashboard structure and profile page (including profile image handling).
- I connected the Wishlist to the Laravel API (`GET/POST/DELETE /wishlist`), replacing the frontend mock data.
- I need to finish connecting Buyer product listings to the live backend instead of hardcoded data.

## Phase 7 — Seller Frontend 🔄 Mostly Completed
- I built the Seller sidebar (Dashboard, Orders, Products, Store Profile, Earnings, Settings, Logout, Collapse) and dashboard UI.
- I built the seller product management flow: view, add, upload image, set price/discount/stock, and save to Laravel.
- I built the seller order management flow, covering statuses from Pending through Ready for Delivery.
- I built the seller profile page (store name, description, phone, address), connected to Laravel.
- I need to fix an outstanding issue where products created through the frontend appear in Postman but not in the frontend product list.

## Phase 8 — Admin Frontend 🔶 Partially Completed
- I built the initial Admin Dashboard, along with Products, Orders, Seller management, and Rider management/integration screens.
- The backend already supports seller approval/rejection/suspension, product management, order management, and rider management.
- I need to finish polishing and fully connecting the remaining Admin screens to these backend capabilities.

## Phase 9 — Rider Frontend 🔄 In Progress
- I built the Rider activation flow (`/rider/activate`): reading the invitation token, accepting and confirming a password, submitting activation to Laravel, and redirecting to login on success.
- The Laravel invitation system is already implemented on the backend.
- I need to continue building out the Rider Dashboard and login experience.

## Phase 10 — Cart & Checkout ⏳ Needs Completion
- I need to build the full cart flow: add to cart, quantity management, item removal.
- I need to build checkout: delivery address, order summary, and payment.
- I need to support multi-seller orders in a single checkout, since OrderMe is a multi-seller marketplace (e.g., one order splitting across Seller A, B, and C).

## Phase 11 — Payment Frontend ⏳ Needs Completion
- The backend payment architecture is already in place.
- I need to build the frontend payment flow: method selection (ClickPesa/Lipapay), payment request, payment status, and order confirmation.
- I need to display order total, delivery cost, applicable service charges, final amount, and payment status to the buyer.

## Phase 12 — Buyer Orders ⏳ Needs Finalization
- I need to build the "My Orders" view with order details, seller/order status, and delivery status.
- I need to display a clear status timeline per order (Payment → Confirmed → Processing → Ready → Assigned → Out for Delivery → Delivered).

## Phase 13 — Delivery Tracking ⏳ Major Remaining Feature
- I need to build the Rider dashboard view of assigned deliveries, pickup locations, customer destinations, delivery status, navigation, current location, and delivery progress.
- I need to build the Buyer-facing tracking view (Rider assigned → Out for delivery → Rider approaching → Delivered).

## Phase 14 — Rider GPS ⏳ Needs Implementation
- I need to request location permission from the rider after login (not during registration).
- I need to capture latitude/longitude via the browser and send it to the Laravel API.

## Phase 15 — Delivery OTP ⏳ Needs Implementation
- I need to implement the OTP delivery confirmation flow: customer receives an OTP via SMS, gives it to the rider, rider enters it, Laravel verifies it, and the order is marked Delivered.
- I need to use standard SMS rather than WhatsApp for this.

## Phase 16 — Search ⏳ Needs Completion
- The search box UI already exists in the navbar.
- I need to connect it to the Laravel products API and render results as product cards.
- I need to eventually support filtering by product name, category, seller/store, and possibly price.

## Phase 17 — Product Details ⏳ Needs Completion
- I need to finalize the product details page (image, name, price, old price, discount, rating, reviews, stock, seller, category, description, add-to-cart, wishlist).
- I need to connect `/product/{id}` to retrieve live data from Laravel.

## Phase 18 — Stores / Seller Shops ⏳ Needs Completion
- I need to build the public Stores page showing seller/store cards linking to individual store profiles and their products.

## Phase 19 — Deals & New Arrivals ⏳ Needs Backend Integration
- I need to connect the Deals page to products with an active discount, and New Arrivals to the newest products, replacing the current hardcoded data.

## Phase 20 — Reviews & Ratings ⏳ Needs Frontend Completion
- I need to let buyers rate and review a product once it's delivered.
- I need to display aggregated review counts and ratings on seller/product pages.

## Phase 21 — Responsive Design & Final UI ⏳ Final Polishing
- Once functionality is complete, I need to review responsiveness across desktop, tablet, and mobile for: navbar, sidebar, product cards, tables, forms, checkout, dashboards, modals, alerts, and loading/error states.

## Phase 24 — Final Project Testing ⏳ Final Milestone
- I need to run a full end-to-end simulation of a real OrderMe transaction: registration → login → browsing → product selection → add to cart → checkout → payment → seller order handling → ready for delivery → admin assigns delivery → rider accepts, picks up, and delivers → customer confirms via OTP → order marked Delivered → customer leaves a review.