'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    Tag,
    RotateCcw,
    Settings,
    Bell,
    ChevronDown,
    Menu,
    X,
    LogOut,
    Mail,
    MessageSquare,
    FileText,
    Folders,
    Zap,
    Store
} from 'lucide-react';
import useUserStore from '@/store/user';

const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Pesanan' },
    { href: '/admin/products', icon: Package, label: 'Produk' },
    { href: '/admin/categories', icon: Folders, label: 'Kategori' },
    { href: '/admin/flash-sales', icon: Zap, label: 'Flash Sale' },
    { href: '/admin/customers', icon: Users, label: 'Pelanggan' },
    { href: '/admin/reports', icon: FileText, label: 'Laporan' },
    { href: '/admin/vouchers', icon: Tag, label: 'Voucher' },
    { href: '/admin/refunds', icon: RotateCcw, label: 'Refund' },
    { href: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
    { href: '/admin/messages', icon: MessageSquare, label: 'Pesan' },
];

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const { user, logout } = useUserStore();

    // Frontend role validation - critical security check
    useEffect(() => {
        if (!user) {
            // No user logged in - redirect to homepage
            router.push('/');
            return;
        }

        if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            // User is not admin - redirect to homepage
            console.warn('Unauthorized access attempt to admin panel by role:', user.role);
            router.push('/');
            return;
        }

        // User is valid admin
        setIsValidating(false);
    }, [user, router]);

    // Show loading state while validating
    if (isValidating || !user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-neutral-600">Memvalidasi akses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-100">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-neutral-900 text-white transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-800">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">i</span>
                        </div>
                        <span className="font-display font-bold">Admin Panel</span>
                    </Link>
                    <button
                        className="lg:hidden p-1 hover:bg-neutral-800 rounded"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary-500 text-white'
                                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Settings at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800 space-y-1">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                    >
                        <Store className="w-5 h-5" />
                        Lihat Toko
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        Pengaturan
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Header */}
                <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-6">
                    <button
                        className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        {/* Notifications */}
                        <button className="relative p-2 hover:bg-neutral-100 rounded-lg">
                            <Bell className="w-5 h-5 text-neutral-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User Menu */}
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-neutral-800">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-neutral-500">{user?.role || 'ADMIN'}</p>
                            </div>
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-primary-600 font-semibold">
                                    {user?.name?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

