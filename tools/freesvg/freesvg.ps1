param(
[string]$Id,
[string]$Name
)

$ErrorActionPreference = "Stop"

$BaseUrl = "https://freesvg.org/api/v1"

$TokenFile = Join-Path $PSScriptRoot ".config\token.txt"

$BadgeDir = Join-Path $PSScriptRoot "....\src\components\expressions\badges"

if (!(Test-Path $TokenFile)) {
Write-Host "FreeSVG token not found." -ForegroundColor Red
exit 1
}

$Token = (Get-Content $TokenFile -Raw).Trim()

$Headers = @{
"Accept" = "application/json"
"Authorization" = "Bearer $Token"
}

if (!$Id) {
$Id = Read-Host "SVG ID"
}

if (!$Name) {
$Name = Read-Host "Filename without .svg"
}

$Name = $Name -replace '[^a-zA-Z0-9_-]', '-'

New-Item -ItemType Directory -Force $BadgeDir | Out-Null

Write-Host ""
Write-Host "Getting SVG information for ID $Id..." -ForegroundColor Cyan
Write-Host ""

$info = Invoke-RestMethod `    -Uri "$BaseUrl/svg/$Id"`
-Method Get `
-Headers $Headers

Write-Host "Title: $($info.name)"
Write-Host "License: $($info.license_title)"
Write-Host ""

$svgUrl = $info.svg_url

if (!$svgUrl) {
Write-Host "No SVG URL returned." -ForegroundColor Red
exit 1
}

Write-Host "SVG URL:" -ForegroundColor Gray
Write-Host $svgUrl
Write-Host ""

Write-Host "Downloading actual SVG..." -ForegroundColor Cyan

$response = Invoke-WebRequest `    -Uri $svgUrl`
-Method Get `
-UseBasicParsing

$svg = $response.Content

if (!$svg -or $svg -notmatch "<svg") {
Write-Host ""
Write-Host "ERROR: Downloaded content is not an SVG." -ForegroundColor Red
Write-Host ""

```
if ($svg) {
    Write-Host $svg.Substring(
        0,
        [Math]::Min(300, $svg.Length)
    )
}

exit 1
```

}

$output = Join-Path $BadgeDir "$Name.svg"

Set-Content `    -Path $output`
-Value $svg `
-Encoding UTF8

$file = Get-Item $output

Write-Host ""
Write-Host "SUCCESS" -ForegroundColor Green
Write-Host ""
Write-Host "File: $($file.FullName)"
Write-Host "Size: $($file.Length) bytes"
Write-Host ""


