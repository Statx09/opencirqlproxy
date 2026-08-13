$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

$TokenFile = Join-Path $PSScriptRoot ".config\token.txt"
$InputFile = Join-Path $PSScriptRoot "urls.txt"

$SourceDir = Join-Path $Root "src\components\expressions\badges"
$PublicDir = Join-Path $Root "public\expressions"

if (!(Test-Path $TokenFile)) {
    Write-Host "ERROR: FreeSVG token not found." -ForegroundColor Red
    exit 1
}

if (!(Test-Path $InputFile)) {
    Write-Host "ERROR: urls.txt not found." -ForegroundColor Red
    exit 1
}

$Token = (Get-Content $TokenFile -Raw).Trim()

$Headers = @{
    Authorization = "Bearer $Token"
    Accept = "application/json"
}

New-Item -ItemType Directory -Force $SourceDir | Out-Null
New-Item -ItemType Directory -Force $PublicDir | Out-Null

$Urls = Get-Content $InputFile |
    Where-Object { $_.Trim() } |
    Select-Object -Unique

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "        FREESVG BULK ADD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Found $($Urls.Count) unique URLs" -ForegroundColor Cyan
Write-Host ""

$success = 0
$failed = 0

foreach ($pageUrl in $Urls) {

    $pageUrl = $pageUrl.Trim()
    $slug = ($pageUrl.TrimEnd("/") -split "/")[-1]

    Write-Host "----------------------------------------"
    Write-Host "Resolving: $slug" -ForegroundColor Cyan

    try {

        $query = $slug -replace "-", " "
        $encodedQuery = [uri]::EscapeDataString($query)

        $search = Invoke-RestMethod `
            -Uri "https://freesvg.org/api/v1/search?query=$encodedQuery" `
            -Headers $Headers `
            -Method Get

        $item = $search.data |
            Where-Object { $_.slug -eq $slug } |
            Select-Object -First 1

        if (!$item) {

            Write-Host "Exact match not found. Trying fallback search..." -ForegroundColor Yellow

            $firstWord = $slug.Split("-")[0]

            $item = $search.data |
                Where-Object {
                    $_.slug -like "*$firstWord*"
                } |
                Select-Object -First 1
        }

        if (!$item) {
            throw "Could not find a suitable SVG"
        }

        Write-Host "Matched: $($item.name)" -ForegroundColor Gray
        Write-Host "SVG ID:  $($item.id)" -ForegroundColor Gray

        if (!$item.svg_url) {
            throw "No SVG URL returned"
        }

        $name = $item.slug

        $name = $name -replace '[^a-zA-Z0-9_-]', '_'
        $name = $name -replace '-', '_'

        $filename = "$name.svg"

        $sourcePath = Join-Path $SourceDir $filename
        $publicPath = Join-Path $PublicDir $filename

        Write-Host "Downloading actual SVG..." -ForegroundColor Yellow

        $response = Invoke-WebRequest `
            -Uri $item.svg_url `
            -Method Get `
            -UseBasicParsing

        $svg = $response.Content

        if (!$svg -or $svg -notmatch "<svg") {
            throw "Downloaded content is not valid SVG"
        }

        Set-Content `
            -Path $sourcePath `
            -Value $svg `
            -Encoding UTF8

        Set-Content `
            -Path $publicPath `
            -Value $svg `
            -Encoding UTF8

        if (!(Test-Path $sourcePath)) {
            throw "Source SVG was not created"
        }

        if (!(Test-Path $publicPath)) {
            throw "Public SVG was not created"
        }

        $size = (Get-Item $publicPath).Length

        if ($size -lt 100) {
            throw "SVG file is suspiciously small: $size bytes"
        }

        Write-Host "SUCCESS: $filename" -ForegroundColor Green
        Write-Host "Size:    $size bytes" -ForegroundColor Gray

        $success++

    }
    catch {

        Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }

    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BULK DOWNLOAD COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Downloaded: $success" -ForegroundColor Green
Write-Host "Failed:     $failed" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""