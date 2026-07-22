"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { API_URL } from '@/lib/config';
import {
    Info,
    ChevronDown,
    ChevronRight,
    Globe,
    Copy,
    RefreshCw,
    Download,
    Monitor,
    ToggleLeft,
    ToggleRight,
    ExternalLink,
    Loader2,
    Search,
    Check,
    Plus,
    Minus,
    ArrowRight,
    Lock,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import LoadingDashboard from "@/components/common/LoadingDashboard";
import { motion, AnimatePresence } from "framer-motion";

interface ProxyInfo {
    proxyAccount: string;
    proxyPassword: string;
}

interface Region {
    country_name: string;
    country_code: string;
    domain: any[];
}

interface SubRegion {
    id: string;
    name: string;
    country_code?: string;
    cities?: any[];
}

interface City {
    id: string;
    name: string;
    country_code: string;
    state_id?: string;
}

interface ISP {
    name: string;
    value: string;
    country_code: string;
}

const PremiumResidentialProxiesPage = () => {
    const [activeTab, setActiveTab] = useState('Proxy Setup');

    const [trafficReminder, setTrafficReminder] = useState(false);
    const [unit, setUnit] = useState('GB');
    const [proxyInfo, setProxyInfo] = useState<ProxyInfo | null>(null);
    const [subUserInfo, setSubUserInfo] = useState<{ username: string; password: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [residentialBalance, setResidentialBalance] = useState<number | null>(null);
    const [residentialProxyKey, setResidentialProxyKey] = useState<string | null>(null);
    const [isBalanceLoading, setIsBalanceLoading] = useState(false);
    const [regions, setRegions] = useState<Region[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<Region | null>(null);
    const [isRegionsLoading, setIsRegionsLoading] = useState(true);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [countrySearchQuery, setCountrySearchQuery] = useState('');
    const [subRegions, setSubRegions] = useState<SubRegion[]>([]);
    const [selectedSubRegion, setSelectedSubRegion] = useState<SubRegion | null>(null);
    const [isSubRegionsLoading, setIsSubRegionsLoading] = useState(false);
    const [isSubRegionDropdownOpen, setIsSubRegionDropdownOpen] = useState(false);
    const [subRegionSearchQuery, setSubRegionSearchQuery] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const [citySearchQuery, setCitySearchQuery] = useState('');
    const [asns, setAsns] = useState<any[]>([]);
    const [selectedAsn, setSelectedAsn] = useState<any | null>(null);
    const [isAsnLoading, setIsAsnLoading] = useState(false);
    const [isAsnDropdownOpen, setIsAsnDropdownOpen] = useState(false);
    const [asnSearchQuery, setAsnSearchQuery] = useState('');
    const [selectedHostname, setSelectedHostname] = useState('premium.realproxy.net');
    const [isHostnameDropdownOpen, setIsHostnameDropdownOpen] = useState(false);
    const [selectedSessionType, setSelectedSessionType] = useState('Sticky IP');
    const [isSessionTypeDropdownOpen, setIsSessionTypeDropdownOpen] = useState(false);
    const [sessionDuration, setSessionDuration] = useState(15);

    // New Generator State
    const [selectedProtocol, setSelectedProtocol] = useState('HTTP/HTTPS');
    const [isProtocolDropdownOpen, setIsProtocolDropdownOpen] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState('hostname:port:username:password');
    const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('Sticky Session');
    const [sessionType, setSessionType] = useState('Normal Session');
    const [amount, setAmount] = useState(1);
    const [lifetime, setLifetime] = useState(30);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isResettingKey, setIsResettingKey] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        setIsMounted(true);
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

        return () => {
            observer.disconnect();
        };
    }, []);

    const theme = isDarkMode ? {
        bg: '#0F172A',
        card: '#1E293B',
        input: '#334155',
        active: '#3B82F6',
        text: '#F8FAFC',
        textMuted: '#94A3B8',
        border: '#475569'
    } : {
        bg: '#F8FAFC',
        card: '#FFFFFF',
        input: '#F1F5F9',
        active: '#3B82F6',
        text: '#1E293B',
        textMuted: '#64748B',
        border: '#E2E8F0'
    };

    const countryDropdownRef = useRef<HTMLDivElement>(null);
    const subRegionDropdownRef = useRef<HTMLDivElement>(null);
    const cityDropdownRef = useRef<HTMLDivElement>(null);
    const asnDropdownRef = useRef<HTMLDivElement>(null);
    const protocolDropdownRef = useRef<HTMLDivElement>(null);
    const formatDropdownRef = useRef<HTMLDivElement>(null);
    const hostnameDropdownRef = useRef<HTMLDivElement>(null);
    const sessionTypeDropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchProxyInfo = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/Auth/get-proxy-info`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'accept': '*/*'
                    }
                });

                if (response.data) {
                    setProxyInfo(response.data);
                }
            } catch (error: any) {
                console.error('Error fetching proxy info:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_email');
                    toast.error('Session expired. Please login again.');
                    router.push('/login');
                } else {
                    toast.error('Failed to fetch proxy information.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        const fetchResidentialBalance = async (username: string) => {
            setIsBalanceLoading(true);
            try {
                const res = await axios.get(`${API_URL}/api/Proxy/sub_user?username=${username}`);
                const balance = res.data?.data?.products?.residential?.balance ?? null;
                setResidentialBalance(balance);
            } catch (error) {
                console.error('Error fetching residential balance:', error);
            } finally {
                setIsBalanceLoading(false);
            }
        };

        const fetchRegions = async () => {
            try {
                const processData = (data: any[]) => {
                    // Map response array to countries list
                    const countriesList = data.map((c: any) => ({
                        country_name: c.name,
                        country_code: c.code,
                        cities: c.cities,
                        states: c.states,
                        asns: c.asns
                    }));

                    // Sort countries by name
                    countriesList.sort((a, b) => a.country_name.localeCompare(b.country_name));

                    // Add Global option at the top
                    const globalRegion = {
                        country_name: 'Global',
                        country_code: '',
                        cities: { prefix: '', options: [] },
                        states: { prefix: '', options: [] },
                        asns: { prefix: '', options: [] }
                    };

                    const finalRegions = [globalRegion, ...countriesList];
                    setRegions(finalRegions as any);
                    setSelectedCountry(globalRegion as any);
                };

                const response = await axios.get(`${API_URL}/api/Premium/targeting-options`, {
                    headers: {
                        'accept': '*/*'
                    }
                });

                let countriesData = null;
                if (response.data) {
                    if (Array.isArray(response.data)) {
                        countriesData = response.data;
                    } else if (Array.isArray(response.data.countries)) {
                        countriesData = response.data.countries;
                    }
                }

                if (countriesData) {
                    processData(countriesData);
                } else {
                    console.error('Invalid targeting options structure:', response.data);
                }
            } catch (error: any) {
                console.error('Error fetching regions:', error);
                toast.error('Failed to load location settings. Please refresh the page.');
            } finally {
                setIsRegionsLoading(false);
            }
        };

        const fetchSubUserInfo = async () => {
            const email = localStorage.getItem('user_email');
            if (!email) return;
            try {
                const response = await axios.get(`${API_URL}/api/Premium/subuser-info?email=${email}`);
                if (response.data && response.data.success) {
                    setSubUserInfo({
                        username: response.data.username,
                        password: response.data.password
                    });
                }
            } catch (error) {
                console.error('Error fetching sub-user info:', error);
            }
        };

        fetchProxyInfo();
        fetchSubUserInfo();
        fetchRegions();
        setIsMounted(true);
    }, [router]);

    const handleResetSubUserPassword = async () => {
        const email = localStorage.getItem('user_email');
        if (!email) {
            toast.error('User email not found. Please log in again.');
            return;
        }
        setIsResettingKey(true);
        try {
            const res = await axios.post(
                `${API_URL}/api/Premium/reset-subuser-password?email=${email}`
            );
            if (res.data && res.data.success) {
                setSubUserInfo({
                    username: res.data.username,
                    password: res.data.password
                });
                toast.success('Proxy password reset successfully!');
            } else {
                toast.error('Failed to reset proxy password.');
            }
        } catch (error: any) {
            console.error('Error resetting proxy password:', error);
            const errorMsg = error.response?.data?.message || 'Failed to reset proxy password. Please try again.';
            toast.error(errorMsg);
        } finally {
            setIsResettingKey(false);
            setShowResetConfirm(false);
        }
    };

    // Fetch balance after subUserInfo is available
    const refreshBalance = async (username?: string) => {
        const user = username ?? subUserInfo?.username;
        if (!user || user === '...' || user === 'demo_username') return;
        setIsBalanceLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/Premium/subuser-live-usage?username=${user}`);
            if (res.data && res.data.success) {
                const remainingMB = res.data.trafficRemainingMB ?? 0;
                setResidentialBalance(remainingMB);

                // If auto-healing created a new sub-user username, auto-sync credentials on UI
                if (res.data.username && res.data.username !== user) {
                    const email = typeof window !== 'undefined' ? localStorage.getItem('user_email') : null;
                    if (email) {
                        axios.get(`${API_URL}/api/Premium/subuser-info?email=${email}`)
                            .then(infoRes => {
                                if (infoRes.data && infoRes.data.success) {
                                    setSubUserInfo({
                                        username: infoRes.data.username,
                                        password: infoRes.data.password
                                    });
                                }
                            })
                            .catch(err => console.error('Error auto-syncing sub-user info:', err));
                    }
                }
            } else {
                setResidentialBalance(0);
            }
        } catch (error) {
            console.error('Error fetching residential balance:', error);
            toast.error('Failed to refresh balance.');
        } finally {
            setIsBalanceLoading(false);
        }
    };

    useEffect(() => {
        const user = subUserInfo?.username;
        if (user) {
            refreshBalance(user);

            const interval = setInterval(() => {
                refreshBalance(user);
            }, 40000); // Refresh every 40 seconds

            return () => clearInterval(interval);
        }
    }, [subUserInfo?.username]);

    useEffect(() => {
        if (!selectedCountry || selectedCountry.country_name === 'Global') {
            setCities([]);
            setSelectedCity(null);
            setSubRegions([]);
            setSelectedSubRegion(null);
            setAsns([]);
            setSelectedAsn(null);
            return;
        }

        const rawStates = (selectedCountry as any).states || (selectedCountry as any).regions;
        const stateOptions = Array.isArray(rawStates) ? rawStates : (rawStates?.options || []);
        const mappedStates = stateOptions.map((s: any) => ({
            id: s.code || s.id || s.name,
            name: s.name,
            cities: s.cities || [],
            country_code: selectedCountry.country_code
        })).sort((a: any, b: any) => a.name.localeCompare(b.name));
        setSubRegions(mappedStates);
        setSelectedSubRegion(null);

        const rawAsns = (selectedCountry as any).asns;
        const asnOptions = Array.isArray(rawAsns) ? rawAsns : (rawAsns?.options || []);
        const mappedAsns = asnOptions.map((a: any) => {
            const rawName = a.name || '';
            const cleanName = rawName.replace(/^AS[-_\s]*/i, '').trim().replace(/\s+/g, '-');
            return {
                code: a.code || a.id || a.name,
                name: cleanName
            };
        }).sort((a: any, b: any) => a.name.localeCompare(b.name));
        setAsns(mappedAsns);
        setSelectedAsn(null);
    }, [selectedCountry]);

    useEffect(() => {
        if (!selectedCountry || selectedCountry.country_name === 'Global') {
            setCities([]);
            setSelectedCity(null);
            return;
        }

        if (selectedSubRegion) {
            const stateCities = (selectedSubRegion as any).cities || [];
            const mappedCities = stateCities.map((c: any) => ({
                id: c.code || c.id || c.name,
                name: c.name,
                state_id: selectedSubRegion.id,
                country_code: selectedCountry.country_code
            })).sort((a: any, b: any) => a.name.localeCompare(b.name));
            setCities(mappedCities);
        } else {
            const allCities = subRegions.reduce((acc: any[], state: any) => {
                const stateCities = state.cities || [];
                const mappedStateCities = stateCities.map((city: any) => ({
                    id: city.code || city.id || city.name,
                    name: city.name,
                    state_id: state.id,
                    country_code: selectedCountry.country_code
                }));
                return acc.concat(mappedStateCities);
            }, []).sort((a: any, b: any) => a.name.localeCompare(b.name));
            setCities(allCities);
        }
    }, [selectedCountry, selectedSubRegion, subRegions]);

    useEffect(() => {
        if (selectedSubRegion && selectedCity && selectedCity.state_id !== selectedSubRegion.id) {
            setSelectedCity(null);
        }
    }, [selectedSubRegion]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
                setIsCountryDropdownOpen(false);
            }
            if (subRegionDropdownRef.current && !subRegionDropdownRef.current.contains(event.target as Node)) {
                setIsSubRegionDropdownOpen(false);
            }
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
                setIsCityDropdownOpen(false);
            }
            if (asnDropdownRef.current && !asnDropdownRef.current.contains(event.target as Node)) {
                setIsAsnDropdownOpen(false);
            }
            if (protocolDropdownRef.current && !protocolDropdownRef.current.contains(event.target as Node)) {
                setIsProtocolDropdownOpen(false);
            }
            if (hostnameDropdownRef.current && !hostnameDropdownRef.current.contains(event.target as Node)) {
                setIsHostnameDropdownOpen(false);
            }
            if (sessionTypeDropdownRef.current && !sessionTypeDropdownRef.current.contains(event.target as Node)) {
                setIsSessionTypeDropdownOpen(false);
            }
            if (formatDropdownRef.current && !formatDropdownRef.current.contains(event.target as Node)) {
                setIsFormatDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isCountryDropdownOpen) {
            setCountrySearchQuery(selectedCountry && selectedCountry.country_name !== 'Global' ? selectedCountry.country_name : '');
        }
    }, [isCountryDropdownOpen, selectedCountry]);

    useEffect(() => {
        if (isSubRegionDropdownOpen) {
            setSubRegionSearchQuery(selectedSubRegion ? selectedSubRegion.name : '');
        }
    }, [isSubRegionDropdownOpen, selectedSubRegion]);

    useEffect(() => {
        if (isCityDropdownOpen) {
            setCitySearchQuery(selectedCity ? selectedCity.name : '');
        }
    }, [isCityDropdownOpen, selectedCity]);

    useEffect(() => {
        if (isAsnDropdownOpen) {
            setAsnSearchQuery(selectedAsn ? selectedAsn.name : '');
        }
    }, [isAsnDropdownOpen, selectedAsn]);

    const resetSelection = () => {
        const global = regions.find(r => r.country_name === 'Global');
        if (global) {
            setSelectedCountry(global);
        }
        setCountrySearchQuery('');
        setIsCountryDropdownOpen(false);
        setSelectedSubRegion(null);
        setSubRegionSearchQuery('');
        setIsSubRegionDropdownOpen(false);
        setSelectedCity(null);
        setCitySearchQuery('');
        setIsCityDropdownOpen(false);
        setSelectedAsn(null);
        setAsnSearchQuery('');
        setIsAsnDropdownOpen(false);
        setSelectedProtocol('HTTP/HTTPS');
        setIsProtocolDropdownOpen(false);
        setSelectedHostname('premium.realproxy.net');
        setIsHostnameDropdownOpen(false);
        setSelectedSessionType('Sticky IP');
        setIsSessionTypeDropdownOpen(false);
        setSessionDuration(15);
    };

    const getPort = () => {
        const protocol = selectedProtocol.toUpperCase();
        const type = selectedType;

        if (protocol === 'SOCKS5') {
            if (type === 'Sticky Session') {
                return '12000';
            } else {
                return '11000';
            }
        } else {
            // 'HTTP/HTTPS'
            if (type === 'Sticky Session') {
                return '10000';
            } else {
                return '9000';
            }
        }
    };

    const cardStyle: React.CSSProperties = {
        backgroundColor: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: '100%',
        minHeight: '220px',
        color: theme.text
    };

    const inputContainerStyle: React.CSSProperties = {
        height: '38px',
        backgroundColor: '#f2f3f5',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        fontSize: '14px',
        color: '#1D2129',
        border: '1px solid transparent',
        transition: 'all 0.2s'
    };

    const countryPart = selectedCountry && selectedCountry.country_name !== 'Global' ? `-country-${selectedCountry.country_code.toLowerCase()}` : '';

    const rawCities = (selectedCountry as any)?.cities;
    const cityPrefix = !Array.isArray(rawCities) && rawCities?.prefix ? rawCities.prefix : '-city-';

    const rawStates = (selectedCountry as any)?.states || (selectedCountry as any)?.regions;
    const statePrefix = !Array.isArray(rawStates) && rawStates?.prefix ? rawStates.prefix : '-state-';

    const rawAsns = (selectedCountry as any)?.asns;
    const asnPrefix = !Array.isArray(rawAsns) && rawAsns?.prefix ? rawAsns.prefix : '-asn-';

    const cityPart = selectedCity ? `${cityPrefix}${selectedCity.id.toLowerCase()}` : '';
    const regionPart = selectedSubRegion ? `${statePrefix}${selectedSubRegion.id.toLowerCase()}` : '';
    const asnPart = selectedAsn ? `${asnPrefix}${selectedAsn.code.toLowerCase()}` : '';

    const generatedCredentials = useMemo(() => {
        if (!isMounted) return [];
        return Array.from({ length: Math.min(Math.max(1, amount), 300) }, () => {
            const baseUser = subUserInfo?.username || 'demo_username';

            let finalUser = baseUser + '-type-residential' + countryPart + regionPart + cityPart + asnPart;

            if (selectedType !== 'Rotating') {
                const randomId = Math.random().toString(36).substring(2, 8);
                finalUser += `-lifetime-${lifetime}-session-${randomId}`;
            }

            const finalPass = subUserInfo?.password || 'demo_password';

            return {
                username: finalUser,
                password: finalPass
            };
        });
    }, [isMounted, amount, subUserInfo, countryPart, regionPart, cityPart, asnPart, selectedType, lifetime]);

    const generatedList = generatedCredentials.map((cred) => {
        const protocol = selectedProtocol.toLowerCase();
        const prefix = protocol === 'socks5' ? '' : '';
        const port = getPort();

        if (selectedFormat === 'username:password@hostname:port') {
            return `${prefix}${cred.username}:${cred.password}@${selectedHostname}:${port}`;
        } else if (selectedFormat === 'username:password:hostname:port') {
            return `${prefix}${cred.username}:${cred.password}:${selectedHostname}:${port}`;
        } else {
            return `${prefix}${selectedHostname}:${port}:${cred.username}:${cred.password}`;
        }
    });

    const topBarUsername = isLoading ? '...' : (subUserInfo?.username || 'demo_username');
    const topBarPassword = isLoading ? '...' : (subUserInfo?.password || 'demo_password');

    const downloadProxies = () => {
        const blob = new Blob([generatedList.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proxies-${selectedCountry?.country_name || 'worldwide'}-${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="main-responsive-container">
            <div className="dashboard-header-container">
                <div className="header-nav-tabs">
                    {['Proxy Setup', 'Statistics'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`nav-tab-item ${activeTab === tab ? 'active' : ''}`}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                <div className="header-balance-section">
                    <div className="balance-info-chip">
                        <span className="balance-label">Remaining Balance:</span>
                        {isBalanceLoading ? (
                            <Loader2 size={16} className="animate-spin" style={{ color: '#1677ff' }} />
                        ) : residentialBalance !== null ? (
                            <span className="balance-value">
                                {
                                    residentialBalance >= 1000
                                        ? `${(residentialBalance / 1000).toFixed(2)} GB`
                                        : `${Number(residentialBalance.toFixed(2))} MB`
                                }
                            </span>
                        ) : (
                            <span style={{ color: '#aaa', fontSize: '14px' }}>—</span>
                        )}
                        <button
                            onClick={() => refreshBalance()}
                            disabled={isBalanceLoading}
                            title="Refresh balance"
                            className="balance-refresh-btn"
                        >
                            <RefreshCw size={13} strokeWidth={2.5} style={{ animation: isBalanceLoading ? 'spin 1s linear infinite' : 'none' }} />
                        </button>
                    </div>
                    <button
                        onClick={() => router.push('/residential-proxies?recharge=true&type=static#bandwidth-section')}
                        className="header-refill-btn"
                    >
                        Refill Balance
                        <ArrowRight size={15} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {activeTab === 'Proxy Setup' ? (
                <div className="proxy-setup-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '32px', alignItems: 'start' }}>
                    <div className="proxy-generator-column">
                        <div className="generator-container">
                            {/* Upper Info Bar */}
                            <div className="generator-header-info">
                                <h2 className="generator-title">Proxy Generator</h2>
                                <div className="info-bar-scroll custom-scrollbar">
                                    <div className="info-bar">
                                        <div className="info-item">
                                            <span className="info-label">Username:</span>
                                            <span className="info-value">{isLoading ? <span className="skeleton skeleton-small" /> : topBarUsername}</span>
                                            <button className="info-copy-btn" onClick={() => {
                                                if (!isLoading && topBarUsername !== '...') {
                                                    navigator.clipboard.writeText(topBarUsername);
                                                    toast.success('Copied!');
                                                }
                                            }}>
                                                <Copy size={13} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Password:</span>
                                            <span className="info-value">{isLoading ? <span className="skeleton skeleton-small" /> : topBarPassword}</span>
                                            <button className="info-copy-btn" onClick={() => {
                                                if (!isLoading && topBarPassword !== '...') {
                                                    navigator.clipboard.writeText(topBarPassword);
                                                    toast.success('Copied!');
                                                }
                                            }}>
                                                <Copy size={13} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Hostname:</span>
                                            <span className="info-value">premium.realproxy.net</span>
                                            <button className="info-copy-btn" onClick={() => { navigator.clipboard.writeText('premium.realproxy.net'); toast.success('Copied!'); }}>
                                                <Copy size={13} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Port:</span>
                                            <span className="info-value">{isLoading ? <span className="skeleton skeleton-small" /> : getPort()}</span>
                                            <button className="info-copy-btn" onClick={() => {
                                                if (!isLoading) {
                                                    navigator.clipboard.writeText(getPort());
                                                    toast.success('Copied!');
                                                }
                                            }}>
                                                <Copy size={13} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="generator-main-grid">
                                {/* Left Column: Settings */}
                                <div className="settings-column">



                                    {/* Location Settings */}
                                    <div className="settings-panel">

                                        <div className="setting-fieldset">
                                            <label className="field-label">Country</label>
                                            <div className="dark-dropdown" onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)} ref={countryDropdownRef}>
                                                <div className="dropdown-val">
                                                    <Globe size={16} color={selectedCountry?.country_name !== 'Global' ? '#3B82F6' : '#94A3B8'} />
                                                    {isCountryDropdownOpen ? (
                                                        <input
                                                            type="text"
                                                            className="dropdown-trigger-input"
                                                            value={countrySearchQuery}
                                                            onChange={(e) => {
                                                                setIsCountryDropdownOpen(true);
                                                                setCountrySearchQuery(e.target.value);
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsCountryDropdownOpen(true);
                                                            }}
                                                            placeholder={selectedCountry?.country_name || 'Search country...'}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span>{selectedCountry?.country_name || 'Worldwide'}</span>
                                                    )}
                                                </div>
                                                
                                                {selectedCountry && selectedCountry.country_name !== 'Global' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const global = regions.find(r => r.country_name === 'Global');
                                                            if (global) setSelectedCountry(global);
                                                            setCountrySearchQuery('');
                                                            setIsCountryDropdownOpen(false);
                                                        }}
                                                        className="dropdown-clear-btn"
                                                        title="Clear selection"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                                
                                                <ChevronDown size={16} color="#94A3B8" style={{ transform: isCountryDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }} />

                                                {isCountryDropdownOpen && (
                                                    <div className="dropdown-flyout custom-scrollbar">
                                                        {regions.filter(r => r.country_name.toLowerCase().includes(countrySearchQuery.toLowerCase())).map(r => (
                                                            <div
                                                                key={r.country_code}
                                                                className={`dropdown-option ${selectedCountry?.country_code === r.country_code ? 'active' : ''}`}
                                                                onClick={(e) => { e.stopPropagation(); setSelectedCountry(r); setIsCountryDropdownOpen(false); setCountrySearchQuery(''); }}
                                                            >
                                                                {r.country_name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="split-fields">
                                            <div className="setting-fieldset">
                                                <label className="field-label">State / Region</label>
                                                <div className="dark-dropdown" style={{ opacity: subRegions.length === 0 ? 0.6 : 1, cursor: subRegions.length === 0 ? 'not-allowed' : 'pointer' }} onClick={() => subRegions.length > 0 && setIsSubRegionDropdownOpen(!isSubRegionDropdownOpen)} ref={subRegionDropdownRef}>
                                                    <div className="dropdown-val">
                                                        <Monitor size={16} color={selectedSubRegion ? '#3B82F6' : '#94A3B8'} />
                                                        {isSubRegionDropdownOpen ? (
                                                            <input
                                                                type="text"
                                                                className="dropdown-trigger-input"
                                                                value={subRegionSearchQuery}
                                                                onChange={(e) => {
                                                                    setIsSubRegionDropdownOpen(true);
                                                                    setSubRegionSearchQuery(e.target.value);
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setIsSubRegionDropdownOpen(true);
                                                                }}
                                                                placeholder={selectedSubRegion?.name || 'Search state...'}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span>{selectedSubRegion?.name || 'Random'}</span>
                                                        )}
                                                    </div>
                                                    
                                                    {selectedSubRegion && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedSubRegion(null);
                                                                setSubRegionSearchQuery('');
                                                                setIsSubRegionDropdownOpen(false);
                                                            }}
                                                            className="dropdown-clear-btn"
                                                            title="Clear selection"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                    
                                                    <ChevronDown size={16} color="#94A3B8" style={{ transform: isSubRegionDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }} />
                                                    {isSubRegionDropdownOpen && (
                                                        <div className="dropdown-flyout custom-scrollbar">
                                                            {subRegions.filter(s => s.name.toLowerCase().includes(subRegionSearchQuery.toLowerCase())).map(s => (
                                                                <div key={s.id} className={`dropdown-option ${selectedSubRegion?.id === s.id ? 'active' : ''}`} onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedSubRegion(s);
                                                                    setIsSubRegionDropdownOpen(false);
                                                                    setSubRegionSearchQuery('');
                                                                    toast.success('State selected.');
                                                                }}>
                                                                    {s.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="setting-fieldset">
                                                <label className="field-label">City</label>
                                                <div className="dark-dropdown" style={{ opacity: cities.length === 0 ? 0.6 : 1, cursor: cities.length === 0 ? 'not-allowed' : 'pointer' }} onClick={() => cities.length > 0 && setIsCityDropdownOpen(!isCityDropdownOpen)} ref={cityDropdownRef}>
                                                    <div className="dropdown-val">
                                                        <Monitor size={16} color={selectedCity ? '#3B82F6' : '#94A3B8'} />
                                                        {isCityDropdownOpen ? (
                                                            <input
                                                                type="text"
                                                                className="dropdown-trigger-input"
                                                                value={citySearchQuery}
                                                                onChange={(e) => {
                                                                    setIsCityDropdownOpen(true);
                                                                    setCitySearchQuery(e.target.value);
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setIsCityDropdownOpen(true);
                                                                }}
                                                                placeholder={selectedCity?.name || 'Search city...'}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span>{selectedCity?.name || 'Random'}</span>
                                                        )}
                                                    </div>
                                                    
                                                    {selectedCity && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedCity(null);
                                                                setCitySearchQuery('');
                                                                setIsCityDropdownOpen(false);
                                                            }}
                                                            className="dropdown-clear-btn"
                                                            title="Clear selection"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                    
                                                    <ChevronDown size={16} color="#94A3B8" style={{ transform: isCityDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }} />
                                                    {isCityDropdownOpen && (
                                                        <div className="dropdown-flyout custom-scrollbar">
                                                            {cities.filter(c => c.name.toLowerCase().includes(citySearchQuery.toLowerCase())).map(c => (
                                                                <div key={c.id} className={`dropdown-option ${selectedCity?.id === c.id ? 'active' : ''}`} onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedCity(c);
                                                                    if (c.state_id) {
                                                                        const parentState = subRegions.find(s => s.id === c.state_id);
                                                                        if (parentState) {
                                                                            setSelectedSubRegion(parentState);
                                                                        }
                                                                    }
                                                                    setIsCityDropdownOpen(false);
                                                                    setCitySearchQuery('');
                                                                    toast.success('City selected.');
                                                                }}>
                                                                    {c.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="split-fields" style={{ marginTop: '20px' }}>
                                            <div className="setting-fieldset">
                                                <label className="field-label">ASN</label>
                                                <div className="dark-dropdown" style={{ opacity: asns.length === 0 ? 0.6 : 1, cursor: asns.length === 0 ? 'not-allowed' : 'pointer' }} onClick={() => asns.length > 0 && setIsAsnDropdownOpen(!isAsnDropdownOpen)} ref={asnDropdownRef}>
                                                    <div className="dropdown-val">
                                                        <Monitor size={16} color={selectedAsn ? '#3B82F6' : '#94A3B8'} />
                                                        {isAsnDropdownOpen ? (
                                                            <input
                                                                type="text"
                                                                className="dropdown-trigger-input"
                                                                value={asnSearchQuery}
                                                                onChange={(e) => {
                                                                    setIsAsnDropdownOpen(true);
                                                                    setAsnSearchQuery(e.target.value);
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setIsAsnDropdownOpen(true);
                                                                }}
                                                                placeholder={selectedAsn ? selectedAsn.name : 'Search ASN...'}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span>{selectedAsn ? selectedAsn.name : 'Random'}</span>
                                                        )}
                                                    </div>
                                                    
                                                    {selectedAsn && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedAsn(null);
                                                                setAsnSearchQuery('');
                                                                setIsAsnDropdownOpen(false);
                                                            }}
                                                            className="dropdown-clear-btn"
                                                            title="Clear selection"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                    
                                                    <ChevronDown size={16} color="#94A3B8" style={{ transform: isAsnDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }} />
                                                    {isAsnDropdownOpen && (
                                                        <div className="dropdown-flyout custom-scrollbar">
                                                            {asns.filter(a => a.name.toLowerCase().includes(asnSearchQuery.toLowerCase())).map(a => (
                                                                <div key={a.code} className={`dropdown-option ${selectedAsn?.code === a.code ? 'active' : ''}`} onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedAsn(a);
                                                                    setIsAsnDropdownOpen(false);
                                                                    setAsnSearchQuery('');
                                                                }}>
                                                                    {a.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="setting-fieldset">
                                                <label className="field-label">Protocol</label>
                                                <div className="dark-dropdown" onClick={() => setIsProtocolDropdownOpen(!isProtocolDropdownOpen)} ref={protocolDropdownRef}>
                                                    <div className="dropdown-val">
                                                        <Lock size={16} color="#3B82F6" />
                                                        <span>{selectedProtocol}</span>
                                                    </div>
                                                    <ChevronDown size={16} color="#94A3B8" style={{ transform: isProtocolDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                                                    {isProtocolDropdownOpen && (
                                                        <div className="dropdown-flyout custom-scrollbar">
                                                            {['HTTP/HTTPS', 'SOCKS5'].map(proto => (
                                                                <div
                                                                    key={proto}
                                                                    className={`dropdown-option ${selectedProtocol === proto ? 'active' : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedProtocol(proto);
                                                                        setIsProtocolDropdownOpen(false);
                                                                    }}
                                                                >
                                                                    {proto}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Session Settings */}
                                    <div className="settings-panel">
                                        <div className="panel-header">
                                            <h3 className="panel-title">Session Settings</h3>
                                        </div>

                                        <div className="setting-fieldset">
                                            <label className="field-label">Type</label>
                                            <div className="protocol-tabs">
                                                {['Sticky Session', 'Rotating'].map(t => (
                                                    <button
                                                        key={t}
                                                        className={`tab-item ${selectedType === t ? 'active' : ''}`}
                                                        onClick={() => {
                                                            setSelectedType(t);
                                                        }}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="split-fields">
                                            <div className="setting-fieldset">
                                                <label className="field-label">Proxy Count</label>
                                                <input
                                                    type="number"
                                                    className="dark-input"
                                                    value={amount}
                                                    onChange={(e) => setAmount(Number(e.target.value))}
                                                />
                                            </div>
                                            {selectedType === 'Sticky Session' && (
                                                <div className="setting-fieldset">
                                                    <label className="field-label">Proxy Sticky Lifetime Set</label>
                                                    <input
                                                        type="number"
                                                        className="dark-input"
                                                        value={lifetime}
                                                        onChange={(e) => setLifetime(Number(e.target.value))}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="result-column">
                                    <div className="settings-panel" style={{ padding: '16px 20px' }}>
                                        <div className="panel-header" style={{ marginBottom: '12px' }}>
                                            <h3 className="panel-title" style={{ fontSize: '15px' }}>Format Settings</h3>
                                            <p className="panel-desc" style={{ fontSize: '12px' }}>Select the format you want to receive your proxies in.</p>
                                        </div>

                                        <div className="setting-fieldset" style={{ marginBottom: 0 }}>
                                            <div className="dark-dropdown" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)} ref={formatDropdownRef}>
                                                <div className="dropdown-val">
                                                    <span>{selectedFormat}</span>
                                                </div>
                                                <ChevronDown size={16} color="#94A3B8" style={{ transform: isFormatDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />

                                                {isFormatDropdownOpen && (
                                                    <div className="dropdown-flyout custom-scrollbar">
                                                        {[
                                                            'hostname:port:username:password',
                                                            'username:password@hostname:port',
                                                            'username:password:hostname:port'
                                                        ].map(fmt => (
                                                            <div
                                                                key={fmt}
                                                                className={`dropdown-option ${selectedFormat === fmt ? 'active' : ''}`}
                                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                                onClick={(e) => { e.stopPropagation(); setSelectedFormat(fmt); setIsFormatDropdownOpen(false); }}
                                                            >
                                                                <span>{fmt}</span>
                                                                {selectedFormat === fmt && <Check size={14} color="#3B82F6" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="result-panel">
                                        <div className="result-header">
                                            <h3 className="panel-title">Generated String</h3>
                                            <div className="result-actions">
                                                <button className="action-btn" onClick={() => { navigator.clipboard.writeText(generatedList.join('\n')); toast.success('All strings copied!'); }}>
                                                    <Copy size={13} /> Copy all
                                                </button>
                                                <button className="action-btn" onClick={downloadProxies}>
                                                    <Download size={13} /> Download
                                                </button>
                                                <button className="action-btn" onClick={() => setShowResetConfirm(true)} style={{ color: '#cf1322' }} disabled={isLoading || isResettingKey}>
                                                    <RefreshCw size={13} /> Reset Proxy Password
                                                </button>
                                            </div>
                                        </div>

                                        <div className="generated-viewer custom-scrollbar">
                                            {isLoading ? (
                                                <div className="generated-loading"><div className="small-spinner" /> <p>Loading proxies...</p></div>
                                            ) : (
                                                generatedList.map((str, idx) => (
                                                    <div key={idx} className="proxy-line">
                                                        <span className="line-num">{idx + 1}.</span>
                                                        <span className="line-content">{str}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '120px 40px', textAlign: 'center', color: theme.textMuted, backgroundColor: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <RefreshCw size={48} style={{ opacity: 0.1, marginBottom: '24px' }} />
                    <div style={{ fontSize: '18px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>No Data Available</div>
                    <div style={{ fontSize: '14px', color: theme.textMuted }}>Statistics dynamic data will be displayed once there is usage.</div>
                </div>
            )}

            {/* Reset Proxy Password Confirmation Modal */}
            {showResetConfirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                    <div style={{ background: theme.card, color: theme.text, borderRadius: '16px', padding: '36px 40px', maxWidth: '440px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', textAlign: 'center' }}>
                        <div style={{ width: '56px', height: '56px', background: isDarkMode ? '#3f1a1d' : '#fff1f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <RefreshCw size={26} color="#cf1322" strokeWidth={2.5} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, marginBottom: '12px' }}>RESET PROXY PASSWORD?</h3>
                        <p style={{ fontSize: '14px', color: theme.textMuted, lineHeight: '1.6', marginBottom: '28px' }}>
                            If you reset your proxy password, your current password will <strong>stop working immediately</strong>. All existing proxy connections using this password will be disconnected. Are you sure you want to continue?
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                disabled={isResettingKey}
                                style={{ flex: 1, padding: '11px 20px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                No, Cancel
                            </button>
                            <button
                                onClick={handleResetSubUserPassword}
                                disabled={isResettingKey}
                                style={{ flex: 1, padding: '11px 20px', borderRadius: '8px', border: 'none', background: isResettingKey ? '#ffa39e' : '#cf1322', color: 'white', fontSize: '14px', fontWeight: '600', cursor: isResettingKey ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                {isResettingKey ? <><Loader2 size={14} className="animate-spin" /> Resetting...</> : 'Yes, Reset Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .generator-container {
                    color: ${theme.text};
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                .generator-header-info {
                    background: ${theme.card};
                    border: 1px solid ${theme.border};
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 32px;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
                }

                .generator-title {
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 20px;
                    color: ${theme.text};
                }

                .info-bar-scroll {
                    overflow-x: auto;
                    padding-bottom: 8px;
                }

                .info-bar {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                }
                
                .info-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    background: ${theme.input};
                    padding: 10px 16px;
                    border-radius: 8px;
                    border: 1px solid ${theme.border};
                    overflow: hidden;
                }

                .info-label {
                    color: ${theme.textMuted};
                    font-size: 13px;
                    font-weight: 500;
                    white-space: nowrap;
                }

                .info-value {
                    color: ${theme.text};
                    font-size: 14px;
                    font-weight: 600;
                    font-family: 'JetBrains Mono', 'SFMono-Regular', monospace;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    flex: 1;
                    margin-right: 8px;
                    text-align: right;
                }

                .info-copy-btn {
                    background: rgba(59, 130, 246, 0.1);
                    border: none;
                    color: ${theme.active};
                    padding: 4px;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .info-copy-btn:hover {
                    background: rgba(59, 130, 246, 0.2);
                    transform: scale(1.05);
                }

                .generator-main-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                }

                .settings-column {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .result-column {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .settings-panel {
                    background: ${theme.card};
                    border: 1px solid ${theme.border};
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
                    transition: transform 0.2s;
                }

                .settings-panel:hover {
                    border-color: rgba(59, 130, 246, 0.3);
                }

                .panel-header {
                    margin-bottom: 20px;
                }

                .panel-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: ${theme.text};
                    margin-bottom: 4px;
                }

                .panel-desc {
                    font-size: 13px;
                    color: ${theme.textMuted};
                }

                .setting-fieldset {
                    margin-bottom: 20px;
                }

                .field-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    color: ${theme.textMuted};
                    margin-bottom: 10px;
                }

                .info-icon {
                    color: rgba(148, 163, 184, 0.8);
                    cursor: help;
                }

                .protocol-tabs {
                    display: flex;
                    background: ${theme.input};
                    padding: 4px;
                    border-radius: 8px;
                    gap: 4px;
                    border: 1px solid ${theme.border};
                }

                .tab-item {
                    flex: 1;
                    padding: 8px 12px;
                    border: none;
                    background: transparent;
                    color: ${theme.textMuted};
                    font-size: 13px;
                    font-weight: 600;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                    min-width: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .tab-item.active {
                    background: ${theme.active};
                    color: white;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
                }

                .dark-dropdown {
                    background: ${theme.input};
                    border: 1px solid ${theme.border};
                    border-radius: 8px;
                    padding: 10px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    position: relative;
                }

                .dropdown-val {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 14px;
                    font-weight: 500;
                    overflow: hidden;
                    flex: 1;
                }

                .dropdown-val span {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .dropdown-flyout {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    right: 0;
                    background: ${theme.card};
                    border: 1px solid ${theme.border};
                    border-radius: 12px;
                    z-index: 100;
                    max-height: 250px;
                    overflow-y: auto;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                    animation: slideDown 0.2s ease-out;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .dropdown-search {
                    padding: 12px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border-bottom: 1px solid ${theme.border};
                    position: sticky;
                    top: 0;
                    background: ${theme.card};
                    z-index: 1;
                }

                .dropdown-search input {
                    background: transparent;
                    border: none;
                    color: ${theme.text};
                    font-size: 13px;
                    outline: none;
                    width: 100%;
                }

                .dropdown-option {
                    padding: 12px 16px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                    color: ${theme.text};
                }

                .dropdown-option:hover {
                    background: #F1F5F9;
                }

                .dropdown-option.active {
                    background: rgba(59, 130, 246, 0.05);
                    color: ${theme.active};
                    font-weight: 600;
                }

                .dropdown-trigger-input {
                    background: transparent;
                    border: none;
                    color: ${theme.text};
                    outline: none;
                    width: 100%;
                    font-size: 14px;
                    font-weight: 500;
                    padding: 0;
                    font-family: inherit;
                }

                .dropdown-clear-btn {
                    background: transparent;
                    border: none;
                    color: ${theme.textMuted};
                    padding: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s;
                    margin-right: 4px;
                    flex-shrink: 0;
                }

                .dropdown-clear-btn:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                }

                .split-fields {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .dark-input {
                    background: ${theme.input};
                    border: 1px solid ${theme.border};
                    border-radius: 8px;
                    padding: 10px 16px;
                    color: ${theme.text};
                    width: 100%;
                    outline: none;
                    font-size: 14px;
                }

                .dark-input:focus {
                    border-color: ${theme.active};
                    background: ${theme.card};
                }

                .result-panel {
                    background: ${theme.card};
                    border: 1px solid ${theme.border};
                    border-radius: 12px;
                    padding: 24px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
                }

                .result-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .result-actions {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .action-btn {
                    background: #F1F5F9;
                    border: 1px solid ${theme.border};
                    border-radius: 6px;
                    padding: 6px 12px;
                    color: ${theme.textMuted};
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background: #E2E8F0;
                    color: ${theme.text};
                }

                .generated-viewer {
                    background: ${theme.input};
                    border: 1px solid ${theme.border};
                    border-radius: 8px;
                    padding: 16px;
                    flex-grow: 1;
                    height: 320px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    font-family: 'JetBrains Mono', 'SFMono-Regular', monospace;
                    width: 100%;
                    box-sizing: border-box;
                }

                .proxy-line {
                    display: grid;
                    grid-template-columns: 24px 1fr;
                    gap: 8px;
                    padding: 8px 0;
                    border-bottom: 1px solid ${theme.border};
                    font-size: 13px;
                }

                .line-num {
                    color: ${theme.textMuted};
                    opacity: 0.8;
                    user-select: none;
                    font-weight: 500;
                }

                .line-content {
                    color: ${theme.text};
                    word-break: break-all;
                    overflow-wrap: break-word;
                    min-width: 0;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.3);
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(148, 163, 184, 0.5);
                }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* Lightweight skeletons for faster first paint */
                .skeleton {
                    display: inline-block;
                    background: linear-gradient(90deg, #e6eefc 25%, #f8fbff 37%, #e6eefc 63%);
                    background-size: 400% 100%;
                    animation: shimmer 1.4s ease infinite;
                    border-radius: 6px;
                }

                .skeleton-small { width: 140px; height: 16px; display: inline-block; }
                .skeleton-medium { width: 220px; height: 20px; display: inline-block; }

                @keyframes shimmer {
                    0% { background-position: 100% 0; }
                    100% { background-position: -100% 0; }
                }

                .generated-loading {
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    justify-content: center;
                    color: #64748B;
                }

                .small-spinner {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    border: 3px solid rgba(0,0,0,0.08);
                    border-top-color: #1677ff;
                    animation: spin 1s linear infinite;
                }

                .main-responsive-container {
                    max-width: 1440px;
                    margin: 0 auto;
                    padding: 0 24px;
                    box-sizing: border-box;
                    width: 100%;
                    overflow-x: hidden;
                }

                .dashboard-header-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid ${theme.border};
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .header-nav-tabs {
                    display: flex;
                    gap: 16px;
                }

                .nav-tab-item {
                    padding: 12px 32px;
                    font-size: 16px;
                    font-weight: 700;
                    color: #4E5969;
                    border-bottom: 2px solid transparent;
                    cursor: pointer;
                    margin-bottom: -1px;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .nav-tab-item.active {
                    color: #1677ff;
                    border-bottom-color: #1677ff;
                }

                .header-balance-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding-bottom: 8px;
                    flex-wrap: wrap;
                }

                .balance-info-chip {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #e6f4ff;
                    padding: 8px 14px;
                    border-radius: 8px;
                    border: 1px solid #91caff;
                }

                .balance-label {
                    color: #4E5969;
                    font-size: 13px;
                    font-weight: 500;
                }

                .balance-value {
                    color: #1677ff;
                    font-size: 15px;
                    font-weight: 800;
                }

                .balance-refresh-btn {
                    display: flex;
                    align-items: center;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #1677ff;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                    padding: 2px;
                }

                .balance-refresh-btn:hover { opacity: 1; }
                .balance-refresh-btn:disabled { opacity: 0.3; cursor: not-allowed; }

                .header-refill-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #1677ff;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 2px 6px rgba(22, 119, 255, 0.2);
                    white-space: nowrap;
                }

                .header-refill-btn:hover { background: #4096ff; }

                @media (max-width: 1300px) {
                    .info-bar {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (max-width: 1024px) {
                    .proxy-setup-layout {
                        grid-template-columns: minmax(0, 1fr) !important;
                        width: 100% !important;
                        overflow-x: hidden;
                    }
                    .main-responsive-container {
                        padding: 0 12px;
                        min-width: 0;
                    }
                    .dashboard-header-container {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 16px;
                        padding-bottom: 8px;
                    }
                    .header-nav-tabs {
                        width: 100%;
                        justify-content: center;
                    }
                    .header-balance-section {
                        width: 100%;
                        justify-content: center;
                    }
                    .generator-main-grid {
                        grid-template-columns: minmax(0, 1fr) !important;
                        width: 100% !important;
                    }
                    .proxy-generator-column, .generator-container {
                        width: 100% !important;
                        overflow-x: hidden;
                    }
                    .generated-viewer {
                        height: 400px;
                        width: 100% !important;
                    }
                    .generator-header-info {
                        padding: 16px;
                    }
                }
                
                @media (max-width: 640px) {
                    .main-responsive-container {
                        padding: 0 8px;
                    }
                    .nav-tab-item {
                        padding: 12px 8px;
                        font-size: 13px;
                        flex: 1;
                        text-align: center;
                    }
                    .header-balance-section {
                        flex-direction: column;
                        align-items: center;
                        gap: 12px;
                    }
                    .balance-info-chip {
                        justify-content: center;
                        width: 100%;
                    }
                    .header-nav-tabs {
                        gap: 4px;
                    }
                    .header-refill-btn {
                        width: 100%;
                        justify-content: center;
                    }
                    .info-bar {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                    .split-fields {
                        grid-template-columns: 1fr;
                    }
                    .settings-panel, .result-panel {
                        padding: 16px 12px;
                        width: 100% !important;
                        box-sizing: border-box !important;
                        min-width: 0 !important;
                    }
                    .info-item {
                        padding: 8px 12px;
                    }
                    .result-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }
                    .result-actions {
                        width: 100%;
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 8px;
                    }
                    .action-btn {
                        justify-content: center;
                        padding: 10px 4px;
                        font-size: 12px;
                    }
                    .action-btn:last-child {
                        grid-column: span 2;
                    }
                    .protocol-tabs {
                        flex-wrap: wrap;
                        width: 100%;
                    }
                    .tab-item {
                        padding: 8px 4px;
                        font-size: 11px;
                        white-space: normal;
                        word-break: break-word;
                        height: auto;
                        min-height: 44px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        line-height: 1.2;
                    }
                }

                @media (max-width: 400px) {
                    .settings-panel, .result-panel {
                        padding: 16px 10px;
                        margin-left: 0;
                        margin-right: 0;
                        width: 100%;
                    }
                    .main-responsive-container {
                        padding: 0 4px;
                    }
                    .action-btn {
                        font-size: 11px;
                        gap: 4px;
                    }
                    .info-item {
                        padding: 8px 10px;
                    }
                    .info-label {
                        font-size: 12px;
                    }
                    .info-value {
                        font-size: 13px;
                    }
                }
            ` }} />
        </div >
    );
};

export default PremiumResidentialProxiesPage;
