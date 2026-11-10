Add-Type -AssemblyName System.Drawing

$srcSketch = "C:\Users\lucky\.gemini\antigravity\brain\3b0660d2-f05e-4c30-83c3-b60a21ebc102\.user_uploaded\media_1794244542725.jpg"
$destDir = "public\characters\test_measure"
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$bmp = [System.Drawing.Bitmap]::FromFile($srcSketch)

function Crop-Box($bmp, $x, $y, $w, $h, $name) {
    $crop = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($crop)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $dest = New-Object System.Drawing.Rectangle 0, 0, $w, $h
    $src = New-Object System.Drawing.Rectangle $x, $y, $w, $h
    $g.DrawImage($bmp, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $crop.Save("$destDir\$name.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $crop.Dispose()
}

# Row 1 (y: 55 to 145)
# Page 1 (Main): 1, 2, 3 (x: 10..230) -> each ~73 px
Crop-Box $bmp 12 55 70 85 "c01_shin"
Crop-Box $bmp 88 55 70 85 "c02_rosey"
Crop-Box $bmp 164 55 70 85 "c03_ryujin"

# Page 2 (Takamori First Gen): 4, 5 (x: 245..410) -> each ~80 px
Crop-Box $bmp 246 55 80 85 "c04_isamu"
Crop-Box $bmp 330 55 80 85 "c05_sachiko"

# Page 3 (Big Father Family): 6, 7, 8, 9, 10, 11 (x: 420..755) -> each ~55 px
Crop-Box $bmp 423 55 54 85 "c06_akio"
Crop-Box $bmp 478 55 54 85 "c07_kaori"
Crop-Box $bmp 533 55 54 85 "c08_kazuki"
Crop-Box $bmp 588 55 54 85 "c09_emi"
Crop-Box $bmp 643 55 54 85 "c10_ichika"
Crop-Box $bmp 698 55 54 85 "c11_ryo"

# Page 4 (Shin Family): 12, 13, 14, 15 (x: 765..1010) -> each ~60 px
Crop-Box $bmp 767 55 59 85 "c12_haruto"
Crop-Box $bmp 828 55 59 85 "c13_miyuki"
Crop-Box $bmp 888 55 59 85 "c14_shin"
Crop-Box $bmp 948 55 59 85 "c15_yuna"

$bmp.Dispose()
Write-Output "Measured Row 1 successfully!"
