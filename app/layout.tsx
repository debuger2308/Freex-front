import { ThemeProvider } from '@/components/providers/ThemeProvider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Footer from '@/components/footer/Footer'
import './reset.css'
import './global.css'
import { ColorTheme } from '@/providers/ColorTheme'
import Header from '@/components/header/header'



export const dynamic = 'force-dynamic'
const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
	title: 'Freex',
	description: 'Dating platform',
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {



	return (
		<html lang="en">
			<body className={inter.className}>
				<ColorTheme>
					<div className="wrapper">
						<Header />
						{children}
						<Footer />
					</div>
				</ColorTheme>
			</body>
		</html>
	)
}
