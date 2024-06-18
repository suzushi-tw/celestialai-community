import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { Toaster as Shadcntoast } from "@/components/ui/toaster"
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import Animatetransition from "@/components/Animatetransition";

const inter = Inter({ subsets: ["latin"] });



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (


    <html lang="en" >
      <Providers>
        <body className={inter.className} >
          <Toaster />
          <Shadcntoast />
          <Navbar />
          <Animatetransition >
            {children}
          </Animatetransition>
        </body>
      </Providers>
    </html>

  );
}
