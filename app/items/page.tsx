"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/myLayout";
import { DataTable } from "./data-table";
import { Item } from "./columns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { DialogDescription } from "@radix-ui/react-dialog";

interface ApiResponse {
  isSuccess: boolean;
  message: string;
  data: {
    items: Item[];
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
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isOpenAddDialog, setIsOpenAddDialog] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
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

  useEffect(() => {
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

  const handleCloseAddDialog = () => {
    setValidationError({});
    setIsOpenAddDialog(false);
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

    try {
      const response = await fetch("http://localhost:5000/api/Items", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result: ApiResponse = await response.json();
      if (result.isSuccess) {
        setNewItem({ name: "", price: "", stock: "", category: "" });
        setImageFile(null);
        setValidationError({});
        handleCloseAddDialog();

        router.refresh();
        fetchItems();
        toast({
          title: "Success",
          description: "Item added successfully",
        });
      }
    } catch (err) {
      setError("Failed to add new item");
      console.error("Error adding new item:", err);
      toast({
        title: "Uh oh! an error occurred",
        description: "Failed to add new item",
        variant: "destructive",
      });
    }
  };

  const handleOpenUpdateDialog = (item: Item) => {
    setSelectedItem(item);
    setNewItem({
      name: item.name,
      price: item.price.toString(),
      stock: item.stock.toString(),
      category: item.category,
    });
    setImageFile(null);
    setValidationError({});
    setIsOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedItem(null);
    setNewItem({ name: "", price: "", stock: "", category: "" });
    setImageFile(null);
    setValidationError({});
    setIsOpenDialog(false);
  };

  const handleUpdateItem = async (e: React.FormEvent<HTMLFormElement>) => {
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
    formData.append("id", selectedItem?.id as string);
    formData.append("name", newItem.name);
    formData.append("price", newItem.price);
    formData.append("stock", newItem.stock);
    formData.append("category", newItem.category);
    formData.append("imageFile", imageFile);

    try {
      const response = await fetch(
        `http://localhost:5000/api/Items/${selectedItem?.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add new item");
      }

      const result: ApiResponse = await response.json();
      if (result.isSuccess) {
        console.log("Item updated successfully!");
        setNewItem({ name: "", price: "", stock: "", category: "" });
        setImageFile(null);
        setValidationError({});
        handleCloseDialog();

        router.refresh();
        fetchItems();
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Uh oh! an error occurred",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const handleOpenDeleteDialog = (item: Item) => {
    setSelectedItem(item);
    setIsOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedItem(null);
    setIsOpenDeleteDialog(false);
  };

  const handleDeleteItem = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/Items/${selectedItem?.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result: ApiResponse = await response.json();
      if (result.isSuccess) {
        console.log("Item deleted successfully!");
        handleCloseDeleteDialog();
        router.refresh();
        fetchItems();
        toast({
          title: "Success",
          description: "Item deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Uh oh! an error occurred",
        description: "Failed to delete item",
        variant: "destructive",
      });
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
      {/* dialog for add new item */}
      <Dialog open={isOpenAddDialog} onOpenChange={setIsOpenAddDialog}>
        <DialogTrigger asChild>
          <Button variant="outline">Add New Item</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader className="bg-white">
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Add a new item to the list. Make sure to fill in all the fields.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="pt-4 space-y-2">
            <div>
              <input
                type="text"
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                placeholder="Item Name"
                className="w-full p-2 border rounded"
                required
                autoComplete="off"
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
                required
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
                required
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
                required
                autoComplete="off"
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
                required
              />
              {imageError && (
                <p className="text-red-500 text-sm mt-1">{imageError}</p>
              )}
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant={"outline"}>Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add New Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog for update item */}
      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader className="bg-white">
            <DialogTitle>Update Item: {selectedItem?.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Update the existing item in the list. Make sure to fill in all the
              fields.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateItem} className="pt-4 space-y-2">
            <div>
              <input
                type="text"
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                placeholder="Item Name"
                className="w-full p-2 border rounded"
                required
                autoComplete="off"
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
                required
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
                required
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
                required
                autoComplete="off"
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
                required
              />
              {imageError && (
                <p className="text-red-500 text-sm mt-1">{imageError}</p>
              )}
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant={"outline"}>Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Update Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog for delete item */}
      <Dialog open={isOpenDeleteDialog} onOpenChange={setIsOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader className="bg-white">
            <DialogTitle>Delete Item: {selectedItem?.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              This action can NOT be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant={"outline"}>Cancel</Button>
            </DialogClose>
            <Button
              className="bg-red-500 text-white rounded hover:bg-red-600"
              onClick={handleDeleteItem}
            >
              Delete Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* render data table */}
      <div className="container mx-auto py-4">
        <DataTable
          data={items}
          handleOpenUpdateDialog={handleOpenUpdateDialog}
          handleOpenDeleteDialog={handleOpenDeleteDialog}
        />
      </div>
    </Layout>
  );
};

export default ItemsPage;
