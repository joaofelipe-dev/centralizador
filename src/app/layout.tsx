import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { OfflineProvider } from "@/context/OfflineContext";
import { PedidosNavProvider } from "@/context/PedidosNavContext";
import { Toaster } from "sonner";
import { MobileNavbar } from "@/components/MobileNavbar";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Centralizador de Pedidos",
  description: "Sistema de centralização de pedidos de compra",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm focus:font-bold"
        >
          Pular para o conteúdo principal
        </a>
        <AuthProvider>
          <OfflineProvider>
            <PedidosNavProvider>
              <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                <Header />
                <main id="main-content" className="flex-1 pb-24 md:pb-0">{children}</main>
                <Footer />
                <MobileNavbar />
              </div>
            </PedidosNavProvider>
            <OfflineBanner />
            <ServiceWorkerRegister />
            <Toaster
              theme="light"
              position="top-right"
              toastOptions={{
                classNames: {
                  toast: "!rounded-lg !border !border-border !bg-card !text-card-foreground !shadow-lg",
                  title: "!font-semibold",
                  error: "!border-destructive !bg-destructive !text-destructive-foreground",
                  success: "!border-success !bg-success !text-success-foreground",
                  warning: "!border-warning !bg-warning !text-warning-foreground",
                },
              }}
            />
          </OfflineProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
