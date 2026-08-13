# Voyage Local Server
$port = 4444
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:' + $port + '/')
$listener.Start()

Write-Host ''
Write-Host '  Voyage of the Black Pearl — Local Server' -ForegroundColor DarkYellow
Write-Host ('  Listening on: http://localhost:' + $port) -ForegroundColor Cyan
Write-Host '  Open that URL in your browser.' -ForegroundColor Green
Write-Host '  Press Ctrl+C to stop.' -ForegroundColor Gray
Write-Host ''

Start-Process ('http://localhost:' + $port)

$mimeMap = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'application/javascript'
  '.css'  = 'text/css'
  '.glb'  = 'model/gltf-binary'
  '.gltf' = 'model/gltf+json'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.ico'  = 'image/x-icon'
}

while ($listener.IsListening) {
  try {
    $ctx  = $listener.GetContext()
    $req  = $ctx.Request
    $res  = $ctx.Response
    $urlPath = $req.Url.LocalPath
    if ($urlPath -eq '/') { $urlPath = '/index.html' }
    $filePath = Join-Path $root ($urlPath.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar))

    if (Test-Path $filePath -PathType Leaf) {
      $ext   = [IO.Path]::GetExtension($filePath).ToLower()
      $mime  = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { 'application/octet-stream' }
      $bytes = [IO.File]::ReadAllBytes($filePath)
      $res.ContentType    = $mime
      $res.ContentLength64 = $bytes.Length
      $res.AddHeader('Access-Control-Allow-Origin', '*')
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host ('  200 ' + $urlPath) -ForegroundColor DarkGreen
    } else {
      $res.StatusCode = 404
      $body = [Text.Encoding]::UTF8.GetBytes('404 Not Found')
      $res.OutputStream.Write($body, 0, $body.Length)
      Write-Host ('  404 ' + $urlPath) -ForegroundColor DarkRed
    }
    $res.OutputStream.Close()
  } catch {
    if ($listener.IsListening) {
      Write-Host ('  Error: ' + $_.Exception.Message) -ForegroundColor Red
    }
  }
}
