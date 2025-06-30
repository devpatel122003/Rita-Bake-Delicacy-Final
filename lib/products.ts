import type { Product } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`/api/products`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error('API Error:', errorData);
      throw new Error(errorData?.message || 'Failed to fetch products');
    }

    const products = await res.json();

    // Ensure all image URLs use the public S3 format
    return products.map((product: { image: string | string[]; }) => ({
      ...product,
      image: product.image?.includes('amazonaws.com')
        ? product.image
        : `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${product.image}`
    }));
  } catch (error) {
    console.error('Network Error:', error);
    throw new Error('Network error occurred while fetching products');
  }
}

export async function createProduct(productData: any) {
  try {
    // First upload the image to S3 if it's a file
    if (productData.image instanceof File) {
      const { uploadFileToS3 } = await import('@/lib/s3-utils');
      const imageUrl = await uploadFileToS3(productData.image);
      productData.image = imageUrl; // Store full public URL
    }

    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    if (!res.ok) {
      const errorResponse = await res.json().catch(() => null);
      const errorMessage = errorResponse?.error || "Failed to create product";
      throw new Error(errorMessage);
    }

    const result = await res.json();
    if (!result._id) {
      throw new Error("Invalid server response: _id missing");
    }

    return result._id;
  } catch (error) {
    console.error("Error in createProduct:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create product");
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const res = await fetch(`/api/products/${id}`, {
      cache: 'no-store' // Important for dynamic routes
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch product (status: ${res.status})`);
    }

    const product = await res.json();

    // Ensure image URL is properly formatted
    if (product.image && !product.image.includes('amazonaws.com')) {
      product.image = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${product.image}`;
    }

    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return undefined;
  }
}

// Other functions remain the same as they use getProducts() which already handles the URL conversion
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products.filter((product) => product.featured);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const products = await getProducts();
    if (category === 'all') return products;
    return products.filter((product) => product.category === category);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const products = await getProducts();
    const searchTerm = query.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.flavors?.some((flavor) => flavor.toLowerCase().includes(searchTerm)) ||
        product.category.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}