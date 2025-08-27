<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

/**
 * Comando para verificar métricas de consultas de NFe
 * Exibe estatísticas de performance e uso do sistema
 */
class VerificarMetricasNFe extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nfe:metricas {--data= : Data específica (YYYY-MM-DD)} {--limpar : Limpar cache de métricas}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica métricas de consultas de notas fiscais';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $data = $this->option('data') ?? date('Y-m-d');
        $limpar = $this->option('limpar');

        if ($limpar) {
            $this->limparMetricas($data);
            return;
        }

        $this->exibirMetricas($data);
    }

    /**
     * Exibe as métricas de consultas
     */
    private function exibirMetricas(string $data): void
    {
        $cacheKey = "nfe_metrics_{$data}";
        $metrics = Cache::get($cacheKey);

        if (!$metrics) {
            $this->error("Nenhuma métrica encontrada para a data: {$data}");
            return;
        }

        $this->info("📊 Métricas de Consultas NFe - {$data}");
        $this->line('');

        // Tabela de métricas
        $headers = ['Métrica', 'Valor'];
        $rows = [
            ['Total de Consultas', $metrics['total_consultas']],
            ['Sucessos', $metrics['sucessos']],
            ['Erros', $metrics['erros']],
            ['Taxa de Sucesso', $this->calcularTaxaSucesso($metrics) . '%'],
            ['Tempo Médio', round($metrics['tempo_medio'], 2) . 'ms'],
            ['Tempo Total', round($metrics['tempo_total'], 2) . 'ms']
        ];

        $this->table($headers, $rows);

        // Análise de performance
        $this->analisarPerformance($metrics);
    }

    /**
     * Calcula a taxa de sucesso
     */
    private function calcularTaxaSucesso(array $metrics): float
    {
        if ($metrics['total_consultas'] === 0) {
            return 0;
        }

        return round(($metrics['sucessos'] / $metrics['total_consultas']) * 100, 2);
    }

    /**
     * Analisa a performance do sistema
     */
    private function analisarPerformance(array $metrics): void
    {
        $this->line('');
        $this->info('🔍 Análise de Performance:');

        // Taxa de sucesso
        $taxaSucesso = $this->calcularTaxaSucesso($metrics);
        if ($taxaSucesso >= 95) {
            $this->line("✅ Taxa de sucesso excelente: {$taxaSucesso}%");
        } elseif ($taxaSucesso >= 80) {
            $this->line("⚠️  Taxa de sucesso boa: {$taxaSucesso}%");
        } else {
            $this->line("❌ Taxa de sucesso baixa: {$taxaSucesso}%");
        }

        // Tempo de resposta
        $tempoMedio = $metrics['tempo_medio'];
        if ($tempoMedio <= 1000) {
            $this->line("✅ Tempo de resposta excelente: {$tempoMedio}ms");
        } elseif ($tempoMedio <= 3000) {
            $this->line("⚠️  Tempo de resposta aceitável: {$tempoMedio}ms");
        } else {
            $this->line("❌ Tempo de resposta lento: {$tempoMedio}ms");
        }

        // Volume de consultas
        $totalConsultas = $metrics['total_consultas'];
        if ($totalConsultas > 1000) {
            $this->line("🔥 Alto volume de consultas: {$totalConsultas}");
        } elseif ($totalConsultas > 100) {
            $this->line("📈 Volume moderado de consultas: {$totalConsultas}");
        } else {
            $this->line("📊 Volume baixo de consultas: {$totalConsultas}");
        }
    }

    /**
     * Limpa as métricas do cache
     */
    private function limparMetricas(string $data): void
    {
        $cacheKey = "nfe_metrics_{$data}";
        
        if (Cache::has($cacheKey)) {
            Cache::forget($cacheKey);
            $this->info("✅ Métricas da data {$data} foram limpas do cache.");
        } else {
            $this->warn("⚠️  Nenhuma métrica encontrada para a data {$data}.");
        }
    }
} 