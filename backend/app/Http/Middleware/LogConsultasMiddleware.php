<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * Middleware para registrar e monitorar consultas de notas fiscais
 * Registra métricas de performance e detecta padrões suspeitos
 */
class LogConsultasMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $startTime = microtime(true);
        
        // Registra início da consulta
        $this->logConsultaInicio($request);
        
        // Processa a requisição
        $response = $next($request);
        
        $endTime = microtime(true);
        $duration = ($endTime - $startTime) * 1000; // Converte para milissegundos
        
        // Registra fim da consulta
        $this->logConsultaFim($request, $response, $duration);
        
        // Verifica por padrões suspeitos
        $this->verificarPadroesSuspeitos($request);
        
        return $response;
    }

    /**
     * Registra o início de uma consulta
     */
    private function logConsultaInicio(Request $request): void
    {
        $chaveAcesso = $request->input('chave_acesso');
        $user = $request->user();
        
        Log::info('Consulta NFe iniciada', [
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'chave_acesso' => $chaveAcesso,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Registra o fim de uma consulta
     */
    private function logConsultaFim(Request $request, $response, float $duration): void
    {
        $chaveAcesso = $request->input('chave_acesso');
        $user = $request->user();
        $statusCode = $response->getStatusCode();
        
        // Determina o tipo de resultado
        $resultado = $this->determinarResultado($response);
        
        Log::info('Consulta NFe finalizada', [
            'user_id' => $user?->id,
            'chave_acesso' => $chaveAcesso,
            'status_code' => $statusCode,
            'resultado' => $resultado,
            'duracao_ms' => round($duration, 2),
            'timestamp' => now()->toISOString()
        ]);
        
        // Atualiza métricas
        $this->atualizarMetricas($resultado, $duration);
    }

    /**
     * Determina o resultado da consulta
     */
    private function determinarResultado($response): string
    {
        $statusCode = $response->getStatusCode();
        
        if ($statusCode === 200) {
            return 'sucesso';
        } elseif ($statusCode === 404) {
            return 'nao_encontrada';
        } elseif ($statusCode === 400) {
            return 'erro_validacao';
        } else {
            return 'erro_servidor';
        }
    }

    /**
     * Atualiza métricas de performance
     */
    private function atualizarMetricas(string $resultado, float $duration): void
    {
        $cacheKey = 'nfe_metrics_' . date('Y-m-d');
        
        $metrics = Cache::get($cacheKey, [
            'total_consultas' => 0,
            'sucessos' => 0,
            'erros' => 0,
            'tempo_medio' => 0,
            'tempo_total' => 0
        ]);
        
        $metrics['total_consultas']++;
        $metrics['tempo_total'] += $duration;
        $metrics['tempo_medio'] = $metrics['tempo_total'] / $metrics['total_consultas'];
        
        if ($resultado === 'sucesso') {
            $metrics['sucessos']++;
        } else {
            $metrics['erros']++;
        }
        
        Cache::put($cacheKey, $metrics, 86400); // Cache por 24 horas
    }

    /**
     * Verifica por padrões suspeitos de uso
     */
    private function verificarPadroesSuspeitos(Request $request): void
    {
        $user = $request->user();
        $ip = $request->ip();
        $chaveAcesso = $request->input('chave_acesso');
        
        // Verifica consultas excessivas por usuário
        $this->verificarConsultasExcessivas($user, $ip);
        
        // Verifica chaves de acesso suspeitas
        $this->verificarChaveSuspeita($chaveAcesso);
    }

    /**
     * Verifica se há consultas excessivas
     */
    private function verificarConsultasExcessivas($user, string $ip): void
    {
        $userKey = $user ? "user_{$user->id}" : "ip_{$ip}";
        $cacheKey = "consultas_{$userKey}_" . date('Y-m-d-H');
        
        $consultas = Cache::get($cacheKey, 0);
        $consultas++;
        
        Cache::put($cacheKey, $consultas, 3600); // Cache por 1 hora
        
        // Alerta se mais de 100 consultas por hora
        if ($consultas > 100) {
            Log::warning('Possível uso excessivo detectado', [
                'user_id' => $user?->id,
                'ip' => $ip,
                'consultas_hora' => $consultas,
                'timestamp' => now()->toISOString()
            ]);
        }
    }

    /**
     * Verifica se a chave de acesso é suspeita
     */
    private function verificarChaveSuspeita(string $chaveAcesso): void
    {
        // Verifica se é uma chave de teste ou padrão
        $chavesSuspeitas = [
            '00000000000000000000000000000000000000000000',
            '11111111111111111111111111111111111111111111',
            '12345678901234567890123456789012345678901234'
        ];
        
        if (in_array($chaveAcesso, $chavesSuspeitas)) {
            Log::warning('Chave de acesso suspeita detectada', [
                'chave_acesso' => $chaveAcesso,
                'timestamp' => now()->toISOString()
            ]);
        }
        
        // Verifica se a chave tem padrões repetitivos
        if ($this->temPadraoRepetitivo($chaveAcesso)) {
            Log::warning('Chave de acesso com padrão repetitivo', [
                'chave_acesso' => $chaveAcesso,
                'timestamp' => now()->toISOString()
            ]);
        }
    }

    /**
     * Verifica se a chave tem padrões repetitivos
     */
    private function temPadraoRepetitivo(string $chave): bool
    {
        // Verifica se há sequências repetitivas
        for ($i = 2; $i <= 10; $i++) {
            if (strlen($chave) % $i === 0) {
                $parte = substr($chave, 0, $i);
                $repeticao = str_repeat($parte, strlen($chave) / $i);
                if ($repeticao === $chave) {
                    return true;
                }
            }
        }
        
        return false;
    }
} 