"use client";

import React, { useState, useEffect, useRef } from 'react';
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
    ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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
    const [selectedProtocol, setSelectedProtocol] = useState('HTTPS');
    const [selectedFormat, setSelectedFormat] = useState('hostname:port:username:password');
    const [selectedType, setSelectedType] = useState('Rotating');
    const [sessionType, setSessionType] = useState('Normal Session');
    const [amount, setAmount] = useState(1);
    const [lifetime, setLifetime] = useState(30);

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
                const response = await axios.get('https://api.realproxy.net/api/Auth/get-proxy-info', {
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

        // Fetch regions from API
        const fetchRegions = async () => {
            try {
                const response = await axios.get('https://api.realproxy.net/api/Proxy/settings', {
                    headers: {
                        'accept': '*/*'
                    }
                });

                if (response.data && response.data.data && response.data.data.residential && response.data.data.residential.countries) {
                    const countriesData = response.data.data.residential.countries;

                    // Transform { "US": "United States", ... } to Array of Region
                    let regionsArray: Region[] = Object.entries(countriesData).map(([code, name]: [string, any]) => ({
                        country_name: name as string,
                        country_code: code,
                        domain: []
                    }));

                    // Sort countries by name
                    regionsArray.sort((a, b) => a.country_name.localeCompare(b.country_name));

                    // Add Global option at the top (as it's often preferred for (ALL) Global)
                    const globalRegion: Region = { country_name: 'Global', country_code: '', domain: [] };
                    const finalRegions = [globalRegion, ...regionsArray];

                    setRegions(finalRegions);

                    if (response.data.data.residential.cities && response.data.data.residential.cities.data) {
                        setAllCitiesData(response.data.data.residential.cities.data);
                    }

                    if (response.data.data.residential.regions && response.data.data.residential.regions.data) {
                        setAllSubRegionsData(response.data.data.residential.regions.data);
                    }

                    if (response.data.data.residential.isp) {
                        const ispData = response.data.data.residential.isp;
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
            } catch (error: any) {
                console.error('Error fetching regions:', error);
                toast.error('Failed to load location settings. Please refresh the page.');
            } finally {
                setIsRegionsLoading(false);
            }
        };

        fetchProxyInfo();
        fetchRegions();
    }, [router]);

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

                // Sort cities by name
                filteredCities.sort((a, b) => a.name.localeCompare(b.name));

                setCities(filteredCities);
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
                // Attempt to filter by country_code if it exists in data, otherwise show all
                const filteredRegions = allSubRegionsData.filter(
                    region => {
                        const regionCountryCode = region.country_code;
                        return !regionCountryCode || regionCountryCode.toLowerCase() === countryCode;
                    }
                );

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

    const generatedList = Array.from({ length: Math.min(Math.max(1, amount), 50) }, (_, i) => {
        const protocol = selectedProtocol.toLowerCase();
        const user = proxyInfo?.proxyAccount || 'user';
        const basePass = proxyInfo?.proxyPassword || 'pass';

        let passOptions = `${countryPart}${regionPart}${cityPart}`;

        if (selectedType === 'Rotating') {
            return `${protocol}://${selectedHostname}:1000:${user}:${basePass}${passOptions}`;
        } else {
            const randomId = Math.random().toString(36).substring(2, 11).toUpperCase();
            return `${protocol}://${selectedHostname}:1000:${user}:${basePass}${passOptions}_session-${randomId}_lifetime-${lifetime}`;
        }
    });

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
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>
            {/* Top Navigation Mode & Compact Balance Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '60px' }}>
                    {['Proxy Setup', 'Statistics'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '13px 50px',
                                fontSize: '18px',
                                fontWeight: '700',
                                color: activeTab === tab ? '#1677ff' : '#4E5969',
                                borderBottom: activeTab === tab ? '2px solid #1677ff' : '2px solid transparent',
                                cursor: 'pointer',
                                marginBottom: '-1px',
                                transition: 'all 0.2s',
                                letterSpacing: '0.2px'
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                {/* Remaining Balance (Small, Side-by-side, Right aligned) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e6f4ff', padding: '8px 16px', borderRadius: '8px', border: '1px solid #91caff' }}>
                        <span style={{ color: '#4E5969', fontSize: '14px', fontWeight: '500' }}>Remaining Balance:</span>
                        <span style={{ color: '#1677ff', fontSize: '16px', fontWeight: '800' }}>99.963 MB</span>
                    </div>
                    <button onClick={() => router.push('/dashboard/pricing')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1677ff', color: 'white', border: 'none', padding: '9px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(22, 119, 255, 0.2)' }}>
                        Refill
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
                                            <span className="info-value">{proxyInfo?.proxyAccount || '...'}</span>
                                            <button className="info-copy-btn" onClick={() => { navigator.clipboard.writeText(proxyInfo?.proxyAccount || ''); toast.success('Copied!'); }}>
                                                <Copy size={13} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Password:</span>
                                            <span className="info-value">{proxyInfo ? `${proxyInfo.proxyPassword}${countryPart}${regionPart}${cityPart}` : '...'}</span>
                                            <button className="info-copy-btn" onClick={() => {
                                                const textToCopy = proxyInfo ? `${proxyInfo.proxyPassword}${countryPart}${regionPart}${cityPart}` : '';
                                                navigator.clipboard.writeText(textToCopy);
                                                toast.success('Copied!');
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
                                            <span className="info-value">1000</span>
                                            <button className="info-copy-btn" onClick={() => { navigator.clipboard.writeText('1000'); toast.success('Copied!'); }}>
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
                                                                    setSelectedSubRegion(null); // Mutually exclusive
                                                                    setIsCityDropdownOpen(false);
                                                                    setCitySearchQuery('');
                                                                    toast.success('City selected. Region targeting disabled.');
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
                                                                    setSelectedCity(null); // Mutually exclusive
                                                                    setIsSubRegionDropdownOpen(false);
                                                                    setSubRegionSearchQuery('');
                                                                    toast.success('Region selected. City targeting disabled.');
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
                                                {['Rotating', 'Sticky Session'].map(t => (
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
                                                    <label className="field-label">Amount</label>
                                                    <input
                                                        type="number"
                                                        className="dark-input"
                                                        value={amount}
                                                        onChange={(e) => setAmount(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="setting-fieldset">
                                                    <label className="field-label">Lifetime (min)</label>
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
                                                <button className="action-btn" onClick={resetSelection}>
                                                    <RefreshCw size={13} /> Reset
                                                </button>
                                                <button className="action-btn" onClick={downloadProxies}>
                                                    <Download size={13} /> Download
                                                </button>
                                            </div>
                                        </div>

                                        <div className="generated-viewer custom-scrollbar">
                                            {generatedList.map((str, idx) => (
                                                <div key={idx} className="proxy-line">
                                                    <span className="line-num">{idx + 1}.</span>
                                                    <span className="line-content">{str}</span>
                                                </div>
                                            ))}
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

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 1024px) {
                    .proxy-setup-layout {
                        grid-template-columns: 1fr !important;
                    }
                }

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
                    gap: 16px;
                }
                
                @media (max-width: 1300px) {
                    .info-bar {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (max-width: 640px) {
                    .info-bar {
                        grid-template-columns: 1fr;
                    }
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
                    padding: 8px;
                    border: none;
                    background: transparent;
                    color: ${theme.textMuted};
                    font-size: 13px;
                    font-weight: 600;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
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
                    font-family: 'JetBrains Mono', 'SFMono-Regular', monospace;
                }

                .proxy-line {
                    display: flex;
                    gap: 12px;
                    padding: 8px 0;
                    border-bottom: 1px solid ${theme.border};
                    font-size: 13px;
                }

                .line-num {
                    color: ${theme.textMuted};
                    opacity: 0.8;
                    user-select: none;
                    min-width: 24px;
                }

                .line-content {
                    color: ${theme.text};
                    word-break: break-all;
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

                @media (max-width: 1024px) {
                    .generator-main-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .generated-viewer {
                        height: 400px;
                    }
                }

                @media (max-width: 640px) {
                    .info-bar {
                        gap: 12px;
                    }
                    .split-fields {
                        grid-template-columns: 1fr;
                    }
                }
            ` }} />
        </div >
    );
};

export default TrafficSetupPage;
