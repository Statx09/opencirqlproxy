$ErrorActionPreference = "Continue"

$Token = (Get-Content ".\tools\freesvg.config\token.txt" -Raw).Trim()

$Headers = @{
Authorization = "Bearer $Token"
Accept = "application/json"
}

$IdFile = ".\tools\freesvg\ids.txt"
$SourceDir = ".\src\components\expressions\badges"
$PublicDir = ".\public\expressions"

New-Item -ItemType Directory -Force $SourceDir | Out-Null
New-Item -ItemType Directory -Force $PublicDir | Out-Null

$ids = Get-Content $IdFile |
Where-Object { $_.Trim() -match '^\d+$' } |
Select-Object -Unique

Write-Host ""
Write-Host "Found $($ids.Count) SVG IDs" -ForegroundColor Cyan
Write-Host ""

$success = 0
$failed = 0

foreach ($id in $ids) {

```
Write-Host "----------------------------------------"
Write-Host "Processing SVG ID: $id" -ForegroundColor Cyan

try {

    $search = Invoke-RestMethod `
        -Uri "https://freesvg.org/api/v1/svg/$id" `
        -Headers $Headers

    $item = $search.data

    if (!$item) {
        throw "SVG metadata not found"
    }

    Write-Host "Name: $($item.name)"
    Write-Host "Slug: $($item.slug)"

    if (!$item.svg_url) {
        throw "No SVG URL returned"
    }

    $name = $item.slug
    $svgUrl = $item.svg_url

    Write-Host "Downloading: $name.svg"

    $response = Invoke-WebRequest `
        -Uri $svgUrl `
        -UseBasicParsing

    $svg = $response.Content

    if (!$svg -or $svg -notmatch "<svg") {
        throw "Downloaded content is not valid SVG"
    }

    $sourcePath = Join-Path $SourceDir "$name.svg"
    $publicPath = Join-Path $PublicDir "$name.svg"

    Set-Content `
        -Path $sourcePath `
        -Value $svg `
        -Encoding UTF8

    Set-Content `
        -Path $publicPath `
        -Value $svg `
        -Encoding UTF8

    $size = (Get-Item $sourcePath).Length

    Write-Host "SUCCESS: $name.svg ($size bytes)" -ForegroundColor Green

    $success++

}
catch {

    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red

    $failed++
}

Write-Host ""
```

}

Write-Host "========================================"
Write-Host "DOWNLOAD COMPLETE"
Write-Host "========================================"
Write-Host ""
Write-Host "Downloaded: $success" -ForegroundColor Green
Write-Host "Failed:     $failed" -ForegroundColor Red
Write-Host ""
