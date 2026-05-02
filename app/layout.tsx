import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from 'next/font/local';



const plusJakarta = localFont({
  src: '../public/font/PlusJakartaSans-Medium.ttf',
  variable: '--font-plus-jakarta',
  weight: '500',
});


export const metadata: Metadata = {
  title: "Vetta — Precision Talent Intelligence",
 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <html lang="en" className={plusJakarta.variable}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
