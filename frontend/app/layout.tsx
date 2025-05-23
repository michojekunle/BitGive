import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
import { ThirdwebProvider } from "thirdweb/react"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "BitGive - Donate Bitcoin, Change the World",
  description: "A blockchain-powered donation platform built on Rootstock",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <ThirdwebProvider>
            {children}
            <Toaster/>
          </ThirdwebProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}