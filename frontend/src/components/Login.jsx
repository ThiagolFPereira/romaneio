import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

/**
 * Componente de Login
 * Permite que usuários façam login no sistema
 */
const Login = ({ onLogin, onSwitchToRegister }) => {
    // Estados para gerenciar o formulário
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Atualiza os campos do formulário
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    /**
     * Submete o formulário de login
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Valida se os campos estão preenchidos
        if (!formData.email || !formData.password) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Faz a requisição de login
            const response = await axios.post('https://romaneio-ag92.onrender.com/api/auth/login', formData);

            // Salva o token no localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Configura o token para futuras requisições
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

            // Chama a função de callback para atualizar o estado de autenticação
            onLogin(response.data.user, response.data.token);

        } catch (error) {
            setLoading(false);

            if (error.response) {
                // Erro da API
                setError(error.response.data.error || 'Erro ao fazer login');
            } else if (error.request) {
                // Erro de conexão
                setError('Erro de conexão. Verifique se o servidor está rodando.');
            } else {
                // Outros erros
                setError('Erro inesperado ao fazer login');
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Login</h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email:
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Digite seu email"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Senha:
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Digite sua senha"
                            disabled={loading}
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary auth-btn"
                        disabled={loading}
                    >
                        {loading ? 'Fazendo Login...' : 'Entrar'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Não tem uma conta?{' '}
                        <button
                            type="button"
                            className="auth-link"
                            onClick={onSwitchToRegister}
                            disabled={loading}
                        >
                            Registre-se
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login; 