Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$sdkRoot = $env:ANDROID_SDK_ROOT
if (-not $sdkRoot) {
  $sdkRoot = $env:ANDROID_HOME
}
if (-not $sdkRoot) {
  $sdkRoot = Join-Path $env:LOCALAPPDATA "Android\\sdk"
}

Write-Host "[android] sdk: $sdkRoot"

$sdkManager = Join-Path $sdkRoot "cmdline-tools\\latest\\bin\\sdkmanager.bat"
if (-not (Test-Path $sdkManager)) {
  Write-Host "[android] cmdline-tools missing, downloading..."

  $fallbackUrl = "https://dl.google.com/android/repository/commandlinetools-win-13114758_latest.zip"
  $url = $fallbackUrl

  try {
    $html = (Invoke-WebRequest -UseBasicParsing "https://developer.android.com/studio").Content
    $m = [regex]::Match($html, "https://dl\\.google\\.com/android/repository/commandlinetools-win-\\d+_latest\\.zip")
    if ($m.Success) {
      $url = $m.Value
    }
  } catch {
    # Keep fallback URL.
  }

  Write-Host "[android] url: $url"

  $zipPath = Join-Path $env:TEMP ("android-cmdline-tools-" + [guid]::NewGuid().ToString() + ".zip")
  $extractDir = Join-Path $env:TEMP ("android-cmdline-tools-extract-" + [guid]::NewGuid().ToString())

  Invoke-WebRequest -UseBasicParsing $url -OutFile $zipPath
  New-Item -ItemType Directory -Force $extractDir | Out-Null
  Expand-Archive -Force $zipPath $extractDir

  $src = Join-Path $extractDir "cmdline-tools"
  if (-not (Test-Path $src)) {
    throw "Unexpected archive layout: missing '$src'"
  }

  $destRoot = Join-Path $sdkRoot "cmdline-tools"
  $destLatest = Join-Path $destRoot "latest"
  New-Item -ItemType Directory -Force $destRoot | Out-Null

  if (Test-Path $destLatest) {
    Remove-Item -Recurse -Force $destLatest
  }
  Move-Item -Force $src $destLatest

  Remove-Item -Recurse -Force $extractDir
  Remove-Item -Force $zipPath
}

$env:ANDROID_SDK_ROOT = $sdkRoot
$env:ANDROID_HOME = $sdkRoot
$env:PATH = (Join-Path $sdkRoot "cmdline-tools\\latest\\bin") + ";" + (Join-Path $sdkRoot "platform-tools") + ";" + $env:PATH

Write-Host "[android] accepting licenses..."
cmd.exe /c "(for /l %i in (1,1,50) do @echo y) | \"${sdkManager}\" --licenses" | Out-Host

Write-Host "[android] done"

