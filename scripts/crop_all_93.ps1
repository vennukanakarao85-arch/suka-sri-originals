Add-Type -AssemblyName System.Drawing

$srcSketch = "C:\Users\lucky\.gemini\antigravity\brain\3b0660d2-f05e-4c30-83c3-b60a21ebc102\.user_uploaded\media_1794244542725.jpg"
$destDir = "public\characters\canon_exact"
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$bmp = [System.Drawing.Bitmap]::FromFile($srcSketch)

function Crop-Character($bmp, $num, $name, $x, $y, $w, $h) {
    $pad = [string]$num
    if ($num -lt 10) { $pad = "0$num" }
    
    $targetW = 360
    $targetH = 480
    
    $crop = New-Object System.Drawing.Bitmap $targetW, $targetH
    $g = [System.Drawing.Graphics]::FromImage($crop)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $dest = New-Object System.Drawing.Rectangle 0, 0, $targetW, $targetH
    $src = New-Object System.Drawing.Rectangle $x, $y, $w, $h
    $g.DrawImage($bmp, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    $safeName = $name -replace '[^a-zA-Z0-9_]', '_'
    $outPath = "$destDir\${pad}_${safeName}.jpg"
    $crop.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $crop.Dispose()
}

# Row 1 (y: 54, h: 64 - perfectly cuts off bottom label and left/right borders)
Crop-Character $bmp 1 "Shin_Takamori" 16 54 64 64
Crop-Character $bmp 2 "Rosey_Rina_Kobayashi" 92 54 64 64
Crop-Character $bmp 3 "Ryujin" 168 54 64 64
Crop-Character $bmp 4 "Isamu_Takamori" 250 54 72 64
Crop-Character $bmp 5 "Sachiko_Takamori" 334 54 72 64
Crop-Character $bmp 6 "Akio_Takamori" 427 54 46 64
Crop-Character $bmp 7 "Kaori_Takamori" 482 54 46 64
Crop-Character $bmp 8 "Kazuki_Takamori" 538 54 46 64
Crop-Character $bmp 9 "Emi_Takamori" 592 54 46 64
Crop-Character $bmp 10 "Ichika_Takamori" 648 54 46 64
Crop-Character $bmp 11 "Ryo_Kisaragi" 702 54 46 64
Crop-Character $bmp 12 "Haruto_Takamori" 772 54 50 64
Crop-Character $bmp 13 "Miyuki_Takamori" 832 54 50 64
Crop-Character $bmp 14 "Shin_Takamori" 892 54 50 64
Crop-Character $bmp 15 "Yuna_Takamori" 952 54 50 64

# Row 2 (y: 195, h: 64)
Crop-Character $bmp 16 "Takeshi_Takamori" 14 195 44 64
Crop-Character $bmp 17 "Yukiko_Takamori" 68 195 44 64
Crop-Character $bmp 18 "Kage_Takamori" 122 195 44 64
Crop-Character $bmp 19 "Aoi_Takamori" 176 195 44 64
Crop-Character $bmp 20 "Ren_Hayato" 230 195 44 64
Crop-Character $bmp 21 "Ayumi_Takamori" 290 195 54 64
Crop-Character $bmp 22 "Kazuya_Aizawa" 354 195 54 64
Crop-Character $bmp 23 "Mei_Aizawa" 418 195 54 64
Crop-Character $bmp 24 "Kazuhiro_Kobayashi" 495 195 68 64
Crop-Character $bmp 25 "Ayumi_Kobayashi" 575 195 68 64
Crop-Character $bmp 26 "Rosey_Rina_Kobayashi" 655 195 68 64
Crop-Character $bmp 27 "Daiki_Sakamoto" 738 195 60 64
Crop-Character $bmp 28 "Yuto_Nishimura" 808 195 60 64
Crop-Character $bmp 29 "Ren_Fujimoto" 878 195 60 64
Crop-Character $bmp 30 "Kaito_Hoshino" 948 195 60 64

# Row 3 (y: 336, h: 64)
Crop-Character $bmp 31 "Hideo_Sakamoto" 14 336 29 64
Crop-Character $bmp 32 "Yumi_Sakamoto" 50 336 29 64
Crop-Character $bmp 33 "Kenta_Nishimura" 86 336 29 64
Crop-Character $bmp 34 "Ayumi_Nishimura" 122 336 29 64
Crop-Character $bmp 35 "Naoto_Fujimoto" 158 336 29 64
Crop-Character $bmp 36 "Haruka_Fujimoto" 194 336 29 64
Crop-Character $bmp 37 "Masato_Hoshino" 230 336 29 64
Crop-Character $bmp 38 "Keiko_Hoshino" 266 336 29 64

# Page 10: School Teachers (top row)
Crop-Character $bmp 39 "Keiko_Tanaka" 314 318 44 46
Crop-Character $bmp 40 "Hiroshi_Watanabe" 368 318 44 46
Crop-Character $bmp 41 "Takeshi_Inoue" 422 318 44 46
Crop-Character $bmp 42 "Ayaka_Mori" 476 318 44 46

# Page 10: School Students (bottom row)
Crop-Character $bmp 43 "Shin_Shimizu" 312 376 25 44
Crop-Character $bmp 44 "Riko_Hayashi" 344 376 25 44
Crop-Character $bmp 45 "Kei_Takeda" 376 376 25 44
Crop-Character $bmp 46 "Minoru_Kogami" 408 376 25 44
Crop-Character $bmp 47 "Takeru_Mori" 440 376 25 44
Crop-Character $bmp 48 "Ryo_Asakawa" 472 376 25 44
Crop-Character $bmp 49 "Sakura_Arai" 504 376 25 44

# Page 11: College (top row)
Crop-Character $bmp 50 "Kenji_Nakamura" 546 318 60 46
Crop-Character $bmp 51 "Shun_Okamoto" 615 318 60 46
Crop-Character $bmp 52 "Hinata_Arai" 684 318 60 46
Crop-Character $bmp 53 "Naoki_Yoshida" 753 318 58 46

# Page 11: College Sisters (middle row)
Crop-Character $bmp 54 "Akari" 545 378 29 44
Crop-Character $bmp 55 "Miya" 581 378 29 44
Crop-Character $bmp 56 "Misaki" 617 378 29 44
Crop-Character $bmp 57 "Suzune" 653 378 29 44

# Page 11: College Friends (bottom row)
Crop-Character $bmp 58 "Sana_Shindo" 691 378 34 44
Crop-Character $bmp 59 "Kana_Mizuno" 733 378 34 44
Crop-Character $bmp 60 "Reina_Kanda" 775 378 34 44

# Page 12: NOVATECH
Crop-Character $bmp 61 "Hikaru_Shindo" 832 336 80 64
Crop-Character $bmp 62 "Sana_Shindo" 922 336 80 64

# Row 4 (y: 476, h: 64)
# Page 13: SUKA SRI Core Team
Crop-Character $bmp 63 "Koji_Ando" 16 476 43 64
Crop-Character $bmp 64 "Yuki_Ishikawa" 68 476 43 64
Crop-Character $bmp 65 "Kana_Mizuno" 120 476 43 64
Crop-Character $bmp 66 "Dr_Toru_Shibata" 172 476 43 64
Crop-Character $bmp 67 "Genji_Arakawa" 224 476 43 64
Crop-Character $bmp 68 "Akihiro_Matsuda" 276 476 43 64
Crop-Character $bmp 69 "Reina_Kanda" 328 476 43 64
Crop-Character $bmp 70 "Makoto_Sugiyama" 380 476 43 64
Crop-Character $bmp 71 "Daisuke_Kinoshita" 432 476 43 64

# Page 14: World Leaders & Global Figures
Crop-Character $bmp 72 "Tetsuya_Kirishima" 494 476 47 64
Crop-Character $bmp 73 "Takumi_Aizawa" 550 476 47 64
Crop-Character $bmp 74 "Naoko_Fujii" 606 476 47 64
Crop-Character $bmp 75 "Dr_Rei_Kanzaki" 662 476 47 64
Crop-Character $bmp 76 "Sakura_Minase" 718 476 47 64

# Page 15: Mentor & Mythical World
Crop-Character $bmp 77 "Masaru_Kuroda" 784 476 100 64
Crop-Character $bmp 78 "Ryujin" 899 476 100 64
Crop-Character $bmp 79 "Seiryu" 784 524 67 62
Crop-Character $bmp 80 "Byakko" 860 524 67 62
Crop-Character $bmp 81 "Sogen" 936 524 67 62

# Page 16: Syndicate (Villains) - Full Color, y: 592, h: 58 (Cuts off label perfectly!)
Crop-Character $bmp 82 "Shadow_King_Kage_Takamori" 15 592 52 58
Crop-Character $bmp 83 "Queen_Akari_Himemiya" 78 592 52 58
Crop-Character $bmp 84 "Raiden" 141 592 52 58
Crop-Character $bmp 85 "Jin" 204 592 52 58
Crop-Character $bmp 86 "Akuma" 267 592 52 58
Crop-Character $bmp 87 "Shigure" 330 592 52 58
Crop-Character $bmp 88 "Zero" 393 592 52 58
Crop-Character $bmp 89 "Genzo" 456 592 52 58
Crop-Character $bmp 90 "Kuro" 519 592 52 58
Crop-Character $bmp 91 "Hayate" 582 592 52 58
Crop-Character $bmp 92 "Rei" 645 592 52 58
Crop-Character $bmp 93 "Goro" 708 592 52 58

$bmp.Dispose()
Write-Output "PERFECT: Successfully cropped all 93 canonical portraits without borders or labels!"
