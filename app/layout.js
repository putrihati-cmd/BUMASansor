import './globals.css';
import { PWAInstaller } from '@/components/PWAInstaller';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PWAUpdateNotification from '@/components/PWAUpdateNotification';
import { BottomNav } from '@/components/layout';
import AdminPreviewBanner from '@/components/AdminPreviewBanner';
import GoogleAuthHandler from '@/components/auth/GoogleAuthHandler';

export const metadata = {
    title: 'Infiatin Store - Pusat Kurma & Oleh-Oleh Haji Ramadhan 2026',
    description: 'Pusat grosir & eceran kurma premium di Sidareja, Cilacap. Kurma Ajwa, Sukkari, Khalas langsung import. Promo spesial Ramadhan 2026! Gratis ongkir min. 200rb.',
    keywords: 'kurma ramadhan 2026, kurma ajwa madinah, kurma sukkari, oleh-oleh haji, air zamzam, pusat kurma sidareja, grosir kurma cilacap',
    authors: [{ name: 'Infiatin Store' }],
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Infiatin Store',
    },
    openGraph: {
        title: 'Infiatin Store - Pusat Kurma & Oleh-Oleh Haji Ramadhan 2026',
        description: 'Dekat & Bersahabat. Kurma premium Ajwa, Sukkari, Khalas langsung import. Promo Ramadhan 2026!',
        siteName: 'Infiatin Store',
        locale: 'id_ID',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: '#667eea',
};

export default function RootLayout({ children }) {
    return (
        <html lang="id" suppressHydrationWarning>
            <head>
                <link rel="apple-touch-icon" href="/icon-192.png" />
            </head>
            <body className="min-h-screen flex flex-col" suppressHydrationWarning>
                <PWAInstaller />
                <PWAInstallPrompt />
                <PWAUpdateNotification />
                <AdminPreviewBanner />
                <GoogleAuthHandler />
                {children}
                <BottomNav />
            </body>
        </html>
    );
}


