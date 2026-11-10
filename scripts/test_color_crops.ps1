Add-Type -AssemblyName System.Drawing

$srcColor = "C:\Users\lucky\.gemini\antigravity\brain\3b0660d2-f05e-4c30-83c3-b60a21ebc102\.user_uploaded\media_1794245301895.jpg"
$destDir = "public\characters\test_color_crops"
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }

$bmp = [System.Drawing.Bitmap]::FromFile($srcColor)

function Crop-Box($bmp, $x, $y, $w, $h, $name) {
    $crop = New-Object System.Drawing.Bitmap 360, 480
    $g = [System.Drawing.Graphics]::FromImage($crop)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $dest = New-Object System.Drawing.Rectangle 0, 0, 360, 480
    $src = New-Object System.Drawing.Rectangle $x, $y, $w, $h
    $g.DrawImage($bmp, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $crop.Save("$destDir\$name.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $crop.Dispose()
}

# Left side - Shin's family: 12 Haruto, 13 Miyuki, 14 Shin, 15 Yuna (y ~ 245..300, w ~ 45, x ~ 10, 56, 102, 148)
Crop-Box $bmp 8 245 42 55 "c12_haruto_color"
Crop-Box $bmp 53 245 42 55 "c13_miyuki_color"

# Right side - Childhood friends: 27 Daiki, 28 Yuto, 29 Ren, 30 Kaito (y ~ 22..75, x ~ 800, 850, 900, 950)
Crop-Box $bmp 800 24 48 55 "c27_daiki_color"
Crop-Box $bmp 853 24 48 55 "c28_yuto_color"

# Center Hero & Heroine
Crop-Box $bmp 235 60 210 250 "center_shin_hero"
Crop-Box $bmp 420 115 150 190 "center_rosey_heroine"

$bmp.Dispose()
Write-Output "Test color crops generated!"
