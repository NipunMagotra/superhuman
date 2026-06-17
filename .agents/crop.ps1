Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\Nipun Magotra\Downloads\clearlyy-landing-page\pigeon.png"
$outputPath = "C:\Users\Nipun Magotra\Downloads\clearlyy-landing-page\public\pigeon.png"

Write-Host "Loading image from $sourcePath..."
$srcBmp = New-Object System.Drawing.Bitmap($sourcePath)
$width = $srcBmp.Width
$height = $srcBmp.Height

# Find bounding box of non-white, non-transparent pixels
$minX = $width
$maxX = 0
$minY = $height
$maxY = 0

for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $c = $srcBmp.GetPixel($x, $y)
        $isWhite = ($c.R -gt 245) -and ($c.G -gt 245) -and ($c.B -gt 245)
        $isTransparent = $c.A -lt 10
        if (-not $isWhite -and -not $isTransparent) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

# Add padding
$padding = 15
$minX = [Math]::Max(0, $minX - $padding)
$maxX = [Math]::Min($width - 1, $maxX + $padding)
$minY = [Math]::Max(0, $minY - $padding)
$maxY = [Math]::Min($height - 1, $maxY + $padding)

$cropWidth = $maxX - $minX + 1
$cropHeight = $maxY - $minY + 1

Write-Host "Cropping to bounds: X=$minX..$maxX ($cropWidth px), Y=$minY..$maxY ($cropHeight px)..."

# Create new cropped bitmap
$dstBmp = New-Object System.Drawing.Bitmap($cropWidth, $cropHeight)

for ($y = 0; $y -lt $cropHeight; $y++) {
    for ($x = 0; $x -lt $cropWidth; $x++) {
        $c = $srcBmp.GetPixel($minX + $x, $minY + $y)
        $isWhite = ($c.R -gt 245) -and ($c.G -gt 245) -and ($c.B -gt 245)
        if ($isWhite) {
            # Make white pixels transparent
            $dstBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
        } else {
            $dstBmp.SetPixel($x, $y, $c)
        }
    }
}

# Save as PNG
$dstBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$dstBmp.Dispose()
$srcBmp.Dispose()

Write-Host "Successfully cropped and made background transparent!"
