"use client";

import { useState, useEffect } from "react";
import { ProductGrid } from "@/components/product-grid";
import { ProductFilters, type FilterState } from "@/components/product-filters";
import { getProducts } from "@/lib/products";
import type { Product } from "@/types/product";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Loader2, FilterIcon, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useStoreStatus } from "../context/store-status-context";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export default function ProductsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get("category") || "all";
  const { isOnline } = useStoreStatus();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 2000],
    categories: [],
    flavors: [],
    searchQuery: "",
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await getProducts();

        // Generate signed URLs for images if they're from S3
        const productsWithSignedUrls = await Promise.all(
          allProducts.map(async (product) => {
            if (product.image?.startsWith("s3://")) {
              const params = {
                Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
                Key: product.image.replace("s3://", ""),
              };
              const command = new GetObjectCommand(params);
              const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
              return { ...product, image: signedUrl };
            }
            return product;
          })
        );

        setProducts(productsWithSignedUrls);
        setFilteredProducts(productsWithSignedUrls);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    let result = [...products];

    // Filter by category tab
    if (activeCategory !== "all") {
      result = result.filter((product) => product.category === activeCategory);
    }

    // Filter by selected categories
    if (filters.categories.length > 0) {
      result = result.filter((product) =>
        filters.categories.includes(product.category)
      );
    }

    // Filter by price range
    result = result.filter(
      (product) =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1]
    );

    // Filter by flavors
    if (filters.flavors.length > 0) {
      result = result.filter((product) =>
        product.flavors?.some((flavor) => filters.flavors.includes(flavor))
      );
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(result);
  }, [activeCategory, filters, products]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    // Update URL
    router.push(
      `/products${category !== "all" ? `?category=${category}` : ""}`,
      { scroll: false }
    );
    // Reset category filters when changing tabs
    setFilters((prev) => ({
      ...prev,
      categories: [],
    }));
  };

  // Mobile category selector
  const categoryOptions = [
    { value: "all", label: "All Items" },
    { value: "chocolate-cake", label: "Chocolate Cakes" },
    { value: "cheesecake", label: "Cheesecakes" },
    { value: "cookie", label: "Cookies" },
    { value: "brownie", label: "Brownies" },
    { value: "dry-cake", label: "Dry Cakes" },
    { value: "tart", label: "Tarts" },
    { value: "jar-cake", label: "Jar Cakes" },
    { value: "mousse", label: "Mousse" },
    { value: "muffin", label: "Muffins" },
    { value: "millet-magic", label: "Millet Magic" },
    { value: "other", label: "Other" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container px-4 md:px-6 mx-auto py-6 md:py-12"
    >
      <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-pink-800">
        Our Delicious Treats
      </h1>

      {/* Desktop Tabs */}
      <div className="mb-6 md:mb-8 overflow-x-auto pb-2 hidden md:block">
        <Tabs
          defaultValue={activeCategory}
          onValueChange={handleCategoryChange}
          className="w-full"
        >
          <TabsList className="bg-pink-50 p-1 flex flex-nowrap w-max min-w-full md:w-auto">
            {categoryOptions.map((category) => (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="data-[state=active]:bg-white data-[state=active]:text-pink-600 rounded-md px-4 py-2 whitespace-nowrap"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Mobile Category Dropdown */}
      <div className="md:hidden mb-4">
        <select
          value={activeCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full p-3 rounded-md border border-pink-200 bg-white text-pink-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {categoryOptions.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Filter Controls */}
      {/* <div className="flex items-center justify-between mb-4 md:hidden">
        <div className="text-sm text-gray-500">
          Showing {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "product" : "products"}
        </div>
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-pink-200 text-pink-800"
            >
              <FilterIcon size={16} />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] sm:w-[380px] p-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFiltersOpen(false)}
                >
                  <X size={18} />
                </Button>
              </div>
              <ProductFilters
                onFilterChange={handleFilterChange}
                initialFilters={filters}
                onApply={() => setFiltersOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        {/* Desktop Filters */}
        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-6">
            <ProductFilters
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
            </div>
          ) : (
            <>
              <div className="hidden md:block mb-4 text-sm text-gray-500">
                Showing {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </div>
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center bg-pink-50 rounded-lg p-8 text-center">
                  <p className="text-lg font-medium text-pink-800 mb-2">
                    No products found
                  </p>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({
                        priceRange: [0, 2000],
                        categories: [],
                        flavors: [],
                        searchQuery: "",
                      });
                      setActiveCategory("all");
                    }}
                    className="border-pink-400 text-pink-700 hover:bg-pink-100"
                  >
                    Reset all filters
                  </Button>
                </div>
              ) : (
                <ProductGrid
                  products={filteredProducts}
                  isStoreOnline={isOnline}
                />
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
