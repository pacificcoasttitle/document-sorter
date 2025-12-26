import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { EntriesProvider } from "@/contexts/EntriesContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/AuthProvider";
import { UserHeader } from "@/components/UserHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tessa Knowledge Tool",
  description: "Upload documents to build your knowledge base",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <WorkspaceProvider>
            <EntriesProvider>
              <UserHeader />
              <div className="pt-14">
                {children}
              </div>
              <Toaster />
            </EntriesProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
