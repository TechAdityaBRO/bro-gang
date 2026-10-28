param(
  [Parameter(Mandatory)] [string]$ZipPath,
  [Parameter(Mandatory)] [string]$DestDir,
  [Parameter(Mandatory)] [string]$Bins,
  [Parameter(Mandatory)] [string]$ShimDir
)
$ErrorActionPreference = 'Stop'
if (Test-Path $DestDir) { Remove-Item $DestDir -Recurse -Force }
New-Item -ItemType Directory -Path $DestDir, $ShimDir -Force | Out-Null
Expand-Archive -Path $ZipPath -DestinationPath $DestDir -Force

foreach ($pair in $Bins.Split(',')) {
  if (-not $pair) { continue }
  $parts = $pair.Split('|')
  $from = $parts[0]; $to = $parts[1]
  $exe = Get-ChildItem -Path $DestDir -Filter $from -Recurse | Select-Object -First 1
  if (-not $exe) { throw "binary $from not found in archive" }
  $shimName = ($to -replace '\.exe$', '') + '.cmd'
  $shimPath = Join-Path $ShimDir $shimName
  "@echo off`r`n`"$($exe.FullName)`" %*" | Set-Content -Path $shimPath -Encoding ASCII
  Write-Host "  shim: $shimName -> $($exe.FullName)"
}
Write-Host "  extracted to $DestDir"
