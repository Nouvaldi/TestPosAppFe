"use client";

import Layout from "@/components/myLayout";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns, Transaction } from "./columns";
import { useRouter } from "next/navigation";

interface ApiResponse {
  isSuccess: boolean;
  message: string;
  data: { posReport: Transaction[] };
}

const PosReportPage: React.FC = () => {
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
          "http://localhost:5000/api/POS/reports?pageNumber=1&pageSize=10",
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
          setTransac(result.data.posReport);
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
      <h1 className="text-2xl font-bold mb-4">Point of Sale Report</h1>
      <div className="container mx-auto py-4">
        <DataTable columns={columns} data={Transac} />
      </div>
    </Layout>
  );
};

export default PosReportPage;
