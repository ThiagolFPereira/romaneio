import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

/**
 * Componente principal de autenticação
 * Gerencia a alternância entre tela de login e registro
 */
const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);

    /**
     * Alterna para a tela de login
     */
    const switchToLogin = () => {
        setIsLogin(true);
    };

    /**
     * Alterna para a tela de registro
     */
    const switchToRegister = () => {
        setIsLogin(false);
    };

    return (
        <div className="auth-wrapper">
            {isLogin ? (
                <Login
                    onLogin={onLogin}
                    onSwitchToRegister={switchToRegister}
                />
            ) : (
                <Register
                    onLogin={onLogin}
                    onSwitchToLogin={switchToLogin}
                />
            )}
        </div>
    );
};

export default Auth; 