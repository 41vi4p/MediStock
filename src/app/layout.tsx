import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { FamilyProvider } from "@/contexts/FamilyContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediStock - Medicine Inventory Management",
  description: "Manage your home medicine inventory with expiry tracking and family sharing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <FamilyProvider>
            {children}
          </FamilyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
