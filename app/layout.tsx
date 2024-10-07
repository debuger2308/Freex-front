import { ThemeProvider } from '@/components/providers/ThemeProvider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Footer from '@/components/footer/Footer'
import './reset.css'
import './global.css'
import { ColorTheme } from '@/providers/ColorTheme'
import Header from '@/components/header/Header'
import { cookies } from 'next/headers'
import { SocketProvider } from '@/providers/SocketProvider'



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

	const cookie = cookies().get('auth-info') || null
	const session: { isAuth: boolean, token: string } | null = JSON.parse(cookie?.value || '{}') || null

	return (
		<html lang="en">
			<body className={inter.className}>
				<ColorTheme>
					<SocketProvider session={session}>
						<div className="wrapper">
							<Header session={session} />
							{children}
							<Footer />
						</div>
					</SocketProvider>
				</ColorTheme>
			</body>
		</html>
	)
}
