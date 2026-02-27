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
    const [selectedHostname, setSelectedHostname] = useState('na.proxys5.net');
    const [isHostnameDropdownOpen, setIsHostnameDropdownOpen] = useState(false);
    const [selectedSessionType, setSelectedSessionType] = useState('Sticky IP');
    const [isSessionTypeDropdownOpen, setIsSessionTypeDropdownOpen] = useState(false);
    const [sessionDuration, setSessionDuration] = useState(15);
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

    const renderProxySetup = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Top Cards Grid */}
            <div className="setup-top-grid">
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


                <div style={{ padding: '24px 16px' }}>
                    <div className="setup-main-grid">
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
                                        {/* Country */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    Country <Info size={14} color="#c9cdd4" strokeWidth={1.5} />
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

                                        {/* Region Dropdown (from 'regions' API) */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600' }}>Region</label>
                                            </div>
                                            <div style={{ position: 'relative' }} ref={subRegionDropdownRef}>
                                                <div
                                                    onClick={() => !isRegionsLoading && !isSubRegionsLoading && subRegions.length > 0 && setIsSubRegionDropdownOpen(!isSubRegionDropdownOpen)}
                                                    style={{
                                                        ...inputContainerStyle,
                                                        cursor: (subRegions.length > 0) ? 'pointer' : 'default',
                                                        border: isSubRegionDropdownOpen ? '1px solid #1677ff' : '1px solid transparent',
                                                        backgroundColor: (subRegions.length === 0) ? '#f7f8fa' : 'white',
                                                        boxShadow: isSubRegionDropdownOpen ? '0 0 0 2px rgba(22, 119, 255, 0.1)' : 'none',
                                                        opacity: (subRegions.length === 0) ? 0.6 : 1
                                                    }}
                                                >
                                                    <span style={{ flex: 1, fontWeight: '500' }}>
                                                        {isSubRegionsLoading ? 'Loading...' : (selectedSubRegion?.name || (selectedCountry?.country_name === 'Global' ? 'Random' : (subRegions.length === 0 ? 'No regions' : 'Random')))}
                                                    </span>
                                                    {isSubRegionsLoading ? (
                                                        <Loader2 size={16} className="animate-spin" color="#86909C" />
                                                    ) : subRegions.length > 0 && (
                                                        <ChevronDown
                                                            size={16}
                                                            color="#86909C"
                                                            style={{
                                                                transform: isSubRegionDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s'
                                                            }}
                                                        />
                                                    )}
                                                </div>

                                                {isSubRegionDropdownOpen && (
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
                                                                    placeholder="Search region..."
                                                                    value={subRegionSearchQuery}
                                                                    onChange={(e) => setSubRegionSearchQuery(e.target.value)}
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
                                                            {subRegions
                                                                .filter(s => s.name.toLowerCase().includes(subRegionSearchQuery.toLowerCase()))
                                                                .map((region, idx) => (
                                                                    <div
                                                                        key={region.id || `region-${idx}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedSubRegion(region);
                                                                            setIsSubRegionDropdownOpen(false);
                                                                            setSubRegionSearchQuery('');
                                                                        }}
                                                                        style={{
                                                                            padding: '10px 12px',
                                                                            fontSize: '14px',
                                                                            color: selectedSubRegion?.id === region.id ? '#1677ff' : '#4E5969',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            backgroundColor: selectedSubRegion?.id === region.id ? '#e7f2ff' : 'transparent',
                                                                            transition: 'all 0.1s'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            if (selectedSubRegion?.id !== region.id) {
                                                                                e.currentTarget.style.backgroundColor = '#f7f8fa';
                                                                            }
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            if (selectedSubRegion?.id !== region.id) {
                                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                            }
                                                                        }}
                                                                    >
                                                                        <span style={{ fontWeight: selectedSubRegion?.id === region.id ? '600' : '400' }}>
                                                                            {region.name}
                                                                        </span>
                                                                        {selectedSubRegion?.id === region.id && (
                                                                            <Check size={14} color="#1677ff" />
                                                                        )}
                                                                    </div>
                                                                ))
                                                            }
                                                            {subRegions.filter(s => s.name.toLowerCase().includes(subRegionSearchQuery.toLowerCase())).length === 0 && (
                                                                <div style={{ padding: '20px', textAlign: 'center', color: '#86909C', fontSize: '13px' }}>
                                                                    No regions found
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
                                        {/* City (Moved from left column) */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600' }}>City</label>
                                            <div style={{ position: 'relative' }} ref={cityDropdownRef}>
                                                <div
                                                    onClick={() => !isCitiesLoading && cities.length > 0 && setIsCityDropdownOpen(!isCityDropdownOpen)}
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
                                                        {isCitiesLoading ? 'Loading...' : (selectedCity?.name || (cities.length === 0 ? 'No cities' : 'Random'))}
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
                                                                .filter(c => c.name.toLowerCase().includes(citySearchQuery.toLowerCase()))
                                                                .map((city, idx) => (
                                                                    <div
                                                                        key={city.id || `city-${idx}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedCity(city);
                                                                            setIsCityDropdownOpen(false);
                                                                            setCitySearchQuery('');
                                                                        }}
                                                                        style={{
                                                                            padding: '10px 12px',
                                                                            fontSize: '14px',
                                                                            color: (selectedCity?.id === city.id || selectedCity?.name === city.name) ? '#1677ff' : '#4E5969',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            backgroundColor: (selectedCity?.id === city.id || selectedCity?.name === city.name) ? '#e7f2ff' : 'transparent',
                                                                            transition: 'all 0.1s'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            if (selectedCity?.id !== city.id && selectedCity?.name !== city.name) {
                                                                                e.currentTarget.style.backgroundColor = '#f7f8fa';
                                                                            }
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            if (selectedCity?.id !== city.id && selectedCity?.name !== city.name) {
                                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                            }
                                                                        }}
                                                                    >
                                                                        <span style={{ fontWeight: (selectedCity?.id === city.id || selectedCity?.name === city.name) ? '600' : '400' }}>
                                                                            {city.name}
                                                                        </span>
                                                                        {(selectedCity?.id === city.id || selectedCity?.name === city.name) && (
                                                                            <Check size={14} color="#1677ff" />
                                                                        )}
                                                                    </div>
                                                                ))
                                                            }
                                                            {cities.filter(c => c.name.toLowerCase().includes(citySearchQuery.toLowerCase())).length === 0 && (
                                                                <div style={{ padding: '20px', textAlign: 'center', color: '#86909C', fontSize: '13px' }}>
                                                                    No cities found
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ISP (Formerly ASN) - Commented out per user request
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600' }}>ISP</label>
                                            </div>
                                            <div style={{ position: 'relative' }} ref={ispDropdownRef}>
                                                <div
                                                    onClick={() => !isRegionsLoading && !isIspsLoading && isps.length > 0 && setIsIspDropdownOpen(!isIspDropdownOpen)}
                                                    style={{
                                                        ...inputContainerStyle,
                                                        cursor: (isps.length > 0) ? 'pointer' : 'default',
                                                        border: isIspDropdownOpen ? '1px solid #1677ff' : '1px solid transparent',
                                                        backgroundColor: (isps.length === 0) ? '#f7f8fa' : 'white',
                                                        boxShadow: isIspDropdownOpen ? '0 0 0 2px rgba(22, 119, 255, 0.1)' : 'none',
                                                        opacity: (isps.length === 0) ? 0.6 : 1
                                                    }}
                                                >
                                                    <span style={{ flex: 1, fontWeight: '500' }}>
                                                        {isIspsLoading ? 'Loading...' : (selectedIsp?.name || (selectedCountry?.country_name === 'Global' ? 'Random' : (isps.length === 0 ? 'No ISPs' : 'Random')))}
                                                    </span>
                                                    {isIspsLoading ? (
                                                        <Loader2 size={16} className="animate-spin" color="#86909C" />
                                                    ) : isps.length > 0 && (
                                                        <ChevronDown
                                                            size={16}
                                                            color="#86909C"
                                                            style={{
                                                                transform: isIspDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s'
                                                            }}
                                                        />
                                                    )}
                                                </div>

                                                {isIspDropdownOpen && (
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
                                                                    placeholder="Search ISP..."
                                                                    value={ispSearchQuery}
                                                                    onChange={(e) => setIspSearchQuery(e.target.value)}
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
                                                            {isps
                                                                .filter(i => i.name.toLowerCase().includes(ispSearchQuery.toLowerCase()))
                                                                .map((isp, idx) => (
                                                                    <div
                                                                        key={isp.value || `isp-${idx}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedIsp(isp);
                                                                            setIsIspDropdownOpen(false);
                                                                            setIspSearchQuery('');
                                                                        }}
                                                                        style={{
                                                                            padding: '10px 12px',
                                                                            fontSize: '14px',
                                                                            color: selectedIsp?.value === isp.value ? '#1677ff' : '#4E5969',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            backgroundColor: selectedIsp?.value === isp.value ? '#e7f2ff' : 'transparent',
                                                                            transition: 'all 0.1s'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            if (selectedIsp?.value !== isp.value) {
                                                                                e.currentTarget.style.backgroundColor = '#f7f8fa';
                                                                            }
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            if (selectedIsp?.value !== isp.value) {
                                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                            }
                                                                        }}
                                                                    >
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                            <span style={{ fontWeight: selectedIsp?.value === isp.value ? '600' : '400' }}>
                                                                                {isp.name}
                                                                            </span>
                                                                            <span style={{ fontSize: '11px', color: '#86909C' }}>{isp.value}</span>
                                                                        </div>
                                                                        {selectedIsp?.value === isp.value && (
                                                                            <Check size={14} color="#1677ff" />
                                                                        )}
                                                                    </div>
                                                                ))
                                                            }
                                                            {isps.filter(i => i.name.toLowerCase().includes(ispSearchQuery.toLowerCase())).length === 0 && (
                                                                <div style={{ padding: '20px', textAlign: 'center', color: '#86909C', fontSize: '13px' }}>
                                                                    No ISPs found
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        */}

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

                                    <div className="setup-input-row" style={{ gap: '32px' }}>
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
                                                const countryPart = selectedCountry && selectedCountry.country_name !== 'Global' ? `-country-${selectedCountry.country_code}` : '';
                                                const cityPart = selectedCity ? `-city-${selectedCity.name.replace(/\s+/g, '_')}` : '';
                                                const regionPart = selectedSubRegion ? `-region-${selectedSubRegion.name.replace(/\s+/g, '_')}` : '';

                                                const curlCommand = `curl -x ${selectedHostname}:6200 -U "${proxyInfo?.proxyAccount || 'username'}${countryPart}${regionPart}${cityPart}-sessid-XcivyX4zy-sessTime-${sessionDuration}:${proxyInfo?.proxyPassword || 'password'}" ipinfo.io`;
                                                navigator.clipboard.writeText(curlCommand);
                                                toast.success('Example copied!');
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#4E5969', lineHeight: '2', wordBreak: 'break-all', fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', fontWeight: '500' }}>
                                    {isLoading ? (
                                        <span>Loading...</span>
                                    ) : (() => {
                                        const countryPart = selectedCountry && selectedCountry.country_name !== 'Global' ? `-country-${selectedCountry.country_code}` : '';
                                        const cityPart = selectedCity ? `-city-${selectedCity.name.replace(/\s+/g, '_')}` : '';
                                        const regionPart = selectedSubRegion ? `-region-${selectedSubRegion.name.replace(/\s+/g, '_')}` : '';
                                        return `curl -x ${selectedHostname}:6200 -U "${proxyInfo?.proxyAccount || 'username'}${countryPart}${regionPart}${cityPart}-sessid-XcivyX4zy-sessTime-${sessionDuration}:${proxyInfo?.proxyPassword || 'password'}" ipinfo.io`;
                                    })()}
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

                .setup-top-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }

                .setup-main-grid {
                    display: grid;
                    grid-template-columns: 1.25fr 0.75fr;
                    gap: 40px;
                }

                .setup-input-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                @media (max-width: 1200px) {
                    .setup-main-grid {
                        grid-template-columns: 1fr;
                        gap: 32px;
                    }
                }

                @media (max-width: 900px) {
                    .setup-top-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 640px) {
                    .setup-input-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default TrafficSetupPage;
