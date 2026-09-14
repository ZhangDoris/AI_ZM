Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("C:\Users\zhang\AppData\Local\Temp\image.cb8d4bb752.png")
$points = @(
  @{n='member_row'; x=430; y=210},
  @{n='role_row'; x=430; y=306},
  @{n='project_row'; x=430; y=455},
  @{n='modal_bg'; x=430; y=185},
  @{n='key_box'; x=430; y=530}
)
foreach ($p in $points) {
  $c = $bmp.GetPixel($p.x, $p.y)
  $line = "{0}: R={1} G={2} B={3}" -f $p.n, $c.R, $c.G, $c.B
  Write-Output $line
}
$bmp.Dispose()
