export const metadata = {
    metadataBase: new URL('https://infiatin.store'),
    title: {
        default: 'Infiatin Store - Oleh-oleh Haji & Umroh Terpercaya',
        template: '%s | Infiatin Store',
    },
    description: 'Toko online terpercaya untuk produk kecantikan dan perawatan kulit. Produk original, harga terjangkau, gratis ongkir ke seluruh Indonesia.',
    keywords: ['skincare', 'makeup', 'kecantikan', 'beauty', 'kosmetik', 'perawatan kulit', 'serum', 'moisturizer', 'sunscreen'],
    authors: [{ name: 'Infiatin Store' }],
    creator: 'Infiatin Store',
    publisher: 'Infiatin Store',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        locale: 'id_ID',
        url: 'https://infiatin.store',
        title: 'Infiatin Store - Oleh-oleh Haji & Umroh Terpercaya',
        description: 'Toko online terpercaya untuk produk kecantikan dan perawatan kulit.',
        siteName: 'Infiatin Store',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Infiatin Store',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Infiatin Store - Oleh-oleh Haji & Umroh Terpercaya',
        description: 'Toko online terpercaya untuk produk kecantikan dan perawatan kulit.',
        images: ['/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <meta name="theme-color" content="#FF5722" />
            </head>
            <body>{children}</body>
        </html>
    );
}

