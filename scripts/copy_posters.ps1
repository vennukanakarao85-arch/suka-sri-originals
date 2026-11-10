$srcBase = "C:\Users\lucky\.gemini\antigravity\brain\3b0660d2-f05e-4c30-83c3-b60a21ebc102\.user_uploaded"
$destDir = "public\images\master_posters"
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }

Copy-Item "$srcBase\media_1794246386194.jpg" "public\images\part1-poster.jpg" -Force
Copy-Item "$srcBase\media_1794246415324.jpg" "public\images\part2-poster.jpg" -Force
Copy-Item "$srcBase\media_1794246460991.jpg" "public\images\part3-poster.jpg" -Force
Copy-Item "$srcBase\media_1794245301895.jpg" "public\images\mirai-official-saga-poster.jpg" -Force

Copy-Item "$srcBase\media_1794245301895.jpg" "$destDir\mirai_grand_canon_93_characters.jpg" -Force
Copy-Item "$srcBase\media_1794246386194.jpg" "$destDir\part_1_rise_of_the_empire_official.jpg" -Force
Copy-Item "$srcBase\media_1794246415324.jpg" "$destDir\part_2_the_dark_shadow_official.jpg" -Force
Copy-Item "$srcBase\media_1794246460991.jpg" "$destDir\part_3_the_era_of_zero_official.jpg" -Force

Get-ChildItem -Path "public\images\master_posters" | Select-Object Name, Length
Get-ChildItem -Path "public\images\part*-poster.jpg" | Select-Object Name, Length
Write-Output "Successfully deployed official master posters!"
