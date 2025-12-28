/**
 * PWA Install Prompt Component
 * Shows native-like install banner for mobile users
 */

'use client';

import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        const standalone = window.matchMedia('(display-mode: standalone)').matches;
        setIsStandalone(standalone);

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(iOS);

        // Listen for install prompt event (Android/Desktop)
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Don't show if already dismissed
            const dismissed = localStorage.getItem('pwa-install-dismissed');
            if (!dismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('PWA installed');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // Don't show if already installed
    if (isStandalone) return null;

    // iOS Install Instructions
    if (isIOS && !showPrompt) {
        return null; // Could show iOS-specific instructions banner
    }

    // Android/Desktop Install Banner
    if (!showPrompt || !deferredPrompt) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-2xl z-50 animate-slide-up">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Install Infiatin Store</h3>
                        <p className="text-sm opacity-90">Belanja lebih mudah dan cepat tanpa browser!</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleInstall}
                        className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                    >
                        Install
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="text-white px-4 py-2 rounded-lg hover:bg-white/20 transition"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}
