import { useState, useEffect } from "react";
import { ItemSelect } from "./itemSelect";
import { Button } from "./ui/button";
import { Item, Transaction } from "../app/pos/columns";
import { useRouter } from "next/navigation";

interface ApiResponse {
  isSuccess: boolean;
  message: string;
  data: { transactions: Transaction[]; items: Item[] };
}

interface TransactionFormProps {
  submitTransaction: (transaction: {
    items: { itemId: number; quantity: number }[];
  }) => Promise<void>;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  submitTransaction,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<
    { itemId: number; quantity: number }[]
  >([{ itemId: 0, quantity: 1 }]);
  const router = useRouter();

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
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [router]);

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { itemId: 0, quantity: 1 }]);
  };

  const handleItemChange = (
    index: number,
    itemId: number,
    quantity: number
  ) => {
    const newItems = [...selectedItems];
    newItems[index] = { itemId, quantity };
    setSelectedItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitTransaction({ items: selectedItems });
  };

  return (
    <form onSubmit={handleSubmit}>
      {selectedItems.map((item, index) => (
        <ItemSelect
          key={index}
          items={items}
          onItemChange={(itemId, quantity) =>
            handleItemChange(index, itemId, quantity)
          }
          onRemove={() => handleRemoveItem(index)}
        />
      ))}

      <div className="flex items-center justify-end mt-4 gap-4">
        <Button variant={"outline"} type="button" onClick={handleAddItem}>
          Add Another Item
        </Button>

        <Button
          type="submit"
          className="bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit Transaction
        </Button>
      </div>
    </form>
  );
};
