"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegularizeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/attendance/regularization");
  }, [router]);

  return null;
}
