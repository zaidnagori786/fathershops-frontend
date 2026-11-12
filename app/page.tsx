
"use client";

import DOMPurify from "dompurify";
import { useEffect, useMemo, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_LARAVEL_API_URL;

type Category = {
  category_id: string;
  name: string;
  image: string;
};

type Product = {
  product_id?: string;
  id?: string;
  product_name?: string;
  name?: string;
  image?: string;
  images?: any[];
  options?: any[];
  price?: string | number;
  descriptions?: any;
  description?: string;
  [key: string]: any;
};

// Get product description
function getProductDescription(product: any): string {
  if (!product) return "";

  if (typeof product.description === "string") {
    return product.description;
  }

  const descriptions = product.descriptions ?? product;

  if (Array.isArray(descriptions)) {
    const item = descriptions.find(
      (item) => typeof item?.description === "string"
    );

    return item?.description ?? "";
  }

  if (descriptions && typeof descriptions === "object") {
    const values = Object.values(descriptions) as any[];

    const item = values.find(
      (value) => typeof value?.description === "string"
    );

    return item?.description ?? "";
  }

  return "";
}

// Get product name
function getProductName(product: any): string {
  if (!product) return "Product Information";

  if (product.product_name) return product.product_name;
  if (product.name) return product.name;

  const descriptions = product.descriptions ?? product;

  if (Array.isArray(descriptions)) {
    return (
      descriptions.find((item) => item?.name)?.name ||
      "Product Information"
    );
  }

  if (descriptions && typeof descriptions === "object") {
    const values = Object.values(descriptions) as any[];

    const item = values.find((value) => value?.name);

    return item?.name || "Product Information";
  }

  return "Product Information";
}

// Get option name
function getOptionName(option: any): string {
  return (
    option?.names?.["1"]?.name ||
    option?.names?.["2"]?.name ||
    "Product Option"
  );
}

// Get option value name
function getOptionValueName(value: any): string {
  return (
    value?.names?.["1"]?.name ||
    value?.names?.["2"]?.name ||
    "Option Value"
  );
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<any>(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Prevent older category requests from replacing newer results
  const productRequestId = useRef(0);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        if (!API) {
          throw new Error("Laravel API URL is missing");
        }

        const res = await fetch(`${API}/categories`);

        if (!res.ok) {
          throw new Error("Failed to load categories");
        }

        const data = await res.json();

        if (!Array.isArray(data.response)) {
          throw new Error("Invalid categories response");
        }

        setCategories(data.response);
      } catch (err) {
        console.error("Category error:", err);

        setError(
          "Unable to load categories. Please check the Laravel server."
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  // Load products by selected category
  async function getProducts(categoryId: string) {
    const requestId = ++productRequestId.current;

    setSelectedCategory(categoryId);
    setError("");
    setSearch("");
    setProducts([]);
    setProduct(null);
    setLoadingProducts(true);

    try {
      if (!API) {
        throw new Error("Laravel API URL is missing");
      }

      const res = await fetch(`${API}/products/${categoryId}`);

      if (requestId !== productRequestId.current) return;

      if (!res.ok) {
        throw new Error(
          res.status === 404
            ? "No products are available in this category."
            : "Unable to fetch products from the server."
        );
      }

      const data = await res.json();

      if (requestId !== productRequestId.current) return;

      const productList =
        data.data?.products ??
        data.products ??
        data.data ??
        data;

      if (!Array.isArray(productList)) {
        throw new Error("Invalid products response");
      }

      setProducts(productList);
    } catch (err) {
      if (requestId !== productRequestId.current) return;

      console.error("Product error:", err);

      setProducts([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products."
      );
    } finally {
      if (requestId === productRequestId.current) {
        setLoadingProducts(false);
      }
    }
  }

  // Load complete product details
  async function getProductDetails(productId: string) {
    setError("");
    setProduct(null);
    setLoadingDetails(true);

    try {
      if (!API) {
        throw new Error("Laravel API URL is missing");
      }

      const res = await fetch(
        `${API}/products/details/${productId}`
      );

      if (!res.ok) {
        throw new Error(
          res.status === 404
            ? "Product details not found."
            : "Unable to load product details."
        );
      }

      const data = await res.json();

      setProduct(data.data?.product ?? data.data ?? data);
    } catch (err) {
      console.error("Details error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load product details."
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  // Search products
  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return products;

    return products.filter((item) => {
      const name = getProductName(item);

      return String(name).toLowerCase().includes(query);
    });
  }, [products, search]);

  // Selected category name
  const selectedCategoryName =
    categories.find(
      (item) => item.category_id === selectedCategory
    )?.name || "Products";

  // Product description
  const description = getProductDescription(product);

  const safeDescription = description
    ? DOMPurify.sanitize(description)
    : "";

  // Product gallery images
  const productImages = Array.isArray(product?.images)
    ? product.images.filter(
        (item: any) =>
          typeof item?.image === "string" &&
          /^https?:\/\//i.test(item.image)
      )
    : [];

  // Product options
  const productOptions = Array.isArray(product?.options)
    ? product.options
    : [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Header */}
      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Father<span className="text-cyan-400">Shops</span>
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              Discover products for everyone
            </p>
          </div>

          <div className="hidden rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 sm:block">
            Online Shopping
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Welcome to FatherShops
          </p>

          <h2 className="max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
            Find products that match your style.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
            Explore our collections, discover products and view complete
            product information in one place.
          </p>

          <a
            href="#categories"
            className="mt-7 inline-flex rounded-lg bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Explore Categories
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-7 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{error}</p>

            <button
              onClick={() => setError("")}
              className="font-bold"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Categories */}
        <section id="categories">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-700">
                Browse collections
              </p>

              <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                Shop by Category
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Choose a category to explore its products.
              </p>
            </div>

            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              {categories.length} Categories
            </span>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-52 animate-pulse rounded-2xl bg-slate-200"
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="rounded-xl bg-white p-6 text-sm text-slate-500">
              No categories available.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {categories.map((category) => (
                <button
                  key={category.category_id}
                  onClick={() => getProducts(category.category_id)}
                  className={`group overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    selectedCategory === category.category_id
                      ? "border-cyan-500 ring-2 ring-cyan-100"
                      : "border-slate-200"
                  }`}
                >
                  <div className="h-36 overflow-hidden bg-slate-100 sm:h-48">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <span className="font-bold">
                      {category.name}
                    </span>

                    <span className="text-lg text-cyan-600 transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Products */}
        {selectedCategory && (
          <section className="mt-14" id="products">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-700">
                  Our collection
                </p>

                <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                  {selectedCategoryName}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {products.length} products available
                </p>
              </div>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 sm:max-w-xs"
              />
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-64 animate-pulse rounded-2xl bg-slate-200"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <p className="text-3xl">📦</p>

                <h3 className="mt-3 font-bold">
                  No products found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try another search or select a different category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((item, index) => {
                  const id = item.product_id || item.id;
                  const name = getProductName(item);

                  return (
                    <button
                      key={id || index}
                      disabled={!id}
                      onClick={() =>
                        id && getProductDetails(String(id))
                      }
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed"
                    >
                      <div className="flex h-40 items-center justify-center overflow-hidden bg-slate-100 p-3 sm:h-52">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={name}
                            className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span className="text-sm text-slate-400">
                            No image available
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">
                          {name}
                        </h3>

                        {item.price !== undefined && (
                          <p className="mt-2 font-bold text-cyan-700">
                            {item.price}
                          </p>
                        )}

                        <p className="mt-3 text-xs font-semibold text-slate-500 group-hover:text-cyan-700">
                          View Details →
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Product Details Modal */}
      {(loadingDetails || product) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!loadingDetails) setProduct(null);
          }}
        >
          <div
            className="my-auto max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
              <h2 className="text-lg font-bold">
                Product Details
              </h2>

              <button
                onClick={() => setProduct(null)}
                disabled={loadingDetails}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {loadingDetails ? (
              <div className="p-12 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading product details...
                </p>
              </div>
            ) : product ? (
              <div className="p-6">

                {/* Main Product Image */}
                {product.image && (
                  <div className="mb-6 flex justify-center rounded-xl bg-slate-50 p-5">
                    <img
                      src={product.image}
                      alt={getProductName(product)}
                      className="max-h-72 w-full object-contain"
                    />
                  </div>
                )}

                {/* Product Name */}
                <h3 className="mb-5 text-xl font-bold">
                  {getProductName(product)}
                </h3>

                {/* Product Images Gallery */}
                {productImages.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-bold">
                      Product Images
                    </h3>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {productImages.map(
                        (item: any, index: number) => (
                          <div
                            key={`${item.image}-${index}`}
                            className="flex h-40 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3"
                          >
                            <img
                              src={item.image}
                              alt={`Product image ${index + 1}`}
                              loading="lazy"
                              className="h-full w-full object-contain transition duration-300 hover:scale-105"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Product Options */}
                {productOptions.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-bold">
                      Product Options
                    </h3>

                    <div className="space-y-5">
                      {productOptions.map(
                        (option: any, index: number) => (
                          <div
                            key={
                              option.product_option_id || index
                            }
                            className="rounded-xl border border-slate-200 bg-white p-4"
                          >
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <h4 className="font-bold">
                                {getOptionName(option)}
                              </h4>

                              {option.required === "1" && (
                                <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                                  Required
                                </span>
                              )}

                              <span className="text-xs text-slate-400">
                                {option.type}
                              </span>
                            </div>

                            {Array.isArray(
                              option.product_option_value
                            ) &&
                            option.product_option_value.length > 0 ? (
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {option.product_option_value.map(
                                  (
                                    value: any,
                                    valueIndex: number
                                  ) => (
                                    <div
                                      key={
                                        value.product_option_value_id ||
                                        valueIndex
                                      }
                                      className="overflow-hidden rounded-lg border border-slate-200"
                                    >
                                      {value.image && (
                                        <div className="flex h-28 items-center justify-center bg-slate-50 p-2">
                                          <img
                                            src={value.image}
                                            alt={getOptionValueName(
                                              value
                                            )}
                                            loading="lazy"
                                            className="h-full w-full object-contain"
                                          />
                                        </div>
                                      )}

                                      <div className="p-3">
                                        <p className="text-sm font-semibold">
                                          {getOptionValueName(
                                            value
                                          )}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                          Quantity:{" "}
                                          {value.quantity ?? "N/A"}
                                        </p>

                                        {Number(value.price) !==
                                          0 && (
                                          <p className="mt-1 text-sm font-bold text-cyan-700">
                                            {value.price_prefix ||
                                              "+"}
                                            {value.price}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500">
                                No option values available.
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Other Product Information */}
                <div className="divide-y divide-slate-100">
                  {Object.entries(product)
                    .filter(
                      ([key]) =>
                        ![
                          "descriptions",
                          "description",
                          "images",
                          "image",
                          "options",
                        ].includes(key.toLowerCase())
                    )
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="grid gap-2 py-3 sm:grid-cols-[180px_1fr]"
                      >
                        <strong className="text-sm capitalize text-slate-700">
                          {key.replaceAll("_", " ")}
                        </strong>

                        <pre className="whitespace-pre-wrap break-words font-sans text-sm text-slate-500">
                          {typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : String(value ?? "")}
                        </pre>
                      </div>
                    ))}
                </div>

                {/* Product Description */}
                {safeDescription && (
                  <div className="mt-8 border-t pt-6">
                    <h3 className="mb-4 text-xl font-bold">
                      Product Description
                    </h3>

                    <div
                      className="product-description text-sm text-slate-600"
                      dangerouslySetInnerHTML={{
                        __html: safeDescription,
                      }}
                    />
                  </div>
                )}

              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 bg-slate-950 px-5 py-7 text-center text-sm text-slate-400">
        <p>
          © 2026 FatherShops. All rights reserved.
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Built with Next.js and Laravel
        </p>
      </footer>
    </main>
  );
}
