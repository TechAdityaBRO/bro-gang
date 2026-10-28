param([Parameter(Mandatory)] [string]$MsiPath)
$ErrorActionPreference = 'Stop'
$log = Join-Path $env:TEMP "bg-msi-$(Get-Random).log"
$p = Start-Process msiexec.exe -ArgumentList @('/i', "`"$MsiPath`"", '/qn', '/norestart', '/L*v', "`"$log`"") -Wait -PassThru
if ($p.ExitCode -ne 0 -and $p.ExitCode -ne 3010) { throw "msiexec exit $($p.ExitCode). Log: $log" }
Write-Host "  msi installed (log: $log)"
