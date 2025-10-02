"use client";

import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect } from 'react';
import { useRouter, usePathname } from "next/navigation";


export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, loading: authLoading } = useAuth();
    const handleLogout = async () => {
        await logout();
        router.push("/auth");
    };

    useEffect(() => {
        if (!authLoading && !user) {
          router.push("/auth");
        }
    }, [user, authLoading, router]);

    const currentPage = pathname === "/home" ? "home" : "profile";

    if (!user) return null;
    return (
        <div>
            <Navbar user={user} onLogout={handleLogout} currentPage={currentPage} />

            {children}
        </div>
    );
}