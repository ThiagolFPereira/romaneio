<?php

namespace App\Console\Commands;

use App\Services\NotaFiscalService;
use Illuminate\Console\Command;

class TestarMeuDanfe extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'testar:meudanfe {chave? : Chave de acesso da NFe para teste}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Testa a integração com a API do Meu Danfe';

    /**
     * Execute the console command.
     */
    public function handle(NotaFiscalService $notaFiscalService)
    {
        $chave = $this->argument('chave');
        
        if (!$chave) {
            // Chave de exemplo para teste
            $chave = '35240114200166000187550010000000015123456789';
            $this->info("Usando chave de exemplo: {$chave}");
        }

        $this->info("Testando integração com Meu Danfe...");
        $this->info("Chave: {$chave}");
        $this->newLine();

        try {
            $resultado = $notaFiscalService->consultarNotaFiscal($chave);
            
            if ($resultado) {
                $this->info("✅ Consulta realizada com sucesso!");
                $this->newLine();
                
                $this->table(
                    ['Campo', 'Valor'],
                    [
                        ['Chave de Acesso', $resultado['chave_acesso']],
                        ['Emitente', $resultado['emitente'] ?? 'N/A'],
                        ['Destinatário', $resultado['destinatario'] ?? 'N/A'],
                        ['Valor Total', 'R$ ' . ($resultado['valor_total'] ?? '0.00')],
                        ['Status', $resultado['status'] ?? 'N/A'],
                        ['Data Emissão', $resultado['data_emissao'] ?? 'N/A'],
                        ['Número da Nota', $resultado['numero_nota'] ?? 'N/A'],
                        ['Fonte', $resultado['fonte'] ?? 'N/A'],
                        ['Motivo', $resultado['motivo'] ?? 'N/A']
                    ]
                );

                if (isset($resultado['produtos']) && is_array($resultado['produtos'])) {
                    $this->newLine();
                    $this->info("📦 Produtos encontrados:");
                    foreach ($resultado['produtos'] as $produto) {
                        $this->line("- {$produto['nome']} (Qtd: {$produto['quantidade']}, Valor: R$ {$produto['valor_total']})");
                    }
                }

                if (isset($resultado['endereco'])) {
                    $this->newLine();
                    $this->info("📍 Endereço: {$resultado['endereco']}");
                }

            } else {
                $this->error("❌ Falha na consulta. Verifique os logs para mais detalhes.");
            }

        } catch (\Exception $e) {
            $this->error("❌ Erro: " . $e->getMessage());
        }

        $this->newLine();
        $this->info("Teste concluído!");
    }
}
