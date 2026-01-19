"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Globe,
    Shield,
    Users,
    Trophy,
    Download,
    User,
    ChevronDown,
    ChevronRight,
    Bell,
    CreditCard,
    Zap,
    RefreshCw,
    Infinity,
    CircleUser,
    MousePointer2,
    Settings,
    HelpCircle,
    LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['SOCKSS PROXIES', 'TRAFFIC PLANS', 'REFERRAL', 'TOOL', 'Promotion Plan']);
    const router = useRouter();
    const [userEmail, setUserEmail] = useState<string | null>(null);

    React.useEffect(() => {
        const email = localStorage.getItem('user_email');
        if (email) {
            setUserEmail(email);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        router.push('/login');
    };

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev =>
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
    };

    interface SidebarLink {
        name: string;
        icon: React.ReactNode;
        path: string;
        active?: boolean;
        badge?: string;
        badgeColor?: string;
    }

    interface SidebarGroup {
        group: string;
        items: SidebarLink[];
    }

    type SidebarItem = ({ group: string; items: SidebarLink[] } & { name?: undefined }) | (SidebarLink & { group?: undefined });

    const sidebarItems: SidebarItem[] = [
        { name: 'Overview', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
        // {
        //     group: 'SOCKSS PROXIES',
        //     items: [
        //         { name: 'ISP Proxies', icon: <RefreshCw size={18} />, path: '#' },
        //         { name: 'Static Residential Proxies', icon: <RefreshCw size={18} />, path: '#' },
        //     ]
        // },
        {
            group: 'TRAFFIC PLANS',
            items: [
                { name: 'Residential Proxies', icon: <RefreshCw size={18} />, path: '/dashboard/traffic-setup', active: true }
            ]
        },
        {
            group: 'REFERRAL',
            items: [
                { name: 'Affiliate Program', icon: <Users size={18} />, path: '#' }
            ]
        },
        // {
        //     group: 'TOOL',
        //     items: [
        //         { name: 'Online Proxy Checker', icon: <Shield size={18} />, path: '#' },
        //         { name: 'Proxy manager', icon: <Download size={18} />, path: '#' },
        //         { name: 'Browser Extensions', icon: <MousePointer2 size={18} />, path: '#' },
        //     ]
        // },
        // {
        //     group: 'Promotion Plan',
        //     items: [
        //         { name: 'CDKey Details', icon: <Zap size={18} />, path: '#' },
        //         { name: 'Balance Recharge', icon: <CreditCard size={18} />, path: '#', badge: 'New', badgeColor: '#F53F3F' },
        //         { name: 'Agent Console', icon: <User size={18} />, path: '#' },
        //     ]
        // }
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f2f3f5', color: '#1D2129', fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            {/* Sidebar */}
            <aside style={{ width: '345px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10, borderRight: '1px solid #f0f0f0' }}>
                {/* Logo Area */}
                <div style={{ padding: '24px 32px', display: 'flex', alignItems: 'center' }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <img src="/logo.png" alt="Logo" style={{ height: '34px', width: 'auto' }} />
                    </Link>
                </div>

                {/* Navigation Menu */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }} className="custom-scrollbar">
                    {sidebarItems.map((item, idx) => {
                        if ('group' in item) {
                            const isExpanded = expandedGroups.includes((item as any).group);
                            return (
                                <div key={idx} style={{ marginBottom: '8px' }}>
                                    <div
                                        onClick={() => toggleGroup(item.group as string)}
                                        style={{
                                            padding: '8px 32px',
                                            fontSize: '11px',
                                            color: '#86909C',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            fontWeight: '700'
                                        }}
                                    >
                                        {item.group as string}
                                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    </div>
                                    {isExpanded && (item as any).items.map((subItem: any, sIdx: number) => (
                                        <Link
                                            key={sIdx}
                                            href={subItem.path}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '0 32px',
                                                height: '48px',
                                                fontSize: '14px',
                                                color: subItem.active ? '#0086ff' : '#4E5969',
                                                backgroundColor: subItem.active ? '#e7f2ff' : 'transparent',
                                                textDecoration: 'none',
                                                transition: 'all 0.2s',
                                                position: 'relative',
                                                fontWeight: subItem.active ? '600' : '400'
                                            }}
                                        >
                                            <span style={{ color: subItem.active ? '#0086ff' : '#86909C' }}>{subItem.icon}</span>
                                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subItem.name}</span>
                                            {subItem.badge && (
                                                <span style={{
                                                    backgroundColor: subItem.badgeColor,
                                                    color: 'white',
                                                    fontSize: '10px',
                                                    padding: '1px 6px',
                                                    borderRadius: '10px',
                                                    fontWeight: '700',
                                                    marginLeft: '4px'
                                                }}>{subItem.badge}</span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            );
                        } else {
                            return (
                                <Link
                                    key={idx}
                                    href={item.path}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '0 32px',
                                        height: '48px',
                                        fontSize: '14px',
                                        color: '#4E5969',
                                        textDecoration: 'none',
                                        fontWeight: '600'
                                    }}
                                >
                                    <span style={{ color: '#86909C' }}>{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        }
                    })}
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <header style={{ height: '64px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 32px', gap: '24px', flexShrink: 0, borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', gap: '20px', color: '#86909C' }}>
                        <RefreshCw size={20} style={{ cursor: 'pointer' }} />
                        <HelpCircle size={20} style={{ cursor: 'pointer' }} />
                        <Bell size={20} style={{ cursor: 'pointer' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', height: '32px', backgroundColor: '#f7f8fa', border: '1px solid #e5e6eb', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', color: '#4E5969' }}>
                        <Globe size={16} />
                        <span style={{ fontWeight: '500' }}>EN-English</span>
                        <ChevronDown size={14} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '16px', borderLeft: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <CircleUser size={28} color="#0086ff" strokeWidth={1.5} />
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1D2129' }}>{userEmail || 'User'}</span>
                            <ChevronDown size={14} color="#86909C" />
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                marginLeft: '12px',
                                border: '1px solid #ff4d4f',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                color: '#ff4d4f',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <LogOut size={14} />
                            Logout
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="custom-scrollbar">
                    {children}
                </main>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                
                body {
                    margin: 0;
                    padding: 0;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #dfe1e4;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #c9cdd4;
                }
            `}</style>
        </div>
    );
};

export default DashboardLayout;
