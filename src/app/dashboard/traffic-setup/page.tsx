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
    Minus
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

interface State {
    country_code: string;
    state_code: string;
    state_name: string;
}

interface City {
    country_code: string;
    state_code: string;
    city_code: string;
    city_name: string;
}

interface ASN {
    asn_code: string;
    asn_name: string;
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
    const [states, setStates] = useState<State[]>([]);
    const [selectedState, setSelectedState] = useState<State | null>(null);
    const [isStatesLoading, setIsStatesLoading] = useState(false);
    const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
    const [stateSearchQuery, setStateSearchQuery] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const [citySearchQuery, setCitySearchQuery] = useState('');
    const [asns, setAsns] = useState<ASN[]>([]);
    const [selectedAsn, setSelectedAsn] = useState<ASN | null>(null);
    const [isAsnsLoading, setIsAsnsLoading] = useState(false);
    const [isAsnDropdownOpen, setIsAsnDropdownOpen] = useState(false);
    const [asnSearchQuery, setAsnSearchQuery] = useState('');
    const [selectedHostname, setSelectedHostname] = useState('na.proxys5.net');
    const [isHostnameDropdownOpen, setIsHostnameDropdownOpen] = useState(false);
    const [selectedSessionType, setSelectedSessionType] = useState('Sticky IP');
    const [isSessionTypeDropdownOpen, setIsSessionTypeDropdownOpen] = useState(false);
    const [sessionDuration, setSessionDuration] = useState(15);
    const countryDropdownRef = useRef<HTMLDivElement>(null);
    const stateDropdownRef = useRef<HTMLDivElement>(null);
    const cityDropdownRef = useRef<HTMLDivElement>(null);
    const asnDropdownRef = useRef<HTMLDivElement>(null);
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
                const response = await axios.get('https://api.realproxy.net/api/Location/regions', {
                    headers: {
                        'accept': '*/*'
                    }
                });

                if (response.data && response.data.data) {
                    setRegions(response.data.data);
                    // Set default to Global if it exists
                    const global = response.data.data.find((r: Region) => r.country_name === 'Global');
                    if (global) {
                        setSelectedCountry(global);
                    } else if (response.data.data.length > 0) {
                        setSelectedCountry(response.data.data[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching regions:', error);
                toast.error('Failed to fetch country list.');
            } finally {
                setIsRegionsLoading(false);
            }
        };

        fetchProxyInfo();
        fetchRegions();
    }, [router]);

    // Fetch states when country changes
    useEffect(() => {
        const fetchStates = async () => {
            if (!selectedCountry || selectedCountry.country_name === 'Global') {
                setStates([]);
                setSelectedState(null);
                return;
            }

            setIsStatesLoading(true);
            try {
                const response = await axios.get(`https://api.realproxy.net/api/Location/states?country_code=${selectedCountry.country_code}`, {
                    headers: { 'accept': '*/*' }
                });

                if (response.data && response.data.data) {
                    setStates(response.data.data);
                    // Default to "Random" if found, else first state
                    const randomState = response.data.data.find((s: State) => s.state_name === 'Random');
                    if (randomState) {
                        setSelectedState(randomState);
                    } else if (response.data.data.length > 0) {
                        setSelectedState(response.data.data[0]);
                    } else {
                        setSelectedState(null);
                    }
                }
            } catch (error) {
                console.error('Error fetching states:', error);
                setSelectedState(null);
            } finally {
                setIsStatesLoading(false);
            }
        };

        fetchStates();
    }, [selectedCountry]);

