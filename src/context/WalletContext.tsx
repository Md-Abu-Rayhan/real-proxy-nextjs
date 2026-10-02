"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '@/lib/config';

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
    refreshWallet: () => Promise<WalletSummary | undefined>;
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

    const refreshWallet = useCallback(async () => {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await axios.get<WalletSummary>(`${API_URL}/api/Wallet/summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data) {
                const freshData: WalletSummary = {
                    balanceUsd: Number(res.data.balanceUsd ?? 0),
                    balanceBdt: Number(res.data.balanceBdt ?? 0),
                    totalDepositedUsd: Number(res.data.totalDepositedUsd ?? 0),
                    totalSpentUsd: Number(res.data.totalSpentUsd ?? 0),
                    affiliateBalanceUsd: Number(res.data.affiliateBalanceUsd ?? 0),
                    exchangeRateBdt: Number(res.data.exchangeRateBdt ?? 125),
                };
                setWalletData(freshData);
                return freshData;
            }
        } catch (error) {
            console.warn('Failed to fetch wallet summary:', error);
        } finally {
            setIsLoading(false);
        }
        return undefined;
    }, []);

    useEffect(() => {
        refreshWallet();

        // Listen for storage events (e.g. login/logout in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'auth_token') {
                refreshWallet();
            }
        };

        // Auto-refresh when tab is focused (e.g. user returns after paying on Binance/Crypto wallet)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                refreshWallet();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [refreshWallet]);

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
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => useContext(WalletContext);
