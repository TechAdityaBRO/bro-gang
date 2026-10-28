$ErrorActionPreference = 'Stop'
$root = if ($env:BROGANG_HOME) { $env:BROGANG_HOME } else { Join-Path $env:USERPROFILE '.broGang' }
New-Item -ItemType Directory -Path "$root\cache","$root\apps","$root\shims" -Force | Out-Null
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notlike "*$root\shims*") {
  [Environment]::SetEnvironmentVariable('Path', "$userPath;$root\shims", 'User')
  Write-Host "[bg] added $root\shims to user PATH (restart terminal)"
}
Write-Host "[bg] home: $root"
