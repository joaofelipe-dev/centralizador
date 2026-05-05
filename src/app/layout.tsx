import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { HeaderNav } from "@/components/Header/HeaderNav";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Centralizador de Pedidos",
  description: "Sistema premium de centralização de pedidos de compra",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground selection:bg-primary/30`}>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <HeaderNav className="sticky top-0 z-50" />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster theme="dark" position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
