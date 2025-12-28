'use client';

import { useState, useEffect } from 'react';
import { Search, MessageSquare, Eye, Check, Mail, Phone, RefreshCw } from 'lucide-react';
import { Button, Badge, Modal } from '@/components/ui';
import { formatDate } from '@/lib/utils';

const statusConfig = {
    NEW: { label: 'Baru', color: 'warning' },
    IN_PROGRESS: { label: 'Dalam Proses', color: 'primary' },
    RESOLVED: { label: 'Selesai', color: 'success' },
    CLOSED: { label: 'Ditutup', color: 'secondary' },
};

export default function ContactMessagesPage() {
    const [messages, setMessages] = useState([]);
    const [stats, setStats] = useState({ total: 0, new: 0, inProgress: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, [statusFilter]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/messages?${params}`);
            const data = await res.json();

            if (data.success) {
                setMessages(data.messages || []);
                setStats(data.stats || { total: 0, new: 0, inProgress: 0, resolved: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMessages();
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdating(true);
        try {
            const res = await fetch('/api/admin/messages', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (res.ok) {
                alert(`✅ Status berhasil diubah ke ${statusConfig[newStatus].label}`);
                setSelectedMessage(null);
                fetchMessages();
            } else {
                alert('❌ Gagal mengubah status');
            }
        } catch (error) {
            alert('❌ Terjadi kesalahan');
        } finally {
            setUpdating(false);
        }
    };

    const filteredMessages = messages.filter((msg) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return msg.name?.toLowerCase().includes(searchLower) ||
            msg.email?.toLowerCase().includes(searchLower) ||
            msg.subject?.toLowerCase().includes(searchLower);
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-800">Contact Messages</h1>
                    <p className="text-neutral-500">Kelola pesan dari pelanggan</p>
                </div>
                <Button variant="secondary" onClick={fetchMessages} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Total Pesan</p>
                    <p className="text-2xl font-bold text-neutral-800">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Baru</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.new}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Dalam Proses</p>
                    <p className="text-2xl font-bold text-primary-500">{stats.inProgress}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Selesai</p>
                    <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Cari nama, email, atau subjek..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary-500"
                    >
                        <option value="">Semua Status</option>
                        <option value="NEW">Baru</option>
                        <option value="IN_PROGRESS">Dalam Proses</option>
                        <option value="RESOLVED">Selesai</option>
                        <option value="CLOSED">Ditutup</option>
                    </select>
                    <Button type="submit">Cari</Button>
                </form>
            </div>

            {/* Messages Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                        <p className="text-neutral-500">Memuat data...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Pengirim</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Subjek</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Tanggal</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredMessages.map((message) => (
                                    <tr key={message.id} className="hover:bg-neutral-50">
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-neutral-800">{message.name}</p>
                                            <p className="text-sm text-neutral-500 flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {message.email}
                                            </p>
                                            {message.phone && (
                                                <p className="text-sm text-neutral-500 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {message.phone}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-neutral-700">{message.subject}</p>
                                            <p className="text-sm text-neutral-500 line-clamp-1">{message.message}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={statusConfig[message.status]?.color || 'secondary'}>
                                                {statusConfig[message.status]?.label || message.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-neutral-500">
                                            {formatDate(message.createdAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedMessage(message)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-500 hover:bg-primary-50 rounded-lg"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && filteredMessages.length === 0 && (
                    <div className="p-12 text-center">
                        <MessageSquare className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Tidak ada pesan</h3>
                        <p className="text-neutral-500">Belum ada pesan dari pelanggan</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedMessage && (
                <Modal
                    isOpen={!!selectedMessage}
                    onClose={() => setSelectedMessage(null)}
                    title="Detail Pesan"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-500">Pengirim</label>
                            <p className="text-neutral-800">{selectedMessage.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-500">Email</label>
                                <p className="text-neutral-800">{selectedMessage.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-500">Telepon</label>
                                <p className="text-neutral-800">{selectedMessage.phone || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-500">Subjek</label>
                            <p className="text-neutral-800">{selectedMessage.subject}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-500">Pesan</label>
                            <p className="text-neutral-800 whitespace-pre-wrap">{selectedMessage.message}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-500">Status</label>
                            <div className="mt-1">
                                <Badge variant={statusConfig[selectedMessage.status]?.color}>
                                    {statusConfig[selectedMessage.status]?.label}
                                </Badge>
                            </div>
                        </div>
                        {selectedMessage.repliedAt && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-sm text-green-800">
                                    <Check className="w-4 h-4 inline mr-1" />
                                    Dibalas pada {formatDate(selectedMessage.repliedAt, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 mt-6">
                        {selectedMessage.status === 'NEW' && (
                            <Button onClick={() => handleStatusUpdate(selectedMessage.id, 'IN_PROGRESS')} disabled={updating}>
                                {updating ? 'Memproses...' : 'Proses Pesan'}
                            </Button>
                        )}
                        {selectedMessage.status === 'IN_PROGRESS' && (
                            <Button variant="success" onClick={() => handleStatusUpdate(selectedMessage.id, 'RESOLVED')} disabled={updating}>
                                <Check className="w-4 h-4" />
                                {updating ? 'Memproses...' : 'Tandai Selesai'}
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => setSelectedMessage(null)}>
                            Tutup
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

