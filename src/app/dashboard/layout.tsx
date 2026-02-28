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
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['SOCKSS PROXIES', 'TRAFFIC PLANS', 'REFERRAL', 'TOOL', 'Promotion Plan']);
    const router = useRouter();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
        { name: 'Products & Pricing', icon: <LayoutDashboard size={18} />, path: '/residential-proxies' },
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
    ];

    return (
        <div className="dashboard-wrapper">
            {/* Sidebar Backdrop for Mobile */}
            {isSidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${isSidebarOpen ? 'show' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                {/* Logo Area */}
                <div className="sidebar-logo">
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <img src="/logo.png" alt="Logo" style={{ height: '34px', width: 'auto' }} />
                    </Link>
                    <button
                        className="sidebar-close-btn"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Menu */}
                <div className="sidebar-nav custom-scrollbar">
                    {sidebarItems.map((item, idx) => {
                        if ('group' in item) {
                            const isExpanded = expandedGroups.includes((item as any).group);
                            return (
                                <div key={idx} style={{ marginBottom: '8px' }}>
                                    <div
                                        onClick={() => toggleGroup(item.group as string)}
                                        className="nav-group-header"
                                    >
                                        {item.group as string}
                                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    </div>
                                    {isExpanded && (item as any).items.map((subItem: any, sIdx: number) => (
                                        <Link
                                            key={sIdx}
                                            href={subItem.path}
                                            className={`nav-item ${subItem.active ? 'active' : ''}`}
                                            onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                                        >
                                            <span className="nav-icon">{subItem.icon}</span>
                                            <span className="nav-text">{subItem.name}</span>
                                            {subItem.badge && (
                                                <span className="nav-badge" style={{ backgroundColor: subItem.badgeColor }}>
                                                    {subItem.badge}
                                                </span>
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
                                    className="nav-item"
                                    onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-text">{item.name}</span>
                                </Link>
                            );
                        }
                    })}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="main-container">
                {/* Header */}
                <header className="dashboard-header">
                    <div className="header-left">
                        <button
                            className={`sidebar-toggle ${isSidebarCollapsed ? 'is-collapsed' : ''}`}
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    setIsSidebarOpen(!isSidebarOpen);
                                } else {
                                    setIsSidebarCollapsed(!isSidebarCollapsed);
                                }
                            }}
                        >
                            <Menu size={20} />
                            <span className="toggle-label">
                                {typeof window !== 'undefined' && window.innerWidth < 1024
                                    ? (isSidebarOpen ? 'Close' : 'Menu')
                                    : (isSidebarCollapsed ? 'Expand' : 'Collapse')}
                            </span>
                        </button>
                    </div>

                    <div className="header-right">
                        <div className="header-actions">
                            <RefreshCw size={20} className="header-icon" />
                            <HelpCircle size={20} className="header-icon" />
                            <Bell size={20} className="header-icon" />
                        </div>

                        <div className="language-selector">
                            <Globe size={16} />
                            <span className="lang-text">EN-English</span>
                            <ChevronDown size={14} />
                        </div>

                        <div className="user-profile">
                            <div className="user-info">
                                <CircleUser size={28} color="#0086ff" strokeWidth={1.5} />
                                <span className="user-name">{userEmail || 'User'}</span>
                                <ChevronDown size={14} color="#86909C" />
                            </div>
                            <button
                                onClick={handleLogout}
                                className="logout-btn"
                            >
                                <LogOut size={14} />
                                <span className="logout-text">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="dashboard-main custom-scrollbar">
                    {children}
                </main>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                
                body {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }

                .dashboard-wrapper {
                    display: flex;
                    height: 100vh;
                    background-color: #f2f3f5;
                    color: #1D2129;
                    font-family: 'Poppins', sans-serif;
                }

                .dashboard-sidebar {
                    width: 300px;
                    background-color: white;
                    display: flex;
                    flex-direction: column;
                    flex-shrink: 0;
                    z-index: 100;
                    border-right: 1px solid #f0f0f0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .dashboard-sidebar.collapsed {
                    width: 80px;
                }

                .sidebar-logo {
                    padding: 24px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    overflow: hidden;
                }

                .sidebar-logo img {
                    transition: all 0.3s ease;
                }

                .dashboard-sidebar.collapsed .sidebar-logo {
                    padding: 24px 10px;
                    justify-content: center;
                }

                .dashboard-sidebar.collapsed .sidebar-logo img {
                    width: 40px !important;
                    height: auto !important;
                }

                .sidebar-close-btn {
                    display: none;
                    background: none;
                    border: none;
                    padding: 4px;
                    color: #86909C;
                    cursor: pointer;
                }

                .sidebar-nav {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px 0;
                }

                .nav-group-header {
                    padding: 12px 32px;
                    font-size: 11px;
                    color: #86909C;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 700;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 0 32px;
                    height: 48px;
                    font-size: 14px;
                    color: #4E5969;
                    text-decoration: none;
                    transition: all 0.2s;
                    position: relative;
                }

                .nav-item:hover {
                    background-color: #f7f8fa;
                    color: #0086ff;
                }

                .nav-item.active {
                    color: #0086ff;
                    background-color: #e7f2ff;
                    font-weight: 600;
                }

                .nav-icon {
                    color: #86909C;
                }

                .nav-item.active .nav-icon {
                    color: #0086ff;
                }

                .nav-text {
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    transition: opacity 0.2s ease;
                }

                .dashboard-sidebar.collapsed .nav-text,
                .dashboard-sidebar.collapsed .nav-group-header,
                .dashboard-sidebar.collapsed .nav-badge {
                    opacity: 0;
                    pointer-events: none;
                    width: 0;
                    display: none;
                }

                .dashboard-sidebar.collapsed .nav-item {
                    justify-content: center;
                    padding: 0;
                }

                .dashboard-sidebar.collapsed .nav-icon {
                    margin: 0;
                }
                .nav-group-header {
                    padding: 12px 24px;
                    font-size: 11px;
                    color: #86909C;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 700;
                    transition: all 0.2s;
                }

                .main-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .dashboard-header {
                    height: 64px;
                    background-color: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 32px;
                    flex-shrink: 0;
                    border-bottom: 1px solid #f0f0f0;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                }

                .sidebar-toggle {
                    display: flex;
                    align-items: center;
                    background: white;
                    border: 1px solid #e5e6eb;
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    color: #4E5969;
                    font-weight: 600;
                    transition: all 0.2s;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }

                .sidebar-toggle:hover {
                    background-color: #f7f8fa;
                    border-color: #d1d5db;
                }

                .toggle-label {
                    font-size: 14px;
                    margin-left: 8px;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }

                .header-actions {
                    display: flex;
                    gap: 20px;
                    color: #86909C;
                }

                .header-icon {
                    cursor: pointer;
                }

                .language-selector {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0 12px;
                    height: 32px;
                    background-color: #f7f8fa;
                    border: 1px solid #e5e6eb;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    color: #4E5969;
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding-left: 16px;
                    border-left: 1px solid #f0f0f0;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                }

                .user-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1D2129;
                }

                .logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border: 1px solid #ff4d4f;
                    border-radius: 4px;
                    background-color: transparent;
                    color: #ff4d4f;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .dashboard-main {
                    flex: 1;
                    overflow-y: auto;
                    padding: 32px;
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

                @media (max-width: 1024px) {
                    .dashboard-sidebar {
                        position: fixed;
                        left: -300px;
                        top: 0;
                        bottom: 0;
                        box-shadow: 0 0 20px rgba(0,0,0,0.1);
                    }

                    .dashboard-sidebar.show {
                        left: 0;
                    }

                    .sidebar-backdrop {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.4);
                        z-index: 90;
                        backdrop-filter: blur(2px);
                    }

                    .sidebar-toggle {
                        background: transparent;
                        border: 1px solid #e5e6eb;
                    }

                    .dashboard-header {
                        padding: 0 16px;
                    }

                    .mobile-only {
                        display: flex;
                    }

                    .desktop-only {
                        display: none;
                    }

                    .sidebar-close-btn {
                        display: flex;
                    }

                    .dashboard-header {
                        padding: 0 16px;
                    }

                    .header-actions {
                        display: none;
                    }

                    .user-name {
                        display: none;
                    }

                    .logout-text {
                        display: none;
                    }

                    .dashboard-main {
                        padding: 20px 16px;
                    }
                }

                @media (max-width: 640px) {
                    .language-selector {
                        display: none;
                    }
                    
                    .user-profile {
                        padding-left: 0;
                        border-left: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default DashboardLayout;
