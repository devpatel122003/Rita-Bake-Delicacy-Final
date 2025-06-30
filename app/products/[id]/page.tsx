"use client";
import { getProductById } from "@/lib/products";
import { notFound } from "next/navigation";
import { ProductDetailsClient } from "@/components/product-details-client";
import { useEffect } from "react";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container px-4 mx-auto py-6">
      <ProductDetailsClient product={product} />
    </div>
  );
}