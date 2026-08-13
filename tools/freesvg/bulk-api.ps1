$ErrorActionPreference = "Continue"

# ============================================================
# FreeSVG BULK DOWNLOADER
# URL -> resolve -> download actual SVG -> save to both folders
# ============================================================

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

$TokenFile = Join-Path $PSScriptRoot ".config\token.txt"
$ListFile  = Join-Path $PSScriptRoot "badges.txt"

$SourceDir = Join-Path $Root "src\components\expressions\badges"
$PublicDir = Join-Path $Root "public\expressions"

# ------------------------------------------------------------
# Check token
# ------------------------------------------------------------

if (!(Test-Path $TokenFile)) {
    Write-Host "ERROR: FreeSVG token not found." -ForegroundColor Red
    Write-Host $TokenFile
    exit 1
}

$Token = (Get-Content $TokenFile -Raw).Trim()

$Headers = @{
    Authorization = "Bearer $Token"
    Accept        = "application/json"
}

# ------------------------------------------------------------
# Check URL list
# ------------------------------------------------------------

if (!(Test-Path $ListFile)) {
    Write-Host "ERROR: badges.txt not found." -ForegroundColor Red
    Write-Host $ListFile
    exit 1
}

$Urls = Get-Content $ListFile |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ -and $_ -notmatch '^#' } |
    Select-Object -Unique

New-Item -ItemType Directory -Force $SourceDir | Out-Null
New-Item -ItemType Directory -Force $PublicDir | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FREESVG BULK IMPORT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Found $($Urls.Count) unique URLs" -ForegroundColor Cyan
Write-Host ""

$success = 0
$failed  = 0

foreach ($pageUrl in $Urls) {

    Write-Host "----------------------------------------"
    Write-Host "URL: $pageUrl" -ForegroundColor Cyan

    try {

        # ----------------------------------------------------
        # Extract final URL segment
        # ----------------------------------------------------

        $cleanUrl = $pageUrl.TrimEnd("/")

        $lastPart = ($cleanUrl -split "/")[-1]

        # Remove query string if present
        $lastPart = ($lastPart -split "\?")[0]

        # ----------------------------------------------------
        # CASE 1: Numeric FreeSVG ID
        # ----------------------------------------------------

        if ($lastPart -match '^\d+$') {

            Write-Host "Type: Numeric ID"

            $id = $lastPart

            $apiUrl = "https://freesvg.org/api/v1/svg/$id"

            Write-Host "Resolving ID $id..." -ForegroundColor Gray

            $info = Invoke-RestMethod `
                -Uri $apiUrl `
                -Headers $Headers `
                -Method Get

            # API responses can differ slightly
            $item = $info.data

            if (!$item) {
                $item = $info
            }

            if (!$item) {
                throw "FreeSVG returned no SVG information."
            }

        }

        # ----------------------------------------------------
        # CASE 2: Slug
        # ----------------------------------------------------

        else {

            Write-Host "Type: Slug"
            Write-Host "Slug: $lastPart"

            $slug = $lastPart

            # Search using the slug
            $query = $slug -replace "-", " "
            $encodedQuery = [uri]::EscapeDataString($query)

            Write-Host "Searching FreeSVG..." -ForegroundColor Gray

            $search = Invoke-RestMethod `
                -Uri "https://freesvg.org/api/v1/search?query=$encodedQuery" `
                -Headers $Headers `
                -Method Get

            $results = $search.data

            # First: exact slug match
            $item = $results |
                Where-Object {
                    $_.slug -eq $slug
                } |
                Select-Object -First 1

            # Second: case-insensitive exact match
            if (!$item) {
                $item = $results |
                    Where-Object {
                        $_.slug.ToLower() -eq $slug.ToLower()
                    } |
                    Select-Object -First 1
            }

            if (!$item) {
                throw "Could not resolve FreeSVG slug: $slug"
            }
        }

        # ----------------------------------------------------
        # Display resolved information
        # ----------------------------------------------------

        Write-Host "Resolved successfully" -ForegroundColor Green

        if ($item.id) {
            Write-Host "ID:   $($item.id)"
        }

        if ($item.name) {
            Write-Host "Name: $($item.name)"
        }

        if ($item.slug) {
            Write-Host "Slug: $($item.slug)"
        }

        if (!$item.svg_url) {
            throw "FreeSVG did not return an SVG URL."
        }

        Write-Host "SVG URL: $($item.svg_url)" -ForegroundColor Gray

        # ----------------------------------------------------
        # Download actual SVG
        # ----------------------------------------------------

        Write-Host "Downloading actual SVG..." -ForegroundColor Gray

        $response = Invoke-WebRequest `
            -Uri $item.svg_url `
            -UseBasicParsing

        $svg = $response.Content

        if (!$svg) {
            throw "Downloaded response was empty."
        }

        if ($svg -notmatch '<svg') {
            throw "Downloaded content is not valid SVG."
        }

        # ----------------------------------------------------
        # Safe filename
        # ----------------------------------------------------

        $name = $item.slug

        if (!$name) {
            $name = $lastPart
        }

        $name = $name.ToLower()

        $name = $name -replace '[^a-zA-Z0-9_-]', '_'
        $name = $name -replace '-', '_'

        $filename = "$name.svg"

        # ----------------------------------------------------
        # Save to BOTH locations
        # ----------------------------------------------------

        $sourcePath = Join-Path $SourceDir $filename
        $publicPath = Join-Path $PublicDir $filename

        Set-Content `
            -Path $sourcePath `
            -Value $svg `
            -Encoding UTF8

        Set-Content `
            -Path $publicPath `
            -Value $svg `
            -Encoding UTF8

        # ----------------------------------------------------
        # Verify both files
        # ----------------------------------------------------

        if (!(Test-Path $sourcePath)) {
            throw "Source file was not created."
        }

        if (!(Test-Path $publicPath)) {
            throw "Public file was not created."
        }

        $size = (Get-Item $publicPath).Length

        Write-Host ""
        Write-Host "SUCCESS: $filename" -ForegroundColor Green
        Write-Host "Size:    $size bytes" -ForegroundColor Green

        $success++

    }
    catch {

        Write-Host ""
        Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red

        $failed++
    }

    Write-Host ""
}

# ------------------------------------------------------------
# Final report
# ------------------------------------------------------------

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BULK DOWNLOAD COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Downloaded: $success" -ForegroundColor Green
Write-Host "Failed:     $failed" -ForegroundColor Red

Write-Host ""
