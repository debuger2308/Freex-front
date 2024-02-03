import { ThemeProvider } from '@/components/providers/ThemeProvider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './global.css'
import './reset.css'
import Footer from '@/components/footer/Footer'
import StoreProvider from './StoreProvider'

export const dynamic = 'force-dynamic'
const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
  title: 'Freex',
  description: 'Dating platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="wrapper">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <StoreProvider>
              {children}
            </StoreProvider>
            <Footer />
          </ThemeProvider>
        </div>
      </body>
    </html>
  )
}
