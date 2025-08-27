<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Controller para gerenciar autenticação via API
 * Responsável por login, registro e logout de usuários
 */
class AuthController extends Controller
{
    /**
     * Registra um novo usuário
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        // Valida os dados de entrada
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'name.required' => 'Nome é obrigatório',
            'email.required' => 'Email é obrigatório',
            'email.email' => 'Email deve ser válido',
            'email.unique' => 'Este email já está cadastrado',
            'password.required' => 'Senha é obrigatória',
            'password.min' => 'Senha deve ter pelo menos 8 caracteres',
            'password.confirmed' => 'Confirmação de senha não confere'
        ]);

        try {
            // Cria o usuário
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Gera o token de acesso
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Usuário registrado com sucesso',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao registrar usuário'
            ], 500);
        }
    }

    /**
     * Faz login do usuário
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        // Valida os dados de entrada
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ], [
            'email.required' => 'Email é obrigatório',
            'email.email' => 'Email deve ser válido',
            'password.required' => 'Senha é obrigatória'
        ]);

        try {
            // Tenta autenticar o usuário
            if (!Auth::attempt($request->only('email', 'password'))) {
                throw ValidationException::withMessages([
                    'email' => ['Credenciais inválidas'],
                ]);
            }

            // Busca o usuário
            $user = User::where('email', $request->email)->firstOrFail();

            // Revoga tokens antigos (opcional)
            $user->tokens()->delete();

            // Gera novo token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login realizado com sucesso',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Credenciais inválidas'
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao fazer login'
            ], 500);
        }
    }

    /**
     * Faz logout do usuário
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            // Revoga o token atual
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Logout realizado com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao fazer logout'
            ], 500);
        }
    }

    /**
     * Retorna dados do usuário autenticado
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function user(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao buscar dados do usuário'
            ], 500);
        }
    }
} 