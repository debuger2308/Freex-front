'use client'
import Link from 'next/link';
import './header.css'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { usePathname } from 'next/navigation';


const Header = ({ session }: { session: { isAuth: boolean, token: string } | null }) => {
    const pathname = usePathname()

    return (
        session && session.isAuth
            ?
            <header className="header">
                <Link className="logo" href="/">Freex</Link>

                <nav className="header__nav">
                    <Link href="./search" className={`nav__link ${pathname === '/search' ? 'nav__link--active' : ''}`}>
                        Search
                    </Link>
                    <Link href="./chats" className={`nav__link ${pathname === '/chats' ? 'nav__link--active' : ''}`}>
                        Chats
                    </Link>
                    <Link href="./profile" className={`nav__link ${pathname === '/profile' ? 'nav__link--active' : ''}`}>
                        My Profile
                    </Link>
                </nav>
            </header>
            :
            null
    );
}

export default Header;