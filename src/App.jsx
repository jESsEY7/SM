import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { ThemeProvider } from '@/lib/theme';
import AmbientBackground from '@/components/site/AmbientBackground';
import { CartProvider } from '@/lib/cart';
import { CurrencyProvider } from '@/lib/currency';
import Home from '@/pages/Home';
import Checkout from '@/pages/Checkout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Backoffice from '@/pages/Backoffice';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

const AuthenticatedApp = () => {
    const { isLoadingAuth } = useAuth();

    if (isLoadingAuth) {
        return (
            <div className="fixed inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login?returnTo=/backoffice" replace />} />}>
                <Route path="/backoffice" element={<AdminRoute><Backoffice /></AdminRoute>} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <AmbientBackground />
                <CurrencyProvider>
                    <CartProvider>
                        <QueryClientProvider client={queryClientInstance}>
                            <Router>
                                <ScrollToTop />
                                <AuthenticatedApp />
                            </Router>
                            <Toaster />
                        </QueryClientProvider>
                    </CartProvider>
                </CurrencyProvider>
            </ThemeProvider>
        </AuthProvider>
    )
}

export default App
