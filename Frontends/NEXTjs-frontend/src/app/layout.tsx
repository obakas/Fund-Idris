import React from 'react'; 
import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";
import Header from "@/components/Header";
import { Toaster } from 'react-hot-toast'


export const metadata: Metadata = {
  title: "FUND-IDRIS",
  icons: {
    icon: "/cf.png",
  },
}

export default function RootLayout(props: {children: React.ReactNode}){
  return (
    <html lang="en">
      <body>
        <Providers>
              <Header />
              {props.children}
              <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}