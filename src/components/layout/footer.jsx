import React, { useState, useEffect } from 'react';
import './footer.css';

const Footer = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            const scrolledToBottom =
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5;

            setVisible(scrolledToBottom);
        };

        window.addEventListener('scroll', toggleVisibility);
        toggleVisibility();

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <footer className={`footer ${visible ? 'visible' : ''}`}>
            <p>React Vite - @Nguyen Tan Nghia</p>
        </footer>
    );
};

export default Footer;