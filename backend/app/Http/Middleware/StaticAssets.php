<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaticAssets
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $path = $request->path();
        
        // Se for um arquivo estático (CSS, JS, imagens, etc.)
        if (preg_match('/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/', $path)) {
            $filePath = public_path($path);
            
            if (file_exists($filePath)) {
                $mimeType = $this->getMimeType($filePath);
                $content = file_get_contents($filePath);
                
                return response($content)
                    ->header('Content-Type', $mimeType)
                    ->header('Cache-Control', 'public, max-age=31536000');
            }
        }
        
        return $next($request);
    }
    
    /**
     * Get MIME type for file
     */
    private function getMimeType(string $filePath): string
    {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        
        $mimeTypes = [
            'js' => 'application/javascript',
            'css' => 'text/css',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf' => 'font/ttf',
            'eot' => 'application/vnd.ms-fontobject',
        ];
        
        return $mimeTypes[$extension] ?? 'application/octet-stream';
    }
}
