<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Configurações da API Meu Danfe
    |--------------------------------------------------------------------------
    |
    | Configurações para integração com a API do Meu Danfe
    | para consulta e processamento de notas fiscais eletrônicas
    |
    */

    'api_url' => env('MEUDANFE_API_URL', 'https://meudanfe.com.br/api/nfe/'),
    
    'timeout' => env('MEUDANFE_TIMEOUT', 30),
    
    'enabled' => env('MEUDANFE_ENABLED', true),
    
    'fallback_to_sefaz' => env('MEUDANFE_FALLBACK_TO_SEFAZ', true),
];
