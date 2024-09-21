"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/myLayout";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      try {
        if (Date.now() > Number(localStorage.getItem("token_expires"))) {
          localStorage.removeItem("token");
          localStorage.removeItem("token_expires");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("token_expires");
        router.push("/login");
      }
    }
  }, [router]);

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Welcome!</p>
      </div>
    </Layout>
  );
}
