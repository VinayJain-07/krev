param(
  [string]$KeyPath
)

$ErrorActionPreference = "Stop"

if ($KeyPath -and (Test-Path $KeyPath)) {
  Write-Host "Unlocking git-crypt with keyfile: $KeyPath"
  git-crypt unlock $KeyPath
} elseif ($env:GIT_CRYPT_KEY) {
  Write-Host "Unlocking git-crypt with GIT_CRYPT_KEY environment variable..."
  $tempKey = [System.IO.Path]::GetTempFileName()
  try {
    [System.IO.File]::WriteAllBytes($tempKey, [System.Convert]::FromBase64String($env:GIT_CRYPT_KEY))
    git-crypt unlock $tempKey
    Write-Host "git-crypt successfully unlocked."
  } finally {
    if (Test-Path $tempKey) { Remove-Item -Force $tempKey }
  }
} else {
  Write-Error "ERROR: Neither a keyfile parameter nor GIT_CRYPT_KEY environment variable was found."
  exit 1
}
