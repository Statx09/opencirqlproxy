$ErrorActionPreference = "Continue"

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

$Token = (Get-Content "$PSScriptRoot\.config\token.txt" -Raw).Trim()

$Headers = @{
    Authorization = "Bearer $Token"
    Accept        = "application/json"
}

$Ids = Get-Content "$PSScriptRoot\badges.txt" |
    Where-Object { $_ -match '^\d+$' }

$Public = "$Root\public\expressions"
$Source = "$Root\src\components\expressions\badges"

New-Item -ItemType Directory -Force $Public | Out-Null
New-Item -ItemType Directory -Force $Source | Out-Null

$ok = 0
$fail = 0

foreach ($id in $Ids) {

    Write-Host ""
    Write-Host "Processing ID $id" -ForegroundColor Cyan

    try {

        # Get SVG information from FreeSVG API
        $info = Invoke-RestMethod `
            -Uri "https://freesvg.org/api/v1/svg/$id" `
            -Headers $Headers `
            -Method Get

        $item = $info.data

        if (-not $item) {
            throw "API returned no data."
        }

        if (-not $item.svg_url) {
            throw "No SVG URL returned."
        }

        Write-Host "Name: $($item.name)" -ForegroundColor Gray
        Write-Host "Slug: $($item.slug)" -ForegroundColor Gray
        Write-Host "SVG:  $($item.svg_url)" -ForegroundColor Gray

        # Normalize filename
        # Example:
        # chromatic-floral-pattern-dolphin-3
        # becomes:
        # chromatic_floral_pattern_dolphin_3.svg
        $file = (($item.slug -replace '[^a-zA-Z0-9_-]', '_') -replace '-', '_') + ".svg"

        $PublicFile = Join-Path $Public $file
        $SourceFile = Join-Path $Source $file

        Write-Host "Downloading original SVG..." -ForegroundColor Cyan

        # Download the SVG without changing its contents.
        $response = Invoke-WebRequest `
            -Uri $item.svg_url `
            -Method Get `
            -UseBasicParsing

        if (-not $response.Content) {
            throw "Downloaded SVG was empty."
        }

        # Convert response content to bytes and write directly.
        # This prevents PowerShell from re-encoding/reformatting
        # the SVG when saving it.
        if ($response.Content -is [byte[]]) {

            [System.IO.File]::WriteAllBytes(
                $PublicFile,
                $response.Content
            )

        }
        else {

            [System.IO.File]::WriteAllText(
                $PublicFile,
                $response.Content,
                [System.Text.UTF8Encoding]::new($false)
            )
        }

        # Verify that the downloaded file actually contains <svg
        $savedContent = [System.IO.File]::ReadAllText($PublicFile)

        if ($savedContent -notmatch '<svg') {
            Remove-Item $PublicFile -Force -ErrorAction SilentlyContinue
            throw "Downloaded file does not contain a valid <svg element."
        }

        # Copy the exact same SVG to the source folder
        Copy-Item `
            $PublicFile `
            $SourceFile `
            -Force

        $fileInfo = Get-Item $PublicFile

        Write-Host ""
        Write-Host "SUCCESS: $file" -ForegroundColor Green
        Write-Host "Size:    $($fileInfo.Length) bytes" -ForegroundColor Gray

        $ok++
    }
    catch {

        Write-Host ""
        Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red

        $fail++
    }
}

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "Downloaded: $ok" -ForegroundColor Green
Write-Host "Failed:     $fail" -ForegroundColor Red
Write-Host "==============================" -ForegroundColor Cyan
