Add-Type -AssemblyName System.Drawing

$srcSketch = "C:\Users\lucky\.gemini\antigravity\brain\3b0660d2-f05e-4c30-83c3-b60a21ebc102\.user_uploaded\media_1794244542725.jpg"
$destDir = "public\characters\test_rows"
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

# Row 2 (y ~ 196)
# Page 5: 16 Takeshi (x~10), 17 Yukiko (x~65), 18 Kage (x~118), 19 Aoi (x~172), 20 Ren (x~226)
Crop-Box $bmp 12 196 50 82 "c16_takeshi"
Crop-Box $bmp 118 196 50 82 "c18_kage"

# Page 6: 21 Ayumi (x~285), 22 Kazuya (x~350), 23 Mei (x~415)
Crop-Box $bmp 418 196 50 82 "c23_mei"

# Page 7: 24 Kazuhiro (x~490), 25 Ayumi (x~570), 26 Rosey (x~650)
Crop-Box $bmp 494 196 65 82 "c24_kazuhiro"

# Page 8: 27 Daiki (x~735), 28 Yuto (x~805), 29 Ren (x~875), 30 Kaito (x~945)
Crop-Box $bmp 738 196 60 82 "c27_daiki"
Crop-Box $bmp 948 196 60 82 "c30_kaito"

# Row 3 (y ~ 338)
# Page 9: 31 Hideo (x~10), 32 Yumi (x~46), 33 Kenta (x~82), 34 Ayumi (x~118), 35 Naoto (x~154), 36 Haruka (x~190), 37 Masato (x~226), 38 Keiko (x~262)
Crop-Box $bmp 12 338 34 82 "c31_hideo"
Crop-Box $bmp 228 338 34 82 "c37_masato"

# Page 12: 61 Hikaru Shindo (x~825), 62 Sana Shindo (x~915)
Crop-Box $bmp 828 338 75 82 "c61_hikaru"
Crop-Box $bmp 916 338 75 82 "c62_sana"

# Row 4 (y ~ 478)
# Page 13: 63 Koji Ando (x~10), 64 Yuki Ishikawa (x~62), 65 Kana Mizuno (x~114), 66 Toru (x~166), 67 Genji (x~218), 68 Akihiro (x~270), 69 Reina (x~322), 70 Makoto (x~374), 71 Daisuke (x~426)
Crop-Box $bmp 12 478 48 82 "c63_koji"
Crop-Box $bmp 116 478 48 82 "c65_kana"
Crop-Box $bmp 272 478 48 82 "c68_akihiro"
Crop-Box $bmp 376 478 48 82 "c70_makoto"

# Page 14: 72 Tetsuya (x~488), 73 Takumi (x~544), 74 Naoko Fujii (x~600), 75 Dr Rei (x~656), 76 Sakura (x~712)
Crop-Box $bmp 490 478 52 82 "c72_tetsuya"
Crop-Box $bmp 602 478 52 82 "c74_naoko"

# Page 15 (Mentor & Mythical World): 77 Masaru (x~780, y~478), 78 Ryujin (x~865, y~478), 79 Seiryu (x~780, y~590), 80 Byakko (x~850, y~590), 81 Sogen (x~925, y~590)
Crop-Box $bmp 782 478 75 82 "c77_masaru"
Crop-Box $bmp 848 590 65 82 "c80_byakko"
Crop-Box $bmp 922 590 65 82 "c81_sogen"

$bmp.Dispose()
Write-Output "Tested rows successfully!"
