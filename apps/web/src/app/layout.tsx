import "./globals.css";
import { Providers } from "@/components/providers";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body className="antialiased min-h-screen bg-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
