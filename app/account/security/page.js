'use client';

import { useState } from 'react';
import { Lock, Mail, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';
import { Button, Input } from '@/components/ui';
import useUserStore from '@/store/user';

export default function SecurityPage() {
    const { user, logout } = useUserStore();
    const [loading, setLoading] = useState(false);

    // Change Password State
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Change Email State
    const [emailForm, setEmailForm] = useState({
        newEmail: '',
        password: ''
    });
    const [emailError, setEmailError] = useState('');
    const [emailSuccess, setEmailSuccess] = useState('');

    // Delete Account State
    const [deleteForm, setDeleteForm] = useState({
        password: '',
        confirmation: ''
    });
    const [deleteError, setDeleteError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Handle Change Password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('Password baru tidak cocok');
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            setPasswordError('Password minimal 8 karakter');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                },
                body: JSON.stringify({
                    oldPassword: passwordForm.oldPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setPasswordError(data.error || 'Gagal mengubah password');
                return;
            }

            setPasswordSuccess('Password berhasil diubah!');
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setPasswordError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Change Email
    const handleChangeEmail = async (e) => {
        e.preventDefault();
        setEmailError('');
        setEmailSuccess('');

        setLoading(true);
        try {
            const res = await fetch('/api/auth/change-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                },
                body: JSON.stringify(emailForm)
            });

            const data = await res.json();

            if (!res.ok) {
                setEmailError(data.error || 'Gagal mengirim verifikasi email');
                return;
            }

            setEmailSuccess(data.message);
            setEmailForm({ newEmail: '', password: '' });
        } catch (error) {
            setEmailError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Delete Account
    const handleDeleteAccount = async () => {
        setDeleteError('');

        if (deleteForm.confirmation !== 'DELETE') {
            setDeleteError('Ketik "DELETE" untuk konfirmasi');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                },
                body: JSON.stringify(deleteForm)
            });

            const data = await res.json();

            if (!res.ok) {
                setDeleteError(data.error || 'Gagal menghapus akun');
                return;
            }

            // Logout and redirect
            alert(data.message);
            logout();
            window.location.href = '/';
        } catch (error) {
            setDeleteError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <CartDrawer />
            <main className="flex-1 bg-neutral-50">
                <div className="container-app py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-neutral-800 mb-2">Keamanan Akun</h1>
                        <p className="text-neutral-500">Kelola password, email, dan keamanan akun Anda</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Change Password */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-neutral-800">Ganti Password</h2>
                                    <p className="text-sm text-neutral-500">Perbarui password Anda secara berkala</p>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <Input
                                    label="Password Lama"
                                    type="password"
                                    value={passwordForm.oldPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Password Baru"
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    required
                                    helperText="Minimal 8 karakter, ada huruf besar, kecil, dan angka"
                                />
                                <Input
                                    label="Konfirmasi Password Baru"
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    required
                                />

                                {passwordError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                        {passwordError}
                                    </div>
                                )}
                                {passwordSuccess && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                                        {passwordSuccess}
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Menyimpan...' : 'Ubah Password'}
                                </Button>
                            </form>
                        </div>

                        {/* Change Email */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-neutral-800">Ganti Email</h2>
                                    <p className="text-sm text-neutral-500">Email saat ini: <span className="font-medium text-neutral-700">{user?.email}</span></p>
                                </div>
                            </div>

                            <form onSubmit={handleChangeEmail} className="space-y-4">
                                <Input
                                    label="Email Baru"
                                    type="email"
                                    value={emailForm.newEmail}
                                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                                    required
                                    helperText="Link verifikasi akan dikirim ke email baru"
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    value={emailForm.password}
                                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                                    required
                                    helperText="Konfirmasi dengan password Anda"
                                />

                                {emailError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                        {emailError}
                                    </div>
                                )}
                                {emailSuccess && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                                        {emailSuccess}
                                    </div>
                                )}

                                <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
                                    {loading ? 'Mengirim...' : 'Kirim Verifikasi'}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Delete Account - Full Width Danger Zone */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border-2 border-red-100">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="font-bold text-red-600">Danger Zone</h2>
                                <p className="text-sm text-neutral-500 mt-1">Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus permanen.</p>
                            </div>
                            <Button
                                variant="danger"
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Hapus Akun
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-800">Hapus Akun Permanen?</h3>
                                <p className="text-sm text-neutral-500">Tindakan ini tidak dapat dibatalkan</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
                                    <li>Semua data pribadi akan dihapus</li>
                                    <li>Riwayat pesanan akan dianonimkan</li>
                                    <li>Wishlist dan keranjang akan dihapus</li>
                                    <li>Akun tidak dapat dipulihkan</li>
                                </ul>
                            </div>

                            <Input
                                label="Password"
                                type="password"
                                value={deleteForm.password}
                                onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                                placeholder="Masukkan password Anda"
                            />

                            <Input
                                label='Ketik "DELETE" untuk konfirmasi'
                                value={deleteForm.confirmation}
                                onChange={(e) => setDeleteForm({ ...deleteForm, confirmation: e.target.value })}
                                placeholder="DELETE"
                            />

                            {deleteError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                    {deleteError}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteForm({ password: '', confirmation: '' });
                                    setDeleteError('');
                                }}
                                className="flex-1"
                            >
                                Batal
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Menghapus...' : 'Hapus Akun'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}

