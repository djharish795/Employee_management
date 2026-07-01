import React from "react";
import { Metadata } from "next";
import { ConnectWorkspace } from "@/components/modules/connect/connect-workspace";

export const metadata: Metadata = {
  title: "Connect | Naprocs EMS",
  description: "Find colleague availability and schedule meetings.",
};

export default function ConnectPage() {
  return <ConnectWorkspace />;
}
