<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HistoricoNota;
use App\Services\NotaFiscalService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;

/**
 * Controller para gerenciar operações relacionadas a notas fiscais
 * Responsável por consultar dados de notas e salvar no histórico
 */
class NotaFiscalController extends Controller
{
    protected NotaFiscalService $notaFiscalService;

    public function __construct(NotaFiscalService $notaFiscalService)
    {
        $this->notaFiscalService = $notaFiscalService;
    }

    /**
     * Consulta os dados de uma nota fiscal pela chave de acesso
     * Integra com APIs da SEFAZ e Meu Danfe para buscar dados reais
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function consultar(Request $request): JsonResponse
    {
        // Valida se a chave de acesso foi enviada
        if (!$request->has('chave_acesso') || empty($request->chave_acesso)) {
            return response()->json([
                'error' => 'Chave de acesso é obrigatória'
            ], 400);
        }

        $chaveAcesso = $request->chave_acesso;

        // Valida se a chave tem 44 dígitos
        if (strlen($chaveAcesso) !== 44) {
            return response()->json([
                'error' => 'Chave de acesso deve ter exatamente 44 dígitos'
            ], 400);
        }

        // Valida se a chave contém apenas números
        if (!ctype_digit($chaveAcesso)) {
            return response()->json([
                'error' => 'Chave de acesso deve conter apenas números'
            ], 400);
        }

        try {
            // Consulta a nota fiscal usando o serviço
            $dadosNota = $this->notaFiscalService->consultarNotaFiscal($chaveAcesso);

            if (!$dadosNota) {
                return response()->json([
                    'error' => 'Não foi possível consultar a nota fiscal. Verifique se a chave está correta ou tente novamente mais tarde.'
                ], 404);
            }

            return response()->json($dadosNota);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao consultar nota fiscal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Salva os dados da nota fiscal no histórico
     * Valida os dados recebidos e cria um novo registro no banco
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function salvar(Request $request): JsonResponse
    {
        // Log para debug
        \Log::info('Método salvar chamado', [
            'user_id' => $request->user() ? $request->user()->id : 'null',
            'request_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        // Valida os dados obrigatórios
        $request->validate([
            'chave_acesso' => 'required|string|size:44',
            'destinatario' => 'required|string|max:255',
            'valor_total' => 'required|numeric|min:0'
        ], [
            'chave_acesso.required' => 'Chave de acesso é obrigatória',
            'chave_acesso.size' => 'Chave de acesso deve ter exatamente 44 caracteres',
            'destinatario.required' => 'Destinatário é obrigatório',
            'valor_total.required' => 'Valor total é obrigatório',
            'valor_total.numeric' => 'Valor total deve ser um número',
            'valor_total.min' => 'Valor total deve ser maior ou igual a zero'
        ]);

        try {
            // Verifica se o usuário está autenticado
            if (!$request->user()) {
                \Log::error('Usuário não autenticado no método salvar');
                return response()->json([
                    'error' => 'Usuário não autenticado'
                ], 401);
            }

            // Monta os dados obrigatórios
            $data = [
                'user_id' => $request->user()->id,
                'chave_acesso' => $request->chave_acesso,
                'destinatario' => $request->destinatario,
                'valor_total' => $request->valor_total,
            ];

            // Campos opcionais apenas se existirem na tabela
            if (Schema::hasColumn('historico_notas', 'produtos')) {
                $data['produtos'] = $request->produtos ?? null;
            }
            if (Schema::hasColumn('historico_notas', 'endereco')) {
                $data['endereco'] = $request->endereco ?? null;
            }
            if (Schema::hasColumn('historico_notas', 'emitente')) {
                $data['emitente'] = $request->emitente ?? null;
            }
            if (Schema::hasColumn('historico_notas', 'numero_nota')) {
                $data['numero_nota'] = $request->numero_nota ?? null;
            }
            if (Schema::hasColumn('historico_notas', 'status')) {
                $data['status'] = $request->status ?? null;
            }
            if (Schema::hasColumn('historico_notas', 'data_emissao')) {
                $data['data_emissao'] = $request->data_emissao ?? null;
            }

            // Cria um novo registro no histórico
            $historico = HistoricoNota::create($data);

            \Log::info('Nota fiscal salva com sucesso', ['historico_id' => $historico->id]);

            return response()->json([
                'message' => 'Nota fiscal salva com sucesso no histórico',
                'data' => $historico
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Erro ao salvar nota fiscal', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Verifica se é erro de chave duplicada
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                return response()->json([
                    'error' => 'Esta nota fiscal já foi salva no histórico'
                ], 409);
            }

            return response()->json([
                'error' => 'Erro ao salvar nota fiscal no histórico: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retorna o histórico de consultas do usuário
     * Lista todas as notas fiscais consultadas com paginação
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function historico(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 30);
            $search = $request->get('search', '');
            $dataFiltro = $request->get('data', '');
            $dataInicio = $request->get('data_inicio', '');
            $dataFim = $request->get('data_fim', '');
            
            // Debug dos parâmetros recebidos
            \Log::info('Parâmetros recebidos no histórico:', [
                'search' => $search,
                'data' => $dataFiltro,
                'data_inicio' => $dataInicio,
                'data_fim' => $dataFim,
                'user_id' => $request->user()->id
            ]);
            
            $query = HistoricoNota::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc');

            // Filtro por busca
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('chave_acesso', 'like', "%{$search}%")
                      ->orWhere('destinatario', 'like', "%{$search}%");
                });
                \Log::info('Aplicando filtro de busca:', ['search' => $search]);
            }

            // Filtro por data específica
            if (!empty($dataFiltro)) {
                $query->whereDate('created_at', $dataFiltro);
                \Log::info('Aplicando filtro de data específica:', ['data' => $dataFiltro]);
            }

            // Filtro por range de datas
            if (!empty($dataInicio) && !empty($dataFim)) {
                $query->whereBetween('created_at', [$dataInicio . ' 00:00:00', $dataFim . ' 23:59:59']);
                \Log::info('Aplicando filtro de range de datas:', [
                    'data_inicio' => $dataInicio . ' 00:00:00',
                    'data_fim' => $dataFim . ' 23:59:59'
                ]);
            } elseif (!empty($dataInicio)) {
                $query->whereDate('created_at', '>=', $dataInicio);
                \Log::info('Aplicando filtro de data início:', ['data_inicio' => $dataInicio]);
            } elseif (!empty($dataFim)) {
                $query->whereDate('created_at', '<=', $dataFim);
                \Log::info('Aplicando filtro de data fim:', ['data_fim' => $dataFim]);
            }

            $historico = $query->paginate($perPage);
            
            \Log::info('Resultado da consulta:', [
                'total_registros' => $historico->total(),
                'registros_retornados' => count($historico->items())
            ]);

            return response()->json([
                'data' => $historico->items(),
                'pagination' => [
                    'current_page' => $historico->currentPage(),
                    'last_page' => $historico->lastPage(),
                    'per_page' => $historico->perPage(),
                    'total' => $historico->total(),
                    'from' => $historico->firstItem(),
                    'to' => $historico->lastItem()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao buscar histórico: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retorna estatísticas do histórico do usuário
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function estatisticas(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()->id;
            $dataFiltro = $request->get('data');
            $dataInicio = $request->get('data_inicio');
            $dataFim = $request->get('data_fim');

            // Debug dos parâmetros recebidos
            \Log::info('Parâmetros recebidos nas estatísticas:', [
                'user_id' => $userId,
                'data' => $dataFiltro,
                'data_inicio' => $dataInicio,
                'data_fim' => $dataFim
            ]);

            // Query base
            $query = HistoricoNota::where('user_id', $userId);

            // Aplica filtro de data específica se fornecido
            if ($dataFiltro) {
                $query->whereDate('created_at', $dataFiltro);
                \Log::info('Aplicando filtro de data específica nas estatísticas:', ['data' => $dataFiltro]);
            }

            // Aplica filtro de range de datas se fornecido
            if ($dataInicio && $dataFim) {
                $query->whereBetween('created_at', [$dataInicio . ' 00:00:00', $dataFim . ' 23:59:59']);
                \Log::info('Aplicando filtro de range de datas nas estatísticas:', [
                    'data_inicio' => $dataInicio . ' 00:00:00',
                    'data_fim' => $dataFim . ' 23:59:59'
                ]);
            } elseif ($dataInicio) {
                $query->whereDate('created_at', '>=', $dataInicio);
                \Log::info('Aplicando filtro de data início nas estatísticas:', ['data_inicio' => $dataInicio]);
            } elseif ($dataFim) {
                $query->whereDate('created_at', '<=', $dataFim);
                \Log::info('Aplicando filtro de data fim nas estatísticas:', ['data_fim' => $dataFim]);
            }

            // Estatísticas gerais
            $estatisticas = [
                'total_notas' => $query->count(),
                'valor_total' => $query->sum('valor_total'),
            ];

            // Se não há filtro de data, adiciona estatísticas por período
            if (!$dataFiltro && !$dataInicio && !$dataFim) {
                $estatisticas['hoje'] = HistoricoNota::where('user_id', $userId)
                    ->whereDate('created_at', today())->count();
                $estatisticas['esta_semana'] = HistoricoNota::where('user_id', $userId)
                    ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();
                $estatisticas['este_mes'] = HistoricoNota::where('user_id', $userId)
                    ->whereMonth('created_at', now()->month)->count();
            } else {
                // Se há filtro de data, mostra apenas os dados do período selecionado
                $estatisticas['hoje'] = 0;
                $estatisticas['esta_semana'] = 0;
                $estatisticas['este_mes'] = 0;
            }

            \Log::info('Estatísticas calculadas:', $estatisticas);

            return response()->json($estatisticas);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao buscar estatísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Salva uma nota fiscal diretamente no sistema (sem consulta SEFAZ)
     * Usado para notas escaneadas ou inseridas manualmente
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function salvarDireto(Request $request): JsonResponse
    {
        // Valida os dados obrigatórios
        $request->validate([
            'chave_acesso' => 'required|string|size:44',
            'destinatario' => 'required|string|max:255',
            'valor_total' => 'required|numeric|min:0',
            'status' => 'required|string|max:50',
            'fonte' => 'required|string|max:50',
            'motivo' => 'required|string|max:500'
        ], [
            'chave_acesso.required' => 'Chave de acesso é obrigatória',
            'chave_acesso.size' => 'Chave de acesso deve ter exatamente 44 caracteres',
            'destinatario.required' => 'Destinatário é obrigatório',
            'valor_total.required' => 'Valor total é obrigatório',
            'valor_total.numeric' => 'Valor total deve ser um número',
            'valor_total.min' => 'Valor total deve ser maior ou igual a zero',
            'status.required' => 'Status é obrigatório',
            'fonte.required' => 'Fonte é obrigatória',
            'motivo.required' => 'Motivo é obrigatório'
        ]);

        try {
            // Verifica se a nota já existe
            $notaExistente = HistoricoNota::where('chave_acesso', $request->chave_acesso)
                ->where('user_id', auth()->id())
                ->first();

            if ($notaExistente) {
                return response()->json([
                    'error' => 'Esta nota fiscal já foi registrada anteriormente'
                ], 409);
            }

            // Cria um novo registro no histórico
            $historico = HistoricoNota::create([
                'user_id' => auth()->id(),
                'chave_acesso' => $request->chave_acesso,
                'destinatario' => $request->destinatario,
                'valor_total' => $request->valor_total,
                'status' => $request->status,
                'fonte' => $request->fonte,
                'motivo' => $request->motivo,
                'produtos' => $request->produtos ?? null,
                'endereco' => $request->endereco ?? null,
                'data_consulta' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Nota fiscal salva com sucesso',
                'data' => $historico
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao salvar nota fiscal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exclui uma nota fiscal do histórico
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function excluir(int $id): JsonResponse
    {
        try {
            // Busca a nota no histórico do usuário
            $nota = HistoricoNota::where('id', $id)
                ->where('user_id', auth()->id())
                ->first();

            if (!$nota) {
                return response()->json([
                    'error' => 'Nota fiscal não encontrada'
                ], 404);
            }

            // Exclui a nota
            $nota->delete();

            return response()->json([
                'success' => true,
                'message' => 'Nota fiscal excluída com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao excluir nota fiscal: ' . $e->getMessage()
            ], 500);
        }
    }
} 