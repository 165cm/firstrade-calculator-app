// src/contexts/LicenseContext.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useLicense } from '@/hooks/useLicense';

interface LicenseContextType {
    isVerified: boolean;
    licenseKey: string | null;
    expiryDate: string | null;
    isLoading: boolean;
    error: string | null;
    verifyLicense: (key: string) => Promise<boolean>;
    clearLicense: () => void;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function LicenseProvider({ children }: { children: ReactNode }) {
    const license = useLicense();

    return (
        <LicenseContext.Provider value={license}>
            {children}
        </LicenseContext.Provider>
    );
}

export function useLicenseContext(): LicenseContextType {
    const context = useContext(LicenseContext);
    if (context === undefined) {
        throw new Error('useLicenseContext must be used within a LicenseProvider');
    }
    return context;
}
