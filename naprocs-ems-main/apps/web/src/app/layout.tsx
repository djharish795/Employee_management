import "./globals.css";
import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

