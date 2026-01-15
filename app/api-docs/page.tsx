"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { swaggerSpec } from "@/lib/swagger";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#1F7A4D] text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Campus Navigator API</h1>
        <p className="text-green-100">Covenant University - API Documentation</p>
      </div>
      <SwaggerUI spec={swaggerSpec} />
    </div>
  );
}
