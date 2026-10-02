"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '@/lib/config';
import { DepositSuccessModal, DepositSuccessData } from '@/components/ui/DepositSuccessModal';

interface WalletSummary {
    balanceUsd: number;
    balanceBdt: number;
    totalDepositedUsd: number;
    totalSpentUsd: number;
    affiliateBalanceUsd: number;
    exchangeRateBdt: number;
}

interface WalletContextType {
    balanceUsd: number;
    balanceBdt: number;
    affiliateBalanceUsd: number;
    totalDepositedUsd: number;
    totalSpentUsd: number;
    exchangeRateBdt: number;
    isLoading: boolean;
    isTopUpModalOpen: boolean;
    openTopUpModal: () => void;
    closeTopUpModal: () => void;
    refreshWallet: (force?: boolean) => Promise<WalletSummary | undefined>;
    depositSuccessData: DepositSuccessData | null;
    showDepositSuccess: (data: DepositSuccessData) => void;
    closeDepositSuccess: () => void;
    startDepositListening: (durationMinutes?: number) => void;
}

const WalletContext = createContext<WalletContextType>({
    balanceUsd: 0,
    balanceBdt: 0,
    affiliateBalanceUsd: 0,
    totalDepositedUsd: 0,
    totalSpentUsd: 0,
    exchangeRateBdt: 125,
    isLoading: true,
    isTopUpModalOpen: false,
    openTopUpModal: () => {},
    closeTopUpModal: () => {},
    refreshWallet: async () => undefined,
    depositSuccessData: null,
    showDepositSuccess: () => {},
    closeDepositSuccess: () => {},
    startDepositListening: () => {},
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [walletData, setWalletData] = useState<WalletSummary>({
        balanceUsd: 0,
        balanceBdt: 0,
        totalDepositedUsd: 0,
        totalSpentUsd: 0,
        affiliateBalanceUsd: 0,
        exchangeRateBdt: 125,
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState<boolean>(false);

    // Global Deposit Success Modal State (Works across ALL dashboard pages)
    const [depositSuccessData, setDepositSuccessData] = useState<DepositSuccessData | null>(null);
    const [isDepositSuccessOpen, setIsDepositSuccessOpen] = useState<boolean>(false);
    const lastKnownBalanceRef = useRef<number | null>(null);
    const isFetchingRef = useRef<boolean>(false);
    const lastFetchTimeRef = useRef<number>(0);

    const startDepositListening = useCallback((durationMinutes = 15) => {
        if (typeof window === 'undefined') return;
        try {
            sessionStorage.setItem('crypto_deposit_listening_until', String(Date.now() + durationMinutes * 60 * 1000));
        } catch {
            // Ignore storage restrictions
        }
    }, []);

    const isDepositListeningActive = useCallback((): boolean => {
        if (typeof window === 'undefined') return false;
        try {
            const expiry = sessionStorage.getItem('crypto_deposit_listening_until');
            if (!expiry) return false;
            return Date.now() < Number(expiry);
        } catch {
            return false;
        }
    }, []);

    const stopDepositListening = useCallback(() => {
        if (typeof window === 'undefined') return;
        try {
            sessionStorage.removeItem('crypto_deposit_listening_until');
        } catch {
            // Ignore
        }
    }, []);

    const showDepositSuccess = useCallback((data: DepositSuccessData) => {
        setDepositSuccessData(data);
        setIsDepositSuccessOpen(true);
    }, []);

    const closeDepositSuccess = useCallback(() => {
        setIsDepositSuccessOpen(false);
    }, []);

    const refreshWallet = useCallback(async (force = false) => {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        // Throttle rapid duplicate calls unless forced
        const now = Date.now();
        if (!force && isFetchingRef.current) return;
        if (!force && now - lastFetchTimeRef.current < 2000) return;

        isFetchingRef.current = true;
        try {
            const res = await axios.get<WalletSummary>(`${API_URL}/api/Wallet/summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            lastFetchTimeRef.current = Date.now();

            if (res.data) {
                const newBal = Number(res.data.balanceUsd ?? 0);
                const prevBal = lastKnownBalanceRef.current;

                const freshData: WalletSummary = {
                    balanceUsd: newBal,
                    balanceBdt: Number(res.data.balanceBdt ?? 0),
                    totalDepositedUsd: Number(res.data.totalDepositedUsd ?? 0),
                    totalSpentUsd: Number(res.data.totalSpentUsd ?? 0),
                    affiliateBalanceUsd: Number(res.data.affiliateBalanceUsd ?? 0),
                    exchangeRateBdt: Number(res.data.exchangeRateBdt ?? 125),
                };
                setWalletData(freshData);

                // If balance increased in background on ANY page, trigger global celebration popup!
                if (prevBal !== null && newBal > prevBal + 0.001) {
                    const diff = Number((newBal - prevBal).toFixed(2));
                    // Deposit completed! Stop active polling session immediately
                    stopDepositListening();

                    showDepositSuccess({
                        amountUsd: diff,
                        newBalanceUsd: newBal,
                        currency: 'USD',
                        network: 'Crypto / Blockchain',
                        method: 'Deposit Confirmed'
                    });
                }

                lastKnownBalanceRef.current = newBal;
                return freshData;
            }
        } catch (error) {
            console.warn('Failed to fetch wallet summary:', error);
        } finally {
            isFetchingRef.current = false;
            setIsLoading(false);
        }
        return undefined;
    }, [showDepositSuccess, stopDepositListening]);

    useEffect(() => {
        refreshWallet(true);

        // Listen for storage events (e.g. login/logout in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'auth_token') {
                refreshWallet(true);
            }
        };

        // Instant refresh when user returns to tab (e.g. from Binance or crypto app)
        const handleVisibilityOrFocus = () => {
            if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                if (Date.now() - lastFetchTimeRef.current > 4000) {
                    refreshWallet();
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('visibilitychange', handleVisibilityOrFocus);
        window.addEventListener('focus', handleVisibilityOrFocus);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
            window.removeEventListener('focus', handleVisibilityOrFocus);
        };
    }, [refreshWallet]);

    // Smart zero-load interval: Only polls IF user has an active deposit listening session AND the tab is visible!
    // Regular users browsing other dashboard pages generate ZERO background polling load.
    useEffect(() => {
        const interval = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
                return; // Tab is minimized or hidden -> Zero load
            }
            if (isDepositListeningActive()) {
                refreshWallet();
            }
        }, 12000);

        return () => clearInterval(interval);
    }, [isDepositListeningActive, refreshWallet]);

    const openTopUpModal = () => setIsTopUpModalOpen(true);
    const closeTopUpModal = () => setIsTopUpModalOpen(false);

    return (
        <WalletContext.Provider
            value={{
                balanceUsd: walletData.balanceUsd,
                balanceBdt: walletData.balanceBdt,
                affiliateBalanceUsd: walletData.affiliateBalanceUsd,
                totalDepositedUsd: walletData.totalDepositedUsd,
                totalSpentUsd: walletData.totalSpentUsd,
                exchangeRateBdt: walletData.exchangeRateBdt,
                isLoading,
                isTopUpModalOpen,
                openTopUpModal,
                closeTopUpModal,
                refreshWallet,
                depositSuccessData,
                showDepositSuccess,
                closeDepositSuccess,
                startDepositListening,
            }}
        >
            {children}
            {/* Global Deposit Success Popup Modal - Displays everywhere on Dashboard */}
            <DepositSuccessModal
                isOpen={isDepositSuccessOpen}
                onClose={closeDepositSuccess}
                data={depositSuccessData}
            />
        </WalletContext.Provider>
    );
};

export const useWallet = () => useContext(WalletContext);
