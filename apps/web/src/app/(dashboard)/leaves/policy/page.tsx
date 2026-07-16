"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PolicyRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/leaves/policies");
  }, [router]);

  return null;
}
