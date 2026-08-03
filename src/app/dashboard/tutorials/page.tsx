"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Video,
    ExternalLink,
    Search,
    Sparkles,
    BookOpen,
    CreditCard,
    Monitor,
    Smartphone,
    HelpCircle,
    X,
    Layers,
    Clock,
    ShieldCheck
} from 'lucide-react';
import { triggerContactModal } from '@/components/ui/ContactModal';

interface TutorialVideo {
    id: string;
    youtubeId: string;
    title: string;
    description: string;
    category: string;
    duration: string;
    url: string;
}

const TUTORIALS_DATA: TutorialVideo[] = [
    {
        id: '1',
        youtubeId: 'sKvu4EgSgnA',
        title: 'Realproxy.net Account Signup & Overview',
        description: 'Learn how to create a new account, navigate the dashboard, and manage your user profile in under 2 minutes.',
        category: 'Account & Setup',
        duration: '2:15',
        url: 'https://youtu.be/sKvu4EgSgnA'
    },
    {
        id: '2',
        youtubeId: 'O-K_a47XAe4',
        title: 'bKash & Nagad Instant Payment Guide',
        description: 'Complete guide on how to add funds or purchase proxy bandwidth instantly using bKash & Nagad.',
        category: 'Payment & Billing',
        duration: '3:40',
        url: 'https://youtu.be/O-K_a47XAe4'
    },
    {
        id: '3',
        youtubeId: 'ILJ5NSYIdDM',
        title: 'Binance Pay & Crypto Payment Guide',
        description: 'Step-by-step instructions for depositing funds with Binance Pay, USDT (TRC20/BEP20), and crypto.',
        category: 'Payment & Billing',
        duration: '4:10',
        url: 'https://youtu.be/ILJ5NSYIdDM'
    },
    {
        id: '4',
        youtubeId: 'cv2Vrh_pUMQ',
        title: 'PC & Windows Proxy Configuration',
        description: 'Detailed tutorial on configuring HTTP/SOCKS5 proxies on Windows 10/11, Chrome, and anti-detect browsers.',
        category: 'Proxy Configuration',
        duration: '5:20',
        url: 'https://youtu.be/cv2Vrh_pUMQ'
    },
    {
        id: '5',
        youtubeId: 'XkCeuLWm2u4',
        title: 'Android & Mobile Super Proxy (Tun2tap) Setup',
        description: 'How to setup proxies on Android smartphones using Super Proxy App with full device tunneling.',
        category: 'Mobile Apps',
        duration: '4:45',
        url: 'https://youtu.be/XkCeuLWm2u4'
    },
    {
        id: '6',
        youtubeId: 'e2VZGv58Gdk',
        title: 'Realproxy APP Proxy Setup with Premium Package',
        description: 'Step-by-step tutorial on setting up and configuring Realproxy APP with Premium Package proxies.',
        category: 'Mobile Apps',
        duration: '4:30',
        url: 'https://youtu.be/e2VZGv58Gdk'
    },
    {
        id: '7',
        youtubeId: 'kBbU7k458nQ',
        title: 'Tun2tap APP Proxy Setup with Premium Package',
        description: 'Complete guide to setting up Tun2tap Android app with Real Proxy Premium Package.',
        category: 'Mobile Apps',
        duration: '5:00',
        url: 'https://youtu.be/kBbU7k458nQ'
    },
    {
        id: '8',
        youtubeId: 'kBbU7k458nQ',
        title: 'Super Proxy APP Proxy Setup with Premium Package',
        description: 'Learn how to configure Super Proxy app using Premium Package proxies for seamless mobile tunneling.',
        category: 'Mobile Apps',
        duration: '4:15',
        url: 'https://youtu.be/kBbU7k458nQ'
    }
];

