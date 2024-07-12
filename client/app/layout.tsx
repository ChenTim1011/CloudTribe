import "@/app/styles/globals.css"
import { Inter as FontSans } from "next/font/google"
import type { Metadata } from "next";
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "tribe APP",
  description: "for shopping",
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {children}
      </body>
    </html>
  )
}

