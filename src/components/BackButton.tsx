"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./Button/Button";

export const BackButton = () => {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push('/admin')}
      variant="default"
      size="icon"
      className="h-10 w-10 rounded-xl transition-colors"
    >
        <ArrowLeft className="h-5 w-5 text-white" strokeWidth={2.5} />
    </Button>
  );
};