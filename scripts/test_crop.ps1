Add-Type -AssemblyName System.Drawing

$src = "C:\Users\lucky\.gemini\antigravity\brain\3b0660d2-f05e-4c30-83c3-b60a21ebc102\.user_uploaded\media_1794244542725.jpg"
$destDir = "public\characters\exact_crops"
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$img = [System.Drawing.Image]::FromFile($src)
Write-Output "Image loaded successfully: $($img.Width) x $($img.Height)"
$img.Dispose()
