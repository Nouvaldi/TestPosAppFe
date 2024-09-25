"use client";

import Layout from "@/components/myLayout";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns, Item, Transaction } from "./columns";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/transactionForm";
import { toast } from "@/hooks/use-toast";
import { useForm, FormProvider } from "react-hook-form";

interface ApiResponse {
  isSuccess: boolean;
  message: string;
  data: { transactions: Transaction[]; items: Item[] };
}

const PosPage: React.FC = () => {
  const [Transac, setTransac] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const router = useRouter();
  const formMethods = useForm();

  const submitTransaction = async (transaction: {
    items: { itemId: number; quantity: number }[];
  }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/POS/transactions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transaction),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit transaction");
      }

      const result: ApiResponse = await response.json();

      if (result.isSuccess) {
        console.log("Transaction submitted successfully");
        setIsOpen(false);
        fetchTransactions();
        router.refresh();
        toast({
          title: "Success",
          description: "Item added successfully",
        });
      }
    } catch (error) {
      console.error("Error submitting transaction:", error);
      toast({
        title: "Uh oh! an error occurred",
        description: "Failed to submit transaction",
        variant: "destructive",
      });
    }
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/POS/transactions?pageNumber=1&pageSize=10",
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
        setTransac(result.data.transactions);
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
    fetchTransactions();
  }, [router]);

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
      <h1 className="text-2xl font-bold mb-4">Point of Sale</h1>

      {/* dialog for add new transaction */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add New Transaction</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader className="bg-white">
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Submit a new transaction to the database. Changes can NOT be undone.
          </DialogDescription>
          <FormProvider {...formMethods}>
            <TransactionForm submitTransaction={submitTransaction} />
          </FormProvider>
          <DialogFooter>
            <Button variant={"outline"} onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* <FormProvider {...formMethods}>
        <TransactionForm submitTransaction={submitTransaction} />
      </FormProvider> */}

      {/* dialog for transaction detail */}
      <Dialog open={isOpenDetail} onOpenChange={setIsOpenDetail}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader className="bg-white">
            <DialogTitle>
              Transaction Detail: {selectedTransaction?.transactionId}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>View transaction detail.</DialogDescription>

          <DialogFooter>
            <Button variant={"outline"} onClick={() => setIsOpenDetail(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto py-4">
        <h2 className="text-md mb-2 text-gray-500">Transaction History</h2>
        <DataTable columns={columns} data={Transac} />
      </div>
    </Layout>
  );
};

export default PosPage;
