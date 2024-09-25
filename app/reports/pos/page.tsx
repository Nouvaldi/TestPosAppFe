"use client";

import Layout from "@/components/myLayout";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns, Transaction } from "./columns";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";

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

  const generatePdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Transaction Report", 10, 10);

    let y = 20;
    Transac.forEach((tran) => {
      const fDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(tran.date));
      const fPrice = new Intl.NumberFormat("en-ID", {
        style: "currency",
        currency: "IDR",
      });

      doc.setFontSize(10);
      doc.text(`Transaction ID: ${tran.transactionId}`, 10, y);
      doc.text(`Transaction Date: ${fDate}`, 10, y + 5);
      doc.text(`Total Amount: ${fPrice.format(tran.totalPrice)}`, 10, y + 10);

      const tableData = tran.items.map((item) => [
        item.itemName,
        item.category,
        fPrice.format(item.price),
        item.quantity,
        fPrice.format(item.price * item.quantity),
      ]);

      autoTable(doc, {
        head: [["Item Name", "Category", "Price", "Quantity", "Subtotal"]],
        body: tableData,
        startY: y + 15,
        margin: 0,
        pageBreak: "auto",
        theme: "striped",
      });

      y = doc.lastAutoTable.finalY + 20;
    });

    doc.save("transaction_report.pdf");
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
      <h1 className="text-2xl font-bold mb-4">Point of Sale Report</h1>
      <Button variant={"outline"} onClick={generatePdf}>
        Download PDF
      </Button>
      <div className="container mx-auto py-4">
        <DataTable columns={columns} data={Transac} />
      </div>
    </Layout>
  );
};

export default PosReportPage;
