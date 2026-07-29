import { Analytics } from "@vercel/analytics/react"
import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import "./globals.css"
import { AppFooter } from "@/components/footers"
import { AppHeader } from "@/components/headers"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body className="flex min-h-svh flex-col">
        <ThemeProvider>
          <AppHeader />
          <main className="flex-1">{children}</main>
          <AppFooter />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
