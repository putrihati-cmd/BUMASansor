'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Send, Image as ImageIcon, ArrowLeft, RefreshCw, Store, User } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui';
import useUserStore from '@/store/user';

export default function ChatPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useUserStore();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login?redirect=/chat');
            return;
        }
        fetchMessages();

        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/chat', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Fetch messages error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ message: newMessage }),
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (error) {
            console.error('Send message error:', error);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (date) => {
        const today = new Date();
        const msgDate = new Date(date);

        if (msgDate.toDateString() === today.toDateString()) {
            return 'Hari ini';
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (msgDate.toDateString() === yesterday.toDateString()) {
            return 'Kemarin';
        }

        return msgDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, msg) => {
        const date = formatDate(msg.createdAt);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(msg);
        return groups;
    }, {});

    if (loading) {
        return (
            <>
                <Header />
                <main className="flex-1 bg-neutral-50 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="flex-1 bg-neutral-50 flex flex-col">
                {/* Chat Header */}
                <div className="bg-white border-b border-neutral-100 sticky top-0 z-10">
                    <div className="container-app py-4 flex items-center gap-4">
                        <button onClick={() => router.back()} className="lg:hidden">
                            <ArrowLeft className="w-5 h-5 text-neutral-500" />
                        </button>
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                            <Store className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-semibold text-neutral-800">Customer Service</h1>
                            <p className="text-xs text-green-500">Online</p>
                        </div>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto">
                    <div className="container-app py-4 space-y-6">
                        {Object.entries(groupedMessages).map(([date, msgs]) => (
                            <div key={date}>
                                {/* Date Divider */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-1 border-t border-neutral-200" />
                                    <span className="text-xs text-neutral-400 px-2">{date}</span>
                                    <div className="flex-1 border-t border-neutral-200" />
                                </div>

                                {/* Messages */}
                                <div className="space-y-3">
                                    {msgs.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div className={`max-w-[75%] ${msg.isAdmin ? 'order-2' : 'order-1'}`}>
                                                {msg.isAdmin && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                                            <Store className="w-3 h-3 text-white" />
                                                        </div>
                                                        <span className="text-xs text-neutral-500">Admin</span>
                                                    </div>
                                                )}
                                                <div
                                                    className={`px-4 py-2.5 rounded-xl ${msg.isAdmin
                                                            ? 'bg-white border border-neutral-200 rounded-tl-sm'
                                                            : 'bg-primary-500 text-white rounded-tr-sm'
                                                        }`}
                                                >
                                                    {msg.imageUrl && (
                                                        <div className="relative w-48 h-48 rounded-lg overflow-hidden mb-2">
                                                            <Image
                                                                src={msg.imageUrl}
                                                                alt="Attachment"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                </div>
                                                <p className={`text-[10px] mt-1 ${msg.isAdmin ? 'text-left' : 'text-right'} text-neutral-400`}>
                                                    {formatTime(msg.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {messages.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Store className="w-8 h-8 text-neutral-400" />
                                </div>
                                <h3 className="font-semibold text-neutral-800 mb-2">Mulai Chat</h3>
                                <p className="text-sm text-neutral-500">
                                    Ada pertanyaan? Tim kami siap membantu!
                                </p>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-neutral-100 sticky bottom-0">
                    <form onSubmit={handleSend} className="container-app py-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="p-2 text-neutral-400 hover:text-neutral-600"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Ketik pesan..."
                                className="flex-1 px-4 py-2.5 bg-neutral-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="p-2.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}

