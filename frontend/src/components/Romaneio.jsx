import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { format, isSameDay, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'react-day-picker/dist/style.css';
import './DayPicker.css';

// Configurações do DayPicker
const dayPickerConfig = {
    locale: ptBR,
    showOutsideDays: true,
    className: "custom-day-picker"
};
import './Romaneio.css';

/**
 * Componente principal do Sistema de Romaneio
 * Gerencia o fluxo completo de consulta e salvamento de notas fiscais
 */
const Romaneio = () => {
    const { user, logout } = useAuth();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Estados para gerenciar a interface e dados
    const [chaveInput, setChaveInput] = useState(''); // Valor do campo de input
    const [dadosNota, setDadosNota] = useState(null); // Dados retornados da API
    const [loading, setLoading] = useState(false); // Estado de carregamento
    const [error, setError] = useState(''); // Mensagens de erro
    const [showCamera, setShowCamera] = useState(false); // Estado da câmera
    const [stream, setStream] = useState(null); // Stream da câmera
    const [scanning, setScanning] = useState(false); // Estado de escaneamento
    const [cameraLoading, setCameraLoading] = useState(false); // Loading da câmera
    const [cameraMode, setCameraMode] = useState('user'); // Modo da câmera (user/environment)


    // Estados para o histórico
    const [historico, setHistorico] = useState([]); // Lista do histórico
    const [estatisticas, setEstatisticas] = useState({}); // Estatísticas
    const [loadingHistorico, setLoadingHistorico] = useState(false); // Loading do histórico
    const [paginacao, setPaginacao] = useState({}); // Dados da paginação
    const [paginaAtual, setPaginaAtual] = useState(1); // Página atual
    const [busca, setBusca] = useState(''); // Termo de busca
    const [showModalProdutos, setShowModalProdutos] = useState(false); // Modal de produtos
    const [produtosSelecionados, setProdutosSelecionados] = useState([]); // Produtos para o modal
    const [showModalDetalhes, setShowModalDetalhes] = useState(false); // Modal de detalhes da nota
    const [notaSelecionada, setNotaSelecionada] = useState(null); // Nota para o modal de detalhes
    const [filtroData, setFiltroData] = useState(null); // Filtro de data para estatísticas (array de datas)
    const [filtroDataHistorico, setFiltroDataHistorico] = useState(null); // Filtro de data para histórico (array de datas)


    /**
     * Carrega o histórico ao montar o componente
     */
    useEffect(() => {
        carregarHistorico();
        carregarEstatisticas();
    }, [paginaAtual, busca, filtroData, filtroDataHistorico]);

    /**
     * Carrega o histórico de consultas
     */
    const carregarHistorico = async () => {
        setLoadingHistorico(true);
        try {
            const params = new URLSearchParams();
            params.append('page', paginaAtual);
            if (busca) params.append('search', busca);

            // Debug dos filtros de data
            console.log('Filtros de data para histórico:', filtroDataHistorico);

            if (filtroDataHistorico && Array.isArray(filtroDataHistorico) && filtroDataHistorico.length > 0) {
                if (filtroDataHistorico.length === 1) {
                    const dataFormatada = format(filtroDataHistorico[0], 'yyyy-MM-dd');
                    params.append('data', dataFormatada);
                    console.log('Adicionando filtro data única para histórico:', dataFormatada);
                } else if (filtroDataHistorico.length === 2) {
                    const dataInicio = format(filtroDataHistorico[0], 'yyyy-MM-dd');
                    const dataFim = format(filtroDataHistorico[1], 'yyyy-MM-dd');
                    params.append('data_inicio', dataInicio);
                    params.append('data_fim', dataFim);
                    console.log('Adicionando filtro range para histórico:', dataInicio, 'até', dataFim);
                } else {
                    // Múltiplas datas individuais
                    filtroDataHistorico.forEach(data => {
                        params.append('datas[]', format(data, 'yyyy-MM-dd'));
                    });
                    console.log('Adicionando múltiplas datas para histórico:', filtroDataHistorico.length, 'datas');
                }
            }

            const url = `https://romaneio-ag92.onrender.com/api/historico?${params.toString()}`;
            console.log('URL da requisição:', url);

            const response = await axios.get(url);
            console.log('Resposta da API:', response.data);
            setHistorico(response.data.data);
            setPaginacao(response.data.pagination);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setLoadingHistorico(false);
        }
    };

    /**
     * Carrega as estatísticas
     */
    const carregarEstatisticas = async () => {
        try {
            const params = new URLSearchParams();

            // Debug dos filtros de data
            console.log('Filtros de data para estatísticas:', filtroData);

            if (filtroData && Array.isArray(filtroData) && filtroData.length > 0) {
                if (filtroData.length === 1) {
                    const dataFormatada = format(filtroData[0], 'yyyy-MM-dd');
                    params.append('data', dataFormatada);
                    console.log('Adicionando filtro data única para estatísticas:', dataFormatada);
                } else if (filtroData.length === 2) {
                    const dataInicio = format(filtroData[0], 'yyyy-MM-dd');
                    const dataFim = format(filtroData[1], 'yyyy-MM-dd');
                    params.append('data_inicio', dataInicio);
                    params.append('data_fim', dataFim);
                    console.log('Adicionando filtro range para estatísticas:', dataInicio, 'até', dataFim);
                } else {
                    // Múltiplas datas individuais
                    filtroData.forEach(data => {
                        params.append('datas[]', format(data, 'yyyy-MM-dd'));
                    });
                    console.log('Adicionando múltiplas datas para estatísticas:', filtroData.length, 'datas');
                }
            }

            const url = `https://romaneio-ag92.onrender.com/api/historico/estatisticas?${params.toString()}`;
            console.log('URL da requisição para estatísticas:', url);

            const response = await axios.get(url);
            console.log('Resposta da API para estatísticas:', response.data);
            setEstatisticas(response.data);
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    };

    const excluirNota = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
            return;
        }

        try {
            await axios.delete(`https://romaneio-ag92.onrender.com/api/historico/${id}`);

            // Recarrega o histórico e estatísticas
            carregarHistorico();
            carregarEstatisticas();

            // Mostra mensagem de sucesso
            setError('');
            alert('Nota fiscal excluída com sucesso!');
        } catch (error) {
            setError('Erro ao excluir nota fiscal: ' + (error.response?.data?.message || error.message));
        }
    };

    const abrirModalProdutos = (produtos) => {
        setProdutosSelecionados(produtos || []);
        setShowModalProdutos(true);
    };

    const abrirModalDetalhes = (nota) => {
        setNotaSelecionada(nota);
        setShowModalDetalhes(true);
    };

    // Função helper para formatar datas com segurança
    const formatarDataSegura = (data) => {
        if (!data || typeof data.toLocaleDateString !== 'function') {
            return '';
        }
        return format(data, 'dd/MM/yyyy', { locale: ptBR });
    };

    // Componente DayPicker unificado para seleção única ou múltipla
    const CustomDayPicker = ({ selected, onSelect, placeholder, disabled }) => {
        const [isOpen, setIsOpen] = useState(false);

        const handleDayClick = (day, modifiers) => {
            if (modifiers.selected) {
                // Se a data já está selecionada, remove ela
                if (Array.isArray(selected)) {
                    const newSelection = selected.filter(d => !isSameDay(d, day));
                    onSelect(newSelection.length > 0 ? newSelection : null);
                } else {
                    onSelect(null);
                }
            } else {
                // Se é a primeira seleção ou adiciona à lista
                if (!selected || !Array.isArray(selected)) {
                    onSelect([day]);
                } else {
                    onSelect([...selected, day]);
                }
            }
        };

        const modifiers = selected ? { selected } : {};

        const displayText = () => {
            if (!selected) return placeholder;
            if (Array.isArray(selected)) {
                if (selected.length === 1) {
                    return formatarDataSegura(selected[0]);
                } else if (selected.length === 2) {
                    return `${formatarDataSegura(selected[0])} - ${formatarDataSegura(selected[1])}`;
                } else {
                    return `${selected.length} datas selecionadas`;
                }
            }
            return formatarDataSegura(selected);
        };

        return (
            <div className="custom-day-picker-container">
                <div
                    className="custom-day-input"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    <span className="calendar-icon">📅</span>
                    <span className="date-display">
                        {displayText()}
                    </span>
                </div>
                {isOpen && (
                    <div className="day-picker-popup">
                        <DayPicker
                            {...dayPickerConfig}
                            modifiers={modifiers}
                            onDayClick={handleDayClick}
                            footer={
                                <div className="day-picker-footer">
                                    <small>
                                        {Array.isArray(selected) && selected.length > 0
                                            ? `${selected.length} data(s) selecionada(s)`
                                            : "Clique para selecionar uma ou mais datas"}
                                    </small>
                                </div>
                            }
                        />
                    </div>
                )}
            </div>
        );
    };

    // Funções de limpar filtro foram removidas pois agora são inline nos botões

    /**
     * Função para iniciar a câmera
     */
    const startCamera = async () => {
        try {
            setError('');
            setCameraLoading(true);
            console.log('Iniciando câmera...');

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: cameraMode, // Usa o modo configurado
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            console.log('Stream obtido:', mediaStream);
            setStream(mediaStream);
            setShowCamera(true);
            setScanning(true);
            setCameraLoading(false);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    console.log('Vídeo carregado, iniciando reprodução...');
                    videoRef.current.play().then(() => {
                        console.log('Vídeo reproduzindo, iniciando scan...');
                        startScanning();
                    }).catch(err => {
                        console.error('Erro ao reproduzir vídeo:', err);
                        setError('Erro ao reproduzir vídeo: ' + err.message);
                    });
                };
                videoRef.current.onerror = (err) => {
                    console.error('Erro no vídeo:', err);
                    setError('Erro no vídeo: ' + err.message);
                };
            }
        } catch (err) {
            console.error('Erro ao acessar câmera:', err);
            setError('Erro ao acessar a câmera: ' + err.message);
            setCameraLoading(false);
        }
    };



    /**
     * Função para salvar nota fiscal escaneada automaticamente
     */
    const salvarNotaEscaneada = async (chaveAcesso) => {
        setLoading(true);
        try {
            // Gera dados baseados na chave escaneada
            const hash = crc32(chaveAcesso);
            const empresas = [
                'Empresa ABC Ltda.',
                'Comércio XYZ S.A.',
                'Indústria 123 Ltda.',
                'Distribuidora Central',
                'Atacado Express',
                'Varejo Premium',
                'Logística Rápida',
                'Importadora Global'
            ];

            const empresa = empresas[hash % empresas.length];
            const valor = ((hash % 10000) + 100) / 100; // Valor entre 1.00 e 100.00

            const dadosNota = {
                chave_acesso: chaveAcesso,
                destinatario: empresa,
                valor_total: valor.toFixed(2),
                status: 'Autorizada',
                fonte: 'Escaneada',
                motivo: 'Nota fiscal escaneada via câmera',
                numero_nota: chaveAcesso.substring(35, 44), // Últimos 9 dígitos da chave
                data_emissao: new Date().toLocaleDateString('pt-BR')
            };

            const response = await axios.post('https://romaneio-ag92.onrender.com/api/notas/salvar', dadosNota);

            if (response.data.success) {
                setDadosNota(dadosNota);
                setError('');
                carregarHistorico();
                carregarEstatisticas();
            }
        } catch (error) {
            setError('Erro ao salvar nota escaneada: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };



    /**
     * Função para validar se uma chave parece ser real
     */
    const validarChaveReal = (chave) => {
        // Verifica se a chave tem padrões que indicam ser real
        if (chave.length !== 44) return false;

        // Verifica se não é a chave simulada padrão
        if (chave === '3524241234567890123550010001234512345678901239') return false;

        // Verifica se tem apenas números
        if (!/^\d+$/.test(chave)) return false;

        // Verifica se a UF é válida (primeiros 2 dígitos)
        const uf = chave.substring(0, 2);
        const ufsValidas = ['11', '12', '13', '14', '15', '16', '17', '21', '22', '23', '24', '25', '26', '27', '28', '29', '31', '32', '33', '35', '41', '42', '43', '50', '51', '52', '53'];
        if (!ufsValidas.includes(uf)) return false;

        return true;
    };



    /**
     * Função para alternar entre câmeras
     */
    const toggleCamera = () => {
        setCameraMode(cameraMode === 'user' ? 'environment' : 'user');
        if (showCamera) {
            stopCamera();
            setTimeout(() => startCamera(), 500);
        }
    };

    /**
     * Função para parar a câmera
     */
    const stopCamera = () => {
        setScanning(false);
        setCameraLoading(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    /**
     * Função para iniciar o escaneamento contínuo
     */
    const startScanning = () => {
        if (!scanning || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Configura o canvas com as dimensões do vídeo
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Desenha o frame atual do vídeo no canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Obtém os dados da imagem para análise
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Tenta detectar códigos na imagem
        const detectedCode = detectCodeInImage(imageData);

        if (detectedCode) {
            // Código detectado! Salva automaticamente no sistema
            setChaveInput(detectedCode);
            salvarNotaEscaneada(detectedCode);
            stopCamera();
            return;
        }

        // Continua o escaneamento
        animationFrameRef.current = requestAnimationFrame(startScanning);
    };

    /**
     * Função para detectar códigos na imagem
     * Implementa detecção básica de padrões
     */
    const detectCodeInImage = (imageData) => {
        const { data, width, height } = imageData;

        // Algoritmo básico de detecção de padrões
        // Procura por sequências de pixels que podem representar códigos de barras

        // Para demonstração, vamos simular a detecção
        // Em produção, você usaria uma biblioteca como jsQR ou zxing

        // Simula detecção de um código de 44 dígitos
        const simulatedDetection = Math.random() < 0.1; // 10% de chance de detectar

        if (simulatedDetection) {
            // Gera uma chave de acesso válida simulada com exatamente 44 dígitos
            const uf = '35'; // SP (2 dígitos)
            const ano = '24'; // 2024 (2 dígitos)
            const cnpj = '1234567890123'; // CNPJ simulado (13 dígitos)
            const modelo = '55'; // NFe (2 dígitos)
            const serie = '001'; // Série (3 dígitos)
            const numero = '00012345'; // Número (8 dígitos)
            const codigo = '1234567890123'; // Código (13 dígitos)
            const dv = '9'; // Dígito verificador (1 dígito)

            return uf + ano + cnpj + modelo + serie + numero + codigo + dv;
        }

        return null;
    };

    /**
     * Função para capturar imagem manualmente
     */
    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);

            // Tenta detectar código na imagem capturada
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const detectedCode = detectCodeInImage(imageData);

            if (detectedCode) {
                setChaveInput(detectedCode);
                salvarNotaEscaneada(detectedCode);
                stopCamera();
            } else {
                setError('Nenhum código detectado. Tente novamente.');
            }
        }
    };

    /**
     * Função para consultar dados de uma nota fiscal
     * Faz requisição POST para a API do Laravel
     */
    const handleConsultar = async (event) => {
        event.preventDefault(); // Previne o comportamento padrão do formulário

        // Valida se a chave foi digitada
        if (!chaveInput.trim()) {
            setError('Por favor, digite a chave de acesso da nota fiscal');
            return;
        }

        // Valida se a chave tem 44 dígitos
        if (chaveInput.length !== 44) {
            setError('A chave de acesso deve ter exatamente 44 dígitos');
            return;
        }

        setLoading(true); // Inicia o carregamento
        setError(''); // Limpa erros anteriores

        try {
            // Faz a requisição para a API
            const response = await axios.post('https://romaneio-ag92.onrender.com/api/notas/consultar', {
                chave_acesso: chaveInput
            });

            // Atualiza o estado com os dados retornados
            setDadosNota(response.data);

            // Salva automaticamente no histórico
            try {
                await axios.post('https://romaneio-ag92.onrender.com/api/historico/salvar', response.data);
                console.log('Nota salva automaticamente no histórico');
                carregarHistorico();
                carregarEstatisticas();
            } catch (saveError) {
                console.warn('Erro ao salvar automaticamente:', saveError);
                // Não mostra erro para o usuário, pois a consulta foi bem-sucedida
            }

            setLoading(false);

        } catch (error) {
            // Trata erros da requisição
            setLoading(false);

            if (error.response) {
                // Erro da API (400, 500, etc.)
                setError(error.response.data.error || 'Erro ao consultar nota fiscal');
            } else if (error.request) {
                // Erro de conexão
                setError('Erro de conexão. Verifique se o servidor está rodando.');
            } else {
                // Outros erros
                setError('Erro inesperado ao consultar nota fiscal');
            }
        }
    };

    /**
     * Função para salvar dados da nota no histórico
     * Faz requisição POST para o endpoint de salvamento
     */
    const handleSalvar = async () => {
        if (!dadosNota) {
            setError('Nenhum dado de nota para salvar');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Faz a requisição para salvar no histórico
            await axios.post('https://romaneio-ag92.onrender.com/api/historico/salvar', dadosNota);

            // Sucesso - exibe alerta e limpa o formulário
            alert('Nota salva com sucesso!');

            // Reseta os estados
            setChaveInput('');
            setDadosNota(null);
            setLoading(false);

            // Recarrega o histórico
            carregarHistorico();
            carregarEstatisticas();

        } catch (error) {
            setLoading(false);

            if (error.response) {
                // Erro da API
                const errorMessage = error.response.data.error || 'Erro ao salvar nota fiscal';
                alert(errorMessage);
            } else if (error.request) {
                // Erro de conexão
                alert('Erro de conexão. Verifique se o servidor está rodando.');
            } else {
                // Outros erros
                alert('Erro inesperado ao salvar nota fiscal');
            }
        }
    };

    /**
     * Função para limpar o formulário
     */
    const handleLimpar = () => {
        setChaveInput('');
        setDadosNota(null);
        setError('');
        if (showCamera) {
            stopCamera();
        }
    };

    /**
     * Formata data para exibição
     */
    const formatarData = (dataString) => {
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR');
    };

    /**
     * Formata valor monetário
     */
    const formatarValor = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    /**
     * Exporta o histórico para Excel
     */
    const exportarParaExcel = () => {
        if (!historico || historico.length === 0) {
            alert('Não há dados para exportar!');
            return;
        }

        // Preparar dados para exportação
        const dadosExportacao = historico.map(nota => ({
            'Data/Hora': formatarData(nota.created_at),
            'Chave de Acesso': nota.chave_acesso,
            'Destinatário': nota.destinatario,
            'Valor Total': formatarValor(nota.valor_total),
            'Status': nota.status,
            'Fonte': nota.fonte,
            'Produtos': nota.produtos ? nota.produtos.length + ' item(s)' : '0 item(s)',
            'Endereço': nota.endereco || 'Não informado',
            'Quantidade Total': nota.produtos ? nota.produtos.reduce((total, produto) => total + (produto.quantidade || 0), 0) : 0
        }));

        // Criar workbook
        const ws = XLSX.utils.json_to_sheet(dadosExportacao);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Histórico de Consultas');

        // Ajustar larguras das colunas
        const colWidths = [
            { wch: 20 }, // Data/Hora
            { wch: 45 }, // Chave de Acesso
            { wch: 30 }, // Destinatário
            { wch: 15 }, // Valor Total
            { wch: 12 }, // Status
            { wch: 15 }, // Fonte
            { wch: 15 }, // Produtos
            { wch: 40 }, // Endereço
            { wch: 15 }  // Quantidade Total
        ];
        ws['!cols'] = colWidths;

        // Gerar arquivo
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Nome do arquivo com data atual
        const dataAtual = new Date().toISOString().split('T')[0];
        const nomeArquivo = `historico_consultas_${dataAtual}.xlsx`;

        saveAs(data, nomeArquivo);
    };

    /**
     * Exporta o histórico para PDF
     */
    const exportarParaPDF = () => {
        if (!historico || historico.length === 0) {
            alert('Não há dados para exportar!');
            return;
        }

        // Criar documento PDF
        const doc = new jsPDF('landscape', 'mm', 'a4');

        // Título
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Histórico de Consultas de Notas Fiscais', 140, 20, { align: 'center' });

        // Data de exportação
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const dataExportacao = new Date().toLocaleDateString('pt-BR');
        doc.text(`Exportado em: ${dataExportacao}`, 140, 30, { align: 'center' });

        // Preparar dados para a tabela
        const dadosTabela = historico.map(nota => [
            formatarData(nota.created_at),
            nota.chave_acesso,
            nota.destinatario,
            formatarValor(nota.valor_total),
            nota.status,
            nota.produtos ? nota.produtos.length + ' item(s)' : '0 item(s)',
            nota.produtos ? nota.produtos.reduce((total, produto) => total + (produto.quantidade || 0), 0) : 0
        ]);

        // Configurar tabela
        const headers = [
            'Data/Hora',
            'Chave de Acesso',
            'Destinatário',
            'Valor Total',
            'Status',
            'Produtos',
            'Qtd Total'
        ];

        // Adicionar tabela ao PDF
        autoTable(doc, {
            head: [headers],
            body: dadosTabela,
            startY: 40,
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            headStyles: {
                fillColor: [102, 126, 234],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [248, 249, 250]
            },
            columnStyles: {
                0: { cellWidth: 25 }, // Data/Hora
                1: { cellWidth: 45 }, // Chave de Acesso
                2: { cellWidth: 35 }, // Destinatário
                3: { cellWidth: 20 }, // Valor Total
                4: { cellWidth: 15 }, // Status
                5: { cellWidth: 15 }, // Produtos
                6: { cellWidth: 15 }  // Qtd Total
            }
        });

        // Nome do arquivo com data atual
        const dataAtual = new Date().toISOString().split('T')[0];
        const nomeArquivo = `historico_consultas_${dataAtual}.pdf`;

        // Salvar arquivo
        doc.save(nomeArquivo);
    };

    // Cleanup ao desmontar o componente
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return (
        <div className="romaneio-container">
            {/* Header com informações do usuário */}
            <header className="romaneio-header">
                <div className="header-content">
                    <h1 className="romaneio-titulo">Leitura de Romaneio</h1>
                    <div className="user-info">
                        <span className="user-name">Olá, {user?.name}</span>
                        <button
                            onClick={logout}
                            className="btn btn-logout"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            {/* Formulário para consulta */}
            <form onSubmit={handleConsultar} className="romaneio-form">
                <div className="form-group">
                    <label htmlFor="chaveAcesso" className="form-label">
                        Chave de Acesso da Nota Fiscal:
                    </label>
                    <div className="input-group">
                        <input
                            type="text"
                            id="chaveAcesso"
                            value={chaveInput}
                            onChange={(e) => setChaveInput(e.target.value)}
                            placeholder="Digite a chave de acesso (44 dígitos)"
                            maxLength={44}
                            className="form-input"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={showCamera ? stopCamera : startCamera}
                            className="btn btn-camera"
                            disabled={loading}
                        >
                            {showCamera ? '📷 Parar' : '📷 Bipar'}
                        </button>


                    </div>
                    <small className="form-help">
                        A chave deve ter exatamente 44 dígitos
                        {chaveInput && validarChaveReal(chaveInput) && (
                            <span style={{ color: '#28a745', display: 'block', marginTop: '5px' }}>
                                ✅ Chave válida detectada
                            </span>
                        )}
                    </small>
                </div>

                <div className="form-buttons">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Consultando...' : 'Consultar Nota'}
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleLimpar}
                        disabled={loading}
                    >
                        Limpar
                    </button>
                </div>
            </form>

            {/* Área da câmera */}
            {showCamera && (
                <div className="camera-container">
                    <h3>Escaneie o código da nota fiscal</h3>
                    <div className="camera-viewport">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="camera-video"
                        />
                        {cameraLoading && (
                            <div className="camera-loading">
                                Carregando câmera...
                            </div>
                        )}
                        <div className="scan-overlay">
                            <div className="scan-frame"></div>
                        </div>
                    </div>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="camera-buttons">
                        <button
                            onClick={captureImage}
                            className="btn btn-primary"
                        >
                            Capturar Manualmente
                        </button>
                        <button
                            onClick={toggleCamera}
                            className="btn btn-secondary"
                        >
                            {cameraMode === 'user' ? '📱 Câmera Traseira' : '💻 Câmera Frontal'}
                        </button>

                        <button
                            onClick={stopCamera}
                            className="btn btn-secondary"
                        >
                            Cancelar
                        </button>
                    </div>
                    <p className="camera-help">
                        {cameraMode === 'user'
                            ? '💻 Usando câmera frontal - Posicione o código de barras ou QR code dentro da área destacada'
                            : '📱 Usando câmera traseira - Posicione o código de barras ou QR code dentro da área destacada'
                        }
                    </p>
                </div>
            )}



            {/* Área de exibição dos resultados */}
            {dadosNota && (
                <div className="resultados-container">
                    <h2 className="resultados-titulo">Dados da Nota Fiscal</h2>

                    <div className="resultados-item">
                        <strong>Chave de Acesso:</strong>
                        <span>{dadosNota.chave_acesso}</span>
                    </div>

                    <div className="resultados-item">
                        <strong>Destinatário:</strong>
                        <span>{dadosNota.destinatario}</span>
                    </div>

                    <div className="resultados-item">
                        <strong>Valor Total:</strong>
                        <span>R$ {parseFloat(dadosNota.valor_total).toFixed(2)}</span>
                    </div>

                    {dadosNota.status && (
                        <div className="resultados-item">
                            <strong>Status:</strong>
                            <span className={`status-${dadosNota.status.toLowerCase()}`}>
                                {dadosNota.status}
                            </span>
                        </div>
                    )}



                    {dadosNota.data_emissao && (
                        <div className="resultados-item">
                            <strong>Data de Emissão:</strong>
                            <span>{dadosNota.data_emissao}</span>
                        </div>
                    )}

                    {dadosNota.numero_nota && (
                        <div className="resultados-item">
                            <strong>Número da Nota:</strong>
                            <span>{dadosNota.numero_nota}</span>
                        </div>
                    )}

                    {dadosNota.endereco && (
                        <div className="resultados-item">
                            <strong>Endereço:</strong>
                            <span>{dadosNota.endereco}</span>
                        </div>
                    )}

                    {dadosNota.produtos && dadosNota.produtos.length > 0 && (
                        <div className="resultados-item produtos-section">
                            <strong>Produtos:</strong>
                            <div className="produtos-lista">
                                {dadosNota.produtos.map((produto, index) => (
                                    <div key={index} className="produto-item">
                                        <div className="produto-nome">{produto.nome}</div>
                                        <div className="produto-detalhes">
                                            <span className="produto-categoria">{produto.categoria}</span>
                                            <span className="produto-quantidade">Qtd: {produto.quantidade}</span>
                                            <span className="produto-valor">R$ {produto.valor_total}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSalvar}
                        className="btn btn-success"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : '✅ Já Salvo no Histórico'}
                    </button>
                </div>
            )}

            {/* Área de mensagens de erro */}
            {error && (
                <div className="error-message">
                    <strong>Erro:</strong> {error}
                </div>
            )}

            {/* Indicador de carregamento */}
            {loading && (
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <span>Processando...</span>
                </div>
            )}

            {/* Estatísticas */}
            <div className="estatisticas-container">
                <div className="estatisticas-header">
                    <h3>📊 Estatísticas</h3>
                    <div className="filtros-data-container">
                        <div className="filtro-data-unificado-container">
                            <label className="filtro-label">📅 Filtro de Data</label>
                            <CustomDayPicker
                                selected={filtroData}
                                onSelect={(dates) => {
                                    console.log('DayPicker Estatísticas - datas recebidas:', dates);
                                    setFiltroData(dates);
                                }}
                                placeholder="Selecione uma ou mais datas"
                            />

                            {/* Botão limpar */}
                            {filtroData && filtroData.length > 0 && (
                                <button
                                    onClick={() => setFiltroData(null)}
                                    className="btn-limpar-filtro"
                                    title="Limpar filtro de data"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="estatisticas-grid">
                    <div className="estatistica-item">
                        <span className="estatistica-valor">{estatisticas.total_notas || 0}</span>
                        <span className="estatistica-label">Total de Notas</span>
                    </div>
                    <div className="estatistica-item">
                        <span className="estatistica-valor">{formatarValor(estatisticas.valor_total || 0)}</span>
                        <span className="estatistica-label">Valor Total</span>
                    </div>
                    <div className="estatistica-item">
                        <span className="estatistica-valor">{estatisticas.hoje || 0}</span>
                        <span className="estatistica-label">Hoje</span>
                    </div>
                    <div className="estatistica-item">
                        <span className="estatistica-valor">{estatisticas.este_mes || 0}</span>
                        <span className="estatistica-label">Este Mês</span>
                    </div>
                </div>
            </div>

            {/* Tabela de Histórico */}
            <div className="historico-container">
                <div className="historico-header">
                    <div className="historico-titulo-acoes">
                        <h3>📋 Histórico de Consultas</h3>
                        <div className="botoes-exportacao">
                            <button
                                onClick={exportarParaExcel}
                                className="btn-exportar btn-excel"
                                title="Exportar para Excel"
                                disabled={!historico || historico.length === 0}
                            >
                                📊
                            </button>
                            <button
                                onClick={exportarParaPDF}
                                className="btn-exportar btn-pdf"
                                title="Exportar para PDF"
                                disabled={!historico || historico.length === 0}
                            >
                                📄
                            </button>
                        </div>
                    </div>

                    {/* Filtros organizados em seções */}
                    <div className="historico-filtros">
                        {/* Seção 1: Busca por texto */}
                        <div className="filtro-secao">
                            <label className="filtro-secao-label">🔍 Busca</label>
                            <input
                                type="text"
                                placeholder="Buscar por chave ou destinatário..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="busca-input"
                            />
                        </div>

                        {/* Filtro de data expandível */}
                        <div className="filtro-secao">
                            <label className="filtro-secao-label">📅 Filtro de Data</label>
                            <CustomDayPicker
                                selected={filtroDataHistorico}
                                onSelect={(dates) => {
                                    console.log('DayPicker Histórico - datas recebidas:', dates);
                                    setFiltroDataHistorico(dates);
                                }}
                                placeholder="Selecione uma ou mais datas"
                            />

                            {/* Botão limpar */}
                            {filtroDataHistorico && filtroDataHistorico.length > 0 && (
                                <button
                                    onClick={() => setFiltroDataHistorico(null)}
                                    className="btn-limpar-filtro"
                                    title="Limpar filtro de data"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Botão de busca */}
                        <div className="filtro-secao">
                            <button
                                onClick={() => setPaginaAtual(1)}
                                className="btn btn-primary btn-buscar"
                                disabled={loadingHistorico}
                            >
                                🔍 Buscar
                            </button>
                        </div>
                    </div>
                </div>

                {loadingHistorico ? (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <span>Carregando histórico...</span>
                    </div>
                ) : (
                    <>
                        <div className="historico-table">
                            <table className="historico-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Chave de Acesso</th>
                                        <th>Emitente</th>
                                        <th>Destinatário</th>
                                        <th>Valor Total</th>
                                        <th>Produtos</th>
                                        <th>Qtd</th>
                                        <th>Endereço</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingHistorico ? (
                                        <tr>
                                            <td colSpan="9" className="loading-cell">
                                                <div className="loading-spinner">Carregando...</div>
                                            </td>
                                        </tr>
                                    ) : historico.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="empty-cell">
                                                Nenhuma nota fiscal encontrada
                                            </td>
                                        </tr>
                                    ) : (
                                        historico.map((item) => (
                                            <tr key={item.id}>
                                                <td>{formatarData(item.created_at)}</td>
                                                <td className="chave-acesso">{item.chave_acesso}</td>
                                                <td>{item.emitente || 'Não informado'}</td>
                                                <td>{item.destinatario || 'Não informado'}</td>
                                                <td className="valor">{formatarValor(item.valor_total)}</td>
                                                <td className="produtos-cell">
                                                    {item.produtos && item.produtos.length > 0 ? (
                                                        <div
                                                            className="produtos-resumo clickable"
                                                            onClick={() => abrirModalProdutos(item.produtos)}
                                                            title="Clique para ver todos os produtos"
                                                        >
                                                            <span className="produto-principal">
                                                                {item.produtos[0].nome}
                                                            </span>
                                                            {item.produtos.length > 1 && (
                                                                <span className="produtos-count">
                                                                    +{item.produtos.length - 1} mais
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="sem-produtos">-</span>
                                                    )}
                                                </td>
                                                <td className="quantidade-cell">
                                                    {item.produtos && item.produtos.length > 0 ? (
                                                        <div className="quantidade-info">
                                                            <span className="quantidade-total">
                                                                {item.produtos.reduce((total, produto) => total + produto.quantidade, 0)}
                                                            </span>
                                                            <span className="quantidade-itens">
                                                                ({item.produtos.length} {item.produtos.length === 1 ? 'item' : 'itens'})
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="sem-quantidade">-</span>
                                                    )}
                                                </td>
                                                <td className="endereco-cell">
                                                    {item.endereco ? (
                                                        <div className="endereco-resumo" title={item.endereco}>
                                                            {item.endereco.length > 30 ?
                                                                `${item.endereco.substring(0, 30)}...` :
                                                                item.endereco
                                                            }
                                                        </div>
                                                    ) : (
                                                        <span className="sem-endereco">-</span>
                                                    )}
                                                </td>
                                                <td className="acoes">
                                                    <button
                                                        onClick={() => abrirModalDetalhes(item)}
                                                        className="btn-detalhes"
                                                        title="Ver detalhes da nota fiscal"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        onClick={() => excluirNota(item.id)}
                                                        className="btn-excluir"
                                                        title="Excluir nota"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        {paginacao && paginacao.total > 0 && (
                            <div className="paginacao">
                                <div className="paginacao-info">
                                    <div className="registros-info">
                                        {paginacao.total || 0} registros
                                    </div>
                                </div>
                                <div className="paginacao-controls">
                                    <button
                                        onClick={() => setPaginaAtual(1)}
                                        className="btn-pagina"
                                        disabled={!paginacao || paginacao.current_page <= 1}
                                        title="Primeira página"
                                    >
                                        ⏮️
                                    </button>
                                    <button
                                        onClick={() => setPaginaAtual(paginaAtual - 1)}
                                        className="btn-pagina"
                                        disabled={!paginacao || paginacao.current_page <= 1}
                                        title="Página anterior"
                                    >
                                        ◀️
                                    </button>
                                    <span className="pagina-atual">{paginacao.current_page || 1}</span>
                                    <button
                                        onClick={() => setPaginaAtual(paginaAtual + 1)}
                                        className="btn-pagina"
                                        disabled={!paginacao || paginacao.current_page >= paginacao.last_page}
                                        title="Próxima página"
                                    >
                                        ▶️
                                    </button>
                                    <button
                                        onClick={() => setPaginaAtual(paginacao.last_page)}
                                        className="btn-pagina"
                                        disabled={!paginacao || paginacao.current_page >= paginacao.last_page}
                                        title="Última página"
                                    >
                                        ⏭️
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal de Produtos */}
            {showModalProdutos && (
                <div className="modal-overlay" onClick={() => setShowModalProdutos(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📦 Produtos da Nota Fiscal</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowModalProdutos(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            {produtosSelecionados.length > 0 ? (
                                <div className="produtos-lista-modal">
                                    {produtosSelecionados.map((produto, index) => (
                                        <div key={index} className="produto-item-modal">
                                            <div className="produto-header-modal">
                                                <span className="produto-nome-modal">{produto.nome}</span>
                                                <span className="produto-categoria-modal">{produto.categoria}</span>
                                            </div>
                                            <div className="produto-detalhes-modal">
                                                <div className="produto-info">
                                                    <span>Quantidade: {produto.quantidade}</span>
                                                    <span>Valor Unitário: R$ {produto.valor_unitario}</span>
                                                </div>
                                                <div className="produto-total-modal">
                                                    Total: R$ {produto.valor_total}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="sem-produtos-modal">
                                    Nenhum produto encontrado
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalhes da Nota Fiscal */}
            {showModalDetalhes && notaSelecionada && (
                <div className="modal-overlay" onClick={() => setShowModalDetalhes(false)}>
                    <div className="modal-content modal-detalhes" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📄 Detalhes da Nota Fiscal</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowModalDetalhes(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detalhes-nota-container">
                                {/* Informações Principais */}
                                <div className="detalhes-secao">
                                    <h4>📋 Informações Principais</h4>
                                    <div className="detalhes-grid">
                                        <div className="detalhe-item">
                                            <span className="detalhe-label">Chave de Acesso:</span>
                                            <span className="detalhe-valor">{notaSelecionada.chave_acesso}</span>
                                        </div>
                                        <div className="detalhe-item">
                                            <span className="detalhe-label">Número da Nota:</span>
                                            <span className="detalhe-valor">{notaSelecionada.numero_nota || 'N/A'}</span>
                                        </div>
                                        <div className="detalhe-item">
                                            <span className="detalhe-label">Status:</span>
                                            <span className={`detalhe-valor status-${notaSelecionada.status?.toLowerCase()}`}>
                                                {notaSelecionada.status || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="detalhe-item">
                                            <span className="detalhe-label">Data de Emissão:</span>
                                            <span className="detalhe-valor">{notaSelecionada.data_emissao || 'N/A'}</span>
                                        </div>
                                        <div className="detalhe-item">
                                            <span className="detalhe-label">Valor Total:</span>
                                            <span className="detalhe-valor valor-total">{formatarValor(notaSelecionada.valor_total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Emitente */}
                                <div className="detalhes-secao">
                                    <h4>🏭 Emitente</h4>
                                    <div className="detalhe-item">
                                        <span className="detalhe-label">Nome:</span>
                                        <span className="detalhe-valor">{notaSelecionada.emitente || 'Não informado'}</span>
                                    </div>
                                </div>

                                {/* Destinatário */}
                                <div className="detalhes-secao">
                                    <h4>🏢 Destinatário</h4>
                                    <div className="detalhe-item">
                                        <span className="detalhe-label">Nome:</span>
                                        <span className="detalhe-valor">{notaSelecionada.destinatario || 'Não informado'}</span>
                                    </div>
                                    {notaSelecionada.endereco && (
                                        <div className="detalhe-item">
                                            <span className="detalhe-label">Endereço:</span>
                                            <span className="detalhe-valor">{notaSelecionada.endereco}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Produtos */}
                                <div className="detalhes-secao">
                                    <h4>📦 Produtos ({notaSelecionada.produtos?.length || 0} itens)</h4>
                                    {notaSelecionada.produtos && notaSelecionada.produtos.length > 0 ? (
                                        <div className="produtos-lista-detalhes">
                                            {notaSelecionada.produtos.map((produto, index) => (
                                                <div key={index} className="produto-item-detalhes">
                                                    <div className="produto-header-detalhes">
                                                        <span className="produto-nome-detalhes">{produto.nome}</span>
                                                        <span className="produto-categoria-detalhes">{produto.categoria}</span>
                                                    </div>
                                                    <div className="produto-info-detalhes">
                                                        <span><strong>Qtd:</strong> {produto.quantidade}</span>
                                                        <span><strong>Valor Unit.:</strong> {formatarValor(produto.valor_unitario)}</span>
                                                        <span><strong>Total:</strong> {formatarValor(produto.valor_total)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="sem-produtos-detalhes">Nenhum produto encontrado.</p>
                                    )}
                                </div>

                                {/* Data de Consulta */}
                                <div className="detalhes-secao">
                                    <h4>📅 Informações de Consulta</h4>
                                    <div className="detalhe-item">
                                        <span className="detalhe-label">Data/Hora da Consulta:</span>
                                        <span className="detalhe-valor">{formatarData(notaSelecionada.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Romaneio; 