const CATEGORIES = [
    { name: 'All Guides', icon: Layers, color: '#6366F1', bg: 'rgba(99, 102, 241, 0.15)' },
    { name: 'Account & Setup', icon: BookOpen, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
    { name: 'Payment & Billing', icon: CreditCard, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
    { name: 'Proxy Configuration', icon: Monitor, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
    { name: 'Mobile Apps', icon: Smartphone, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' }
];

const getCategoryStyle = (catName: string) => {
    switch (catName) {
        case 'Account & Setup':
            return { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' };
        case 'Payment & Billing':
            return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' };
        case 'Proxy Configuration':
            return { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' };
        case 'Mobile Apps':
            return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' };
        default:
            return { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' };
    }
};

export default function DashboardTutorialsPage() {
    const [selectedCategory, setSelectedCategory] = useState('All Guides');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeVideo, setActiveVideo] = useState<TutorialVideo | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkDarkMode = () => {
            setIsDarkMode(document.body.classList.contains('dark-mode'));
        };
        checkDarkMode();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    checkDarkMode();
                }
            });
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    const filteredTutorials = useMemo(() => {
        return TUTORIALS_DATA.filter((item) => {
            const matchesCategory = selectedCategory === 'All Guides' || item.category === selectedCategory;
            const matchesSearch =
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    const theme = isDarkMode ? {
        bg: '#0F172A',
        cardBg: '#1E293B',
        cardBorder: '#334155',
        thumbBorder: '#475569',
        text: '#F8FAFC',
        textMuted: '#94A3B8',
        inputBg: '#0F172A',
        pillBg: 'rgba(59, 130, 246, 0.15)',
        pillText: '#60A5FA',
        btnBg: '#334155',
        btnText: '#F8FAFC'
    } : {
        bg: '#F8FAFC',
        cardBg: '#FFFFFF',
        cardBorder: '#E2E8F0',
        thumbBorder: '#CBD5E1',
        text: '#0F172A',
        textMuted: '#64748B',
        inputBg: '#FFFFFF',
        pillBg: 'rgba(37, 99, 235, 0.08)',
        pillText: '#2563EB',
        btnBg: '#F1F5F9',
        btnText: '#0F172A'
    };

    return (
        <div className="tutorials-responsive-container">
            {/* Clean Authentic Hero Banner */}
            <div className="tutorials-hero-banner" style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '20px',
                padding: '32px 28px',
                background: isDarkMode
                    ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
                    : 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                boxShadow: isDarkMode
                    ? '0 12px 36px rgba(0, 0, 0, 0.4)'
                    : '0 12px 30px rgba(37, 99, 235, 0.2)',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.15)'
            }}>
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ maxWidth: '600px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.14)',
                            backdropFilter: 'blur(10px)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            marginBottom: '12px',
                            color: '#FFFFFF'
                        }}>
                            <ShieldCheck size={14} color="#60A5FA" />
                            <span style={{ textTransform: 'uppercase' }}>Official Video Guides</span>
                        </div>

                        <h1 className="hero-title" style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px 0', lineHeight: 1.25 }}>
                            Video Tutorials & <span style={{
                                background: 'linear-gradient(90deg, #60A5FA 0%, #818CF8 50%, #C084FC 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>Setup Guides</span>
                        </h1>

                        <p className="hero-subtitle" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.88)', margin: 0, lineHeight: 1.5 }}>
                            Watch step-by-step guides to configure proxies on PC and mobile devices, add funds, and manage your account.
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'rgba(255, 255, 255, 0.9)',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                padding: '5px 12px',
                                borderRadius: '8px'
                            }}>
                                <Video size={13} color="#60A5FA" />
                                <span>{TUTORIALS_DATA.length} Video Tutorials</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'rgba(255, 255, 255, 0.9)',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                padding: '5px 12px',
                                borderRadius: '8px'
                            }}>
                                <BookOpen size={13} color="#10B981" />
                                <span>Step-by-Step Guides</span>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Search Card */}
                    <div style={{ flex: 1, minWidth: '280px', maxWidth: '420px' }}>
                        <div className="hero-search-wrapper" style={{
                            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(12px)',
                            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.4)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                            borderRadius: '14px',
                            padding: '4px 14px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <Search size={16} style={{ color: isDarkMode ? '#60A5FA' : '#2563EB', marginRight: '10px', flexShrink: 0 }} />
                            <input
                                type="text"
                                placeholder="Search video guides (e.g. bKash, Windows, Tun2tap)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    border: 'none',
                                    outline: 'none',
                                    background: 'transparent',
                                    color: isDarkMode ? '#F8FAFC' : '#0F172A',
                                    fontSize: '13.5px',
                                    fontWeight: 500,
                                    padding: '10px 0'
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        color: isDarkMode ? '#94A3B8' : '#64748B',
                                        padding: '4px'
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Brand Category Filter Pills */}
            <div className="categories-scroll-container custom-scrollbar">
                {CATEGORIES.map((cat) => {
                    const IconComp = cat.icon;
                    const isActive = selectedCategory === cat.name;
                    return (
                        <button
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 16px 8px 10px',
                                borderRadius: '12px',
                                border: isActive
                                    ? `1px solid ${cat.color}`
                                    : `1px solid ${theme.cardBorder}`,
                                backgroundColor: isActive
                                    ? (isDarkMode ? 'rgba(30, 41, 59, 0.95)' : '#FFFFFF')
                                    : theme.cardBg,
                                color: isActive ? theme.text : theme.textMuted,
                                fontWeight: isActive ? 700 : 500,
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                                boxShadow: isActive ? `0 4px 14px ${cat.bg}` : 'none'
                            }}
                        >
                            <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                backgroundColor: cat.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}>
                                <IconComp size={15} color={cat.color} />
                            </div>
                            <span>{cat.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Video Tutorials Grid */}
            {filteredTutorials.length === 0 ? (
                <div style={{
                    backgroundColor: theme.cardBg,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: '16px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: theme.textMuted
                }}>
                    <HelpCircle size={40} style={{ color: theme.pillText, marginBottom: '10px' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.text, marginBottom: '4px' }}>No Tutorials Found</h3>
                    <p style={{ fontSize: '13px' }}>Try searching with a different term or select another category.</p>
                </div>
            ) : (
                <div className="tutorials-cards-grid">
                    {filteredTutorials.map((video, index) => {
                        const catStyle = getCategoryStyle(video.category);
                        return (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.04 }}
                                className="video-card-item"
                                style={{
                                    backgroundColor: theme.cardBg,
                                    border: `1px solid ${theme.cardBorder}`,
                                    borderRadius: '18px',
                                    padding: '14px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {/* Inset Framed Thumbnail Box with Motion Hover */}
                                <motion.div
                                    onClick={() => setActiveVideo(video)}
                                    initial="rest"
                                    whileHover="hover"
                                    animate="rest"
                                    style={{
                                        position: 'relative',
                                        width: '100%',
                                        aspectRatio: '16 / 9',
                                        backgroundColor: '#0F172A',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: `1px solid ${theme.thumbBorder}`
                                    }}
                                >
                                    <img
                                        src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
                                        }}
                                        alt={video.title}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                    />

                                    {/* Framer Motion Hover Overlay */}
                                    <motion.div
                                        variants={{
                                            rest: { opacity: 0 },
                                            hover: { opacity: 1 }
                                        }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: 'rgba(15, 23, 42, 0.45)',
                                            backdropFilter: 'blur(2px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 1
                                        }}
                                    >
                                        <motion.div
                                            variants={{
                                                rest: { scale: 0.85 },
                                                hover: { scale: 1 }
                                            }}
                                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                            style={{
                                                width: '54px',
                                                height: '54px',
                                                borderRadius: '50%',
                                                backgroundColor: '#EF4444',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.6)'
                                            }}
                                        >
                                            <Play size={24} fill="white" color="white" style={{ marginLeft: '3px' }} />
                                        </motion.div>
                                    </motion.div>

                                    {/* Duration Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        right: '8px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                        color: '#FFFFFF',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        backdropFilter: 'blur(4px)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        zIndex: 2
                                    }}>
                                        <Clock size={11} />
                                        <span>{video.duration}</span>
                                    </div>
                                </motion.div>

                                {/* Content Details */}
                                <div style={{
                                    padding: '14px 4px 4px 4px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flex: 1,
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            backgroundColor: catStyle.bg,
                                            color: catStyle.color,
                                            fontSize: '11.5px',
                                            fontWeight: 600,
                                            marginBottom: '10px'
                                        }}>
                                            <span style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                backgroundColor: catStyle.color,
                                                display: 'inline-block'
                                            }} />
                                            <span>{video.category}</span>
                                        </div>

                                        <h3 style={{
                                            fontSize: '15px',
                                            fontWeight: 700,
                                            color: theme.text,
                                            lineHeight: 1.4,
                                            marginBottom: '6px'
                                        }}>
                                            {video.title}
                                        </h3>

                                        <p style={{
                                            fontSize: '12.5px',
                                            color: theme.textMuted,
                                            lineHeight: 1.5,
                                            margin: 0
                                        }}>
                                            {video.description}
                                        </p>
                                    </div>

                                    {/* Bottom Action Buttons - Aligned at Baseline */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '10px',
                                        borderTop: `1px solid ${theme.cardBorder}`,
                                        paddingTop: '12px',
                                        marginTop: '16px'
                                    }}>
                                        <button
                                            onClick={() => setActiveVideo(video)}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                padding: '8px 14px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: '#3B82F6',
                                                color: '#FFFFFF',
                                                fontSize: '12.5px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                boxShadow: '0 3px 10px rgba(59, 130, 246, 0.28)',
                                                transition: 'all 0.2s ease',
                                                flex: 1
                                            }}
                                        >
                                            <Play size={13} fill="currentColor" />
                                            <span>Play Video</span>
                                        </button>

                                        <a
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px',
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                border: `1px solid ${theme.cardBorder}`,
                                                backgroundColor: theme.btnBg,
                                                color: theme.btnText,
                                                fontSize: '12.5px',
                                                fontWeight: 600,
                                                textDecoration: 'none',
                                                transition: 'all 0.2s ease',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <span>YouTube</span>
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Video Modal / Theater Popup via React Portal */}
            {mounted && activeVideo && createPortal(
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveVideo(null)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 999999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '24px',
                            boxSizing: 'border-box'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '850px',
                                margin: 'auto',
                                backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                                borderRadius: '18px',
                                overflow: 'hidden',
                                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)'
                            }}
                        >
                            <div style={{
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`
                            }}>
                                <div>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: '#3B82F6',
                                        textTransform: 'uppercase'
                                    }}>
                                        {activeVideo.category}
                                    </span>
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        color: isDarkMode ? '#F8FAFC' : '#0F172A',
                                        marginTop: '2px'
                                    }}>
                                        {activeVideo.title}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setActiveVideo(null)}
                                    style={{
                                        border: 'none',
                                        backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
                                        borderRadius: '50%',
                                        width: '34px',
                                        height: '34px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: isDarkMode ? '#F8FAFC' : '#0F172A'
                                    }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '16 / 9',
                                backgroundColor: '#000000'
                            }}>
                                <iframe
                                    src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                                    title={activeVideo.title}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        border: 'none'
                                    }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>

                            <div style={{ padding: '16px 20px', backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }}>
                                <p style={{ fontSize: '13px', color: isDarkMode ? '#94A3B8' : '#64748B', lineHeight: 1.5, margin: 0 }}>
                                    {activeVideo.description}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}

            {/* Need More Help Footer Card */}
            <div className="support-footer-card" style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <HelpCircle size={22} color="#3B82F6" />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: theme.text, marginBottom: '2px' }}>
                            Still need help or have custom setup requirements?
                        </h4>
                        <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0 }}>
                            Our 24/7 technical support team is ready to assist you via Telegram and Live Chat.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => triggerContactModal()}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#3B82F6',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Contact Support
                </button>
            </div>

            <style jsx>{`
                .tutorials-responsive-container {
                    padding: 24px;
                    max-width: 1600px;
                    width: 100%;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    box-sizing: border-box;
                }

                .categories-scroll-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    overflow-x: auto;
                    padding-bottom: 4px;
                    scrollbar-width: none;
                }

                .tutorials-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    width: 100%;
                }

                .support-footer-card {
                    border-radius: 18px;
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    justify: space-between;
                    flex-wrap: wrap;
                    gap: 16px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
                }

                @media (max-width: 1400px) {
                    .tutorials-cards-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (max-width: 1100px) {
                    .tutorials-cards-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .tutorials-responsive-container {
                        padding: 16px;
                        gap: 16px;
                    }

                    .tutorials-hero-banner {
                        padding: 24px 18px !important;
                    }

                    .hero-title {
                        font-size: 22px !important;
                    }

                    .hero-subtitle {
                        font-size: 13px !important;
                    }

                    .tutorials-cards-grid {
                        grid-template-columns: 1fr;
                    }

                    .support-footer-card {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </div>
    );
}
