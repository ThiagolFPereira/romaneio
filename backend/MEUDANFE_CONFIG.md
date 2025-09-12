# Configuração da API Meu Danfe

## Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Configurações da API Meu Danfe
MEUDANFE_API_URL=https://ws.meudanfe.com/api/v1/get/nfe/xmltodanfepdf/API
MEUDANFE_API_KEY=
MEUDANFE_TIMEOUT=30
MEUDANFE_ENABLED=true
MEUDANFE_FALLBACK_TO_SEFAZ=true
```

## Descrição das Configurações

- **MEUDANFE_API_URL**: URL base da API do Meu Danfe
- **MEUDANFE_API_KEY**: Chave de API do Meu Danfe (opcional, para autenticação)
- **MEUDANFE_TIMEOUT**: Timeout em segundos para requisições (padrão: 30)
- **MEUDANFE_ENABLED**: Habilita/desabilita a integração com Meu Danfe (padrão: true)
- **MEUDANFE_FALLBACK_TO_SEFAZ**: Se true, tenta SEFAZ quando Meu Danfe falha (padrão: true)

## Como Obter a API Key

1. Acesse [https://meudanfe.com.br/](https://meudanfe.com.br/)
2. Faça o cadastro na área do cliente
3. Gere sua chave de API
4. Adicione a chave na variável `MEUDANFE_API_KEY`

## Ordem de Consulta

O sistema agora consulta as APIs na seguinte ordem:

1. **Portal Público SEFAZ** (QR Code) - Dados reais
2. **API Meu Danfe** - Processamento via XML
3. **API SOAP SEFAZ** - Fallback (se habilitado)

## Logs

Todas as consultas são logadas no sistema de logs do Laravel. Verifique os logs para debug:

```bash
tail -f storage/logs/laravel.log
```
