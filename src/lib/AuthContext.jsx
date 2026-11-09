import React, { createContext, useState, useContext, useEffect } from 'react';
import client from '@/api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('lumen_user')); } catch { return null; }
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('lumen_token'));
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('lumen_token');
        if (token) {
            client.get('/auth/me/')
                .then(res => {
                    setUser(res.data);
                    setIsAuthenticated(true);
                    localStorage.setItem('lumen_user', JSON.stringify(res.data));
                })
                .catch(() => {
                    localStorage.removeItem('lumen_token');
                    localStorage.removeItem('lumen_user');
                    setUser(null);
                    setIsAuthenticated(false);
                })
                .finally(() => setIsLoadingAuth(false));
        } else {
            setIsLoadingAuth(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await client.post('/auth/login/', { email, password });
        const { access, user: userData } = res.data;
        localStorage.setItem('lumen_token', access);
        localStorage.setItem('lumen_user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
    };

    const register = async (email, password, firstName, lastName) => {
        const res = await client.post('/auth/register/', {
            email, password, first_name: firstName, last_name: lastName
        });
        const { access, user: userData } = res.data;
        localStorage.setItem('lumen_token', access);
        localStorage.setItem('lumen_user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('lumen_token');
        localStorage.removeItem('lumen_user');
        setUser(null);
        setIsAuthenticated(false);
    };

    const navigateToLogin = () => {
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoadingAuth,
            isLoadingPublicSettings,
            authError,
            login,
            register,
            logout,
            navigateToLogin,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
