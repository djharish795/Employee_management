import { Metadata } from "next";
import { NewDeviceCard } from "../../../components/auth/new-device-card";

export const metadata: Metadata = {
  title: "New Device Detected | Naprocs EMS",
  description: "Verify and authorize login access from unrecognized devices.",
};

export default function NewDevicePage() {
  return (
    <div className="flex w-full h-screen bg-[#fafbfc] items-center justify-center p-4">
      <NewDeviceCard />
    </div>
  );
}
