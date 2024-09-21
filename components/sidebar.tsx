"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Sidebar = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expires");
    router.push("/login");
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <Link href="/dashboard">
        <h1 className="text-2xl font-bold mb-6">POS System</h1>
      </Link>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              href="/items"
              className="block py-2 px-4 hover:bg-gray-700 rounded"
            >
              Items
            </Link>
          </li>
          <li>
            <Link
              href="/pos"
              className="block py-2 px-4 hover:bg-gray-700 rounded"
            >
              POS
            </Link>
          </li>
          <li>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="py-2 px-4 hover:bg-gray-700 rounded mb-2">
                  Reports
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/reports/pos"
                        className="block py-2 px-4 hover:bg-gray-700 rounded"
                      >
                        POS Report
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/reports/stock"
                        className="block py-2 px-4 hover:bg-gray-700 rounded"
                      >
                        Stock Report
                      </Link>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 px-4 hover:bg-gray-700 rounded"
            >
              Log out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
