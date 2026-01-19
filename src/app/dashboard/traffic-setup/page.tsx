"use client";

import React, { useState } from 'react';
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
    ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const TrafficSetupPage = () => {
    const [activeTab, setActiveTab] = useState('Proxy Setup');
    const [activeExtractionTab, setActiveExtractionTab] = useState('Username:Password');
    const [activeSettingTab, setActiveSettingTab] = useState('Basic settings');
    const [trafficReminder, setTrafficReminder] = useState(false);
    const [unit, setUnit] = useState('GB');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
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
                        <button style={{ backgroundColor: '#165DFF', color: 'white', border: 'none', height: '38px', padding: '0 24px', borderRadius: '4px', fontWeight: '600', fontSize: '14px', flex: 1, cursor: 'pointer', boxShadow: '0 2px 4px rgba(22, 93, 255, 0.2)' }}>Recharge</button>
                        <a href="#" style={{ color: '#165DFF', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Redeem CDKey</a>
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

                {/* Download */}
                <div style={{ ...cardStyle }}>
                    <div style={{ width: '100%', textAlign: 'right', fontSize: '14px', color: '#4E5969', fontWeight: '700' }}>Download</div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Monitor size={52} color="#165DFF" strokeWidth={1} />
                        <div style={{ fontWeight: '700', fontSize: '16px', color: '#1D2129', marginTop: '4px' }}>Proxy Manager</div>
                        <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#165DFF', fontSize: '14px', textDecoration: 'none', fontWeight: '700' }}>
                            Download <ChevronRight size={16} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Tabs Section */}
            <div style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                {/* Secondary Navigation */}
                <div style={{ display: 'flex', backgroundColor: '#f2f3f5', borderBottom: '1px solid #f0f0f0', padding: '6px 24px 0', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', gap: '4px' }}>
                    {['Username:Password', 'Whitelisted IPs'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveExtractionTab(tab)}
                            style={{
                                padding: '12px 28px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: activeExtractionTab === tab ? '#1677ff' : '#4E5969',
                                cursor: 'pointer',
                                backgroundColor: activeExtractionTab === tab ? 'white' : 'transparent',
                                borderTopLeftRadius: '6px',
                                borderTopRightRadius: '6px',
                                borderLeft: activeExtractionTab === tab ? '1px solid #f0f0f0' : '1px solid transparent',
                                borderRight: activeExtractionTab === tab ? '1px solid #f0f0f0' : '1px solid transparent',
                                borderTop: activeExtractionTab === tab ? '1px solid #f0f0f0' : '1px solid transparent',
                                marginBottom: '-1px'
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                <div style={{ padding: '32px' }}>
                    {/* Setup Category Tabs */}
                    <div style={{ display: 'flex', gap: '44px', borderBottom: '1px solid #f0f0f0', marginBottom: '32px' }}>
                        {['Basic settings', 'Advanced Settings', 'Code examples', 'Sub-Users'].map(tab => (
                            <div
                                key={tab}
                                onClick={() => setActiveSettingTab(tab)}
                                style={{
                                    padding: '12px 0',
                                    fontSize: '14px',
                                    fontWeight: activeSettingTab === tab ? '700' : '500',
                                    color: activeSettingTab === tab ? '#1677ff' : '#4E5969',
                                    borderBottom: activeSettingTab === tab ? '2px solid #1677ff' : '2px solid transparent',
                                    cursor: 'pointer',
                                    marginBottom: '-1px'
                                }}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>

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
                                            <span style={{ flex: 1, fontWeight: '500' }}>26546705-zone-custom</span>
                                            <ChevronDown size={16} color="#86909C" />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600' }}>Password</label>
                                        <div style={inputContainerStyle}>
                                            <span style={{ flex: 1, fontWeight: '500' }}>QM7VFRuN</span>
                                            <RefreshCw size={16} color="#86909C" style={{ cursor: 'pointer' }} />
                                        </div>
                                    </div>
                                </div>
                                <a href="#" style={{ color: '#1677ff', fontSize: '14px', textDecoration: 'none', fontWeight: '700' }}>+ Add sub-account</a>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '700', color: '#1D2129' }}>
                                        <div style={{ width: '4px', height: '16px', backgroundColor: '#1677ff', borderRadius: '2px' }} />
                                        Location Settings
                                    </div>
                                    <span style={{ color: '#1677ff', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>Reset</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                Country/Region <Info size={14} color="#c9cdd4" strokeWidth={1.5} />
                                            </label>
                                            <a href="#" style={{ color: '#1677ff', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>Country list</a>
                                        </div>
                                        <div style={inputContainerStyle}>
                                            <Globe size={16} color="#86909C" style={{ marginRight: '8px' }} />
                                            <span style={{ flex: 1, fontWeight: '500' }}>(ALL) Global</span>
                                            <ChevronDown size={16} color="#86909C" />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '13px', color: '#4E5969', fontWeight: '600' }}>State</label>
                                        <div style={inputContainerStyle}>
                                            <span style={{ flex: 1, fontWeight: '500' }}>Random</span>
                                            <ChevronDown size={16} color="#86909C" />
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
                                        <Copy size={20} color="#86909C" style={{ cursor: 'pointer' }} />
                                    </div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#4E5969', lineHeight: '2', wordBreak: 'break-all', fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', fontWeight: '500' }}>
                                    curl -x na.proxys5.net:6200 -U "26546705-zone-custom-sessid-XcivyX4zy-sessTime-15:QM7VFRuN" ipinfo.io
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
        </div>
    );
};

export default TrafficSetupPage;
