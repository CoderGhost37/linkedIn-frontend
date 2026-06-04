import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils";

const geistHeading = Geist({ subsets: ['latin'], variable: '--font-heading' });

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "LinkedIn",
    template: "%s | LinkedIn",
  },
  description: "LinkedIn is the world's largest professional network on the internet. You can use LinkedIn to find the right job or internship, connect and strengthen professional relationships, and learn the skills you need to succeed in your career.",
  keywords: ["LinkedIn", "jobs", "professional network", "careers", "networking", "hiring", "recruiting"],
  applicationName: "LinkedIn",
  metadataBase: new URL("https://linkedin.kushagramathurcom"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://linkedin.kushagramathur.com",
    siteName: "LinkedIn",
    title: "LinkedIn",
    description: "500 million+ members | Manage your professional identity. Build and engage with your professional network. Access knowledge, insights and opportunities.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "LinkedIn",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkedIn",
    description: "The world's largest professional network.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
    shortcut: "/favicon/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable, geistHeading.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
