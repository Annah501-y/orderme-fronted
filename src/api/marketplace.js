const API_URL = import.meta.env.VITE_API_URL;

/** Return a browser-ready image URL from either API image field shape. */
export function getProductImageUrl(product) {
    const value = product?.image_url || product?.image || product?.image_path || product?.photo_url;
    if (!value) return null;

    const image = String(value).trim();
    if (/^(https?:|data:|blob:)/i.test(image)) return image;

    const backendUrl = (API_URL || "").replace(/\/api\/?$/i, "").replace(/\/+$/, "");
    const path = image.replace(/\\/g, "/").replace(/^\/+/, "").replace(/^public\//i, "");
    const storagePath = path.replace(/^storage\//i, "");
    return backendUrl ? `${backendUrl}/storage/${storagePath}` : `/${path}`;
}

/** Fetch every page of the public product catalog. */
export async function fetchAllProducts() {
    const products = [];
    let page = 1;
    let lastPage = 1;

    do {
        const response = await fetch(`${API_URL}/products?page=${page}`, {
            headers: { Accept: "application/json" },
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to load products.");
        }

        const pageProducts = Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.data?.data)
                ? result.data.data
                : [];
        products.push(...pageProducts);
        lastPage = Number(result.meta?.last_page ?? result.data?.last_page ?? page);
        page += 1;
    } while (page <= lastPage);

    return products;
}

/** Load current discounted products exposed by Laravel's public deals route. */
export async function fetchDeals() {
    const response = await fetch(`${API_URL}/deals`, {
        headers: { Accept: "application/json" },
    });
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Unable to load current deals.");
    }

    return Array.isArray(result.data) ? result.data : [];
}

/** Group public active products into seller storefront summaries. */
export function groupProductsBySeller(products) {
    const sellersById = new Map();

    products.forEach((product) => {
        const seller = product.seller;
        if (!seller?.id) {
            return;
        }

        const entry = sellersById.get(seller.id) || {
            id: seller.id,
            name: seller.name || "Marketplace seller",
            storeName: seller.store_name || seller.seller_profile?.store_name || seller.name || "Store",
            description: seller.store_description || seller.seller_profile?.store_description || "",
            products: [],
            categories: new Map(),
        };

        entry.products.push(product);
        const categoryName = product.category?.name;
        if (categoryName) {
            entry.categories.set(categoryName, (entry.categories.get(categoryName) || 0) + 1);
        }
        sellersById.set(seller.id, entry);
    });

    return [...sellersById.values()].map((seller) => ({
        ...seller,
        category: [...seller.categories.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] || "Marketplace seller",
        productCount: seller.products.length,
    }));
}
