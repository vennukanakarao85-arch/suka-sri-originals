Add-Type -AssemblyName System.Drawing

$src = "C:\Users\lucky\.gemini\antigravity\brain\3b0660d2-f05e-4c30-83c3-b60a21ebc102\.user_uploaded\media_1794245301895.jpg"
$destDir = "public\characters\test_crops"
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$bmp = [System.Drawing.Bitmap]::FromFile($src)

# Let's crop Page 16 Villains from bottom right of media_1794245301895.jpg
# Or let's crop Jin (#85), Raiden (#84), Akuma (#86), Zero (#88) from the master sketch and color sheets
# On media_1794244542725.jpg:
$srcSketch = "C:\Users\lucky\.gemini\antigravity\brain\3b0660d2-f05e-4c30-83c3-b60a21ebc102\.user_uploaded\media_1794244542725.jpg"
$bmpSketch = [System.Drawing.Bitmap]::FromFile($srcSketch)

# In media_1794244542725.jpg, Page 16 y starts around 590 to 675. Width is 1024.
# Page 16 spans x: ~8 to ~765. 12 characters: ~63 px wide each!
# 82: ~8..71
# 83: ~71..134
# 84: ~134..197
# 85 (Jin): ~197..260
# 86 (Akuma): ~260..323
# 87 (Shigure): ~323..386
# 88 (Zero): ~386..449
# 89 (Genzo): ~449..512
# 90 (Kuro): ~512..575
# 91 (Hayate): ~575..638
# 92 (Rei): ~638..701
# 93 (Goro): ~701..764

function Crop-And-Save($sourceBmp, $rect, $outputPath, $targetWidth, $targetHeight) {
    $crop = New-Object System.Drawing.Bitmap $targetWidth, $targetHeight
    $g = [System.Drawing.Graphics]::FromImage($crop)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $destRect = New-Object System.Drawing.Rectangle 0, 0, $targetWidth, $targetHeight
    $g.DrawImage($sourceBmp, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $crop.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $crop.Dispose()
}

# Crop Jin (#85)
$jinRect = New-Object System.Drawing.Rectangle 197, 592, 60, 80
Crop-And-Save $bmpSketch $jinRect "$destDir\jin_test.jpg" 300 400

# Crop Shigure (#87)
$shigureRect = New-Object System.Drawing.Rectangle 325, 592, 60, 80
Crop-And-Save $bmpSketch $shigureRect "$destDir\shigure_test.jpg" 300 400

# Crop Zero (#88)
$zeroRect = New-Object System.Drawing.Rectangle 388, 592, 60, 80
Crop-And-Save $bmpSketch $zeroRect "$destDir\zero_test.jpg" 300 400

# Crop Genzo (#89)
$genzoRect = New-Object System.Drawing.Rectangle 451, 592, 60, 80
Crop-And-Save $bmpSketch $genzoRect "$destDir\genzo_test.jpg" 300 400

# Crop Kuro (#90)
$kuroRect = New-Object System.Drawing.Rectangle 514, 592, 60, 80
Crop-And-Save $bmpSketch $kuroRect "$destDir\kuro_test.jpg" 300 400

# Crop Hayate (#91)
$hayateRect = New-Object System.Drawing.Rectangle 577, 592, 60, 80
Crop-And-Save $bmpSketch $hayateRect "$destDir\hayate_test.jpg" 300 400

# Crop Goro (#93)
$goroRect = New-Object System.Drawing.Rectangle 703, 592, 60, 80
Crop-And-Save $bmpSketch $goroRect "$destDir\goro_test.jpg" 300 400

$bmp.Dispose()
$bmpSketch.Dispose()
Write-Output "Cropped 7 villains successfully!"
