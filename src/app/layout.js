import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";



export const metadata = {
  title: "Real estate investment analysis",
  description: "Better real estate investment decisions with AI-powered analysis.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
       
      >
        {children}
      </body>
    </html>
  );
}
