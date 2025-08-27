import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

/**
 * Componente de Registro
 * Permite que novos usuários se registrem no sistema
 */
const Register = ({ onLogin, onSwitchToLogin }) => {
    // Estados para gerenciar o formulário
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
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
     * Submete o formulário de registro
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Valida se os campos estão preenchidos
        if (!formData.name || !formData.email || !formData.password || !formData.password_confirmation) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        // Valida se as senhas conferem
        if (formData.password !== formData.password_confirmation) {
            setError('As senhas não conferem');
            return;
        }

        // Valida se a senha tem pelo menos 8 caracteres
        if (formData.password.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Faz a requisição de registro
            const response = await axios.post('http://localhost:8000/api/auth/register', formData);

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
                const errorData = error.response.data;
                if (errorData.errors) {
                    // Erros de validação
                    const errorMessages = Object.values(errorData.errors).flat();
                    setError(errorMessages.join(', '));
                } else {
                    setError(errorData.error || 'Erro ao registrar usuário');
                }
            } else if (error.request) {
                // Erro de conexão
                setError('Erro de conexão. Verifique se o servidor está rodando.');
            } else {
                // Outros erros
                setError('Erro inesperado ao registrar usuário');
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Registro</h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Nome:
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Digite seu nome completo"
                            disabled={loading}
                            required
                        />
                    </div>

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
                            placeholder="Digite sua senha (mín. 8 caracteres)"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password_confirmation" className="form-label">
                            Confirmar Senha:
                        </label>
                        <input
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Confirme sua senha"
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
                        {loading ? 'Registrando...' : 'Registrar'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Já tem uma conta?{' '}
                        <button
                            type="button"
                            className="auth-link"
                            onClick={onSwitchToLogin}
                            disabled={loading}
                        >
                            Faça login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register; 