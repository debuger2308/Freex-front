"use client"

import { useTheme } from 'next-themes';
import './footer.css'

const Footer = () => {

    const { theme, setTheme } = useTheme()


    return (
        <footer className="footer">
            <div className="footer__content">
                @Freex. All rights reserved 2023.
            </div>
        </footer>
    );
}

export default Footer;