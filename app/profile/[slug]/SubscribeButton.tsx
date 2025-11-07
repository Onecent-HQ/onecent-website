"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Toast from "@/components/Toast";

export default function SubscribeButton() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const handleSubscribe = () => {
    setToast({ message: "Feature coming soon!", type: "info" });
  };

  return (
    <>
      <Button 
        variant="primary" 
        className="w-full justify-center text-sm"
        onClick={handleSubscribe}
      >
        Subscribe to Unlock
      </Button>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

