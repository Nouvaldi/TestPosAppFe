import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useRouter } from "next/navigation";
import { Item } from "@/app/pos/columns";

interface ApiResponse {
  isSuccess: boolean;
  message: string;
  data: {
    items: Item[];
    transactionId: number;
    date: string;
    totalPrice: number;
  };
}

interface TransactionDetailsDialogProps {
  transactionId: number;
}

export const TransactionDetailsDialog: React.FC<
  TransactionDetailsDialogProps
> = ({ transactionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [date, setDate] = useState("");
  const [transId, setTransId] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchTransactionDetails();
    }
  }, [isOpen]);

  const fetchTransactionDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/POS/transactions/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result: ApiResponse = await response.json();

      if (result.isSuccess) {
        setItems(result.data.items);
        setDate(result.data.date);
        setTransId(result.data.transactionId);
        setTotalPrice(result.data.totalPrice);
      }
    } catch (error) {
      console.error("Error fetching transaction details:", error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary">View Details</Button>
        </DialogTrigger>

        <DialogContent className="bg-white">
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            {items ? (
              <div>
                <p>
                  <strong>Date:</strong> {date}
                </p>
                <p>
                  <strong>Total Price:</strong> Rp. {totalPrice}
                </p>
                <h4>Items:</h4>
                <ul>
                  {items.map((item) => (
                    <li key={item.id}>
                      {item.itemName} - Quantity: {item.quantity}, Price: Rp.{" "}
                      {item.price}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};
