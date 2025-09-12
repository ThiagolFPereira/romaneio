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

    'api_url' => env('MEUDANFE_API_URL', 'https://ws.meudanfe.com/api/v1/get/nfe/xmltodanfepdf/API'),
    
    'api_key' => env('MEUDANFE_API_KEY', ''),
    
    'timeout' => env('MEUDANFE_TIMEOUT', 30),
    
    'enabled' => env('MEUDANFE_ENABLED', true),
    
    'fallback_to_sefaz' => env('MEUDANFE_FALLBACK_TO_SEFAZ', true),
];
