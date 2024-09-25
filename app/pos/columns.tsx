"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionDetailsDialog } from "@/components/transDetail";

export interface Transaction {
  transactionId: number;
  date: string;
  totalPrice: number;
  items: Item[];
}

export interface Item {
  id: string;
  itemName: string;
  price: number;
  stock: number;
  category: string;
  quantity: number;
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "transactionId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="mx-4">{row.getValue("transactionId")}</div>;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      const formatted = new Intl.DateTimeFormat("en-ID", {
        dateStyle: "full",
        timeStyle: "long",
        timeZone: "Asia/Jakarta",
      }).format(date);

      return <div className="mx-4">{formatted}</div>;
    },
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const totalPrice = parseFloat(row.getValue("totalPrice"));
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(totalPrice);

      return <div className="text-right mx-4">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const tranId = row.original.transactionId;

      return <TransactionDetailsDialog transactionId={tranId} />;
    },
  },
];
