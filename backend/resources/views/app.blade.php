<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Sistema de Romaneio</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    
    <!-- Meta tags para SEO -->
    <meta name="description" content="Sistema de Romaneio para consulta de notas fiscais">
    <meta name="keywords" content="romaneio, notas fiscais, consulta, sistema">
    <meta name="author" content="Sistema de Romaneio">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Sistema de Romaneio">
    <meta property="og:description" content="Sistema de Romaneio para consulta de notas fiscais">
    <meta property="og:type" content="website">
    
    <!-- Preload de recursos críticos -->
    <link rel="preload" href="/assets/index.css" as="style">
    <link rel="preload" href="/assets/index.js" as="script">
</head>
<body>
    <div id="root"></div>
    
    <!-- Scripts do frontend -->
    <script type="module" src="/assets/index.js"></script>
    
    <!-- Fallback caso o JavaScript falhe -->
    <noscript>
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h1>Sistema de Romaneio</h1>
            <p>Este sistema requer JavaScript para funcionar corretamente.</p>
            <p>Por favor, habilite o JavaScript no seu navegador e recarregue a página.</p>
        </div>
    </noscript>
</body>
</html>