    // Fetch cities when state changes
    useEffect(() => {
        const fetchCities = async () => {
            if (!selectedCountry || !selectedState || selectedState.state_name === 'Random') {
                setCities([]);
                setSelectedCity(null);
                return;
            }

            setIsCitiesLoading(true);
            try {
                const response = await axios.get(`https://api.realproxy.net/api/Location/citys?country_code=${selectedCountry.country_code}&state_code=${selectedState.state_code}`, {
                    headers: { 'accept': '*/*' }
                });

                if (response.data && response.data.data) {
                    setCities(response.data.data);
                    // Default to "Random" if found, else first city
                    const randomCity = response.data.data.find((c: City) => c.city_name === 'Random');
                    if (randomCity) {
                        setSelectedCity(randomCity);
                    } else if (response.data.data.length > 0) {
                        setSelectedCity(response.data.data[0]);
                    } else {
                        setSelectedCity(null);
                    }
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
                setSelectedCity(null);
            } finally {
                setIsCitiesLoading(false);
            }
        };

        fetchCities();
    }, [selectedCountry, selectedState]);

    // Fetch ASNs when country changes
    useEffect(() => {
        const fetchAsns = async () => {
            if (!selectedCountry || selectedCountry.country_name === 'Global') {
                setAsns([]);
                setSelectedAsn(null);
                return;
            }

            setIsAsnsLoading(true);
            try {
                const response = await axios.get(`https://api.realproxy.net/api/Location/asn?country_code=${selectedCountry.country_code}`, {
                    headers: { 'accept': '*/*' }
                });

                if (response.data && response.data.data) {
                    setAsns(response.data.data);
                    setSelectedAsn(null);
                }
            } catch (error) {
                console.error('Error fetching asns:', error);
                setSelectedAsn(null);
            } finally {
                setIsAsnsLoading(false);
            }
        };

        fetchAsns();
    }, [selectedCountry]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
                setIsCountryDropdownOpen(false);
            }
            if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
                setIsStateDropdownOpen(false);
            }
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
                setIsCityDropdownOpen(false);
            }
            if (asnDropdownRef.current && !asnDropdownRef.current.contains(event.target as Node)) {
                setIsAsnDropdownOpen(false);
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
        setSelectedState(null);
        setStateSearchQuery('');
        setIsStateDropdownOpen(false);
        setSelectedCity(null);
        setCitySearchQuery('');
        setIsCityDropdownOpen(false);
        setSelectedAsn(null);
        setAsnSearchQuery('');
        setIsAsnDropdownOpen(false);
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

    const renderProxySetup = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Top Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {/* Residential Proxies */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#4E5969', fontWeight: '500' }}>
                        Residential Proxies <Info size={16} color="#c9cdd4" strokeWidth={1.5} />
                    </div>
                    <div style={{ display: 'flex', gap: '2px', backgroundColor: '#f2f3f5', padding: '2px', borderRadius: '4px', alignSelf: 'flex-start', marginTop: '4px' }}>
                        <button
                            onClick={() => setUnit('GB')}
                            style={{
                                padding: '4px 18px', fontSize: '12px', borderRadius: '4px', border: 'none',
                                backgroundColor: unit === 'GB' ? '#1677ff' : 'transparent',
                                color: unit === 'GB' ? 'white' : '#4E5969',
                                fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >GB</button>
                        <button
                            onClick={() => setUnit('MB')}
                            style={{
                                padding: '4px 18px', fontSize: '12px', borderRadius: '4px', border: 'none',
                                backgroundColor: unit === 'MB' ? '#1677ff' : 'transparent',
                                color: unit === 'MB' ? 'white' : '#4E5969',
                                fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >MB</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '10px' }}>
                        <span style={{ fontSize: '36px', fontWeight: '700', color: '#1D2129' }}>0.00</span>
                        <span style={{ fontSize: '18px', fontWeight: '700', color: '#1D2129' }}>{unit}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#86909C', fontWeight: '500' }}>Expire Date:--</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                        <button
                            onClick={() => router.push('/?recharge=true#pricing-section')}
                            style={{ backgroundColor: '#165DFF', color: 'white', border: 'none', height: '38px', padding: '0 24px', borderRadius: '4px', fontWeight: '600', fontSize: '14px', flex: 1, cursor: 'pointer', boxShadow: '0 2px 4px rgba(22, 93, 255, 0.2)' }}
                        >
                            Recharge
                        </button>
                    </div>
                </div>

                {/* Traffic Left Reminder */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#4E5969', fontWeight: '500' }}>
                        Traffic Left Reminder <Info size={16} color="#c9cdd4" strokeWidth={1.5} />
                    </div>
                    <div
                        onClick={() => setTrafficReminder(!trafficReminder)}
                        style={{
                            width: '50px', height: '24px', borderRadius: '12px',
                            backgroundColor: trafficReminder ? '#165DFF' : '#c9cdd4',
                            position: 'relative', cursor: 'pointer', transition: 'all 0.3s',
                            marginTop: '12px'
                        }}
                    >
                        <div style={{
                            width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
                            position: 'absolute', top: '2px', left: trafficReminder ? '28px' : '2px',
                            transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }} />
                    </div>
                    <div style={{ fontSize: '13px', color: '#4E5969', lineHeight: '1.6', marginTop: '10px' }}>
                        Email will be sent when the GB amount is below your selection.
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', height: '40px', backgroundColor: '#f2f3f5', borderRadius: '4px', color: '#86909C', fontSize: '14px' }}>
                        <span style={{ fontWeight: '600' }}>GB</span>
                        <ChevronDown size={14} />
                    </div>
                </div>

                {/* Tutorial */}
                <div style={cardStyle}>
                    <div style={{ fontSize: '14px', color: '#4E5969', fontWeight: '700' }}>Tutorial</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                        <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#4e5969', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>
                            How to use Residential Proxies? <ChevronRight size={14} color="#86909C" />
                        </a>
                        <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#4e5969', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>
                            IP Whitelist Authentication <ChevronRight size={14} color="#86909C" />
                        </a>
                        <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#4e5969', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>
                            User&Pass Authentication <ChevronRight size={14} color="#86909C" />
                        </a>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '16px' }}>
                        <a href="#" style={{ color: '#165DFF', fontSize: '13px', textDecoration: 'none', fontWeight: '700' }}>More Tutorial</a>
                        <a href="#" style={{ color: '#165DFF', fontSize: '13px', textDecoration: 'none', fontWeight: '700' }}>Using Feedback</a>
                    </div>
                </div>


            </div>

            {/* Main Tabs Section */}
            <div style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>


                <div style={{ padding: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '60px' }}>
                        {/* Form Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '700', color: '#1D2129' }}>
                                        <div style={{ width: '4px', height: '16px', backgroundColor: '#1677ff', borderRadius: '2px' }} />
                                        Account and Password Information
                                    </div>
                                    <a href="#" style={{ color: '#1677ff', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>Tutorial</a>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            Username <Info size={14} color="#c9cdd4" strokeWidth={1.5} />
                                        </label>
                                        <div style={inputContainerStyle}>
                                            {isLoading ? (
                                                <Loader2 size={16} className="animate-spin" color="#86909C" />
                                            ) : (
                                                <>
                                                    <span style={{ flex: 1, fontWeight: '500' }}>{proxyInfo?.proxyAccount || 'N/A'}</span>
                                                    <Copy
                                                        size={16}
                                                        color="#86909C"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => {
                                                            if (proxyInfo?.proxyAccount) {
                                                                navigator.clipboard.writeText(proxyInfo.proxyAccount);
                                                                toast.success('Username copied!');
                                                            }
                                                        }}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600' }}>Password</label>
                                        <div style={inputContainerStyle}>
                                            {isLoading ? (
                                                <Loader2 size={16} className="animate-spin" color="#86909C" />
                                            ) : (
                                                <>
                                                    <span style={{ flex: 1, fontWeight: '500' }}>{proxyInfo?.proxyPassword || 'N/A'}</span>
                                                    <Copy
                                                        size={16}
                                                        color="#86909C"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => {
                                                            if (proxyInfo?.proxyPassword) {
                                                                navigator.clipboard.writeText(proxyInfo.proxyPassword);
                                                                toast.success('Password copied!');
                                                            }
                                                        }}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '700', color: '#1D2129' }}>
                                        <div style={{ width: '4px', height: '16px', backgroundColor: '#1677ff', borderRadius: '2px' }} />
                                        Location Settings
                                    </div>
                                    <span
                                        onClick={resetSelection}
                                        style={{ color: '#1677ff', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
                                    >Reset</span>
                                </div>


                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {/* Country/Region */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    Country/Region <Info size={14} color="#c9cdd4" strokeWidth={1.5} />
                                                </label>
                                                <a href="#" style={{ color: '#1677ff', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>Country list</a>
                                            </div>
                                            <div style={{ position: 'relative' }} ref={countryDropdownRef}>
                                                <div
                                                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                                    style={{
                                                        ...inputContainerStyle,
                                                        cursor: 'pointer',
                                                        border: isCountryDropdownOpen ? '1px solid #1677ff' : '1px solid transparent',
                                                        backgroundColor: 'white',
                                                        boxShadow: isCountryDropdownOpen ? '0 0 0 2px rgba(22, 119, 255, 0.1)' : 'none'
                                                    }}
                                                >
                                                    <Globe size={16} color={selectedCountry?.country_name === 'Global' ? '#0086ff' : '#86909C'} style={{ marginRight: '8px' }} />
                                                    <span style={{ flex: 1, fontWeight: '500' }}>
                                                        {isRegionsLoading ? 'Loading countries...' : (selectedCountry?.country_name || '(ALL) Global')}
                                                    </span>
                                                    {isRegionsLoading ? (
                                                        <Loader2 size={16} className="animate-spin" color="#86909C" />
                                                    ) : (
                                                        <ChevronDown
                                                            size={16}
                                                            color="#86909C"
                                                            style={{
                                                                transform: isCountryDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s'
                                                            }}
                                                        />
                                                    )}
                                                </div>

                                                {isCountryDropdownOpen && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 'calc(100% + 4px)',
                                                        left: 0,
                                                        right: 0,
                                                        backgroundColor: 'white',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)',
                                                        zIndex: 100,
                                                        overflow: 'hidden',
                                                        border: '1px solid #f0f0f0'
                                                    }}>
                                                        <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                backgroundColor: 'white',
                                                                borderRadius: '4px',
                                                                padding: '0 8px',
                                                                height: '32px',
                                                                border: '1px solid #e5e6eb'
                                                            }}>
                                                                <Search size={14} color="#86909C" style={{ marginRight: '6px' }} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search country..."
                                                                    value={countrySearchQuery}
                                                                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                                                                    autoFocus
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{
                                                                        border: 'none',
                                                                        outline: 'none',
                                                                        fontSize: '13px',
                                                                        width: '100%',
                                                                        color: '#1D2129'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="custom-scrollbar">
                                                            {regions
                                                                .filter(r => r.country_name.toLowerCase().includes(countrySearchQuery.toLowerCase()))
                                                                .map((country, idx) => (
                                                                    <div
                                                                        key={country.country_code || `global-${idx}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedCountry(country);
                                                                            setIsCountryDropdownOpen(false);
                                                                            setCountrySearchQuery('');
                                                                        }}
                                                                        style={{
                                                                            padding: '10px 12px',
                                                                            fontSize: '14px',
                                                                            color: selectedCountry?.country_name === country.country_name ? '#1677ff' : '#4E5969',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            backgroundColor: selectedCountry?.country_name === country.country_name ? '#e7f2ff' : 'transparent',
                                                                            transition: 'all 0.1s'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            if (selectedCountry?.country_name !== country.country_name) {
                                                                                e.currentTarget.style.backgroundColor = '#f7f8fa';
                                                                            }
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            if (selectedCountry?.country_name !== country.country_name) {
                                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                            }
                                                                        }}
                                                                    >
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            {country.country_name === 'Global' ? (
                                                                                <Globe size={14} color={selectedCountry?.country_name === 'Global' ? '#1677ff' : '#86909C'} />
                                                                            ) : (
                                                                                <span style={{ fontSize: '14px' }}>
                                                                                    {/* We could use flag icons here if we had them, defaulting to globe for now */}
                                                                                    <Globe size={14} color="#86909C" opacity={0.5} />
                                                                                </span>
                                                                            )}
                                                                            <span style={{ fontWeight: selectedCountry?.country_name === country.country_name ? '600' : '400' }}>
                                                                                {country.country_name === 'Global' ? '(ALL) Global' : country.country_name}
                                                                            </span>
                                                                        </div>
                                                                        {selectedCountry?.country_name === country.country_name && (
                                                                            <Check size={14} color="#1677ff" />
                                                                        )}
                                                                    </div>
                                                                ))
                                                            }
                                                            {regions.filter(r => r.country_name.toLowerCase().includes(countrySearchQuery.toLowerCase())).length === 0 && (
                                                                <div style={{ padding: '20px', textAlign: 'center', color: '#86909C', fontSize: '13px' }}>
                                                                    No countries found
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* City */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600' }}>City</label>
                                            <div style={{ position: 'relative' }} ref={cityDropdownRef}>
                                                <div
                                                    onClick={() => !isStatesLoading && !isCitiesLoading && cities.length > 0 && setIsCityDropdownOpen(!isCityDropdownOpen)}
                                                    style={{
                                                        ...inputContainerStyle,
                                                        cursor: (cities.length > 0) ? 'pointer' : 'default',
                                                        border: isCityDropdownOpen ? '1px solid #1677ff' : '1px solid transparent',
                                                        backgroundColor: (cities.length === 0) ? '#f7f8fa' : 'white',
                                                        boxShadow: isCityDropdownOpen ? '0 0 0 2px rgba(22, 119, 255, 0.1)' : 'none',
                                                        opacity: (cities.length === 0) ? 0.6 : 1
                                                    }}
                                                >
                                                    <span style={{ flex: 1, fontWeight: '500' }}>
                                                        {isCitiesLoading ? 'Loading...' : (selectedCity?.city_name || (selectedState?.state_name === 'Random' ? 'Random' : (cities.length === 0 ? 'No cities' : 'Random')))}
                                                    </span>
                                                    {isCitiesLoading ? (
                                                        <Loader2 size={16} className="animate-spin" color="#86909C" />
                                                    ) : cities.length > 0 && (
                                                        <ChevronDown
                                                            size={16}
                                                            color="#86909C"
                                                            style={{
                                                                transform: isCityDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s'
                                                            }}
                                                        />
                                                    )}
                                                </div>

                                                {isCityDropdownOpen && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 'calc(100% + 4px)',
                                                        left: 0,
                                                        right: 0,
                                                        backgroundColor: 'white',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)',
                                                        zIndex: 100,
                                                        overflow: 'hidden',
                                                        border: '1px solid #f0f0f0'
                                                    }}>
                                                        <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                backgroundColor: 'white',
                                                                borderRadius: '4px',
                                                                padding: '0 8px',
                                                                height: '32px',
                                                                border: '1px solid #e5e6eb'
                                                            }}>
                                                                <Search size={14} color="#86909C" style={{ marginRight: '6px' }} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search city..."
                                                                    value={citySearchQuery}
                                                                    onChange={(e) => setCitySearchQuery(e.target.value)}
                                                                    autoFocus
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{
                                                                        border: 'none',
                                                                        outline: 'none',
                                                                        fontSize: '13px',
                                                                        width: '100%',
                                                                        color: '#1D2129'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div style={{ maxHeight: '250px', overflowY: 'auto' }} className="custom-scrollbar">
                                                            {cities
                                                                .filter(c => c.city_name.toLowerCase().includes(citySearchQuery.toLowerCase()))
                                                                .map((city, idx) => (
                                                                    <div
                                                                        key={city.city_code || `city-${idx}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedCity(city);
                                                                            setIsCityDropdownOpen(false);
                                                                            setCitySearchQuery('');
                                                                        }}
                                                                        style={{
                                                                            padding: '10px 12px',
                                                                            fontSize: '14px',
                                                                            color: selectedCity?.city_name === city.city_name ? '#1677ff' : '#4E5969',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            backgroundColor: selectedCity?.city_name === city.city_name ? '#e7f2ff' : 'transparent',
                                                                            transition: 'all 0.1s'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            if (selectedCity?.city_name !== city.city_name) {
                                                                                e.currentTarget.style.backgroundColor = '#f7f8fa';
                                                                            }
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            if (selectedCity?.city_name !== city.city_name) {
                                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                            }
                                                                        }}
                                                                    >
                                                                        <span style={{ fontWeight: selectedCity?.city_name === city.city_name ? '600' : '400' }}>
                                                                            {city.city_name}
                                                                        </span>
                                                                        {selectedCity?.city_name === city.city_name && (
                                                                            <Check size={14} color="#1677ff" />
                                                                        )}
                                                                    </div>
                                                                ))
                                                            }
                                                            {cities.filter(c => c.city_name.toLowerCase().includes(citySearchQuery.toLowerCase())).length === 0 && (
                                                                <div style={{ padding: '20px', textAlign: 'center', color: '#86909C', fontSize: '13px' }}>
                                                                    No cities found
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Hostname */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    Hostname <Info size={14} color="#c9cdd4" strokeWidth={1.5} />
                                                </label>
                                                <Copy
                                                    size={14}
                                                    color="#86909C"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(selectedHostname);
                                                        toast.success('Hostname copied!');
                                                    }}
                                                />
                                            </div>
                                            <div style={{ position: 'relative' }} ref={hostnameDropdownRef}>
                                                <div
                                                    onClick={() => setIsHostnameDropdownOpen(!isHostnameDropdownOpen)}
                                                    style={{
                                                        ...inputContainerStyle,
                                                        cursor: 'pointer',
                                                        border: isHostnameDropdownOpen ? '1px solid #1677ff' : '1px solid #e5e6eb',
                                                        backgroundColor: 'white',
                                                        boxShadow: isHostnameDropdownOpen ? '0 0 0 2px rgba(22, 119, 255, 0.1)' : 'none'
                                                    }}
                                                >
                                                    <span style={{ flex: 1, fontWeight: '500' }}>{selectedHostname}</span>
                                                    <ChevronDown
                                                        size={16}
                                                        color="#86909C"
                                                        style={{
                                                            transform: isHostnameDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            transition: 'transform 0.2s'
                                                        }}
                                                    />
                                                </div>

                                                {isHostnameDropdownOpen && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 'calc(100% + 4px)',
                                                        left: 0,
                                                        right: 0,
                                                        backgroundColor: 'white',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)',
                                                        zIndex: 100,
                                                        overflow: 'hidden',
                                                        border: '1px solid #f0f0f0'
                                                    }}>
                                                        {['na.proxys5.net', 'as.proxys5.net', 'eu.proxys5.net', 'ea.proxys5.net'].map((host) => (
                                                            <div
                                                                key={host}
                                                                onClick={() => {
                                                                    setSelectedHostname(host);
                                                                    setIsHostnameDropdownOpen(false);
                                                                }}
                                                                style={{
                                                                    padding: '10px 12px',
                                                                    fontSize: '14px',
                                                                    color: selectedHostname === host ? '#1677ff' : '#4E5969',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    backgroundColor: selectedHostname === host ? '#e7f2ff' : 'transparent',
                                                                    transition: 'all 0.1s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (selectedHostname !== host) {
                                                                        e.currentTarget.style.backgroundColor = '#f7f8fa';
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (selectedHostname !== host) {
                                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                                    }
                                                                }}
                                                            >
                                                                <span>{host}</span>
                                                                {selectedHostname === host && <Check size={14} color="#1677ff" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {/* State */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600' }}>State</label>
                                            </div>
                                            <div style={{ position: 'relative' }} ref={stateDropdownRef}>
                                                <div
                                                    onClick={() => !isRegionsLoading && !isStatesLoading && states.length > 0 && setIsStateDropdownOpen(!isStateDropdownOpen)}
                                                    style={{
                                                        ...inputContainerStyle,
                                                        cursor: (states.length > 0) ? 'pointer' : 'default',
                                                        border: isStateDropdownOpen ? '1px solid #1677ff' : '1px solid transparent',
                                                        backgroundColor: (states.length === 0) ? '#f7f8fa' : 'white',
                                                        boxShadow: isStateDropdownOpen ? '0 0 0 2px rgba(22, 119, 255, 0.1)' : 'none',
                                                        opacity: (states.length === 0) ? 0.6 : 1
                                                    }}
                                                >
                                                    <span style={{ flex: 1, fontWeight: '500' }}>
                                                        {isStatesLoading ? 'Loading...' : (selectedState?.state_name || (selectedCountry?.country_name === 'Global' ? 'Random' : (states.length === 0 ? 'No states' : 'Random')))}
                                                    </span>
                                                    {isStatesLoading ? (
                                                        <Loader2 size={16} className="animate-spin" color="#86909C" />
                                                    ) : states.length > 0 && (
                                                        <ChevronDown
                                                            size={16}
                                                            color="#86909C"
                                                            style={{
                                                                transform: isStateDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s'
                                                            }}
                                                        />
                                                    )}
                                                </div>

                                                {isStateDropdownOpen && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 'calc(100% + 4px)',
                                                        left: 0,
                                                        right: 0,
                                                        backgroundColor: 'white',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)',
                                                        zIndex: 100,
                                                        overflow: 'hidden',
                                                        border: '1px solid #f0f0f0'
                                                    }}>
                                                        <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                backgroundColor: 'white',
                                                                borderRadius: '4px',
                                                                padding: '0 8px',
                                                                height: '32px',
                                                                border: '1px solid #e5e6eb'
                                                            }}>
                                                                <Search size={14} color="#86909C" style={{ marginRight: '6px' }} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search state..."
                                                                    value={stateSearchQuery}
                                                                    onChange={(e) => setStateSearchQuery(e.target.value)}
                                                                    autoFocus
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{
                                                                        border: 'none',
                                                                        outline: 'none',
                                                                        fontSize: '13px',
                                                                        width: '100%',
                                                                        color: '#1D2129'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div style={{ maxHeight: '250px', overflowY: 'auto' }} className="custom-scrollbar">
                                                            {states
                                                                .filter(s => s.state_name.toLowerCase().includes(stateSearchQuery.toLowerCase()))
                                                                .map((state, idx) => (
                                                                    <div
                                                                        key={state.state_code || `state-${idx}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedState(state);
                                                                            setIsStateDropdownOpen(false);
                                                                            setStateSearchQuery('');
                                                                        }}
                                                                        style={{
                                                                            padding: '10px 12px',
                                                                            fontSize: '14px',
                                                                            color: selectedState?.state_name === state.state_name ? '#1677ff' : '#4E5969',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            backgroundColor: selectedState?.state_name === state.state_name ? '#e7f2ff' : 'transparent',
                                                                            transition: 'all 0.1s'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            if (selectedState?.state_name !== state.state_name) {
                                                                                e.currentTarget.style.backgroundColor = '#f7f8fa';
                                                                            }
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            if (selectedState?.state_name !== state.state_name) {
                                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                            }
                                                                        }}
                                                                    >
                                                                        <span style={{ fontWeight: selectedState?.state_name === state.state_name ? '600' : '400' }}>
                                                                            {state.state_name}
                                                                        </span>
                                                                        {selectedState?.state_name === state.state_name && (
                                                                            <Check size={14} color="#1677ff" />
                                                                        )}
                                                                    </div>
                                                                ))
                                                            }
                                                            {states.filter(s => s.state_name.toLowerCase().includes(stateSearchQuery.toLowerCase())).length === 0 && (
                                                                <div style={{ padding: '20px', textAlign: 'center', color: '#86909C', fontSize: '13px' }}>
                                                                    No states found
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ASN */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600' }}>ASN</label>
                                            </div>
                                            <div style={{ position: 'relative' }} ref={asnDropdownRef}>
                                                <div
                                                    onClick={() => !isRegionsLoading && !isAsnsLoading && asns.length > 0 && setIsAsnDropdownOpen(!isAsnDropdownOpen)}
                                                    style={{
                                                        ...inputContainerStyle,
                                                        cursor: (asns.length > 0) ? 'pointer' : 'default',
                                                        border: isAsnDropdownOpen ? '1px solid #1677ff' : '1px solid transparent',
                                                        backgroundColor: (asns.length === 0) ? '#f7f8fa' : 'white',
                                                        boxShadow: isAsnDropdownOpen ? '0 0 0 2px rgba(22, 119, 255, 0.1)' : 'none',
                                                        opacity: (asns.length === 0) ? 0.6 : 1
                                                    }}
                                                >
                                                    <span style={{ flex: 1, fontWeight: '500' }}>
                                                        {isAsnsLoading ? 'Loading...' : (selectedAsn?.asn_name || (selectedCountry?.country_name === 'Global' ? 'Random' : (asns.length === 0 ? 'No ASNs' : 'Random')))}
                                                    </span>
                                                    {isAsnsLoading ? (
                                                        <Loader2 size={16} className="animate-spin" color="#86909C" />
                                                    ) : asns.length > 0 && (
                                                        <ChevronDown
                                                            size={16}
                                                            color="#86909C"
                                                            style={{
                                                                transform: isAsnDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s'
                                                            }}
                                                        />
                                                    )}
                                                </div>

                                                {isAsnDropdownOpen && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 'calc(100% + 4px)',
                                                        left: 0,
                                                        right: 0,
                                                        backgroundColor: 'white',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)',
                                                        zIndex: 100,
                                                        overflow: 'hidden',
                                                        border: '1px solid #f0f0f0'
                                                    }}>
                                                        <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                backgroundColor: 'white',
                                                                borderRadius: '4px',
                                                                padding: '0 8px',
                                                                height: '32px',
                                                                border: '1px solid #e5e6eb'
                                                            }}>
                                                                <Search size={14} color="#86909C" style={{ marginRight: '6px' }} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search ASN..."
                                                                    value={asnSearchQuery}
                                                                    onChange={(e) => setAsnSearchQuery(e.target.value)}
                                                                    autoFocus
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{
                                                                        border: 'none',
                                                                        outline: 'none',
                                                                        fontSize: '13px',
                                                                        width: '100%',
                                                                        color: '#1D2129'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div style={{ maxHeight: '250px', overflowY: 'auto' }} className="custom-scrollbar">
                                                            {asns
                                                                .filter(a => a.asn_name.toLowerCase().includes(asnSearchQuery.toLowerCase()) || a.asn_code.toLowerCase().includes(asnSearchQuery.toLowerCase()))
                                                                .map((asn, idx) => (
                                                                    <div
                                                                        key={asn.asn_code || `asn-${idx}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedAsn(asn);
                                                                            setIsAsnDropdownOpen(false);
                                                                            setAsnSearchQuery('');
                                                                        }}
                                                                        style={{
                                                                            padding: '10px 12px',
                                                                            fontSize: '14px',
                                                                            color: selectedAsn?.asn_code === asn.asn_code ? '#1677ff' : '#4E5969',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            backgroundColor: selectedAsn?.asn_code === asn.asn_code ? '#e7f2ff' : 'transparent',
                                                                            transition: 'all 0.1s'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            if (selectedAsn?.asn_code !== asn.asn_code) {
                                                                                e.currentTarget.style.backgroundColor = '#f7f8fa';
                                                                            }
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            if (selectedAsn?.asn_code !== asn.asn_code) {
                                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                            }
                                                                        }}
                                                                    >
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                            <span style={{ fontWeight: selectedAsn?.asn_code === asn.asn_code ? '600' : '400' }}>
                                                                                {asn.asn_name}
                                                                            </span>
                                                                            <span style={{ fontSize: '11px', color: '#86909C' }}>{asn.asn_code}</span>
                                                                        </div>
                                                                        {selectedAsn?.asn_code === asn.asn_code && (
                                                                            <Check size={14} color="#1677ff" />
                                                                        )}
                                                                    </div>
                                                                ))
                                                            }
                                                            {asns.filter(a => a.asn_name.toLowerCase().includes(asnSearchQuery.toLowerCase()) || a.asn_code.toLowerCase().includes(asnSearchQuery.toLowerCase())).length === 0 && (
                                                                <div style={{ padding: '20px', textAlign: 'center', color: '#86909C', fontSize: '13px' }}>
                                                                    No ASNs found
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Port */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    Port <Info size={14} color="#c9cdd4" strokeWidth={1.5} />
                                                </label>
                                                <Copy
                                                    size={14}
                                                    color="#86909C"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => {
                                                        navigator.clipboard.writeText('6200');
                                                        toast.success('Port copied!');
                                                    }}
                                                />
                                            </div>
                                            <div style={{ ...inputContainerStyle, backgroundColor: '#f7f8fa', border: '1px solid #e5e6eb', cursor: 'default' }}>
                                                <span style={{ fontWeight: '500', color: '#1D2129' }}>6200</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Session Settings */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px', borderTop: '1px solid #f0f0f0', paddingTop: '32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '700', color: '#1D2129' }}>
                                        <div style={{ width: '4px', height: '16px', backgroundColor: '#1677ff', borderRadius: '2px' }} />
                                        Session Settings <Info size={14} color="#c9cdd4" strokeWidth={1.5} style={{ marginLeft: '4px' }} />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '60px' }}>
                                        {/* Session type */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600' }}>Session type</label>
                                            <div style={{ position: 'relative' }} ref={sessionTypeDropdownRef}>
                                                <div
                                                    onClick={() => setIsSessionTypeDropdownOpen(!isSessionTypeDropdownOpen)}
                                                    style={{
                                                        ...inputContainerStyle,
                                                        cursor: 'pointer',
                                                        border: isSessionTypeDropdownOpen ? '1px solid #1677ff' : '1px solid #e5e6eb',
                                                        backgroundColor: 'white',
                                                        boxShadow: isSessionTypeDropdownOpen ? '0 0 0 2px rgba(22, 119, 255, 0.1)' : 'none'
                                                    }}
                                                >
                                                    <span style={{ flex: 1, fontWeight: '500' }}>{selectedSessionType}</span>
                                                    <ChevronDown
                                                        size={16}
                                                        color="#86909C"
                                                        style={{
                                                            transform: isSessionTypeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            transition: 'transform 0.2s'
                                                        }}
                                                    />
                                                </div>

                                                {isSessionTypeDropdownOpen && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 'calc(100% + 4px)',
                                                        left: 0,
                                                        right: 0,
                                                        backgroundColor: 'white',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)',
                                                        zIndex: 100,
                                                        overflow: 'hidden',
                                                        border: '1px solid #f0f0f0'
                                                    }}>
                                                        {['Sticky IP', 'Rotating IP'].map((type) => (
                                                            <div
                                                                key={type}
                                                                onClick={() => {
                                                                    setSelectedSessionType(type);
                                                                    setIsSessionTypeDropdownOpen(false);
                                                                }}
                                                                style={{
                                                                    padding: '10px 12px',
                                                                    fontSize: '14px',
                                                                    color: selectedSessionType === type ? '#1677ff' : '#4E5969',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    backgroundColor: selectedSessionType === type ? '#e7f2ff' : 'transparent',
                                                                    transition: 'all 0.1s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (selectedSessionType !== type) {
                                                                        e.currentTarget.style.backgroundColor = '#f7f8fa';
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (selectedSessionType !== type) {
                                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                                    }
                                                                }}
                                                            >
                                                                <span>{type}</span>
                                                                {selectedSessionType === type && <Check size={14} color="#1677ff" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Duration */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600' }}>Duration</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    border: '1px solid #e5e6eb',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden',
                                                    height: '40px',
                                                    backgroundColor: 'white'
                                                }}>
                                                    <button
                                                        onClick={() => setSessionDuration(prev => Math.max(1, prev - 1))}
                                                        style={{ width: '36px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86909C' }}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <div style={{ width: '60px', textAlign: 'center', fontSize: '14px', fontWeight: '600', borderLeft: '1px solid #e5e6eb', borderRight: '1px solid #e5e6eb', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {sessionDuration}
                                                    </div>
                                                    <button
                                                        onClick={() => setSessionDuration(prev => Math.min(120, prev + 1))}
                                                        style={{ width: '36px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1677ff' }}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <span style={{ fontSize: '13px', color: '#86909C' }}>(1-120 minutes)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Result Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ backgroundColor: '#f7f8fa', borderRadius: '8px', padding: '20px', border: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '14px', color: '#1D2129', fontWeight: '700' }}>Example</span>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: '#1677ff', cursor: 'pointer', fontWeight: '600' }}>Other languages</span>
                                        <Copy
                                            size={20}
                                            color="#86909C"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                const curlCommand = `curl -x ${selectedHostname}:6200 -U "${proxyInfo?.proxyAccount || 'username'}-sessid-XcivyX4zy-sessTime-${sessionDuration}:${proxyInfo?.proxyPassword || 'password'}" ipinfo.io`;
                                                navigator.clipboard.writeText(curlCommand);
                                                toast.success('Example copied!');
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#4E5969', lineHeight: '2', wordBreak: 'break-all', fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', fontWeight: '500' }}>
                                    {isLoading ? (
                                        <span>Loading...</span>
                                    ) : (
                                        `curl -x ${selectedHostname}:6200 -U "${proxyInfo?.proxyAccount || 'username'}-sessid-XcivyX4zy-sessTime-${sessionDuration}:${proxyInfo?.proxyPassword || 'password'}" ipinfo.io`
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#1D2129' }}>Formatted Proxy List</div>
                                <div style={{ display: 'flex', padding: '4px', backgroundColor: '#f2f3f5', borderRadius: '6px' }}>
                                    <button style={{ flex: 1, height: '36px', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '700', backgroundColor: '#0086ff', color: 'white', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0, 134, 255, 0.2)' }}>Link</button>
                                    <button style={{ flex: 1, height: '36px', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '600', backgroundColor: 'transparent', color: '#4E5969', cursor: 'pointer' }}>QR Code</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', color: '#86909C', fontWeight: '600' }}>Protocol</label>
                                        <div style={{ ...inputContainerStyle, backgroundColor: 'white', border: '1px solid #f0f0f0' }}>
                                            <span style={{ flex: 1, fontWeight: '500' }}>Endpoint port</span>
                                            <ChevronDown size={14} color="#86909C" />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', color: '#86909C', fontWeight: '600' }}>Format</label>
                                        <div style={{ ...inputContainerStyle, backgroundColor: 'white', border: '1px solid #f0f0f0' }}>
                                            <span style={{ flex: 1, fontSize: '12px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis' }}>hostname:port:username...</span>
                                            <ChevronDown size={14} color="#86909C" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            {/* Top Navigation Mode */}
            <div style={{ display: 'flex', gap: '60px', borderBottom: '1px solid #f0f0f0', marginBottom: '36px' }}>
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

            {activeTab === 'Proxy Setup' ? renderProxySetup() : (
                <div style={{ padding: '120px 40px', textAlign: 'center', color: '#86909C', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <RefreshCw size={48} style={{ opacity: 0.1, marginBottom: '24px' }} />
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#1D2129', marginBottom: '8px' }}>No Data Available</div>
                    <div style={{ fontSize: '14px', color: '#86909C' }}>Statistics dynamic data will be displayed once there is usage.</div>
                </div>
            )}

            <style jsx>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default TrafficSetupPage;
