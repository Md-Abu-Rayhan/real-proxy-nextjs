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
    Lock
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
}

interface City {
    id: string;
    name: string;
    country_code: string;
}

interface ISP {
    name: string;
    value: string;
    country_code: string;
}

const TrafficSetupPage = () => {
    const [activeTab, setActiveTab] = useState('Proxy Setup');

    const [trafficReminder, setTrafficReminder] = useState(false);
    const [unit, setUnit] = useState('GB');
    const [proxyInfo, setProxyInfo] = useState<ProxyInfo | null>(null);
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
    const [isps, setIsps] = useState<ISP[]>([]);
    const [selectedIsp, setSelectedIsp] = useState<ISP | null>(null);
    const [isIspsLoading, setIsIspsLoading] = useState(false);
    const [isIspDropdownOpen, setIsIspDropdownOpen] = useState(false);
    const [ispSearchQuery, setIspSearchQuery] = useState('');
    const [allCitiesData, setAllCitiesData] = useState<City[]>([]);
    const [allSubRegionsData, setAllSubRegionsData] = useState<SubRegion[]>([]);
    const [allIspsData, setAllIspsData] = useState<ISP[]>([]);
    const [selectedHostname, setSelectedHostname] = useState('rp.realproxy.net');
    const [isHostnameDropdownOpen, setIsHostnameDropdownOpen] = useState(false);
    const [selectedSessionType, setSelectedSessionType] = useState('Sticky IP');
    const [isSessionTypeDropdownOpen, setIsSessionTypeDropdownOpen] = useState(false);
    const [sessionDuration, setSessionDuration] = useState(15);

    // New Generator State
    const [selectedProtocol, setSelectedProtocol] = useState('HTTP');
    const [selectedFormat, setSelectedFormat] = useState('hostname:port:username:password');
    const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('Sticky Session');
    const [sessionType, setSessionType] = useState('Normal Session');
    const [amount, setAmount] = useState(1);
    const [lifetime, setLifetime] = useState(30);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isResettingKey, setIsResettingKey] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const theme = {
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
    const ispDropdownRef = useRef<HTMLDivElement>(null);
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

        // Fetch proxy info from API
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
                    // Token expired or invalid, redirect to login
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

        // Fetch regions from API
        const fetchRegions = async () => {
            try {
                // Check cache first
                const CACHE_KEY = 'proxy_location_settings_v6';
                const CACHE_TIME_KEY = 'proxy_location_settings_time';
                const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

                const cachedData = localStorage.getItem(CACHE_KEY);
                const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
                const now = Date.now();

                const processData = (data: any) => {
                    if (data && data.residential && data.residential.countries) {
                        const countriesData = data.residential.countries;

                        // Transform { "US": "United States", ... } to Array of Region
                        let regionsArray: Region[] = Object.entries(countriesData).map(([code, name]: [string, any]) => ({
                            country_name: name as string,
                            country_code: code,
                            domain: []
                        }));

                        // Sort countries by name
                        regionsArray.sort((a, b) => a.country_name.localeCompare(b.country_name));

                        // Add Global option at the top
                        const globalRegion: Region = { country_name: 'Global', country_code: '', domain: [] };
                        const finalRegions = [globalRegion, ...regionsArray];

                        setRegions(finalRegions);

                        const citiesRaw = data.residential.cities?.data || (Array.isArray(data.residential.cities) ? data.residential.cities : []);
                        const cityToCountryMap = new Map<string, string>();

                        if (citiesRaw && citiesRaw.length > 0) {
                            const normalizedCities = citiesRaw.map((c: any) => {
                                const cc = (c.country_code || c.countryCode || c.country_id || c.country || '').toString().trim();
                                const cid = (c.id || c.name || '').toString().toLowerCase();

                                if (cc && cc.toUpperCase() !== 'N/A' && cid) {
                                    cityToCountryMap.set(cid, cc.toUpperCase());
                                }

                                return {
                                    id: c.id || c.name,
                                    name: c.name,
                                    country_code: cc
                                };
                            });
                            setAllCitiesData(normalizedCities);
                        }

                        // List of US states for fallback
                        const usStates = new Set(['alabama', 'alaska', 'arizona', 'arkansas', 'calaware', 'california', 'colorado', 'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new.hampshire', 'new.jersey', 'new.mexico', 'new.york', 'north.carolina', 'north.dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'rhode.island', 'south.carolina', 'south.dakota', 'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west.virginia', 'wisconsin', 'wyoming']);

                        const regionsRaw = data.residential.regions?.data || (Array.isArray(data.residential.regions) ? data.residential.regions : data.residential.regions || []);
                        if (regionsRaw) {
                            let normalizedRegions: SubRegion[] = [];
                            if (Array.isArray(regionsRaw)) {
                                normalizedRegions = regionsRaw.map((r: any) => {
                                    const id = (r.id || r.name || '').toString().toLowerCase();
                                    let cc = (r.country_code || r.countryCode || r.country_id || r.country || '').toString().toUpperCase();

                                    // Fallback 1: US States
                                    if (!cc || cc === 'N/A') {
                                        if (usStates.has(id)) cc = 'US';
                                        else if (id.includes('california') || id.includes('texas') || id.includes('florida') || id.includes('new.york')) cc = 'US';
                                    }

                                    // Fallback 2: Match with current city mapping
                                    if (!cc || cc === 'N/A') {
                                        if (cityToCountryMap.has(id)) {
                                            cc = cityToCountryMap.get(id)!;
                                        }
                                    }

                                    // Fallback 3: Prefix split logic
                                    if (!cc || cc === 'N/A') {
                                        const prefix = id.split(/[-._]/)[0];
                                        if (prefix.length === 2 && prefix !== 'st') {
                                            cc = prefix.toUpperCase();
                                        }
                                    }

                                    return {
                                        id: r.id || r.name || '',
                                        name: r.name || '',
                                        country_code: cc
                                    };
                                });
                            } else if (typeof regionsRaw === 'object') {
                                normalizedRegions = Object.entries(regionsRaw).map(([id, name]) => {
                                    const rid = id.toLowerCase();
                                    let rcc = rid.split(/[-._]/)[0].toUpperCase();

                                    if (usStates.has(rid)) rcc = 'US';
                                    else if (cityToCountryMap.has(rid)) rcc = cityToCountryMap.get(rid)!;

                                    return {
                                        id: id,
                                        name: name as string,
                                        country_code: rcc
                                    };
                                });
                            }
                            setAllSubRegionsData(normalizedRegions);
                        }

                        if (data.residential.isp) {
                            const ispData = data.residential.isp;
                            const ispArray: ISP[] = Object.entries(ispData).map(([name, detail]: [string, any]) => ({
                                name: name,
                                value: detail.value,
                                country_code: detail.countryCode
                            }));
                            setAllIspsData(ispArray);
                        }

                        // Set default to Global
                        setSelectedCountry(globalRegion);
                    }
                };

                if (cachedData && cachedTime && (now - parseInt(cachedTime) < CACHE_EXPIRY)) {
                    try {
                        const parsed = JSON.parse(cachedData);
                        processData(parsed);
                        setIsRegionsLoading(false);
                        return;
                    } catch (e) {
                        console.error('Error parsing cached location data');
                    }
                }

                const response = await axios.get(`${API_URL}/api/Proxy/settings`, {
                    headers: {
                        'accept': '*/*'
                    }
                });

                if (response.data && response.data.data) {
                    processData(response.data.data);

                    // Save to cache
                    localStorage.setItem(CACHE_KEY, JSON.stringify(response.data.data));
                    localStorage.setItem(CACHE_TIME_KEY, now.toString());
                }
            } catch (error: any) {
                console.error('Error fetching regions:', error);
                toast.error('Failed to load location settings. Please refresh the page.');
            } finally {
                setIsRegionsLoading(false);
            }
        };

        fetchProxyInfo();
        fetchRegions();
        setIsMounted(true);
    }, [router]);

    const handleResetProxyKey = async () => {
        if (!proxyInfo?.proxyAccount) return;
        setIsResettingKey(true);
        try {
            const res = await axios.post(
                `${API_URL}/api/Proxy/reset_auth_key`,
                { username: proxyInfo.proxyAccount },
                { headers: { 'Content-Type': 'application/json' } }
            );
            const newKey = res.data?.data?.products?.residential?.proxy_key;
            if (newKey && proxyInfo) {
                setProxyInfo({ ...proxyInfo, proxyPassword: newKey });
                setResidentialProxyKey(newKey);
                toast.success('Proxy key reset successfully!');
            } else {
                toast.error('Reset succeeded but could not read new key.');
            }
        } catch (error) {
            console.error('Error resetting proxy key:', error);
            toast.error('Failed to reset proxy key. Please try again.');
        } finally {
            setIsResettingKey(false);
            setShowResetConfirm(false);
        }
    };

    // Fetch balance after proxyInfo is available
    const refreshBalance = async (username?: string) => {
        const user = username ?? proxyInfo?.proxyAccount;
        if (!user) return;
        setIsBalanceLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/Proxy/sub_user?username=${user}`);
            const residential = res.data?.data?.products?.residential;
            setResidentialBalance(residential?.balance ?? null);
            if (residential?.proxy_key) {
                setResidentialProxyKey(residential.proxy_key);
            }
        } catch (error) {
            console.error('Error fetching residential balance:', error);
            toast.error('Failed to refresh balance.');
        } finally {
            setIsBalanceLoading(false);
        }
    };

    useEffect(() => {
        if (proxyInfo?.proxyAccount) {
            refreshBalance(proxyInfo.proxyAccount);
        }
    }, [proxyInfo?.proxyAccount]);

    // Fetch cities when country changes
    useEffect(() => {
        const fetchCities = async () => {
            if (!selectedCountry || selectedCountry.country_name === 'Global') {
                setCities([]);
                setSelectedCity(null);
                return;
            }

            setIsCitiesLoading(true);
            try {
                // Filter from the stored allCitiesData based on country_code
                const countryCode = selectedCountry.country_code.toLowerCase();
                const filteredCities = allCitiesData.filter(
                    city => city.country_code && city.country_code.toLowerCase() === countryCode
                );

                // Sort and deduplicate cities by name
                const uniqueCities = Array.from(new Set(filteredCities.map(c => c.name)))
                    .map(name => filteredCities.find(c => c.name === name)!)
                    .sort((a, b) => a.name.localeCompare(b.name));

                setCities(uniqueCities);
                setSelectedCity(null); // Reset selection when country changes
            } catch (error) {
                console.error('Error filtering cities:', error);
                setCities([]);
                setSelectedCity(null);
            } finally {
                setIsCitiesLoading(false);
            }
        };

        fetchCities();
    }, [selectedCountry, allCitiesData]);

    // Fetch subregions when country changes
    useEffect(() => {
        const fetchSubRegions = async () => {
            if (!selectedCountry || selectedCountry.country_name === 'Global') {
                setSubRegions([]);
                setSelectedSubRegion(null);
                return;
            }

            setIsSubRegionsLoading(true);
            try {
                const countryCode = selectedCountry.country_code.toLowerCase();
                if (!countryCode) {
                    setSubRegions([]);
                    return;
                }

                // Filter by country_code
                const filteredRegions = allSubRegionsData.filter(
                    region => {
                        const regionCC = region.country_code ? region.country_code.toLowerCase() : '';
                        const regionId = region.id ? region.id.toLowerCase() : '';

                        // 1. Direct country code match
                        if (regionCC === countryCode) return true;

                        // 2. ID prefix match (e.g. "us-alabama")
                        if (regionId.startsWith(`${countryCode}-`) ||
                            regionId.startsWith(`${countryCode}.`) ||
                            regionId.startsWith(`${countryCode}_`)) return true;

                        // 3. Fallback: If region ID is exactly the country code
                        if (regionId === countryCode) return true;

                        return false;
                    }
                );

                console.log(`Filtered ${filteredRegions.length} regions for ${countryCode}`);

                const sortedRegions = [...filteredRegions].sort((a, b) => a.name.localeCompare(b.name));
                setSubRegions(sortedRegions);
                setSelectedSubRegion(null);
            } catch (error) {
                console.error('Error filtering sub-regions:', error);
                setSubRegions([]);
                setSelectedSubRegion(null);
            } finally {
                setIsSubRegionsLoading(false);
            }
        };

        fetchSubRegions();
    }, [selectedCountry, allSubRegionsData]);

    // Fetch ISPs when country changes
    useEffect(() => {
        const fetchIsps = async () => {
            if (!selectedCountry || selectedCountry.country_name === 'Global') {
                setIsps([]);
                setSelectedIsp(null);
                return;
            }

            setIsIspsLoading(true);
            try {
                const countryCode = selectedCountry.country_code.toLowerCase();
                const filteredIsps = allIspsData.filter(
                    isp => isp.country_code && isp.country_code.toLowerCase() === countryCode
                );

                filteredIsps.sort((a, b) => a.name.localeCompare(b.name));
                setIsps(filteredIsps);
                setSelectedIsp(null);
            } catch (error) {
                console.error('Error filtering isps:', error);
                setIsps([]);
                setSelectedIsp(null);
            } finally {
                setIsIspsLoading(false);
            }
        };

        fetchIsps();
    }, [selectedCountry, allIspsData]);

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
            if (ispDropdownRef.current && !ispDropdownRef.current.contains(event.target as Node)) {
                setIsIspDropdownOpen(false);
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
        setSelectedIsp(null);
        setIspSearchQuery('');
        setIsIspDropdownOpen(false);
        setSelectedHostname('na.proxys5.net');
        setIsHostnameDropdownOpen(false);
        setSelectedSessionType('Sticky IP');
        setIsSessionTypeDropdownOpen(false);
        setSessionDuration(15);
    };

    const cardStyle: React.CSSProperties = {
        backgroundColor: 'white',
        border: '1px solid #f0f0f0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: '100%',
        minHeight: '220px'
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

    const countryPart = selectedCountry && selectedCountry.country_name !== 'Global' ? `_country-${selectedCountry.country_code}` : '';
    const cityPart = selectedCity ? `_city-${selectedCity.name.toLowerCase().replace(/\s+/g, '.')}` : '';
    const regionPart = selectedSubRegion ? `_region-${selectedSubRegion.name.toLowerCase().replace(/\s+/g, '.')}` : '';

    const generatedPasswords = useMemo(() => {
        if (!isMounted) return [];
        return Array.from({ length: Math.min(Math.max(1, amount), 50) }, () => {
            const basePass = residentialProxyKey || proxyInfo?.proxyPassword || 'pass';
            let finalPass = basePass + countryPart + regionPart + cityPart;
            if (selectedType !== 'Rotating') {
                const randomId = Math.random().toString(36).substring(2, 11).toUpperCase();
                finalPass += `_hardsession-${randomId}_lifetime-${lifetime}`;
            }
            return finalPass;
        });
    }, [isMounted, amount, residentialProxyKey, proxyInfo?.proxyPassword, countryPart, regionPart, cityPart, selectedType, lifetime]);

    const generatedList = generatedPasswords.map((finalPass) => {
        const protocol = selectedProtocol.toLowerCase();
        const prefix = protocol === 'socks5' ? '' : '';
        const port = protocol === 'socks5' ? '1002' : '1000';
        const user = proxyInfo?.proxyAccount || 'user';

        if (selectedFormat === 'username:password@hostname:port') {
            return `${prefix}${user}:${finalPass}@${selectedHostname}:${port}`;
        } else if (selectedFormat === 'username:password:hostname:port') {
            return `${prefix}${user}:${finalPass}:${selectedHostname}:${port}`;
        } else {
            return `${prefix}${selectedHostname}:${port}:${user}:${finalPass}`;
        }
    });

    const topBarPassword = generatedPasswords.length > 0 ? generatedPasswords[0] : (residentialProxyKey || proxyInfo?.proxyPassword ? `${residentialProxyKey || proxyInfo?.proxyPassword}${countryPart}${regionPart}${cityPart}` : '...');

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

    // Do not block the entire page render while loading — render lightweight
    // skeletons in places so the page paints quickly and then hydrate data.

    return (
        <div className="main-responsive-container">
            {/* Top Navigation Mode & Compact Balance Row */}
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
                                {residentialBalance >= 1000
                                    ? `${(residentialBalance / 1000).toFixed(2)} GB`
                                    : `${Number(residentialBalance).toFixed(2)} MB`}
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
                        onClick={() => router.push('/residential-proxies?recharge=true#bandwidth-section')}
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
                                            <span className="info-value">{isLoading ? <span className="skeleton skeleton-small" /> : (proxyInfo?.proxyAccount || '—')}</span>
                                            <button className="info-copy-btn" onClick={() => { navigator.clipboard.writeText(proxyInfo?.proxyAccount || ''); toast.success('Copied!'); }}>
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
                                            <span className="info-value">rp.realproxy.net</span>
                                            <button className="info-copy-btn" onClick={() => { navigator.clipboard.writeText('rp.realproxy.net'); toast.success('Copied!'); }}>
                                                <Copy size={13} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Port:</span>
                                            <span className="info-value">{selectedProtocol.toLowerCase() === 'socks5' ? '1002' : '1000'}</span>
                                            <button className="info-copy-btn" onClick={() => {
                                                const port = selectedProtocol.toLowerCase() === 'socks5' ? '1002' : '1000';
                                                navigator.clipboard.writeText(port);
                                                toast.success('Copied!');
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

                                    <div className="settings-panel">
                                        <div className="panel-header">
                                            <h3 className="panel-title">Format Settings</h3>
                                            <p className="panel-desc">Select the format you want to receive your proxies in.</p>
                                        </div>

                                        <div className="setting-fieldset">
                                            <label className="field-label">
                                                Protocol
                                                <Info size={14} className="info-icon" />
                                            </label>
                                            <div className="protocol-tabs">
                                                {['HTTP', 'SOCKS5'].map(t => (
                                                    <button
                                                        key={t}
                                                        className={`tab-item ${selectedProtocol.toUpperCase() === t ? 'active' : ''}`}
                                                        onClick={() => setSelectedProtocol(t)}
                                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                                    >
                                                        {t === 'HTTP' && <Globe size={14} />}
                                                        {t === 'SOCKS5' && <Lock size={14} />}
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="setting-fieldset" style={{ marginTop: '20px' }}>
                                            <label className="field-label">Format</label>
                                            <div className="dark-dropdown" onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)} ref={formatDropdownRef}>
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

                                    {/* Location Settings */}
                                    <div className="settings-panel">
                                        <div className="panel-header">
                                            <h3 className="panel-title">Location Settings</h3>
                                            <p className="panel-desc">Select a precise proxy location or leave it random.</p>
                                        </div>

                                        <div className="setting-fieldset">
                                            <label className="field-label">Country</label>
                                            <div className="dark-dropdown" onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)} ref={countryDropdownRef}>
                                                <div className="dropdown-val">
                                                    <Globe size={16} color={selectedCountry?.country_name !== 'Global' ? '#3B82F6' : '#94A3B8'} />
                                                    <span>{selectedCountry?.country_name || 'Worldwide'}</span>
                                                </div>
                                                <ChevronDown size={16} color="#94A3B8" style={{ transform: isCountryDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />

                                                {isCountryDropdownOpen && (
                                                    <div className="dropdown-flyout custom-scrollbar">
                                                        <div className="dropdown-search">
                                                            <Search size={14} color="#94A3B8" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search country..."
                                                                value={countrySearchQuery}
                                                                onChange={(e) => setCountrySearchQuery(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        {regions.filter(r => r.country_name.toLowerCase().includes(countrySearchQuery.toLowerCase())).map(r => (
                                                            <div
                                                                key={r.country_code}
                                                                className={`dropdown-option ${selectedCountry?.country_code === r.country_code ? 'active' : ''}`}
                                                                onClick={(e) => { e.stopPropagation(); setSelectedCountry(r); setIsCountryDropdownOpen(false); }}
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
                                                <label className="field-label">City</label>
                                                <div className="dark-dropdown" onClick={() => cities.length > 0 && setIsCityDropdownOpen(!isCityDropdownOpen)} ref={cityDropdownRef}>
                                                    <div className="dropdown-val">
                                                        <Monitor size={16} color={selectedCity ? '#3B82F6' : '#94A3B8'} />
                                                        <span>{selectedCity?.name || 'Random'}</span>
                                                    </div>
                                                    <ChevronDown size={16} color="#94A3B8" />
                                                    {isCityDropdownOpen && (
                                                        <div className="dropdown-flyout custom-scrollbar">
                                                            <div className="dropdown-search">
                                                                <Search size={14} color="#94A3B8" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search city..."
                                                                    value={citySearchQuery}
                                                                    onChange={(e) => setCitySearchQuery(e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                            {cities.filter(c => c.name.toLowerCase().includes(citySearchQuery.toLowerCase())).map(c => (
                                                                <div key={c.id} className="dropdown-option" onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedCity(c);
                                                                    setSelectedSubRegion(null); // Mutual Reset: Clear Region
                                                                    setIsCityDropdownOpen(false);
                                                                    setCitySearchQuery('');
                                                                    toast.success('City selected. Region reset.');
                                                                }}>
                                                                    {c.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="setting-fieldset">
                                                <label className="field-label">Region</label>
                                                <div className="dark-dropdown" onClick={() => subRegions.length > 0 && setIsSubRegionDropdownOpen(!isSubRegionDropdownOpen)} ref={subRegionDropdownRef}>
                                                    <div className="dropdown-val">
                                                        <Monitor size={16} color={selectedSubRegion ? '#3B82F6' : '#94A3B8'} />
                                                        <span>{selectedSubRegion?.name || 'Random'}</span>
                                                    </div>
                                                    <ChevronDown size={16} color="#94A3B8" />
                                                    {isSubRegionDropdownOpen && (
                                                        <div className="dropdown-flyout custom-scrollbar">
                                                            <div className="dropdown-search">
                                                                <Search size={14} color="#94A3B8" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search region..."
                                                                    value={subRegionSearchQuery}
                                                                    onChange={(e) => setSubRegionSearchQuery(e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                            {subRegions.filter(s => s.name.toLowerCase().includes(subRegionSearchQuery.toLowerCase())).map(s => (
                                                                <div key={s.id} className="dropdown-option" onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedSubRegion(s);
                                                                    setSelectedCity(null); // Mutual Reset: Clear City
                                                                    setIsSubRegionDropdownOpen(false);
                                                                    setSubRegionSearchQuery('');
                                                                    toast.success('Region selected. City reset.');
                                                                }}>
                                                                    {s.name}
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
                                                            if (t === 'Rotating') setAmount(1);
                                                        }}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {selectedType === 'Sticky Session' && (
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
                                                <div className="setting-fieldset">
                                                    <label className="field-label">Proxy Sticky Lifetime Set</label>
                                                    <input
                                                        type="number"
                                                        className="dark-input"
                                                        value={lifetime}
                                                        onChange={(e) => setLifetime(Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Result */}
                                <div className="result-column">
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
                <div style={{ padding: '120px 40px', textAlign: 'center', color: '#86909C', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <RefreshCw size={48} style={{ opacity: 0.1, marginBottom: '24px' }} />
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#1D2129', marginBottom: '8px' }}>No Data Available</div>
                    <div style={{ fontSize: '14px', color: '#86909C' }}>Statistics dynamic data will be displayed once there is usage.</div>
                </div>
            )}

            {/* Reset Proxy Key Confirmation Modal */}
            {showResetConfirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '36px 40px', maxWidth: '440px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', textAlign: 'center' }}>
                        <div style={{ width: '56px', height: '56px', background: '#fff1f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <RefreshCw size={26} color="#cf1322" strokeWidth={2.5} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1D2129', marginBottom: '12px' }}>RESET PROXY PASSWORD?</h3>
                        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', marginBottom: '28px' }}>
                            If you reset your proxy key, your current password will <strong>stop working immediately</strong>. All existing proxy connections using this key will be disconnected. Are you sure you want to continue?
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                disabled={isResettingKey}
                                style={{ flex: 1, padding: '11px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#4E5969', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                No, Cancel
                            </button>
                            <button
                                onClick={handleResetProxyKey}
                                disabled={isResettingKey}
                                style={{ flex: 1, padding: '11px 20px', borderRadius: '8px', border: 'none', background: isResettingKey ? '#ffa39e' : '#cf1322', color: 'white', fontSize: '14px', fontWeight: '600', cursor: isResettingKey ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                {isResettingKey ? <><Loader2 size={14} className="animate-spin" /> Resetting...</> : 'Yes, Reset Key'}
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
                    height: 500px;
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
                    border-bottom: 1px solid #f0f0f0;
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

export default TrafficSetupPage;
