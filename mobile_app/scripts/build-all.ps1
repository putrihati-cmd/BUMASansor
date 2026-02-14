Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

$versionLine = (Get-Content -Path "pubspec.yaml" | Where-Object { $_ -match "^version:" } | Select-Object -First 1)
$versionRaw = ($versionLine -split "\s+", 2)[1].Trim()
$parts = $versionRaw.Split("+")
$version = $parts[0]
$buildNumber = if ($parts.Count -gt 1) { $parts[1] } else { "0" }

Write-Host "[mobile] version: $version ($buildNumber)"

Write-Host "[mobile] clean + deps"
flutter clean
flutter pub get

Write-Host "[mobile] build dev apk"
flutter build apk --flavor dev --debug --dart-define=API_BASE_URL=http://10.0.2.2:3000/api

Write-Host "[mobile] build staging apk"
flutter build apk --flavor staging --release --dart-define=API_BASE_URL=https://bumas.infiatin.cloud/api

Write-Host "[mobile] build prod aab"
flutter build appbundle --flavor prod --release --dart-define=API_BASE_URL=https://bumas.infiatin.cloud/api

$distDir = Join-Path $root ("distribution\\v{0}-{1}" -f $version, $buildNumber)
New-Item -ItemType Directory -Force $distDir | Out-Null

$artifacts = @(
  "build\\app\\outputs\\flutter-apk\\app-dev-debug.apk",
  "build\\app\\outputs\\flutter-apk\\app-staging-release.apk",
  "build\\app\\outputs\\bundle\\prodRelease\\app-prod-release.aab"
)

foreach ($a in $artifacts) {
  if (Test-Path $a) {
    Copy-Item -Force $a -Destination $distDir
  }
}

Write-Host "[mobile] generating checksums..."
$checksumPath = Join-Path $distDir "checksums.txt"
Get-ChildItem -File $distDir | ForEach-Object {
  $hash = (Get-FileHash -Algorithm SHA256 $_.FullName).Hash.ToLower()
  "{0}  {1}" -f $hash, $_.Name
} | Set-Content -Path $checksumPath

Write-Host "[mobile] done"
Write-Host " - $distDir"
