"use client";

import Layout from "@/components/myLayout";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns, Transaction } from "./columns";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ApiResponse {
  isSuccess: boolean;
  message: string;
  data: { transactions: Transaction[] };
}

const PosPage: React.FC = () => {
  const [Transac, setTransac] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
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
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Add New Transaction</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader className="bg-white">
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <form className="mb-8 space-y-4">
            <div>
              <input
                type="search"
                name="name"
                placeholder="Item Name"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <input
                type="number"
                name="quantity"
                placeholder="1"
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              type="button"
              className="w-full p-2 rounded bg-slate-100 hover:bg-slate-200"
            >
              Add Another Item
            </button>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Submit
            </button>
          </form>
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
