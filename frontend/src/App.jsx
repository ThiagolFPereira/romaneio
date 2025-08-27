import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Romaneio from './components/Romaneio';
import Auth from './components/Auth';
import './App.css';

/**
 * Componente principal da aplicação
 * Gerencia autenticação e renderiza o sistema de romaneio
 */
function AppContent() {
    const { user, loading, login } = useAuth();

    // Mostra loading enquanto verifica autenticação
    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <span>Carregando...</span>
            </div>
        );
    }

    // Se não está autenticado, mostra tela de login
    if (!user) {
        return <Auth onLogin={login} />;
    }

    // Se está autenticado, mostra o sistema de romaneio
    return <Romaneio />;
}

/**
 * Wrapper principal com AuthProvider
 */
function App() {
    return (
        <AuthProvider>
            <div className="App">
                <AppContent />
            </div>
        </AuthProvider>
    );
}

export default App; 