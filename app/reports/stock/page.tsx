"use client";

import Layout from "@/components/myLayout";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns, Items } from "./columns";
import { useRouter } from "next/navigation";

interface ApiResponse {
  isSuccess: boolean;
  message: string;
  data: {
    stockReport: Items[];
  };
}

const StockReportPage: React.FC = () => {
  const [items, setItems] = useState<Items[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          "http://localhost:5000/api/Items/stock?pageNumber=1&pageSize=10",
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
          setItems(result.data.stockReport);
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
      <h1 className="text-2xl font-bold">Stock Report</h1>
      <div className="container mx-auto py-4">
        <DataTable columns={columns} data={items} />
      </div>
    </Layout>
  );
};

export default StockReportPage;
