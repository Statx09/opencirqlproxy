$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

$PublicDir = Join-Path $Root "public\expressions"
$ExpressionsFile = Join-Path $Root "src\components\expressions\expressions.jsx"
$IconMapFile = Join-Path $Root "src\components\expressions\iconMap.js"

# ------------------------------------------------------------
# Find SVGs downloaded recently.
# This batch was just downloaded, so use files modified
# within the last 15 minutes.
# ------------------------------------------------------------

$Cutoff = (Get-Date).AddMinutes(-15)

$Files = Get-ChildItem $PublicDir -Filter "*.svg" -File |
    Where-Object { $_.LastWriteTime -ge $Cutoff } |
    Sort-Object Name

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       REGISTER FREE SVG BADGES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (!$Files) {
    Write-Host "No recently downloaded SVG files found." -ForegroundColor Yellow
    exit 1
}

Write-Host "Found $($Files.Count) recent SVG files:" -ForegroundColor Cyan
$Files | ForEach-Object {
    Write-Host "  $($_.Name)"
}

Write-Host ""

# ------------------------------------------------------------
# Read existing files
# ------------------------------------------------------------

$Expressions = Get-Content $ExpressionsFile -Raw
$IconMap = Get-Content $IconMapFile -Raw

$Added = 0
$Skipped = 0

foreach ($File in $Files) {

    $filename = $File.Name
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($filename)

    # ID is the normalized filename without .svg
    $id = $baseName

    Write-Host "----------------------------------------"
    Write-Host "Processing: $filename" -ForegroundColor Cyan

    # --------------------------------------------------------
    # Check whether already registered
    # --------------------------------------------------------

    $expressionExists = $Expressions -match "(?m)^\s*id:\s*`"$([regex]::Escape($id))`""
    $iconExists = $IconMap -match "(?m)^\s*$([regex]::Escape($id))\s*:\s*\{"

    if ($expressionExists -and $iconExists) {

        Write-Host "Already registered - skipping." -ForegroundColor Yellow
        $Skipped++
        continue
    }

    # --------------------------------------------------------
    # Create readable label
    # --------------------------------------------------------

    $label = $id -replace "_", " "
    $label = $label -replace "\s+", " "
    $label = (Get-Culture).TextInfo.ToTitleCase($label)

    # --------------------------------------------------------
    # Add to expressions.jsx
    # --------------------------------------------------------

    if (!$expressionExists) {

        $expressionEntry = @"

  {
    id: "$id",
    label: "$label",
    category: "Lifestyle",
    svg: "$id",
    color: "#22C55E",
    keywords: ["$($label.ToLower())"],
  },
"@

        $marker = "];"

        $position = $Expressions.LastIndexOf($marker)

        if ($position -lt 0) {
            throw "Could not find final ]; in expressions.jsx"
        }

        $Expressions =
            $Expressions.Substring(0, $position) +
            $expressionEntry +
            "`r`n" +
            $Expressions.Substring($position)

        Write-Host "Added to expressions.jsx" -ForegroundColor Green
    }
    else {
        Write-Host "Expression already exists." -ForegroundColor Yellow
    }

    # --------------------------------------------------------
    # Add to iconMap.js
    # --------------------------------------------------------

    if (!$iconExists) {

        $iconEntry = @"

  $id`: {
    type: "image",
    src: "/expressions/$filename",
    color: "#22C55E",
  },
"@

        $marker = "};"

        $position = $IconMap.LastIndexOf($marker)

        if ($position -lt 0) {
            throw "Could not find final }; in iconMap.js"
        }

        $IconMap =
            $IconMap.Substring(0, $position) +
            $iconEntry +
            "`r`n" +
            $IconMap.Substring($position)

        Write-Host "Added to iconMap.js" -ForegroundColor Green
    }
    else {
        Write-Host "Icon already exists." -ForegroundColor Yellow
    }

    $Added++
}

# ------------------------------------------------------------
# Save files
# ------------------------------------------------------------

[System.IO.File]::WriteAllText(
    $ExpressionsFile,
    $Expressions,
    [System.Text.UTF8Encoding]::new($false)
)

[System.IO.File]::WriteAllText(
    $IconMapFile,
    $IconMap,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REGISTRATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Added:   $Added" -ForegroundColor Green
Write-Host "Skipped: $Skipped" -ForegroundColor Yellow
Write-Host ""