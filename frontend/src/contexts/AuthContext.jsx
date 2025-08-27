import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Contexto para gerenciar autenticação globalmente
 */
const AuthContext = createContext();

/**
 * Hook personalizado para usar o contexto de autenticação
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

/**
 * Provider do contexto de autenticação
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Verifica se há um token salvo no localStorage ao inicializar
     */
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setToken(savedToken);
                setUser(userData);

                // Configura o token para futuras requisições
                axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

                // Verifica se o token ainda é válido
                checkAuthStatus();
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                logout();
            }
        } else {
            setLoading(false);
        }
    }, []);

    /**
     * Verifica se o token ainda é válido fazendo uma requisição para a API
     */
    const checkAuthStatus = async () => {
        try {
            const response = await axios.get('https://romaneio-ag92.onrender.com/api/auth/user');
            setUser(response.data.user);
            // setIsAuthenticated não existe, removido
        } catch (error) {
            console.error('Token inválido:', error);
            logout();
        }
    };

    /**
     * Função para fazer login
     */
    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    };

    /**
     * Função para fazer logout
     */
    const logout = async () => {
        try {
            // Tenta fazer logout no servidor se houver token
            if (token) {
                await axios.post('https://romaneio-ag92.onrender.com/api/auth/logout');
            }
        } catch (error) {
            console.error('Erro ao fazer logout no servidor:', error);
        } finally {
            // Limpa os dados locais
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    /**
     * Função para atualizar dados do usuário
     */
    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    /**
     * Verifica se o usuário está autenticado
     */
    const isAuthenticated = () => {
        return !!user && !!token;
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 