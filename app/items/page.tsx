"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/myLayout";
import { DataTable } from "./data-table";
import { Items, columns } from "./columns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as z from "zod";

interface ApiResponse {
  isSuccess: boolean;
  message: string;
  data: {
    items: Items[];
  };
}

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Price must be a positive number"
    ),
  stock: z
    .string()
    .min(1, "Stock is required")
    .refine(
      (val) => !isNaN(parseInt(val)) && parseInt(val) >= 0,
      "Stock must be a non-negative integer"
    ),
  category: z.string().min(1, "Category is required"),
});

type ItemFormData = z.infer<typeof itemSchema>;

const ItemsPage: React.FC = () => {
  const [items, setItems] = useState<Items[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [newItem, setNewItem] = useState<ItemFormData>({
    name: "",
    price: "",
    stock: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<
    Partial<Record<keyof ItemFormData, string>>
  >({});
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/Items?pageNumber=1&pageSize=10",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("token_expires");
            router.push("/login");
            return;
          }
          throw new Error("Network response error");
        }

        const result: ApiResponse = await response.json();

        if (result.isSuccess) {
          setItems(result.data.items);
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
    setValidationError((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImageError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = itemSchema.safeParse(newItem);
    if (!result.success) {
      const errors: Partial<Record<keyof ItemFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path[0] as keyof ItemFormData] = issue.message;
      });
      setValidationError(errors);
      return;
    }

    setValidationError({});

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!imageFile) {
      setImageError("Image is required");
      return;
    }
    setImageError(null);

    const formData = new FormData();
    formData.append("name", newItem.name);
    formData.append("price", newItem.price);
    formData.append("stock", newItem.stock);
    formData.append("category", newItem.category);
    formData.append("imageFile", imageFile);
    formData.append("imageUrl", newItem.name);

    try {
      const response = await fetch("http://localhost:5000/api/Items", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to add new item");
      }

      const result = await response.json();
      if (result.isSuccess) {
        // Reset form and refetch items
        setNewItem({ name: "", price: "", stock: "", category: "" });
        setImageFile(null);
        router.push("/items");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to add new item");
      console.error("Error adding new item:", err);
    }
  };

  if (isLoading)
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div>Error: {error}</div>
      </Layout>
    );

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Items</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Add New Item</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader className="bg-white">
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mb-8 space-y-4">
            <div>
              <input
                type="text"
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                placeholder="Item Name"
                className="w-full p-2 border rounded"
              />
              {validationError.name && (
                <p className="text-red-500 text-sm mt-1">
                  {validationError.name}
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="price"
                value={newItem.price}
                onChange={handleInputChange}
                placeholder="Price"
                className="w-full p-2 border rounded"
              />
              {validationError.price && (
                <p className="text-red-500 text-sm mt-1">
                  {validationError.price}
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="stock"
                value={newItem.stock}
                onChange={handleInputChange}
                placeholder="Stock"
                className="w-full p-2 border rounded"
              />
              {validationError.stock && (
                <p className="text-red-500 text-sm mt-1">
                  {validationError.stock}
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="category"
                value={newItem.category}
                onChange={handleInputChange}
                placeholder="Category"
                className="w-full p-2 border rounded"
              />
              {validationError.category && (
                <p className="text-red-500 text-sm mt-1">
                  {validationError.category}
                </p>
              )}
            </div>
            <div>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
                accept="image/*"
              />
              {imageError && (
                <p className="text-red-500 text-sm mt-1">{imageError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Add New Item
            </button>
          </form>
        </DialogContent>
      </Dialog>
      <div className="container mx-auto py-4">
        <DataTable columns={columns} data={items} />
      </div>
    </Layout>
  );
};

export default ItemsPage;
