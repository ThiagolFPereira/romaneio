<?php

namespace App\Console\Commands;

use App\Services\NotaFiscalService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;

class TestarMeuDanfeReal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'testar:meudanfe-real {chave? : Chave de acesso da NFe para teste}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Testa especificamente a API real do Meu Danfe (força o uso)';

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

        $this->info("Testando especificamente a API real do Meu Danfe...");
        $this->info("Chave: {$chave}");
        $this->newLine();

        try {
            // Força o uso apenas da API do Meu Danfe
            Config::set('meudanfe.enabled', true);
            Config::set('meudanfe.fallback_to_sefaz', false);
            
            // Chama diretamente o método do Meu Danfe
            $reflection = new \ReflectionClass($notaFiscalService);
            $method = $reflection->getMethod('consultarMeuDanfe');
            $method->setAccessible(true);
            
            $resultado = $method->invoke($notaFiscalService, $chave);
            
            if ($resultado) {
                $this->info("✅ API Meu Danfe funcionou!");
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
                $this->error("❌ API Meu Danfe falhou. Verifique os logs para mais detalhes.");
            }

        } catch (\Exception $e) {
            $this->error("❌ Erro: " . $e->getMessage());
        }

        $this->newLine();
        $this->info("Teste concluído!");
    }
}
