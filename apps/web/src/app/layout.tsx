import "./globals.css";
import { Providers } from "@/components/providers";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { MobileBlocker } from "@/components/common/mobile-blocker";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body className={cn("antialiased min-h-screen bg-slate-50 font-sans", inter.className)}>
        <MobileBlocker />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
