Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-NodeTools {
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    return
  }

  # Try Laragon's bundled Node.js if npm is not available in PATH.
  $laragonNodeRoot = "C:\\laragon\\bin\\nodejs"
  if (Test-Path $laragonNodeRoot) {
    $nodeDir = Get-ChildItem -Path $laragonNodeRoot -Directory | Sort-Object Name -Descending | Select-Object -First 1
    if ($nodeDir) {
      $env:PATH = "$($nodeDir.FullName);$env:PATH"
    }
  }
}

function Ensure-FlutterTools {
  if (Get-Command flutter -ErrorAction SilentlyContinue) {
    return
  }

  $flutterBin = "C:\\src\\flutter\\bin"
  if (Test-Path (Join-Path $flutterBin "flutter.bat")) {
    $env:PATH = "$flutterBin;$env:PATH"
  }
}

function Ensure-ContainerRunning([string]$name) {
  $exists = (docker ps -a --format "{{.Names}}" | Select-String -SimpleMatch $name -Quiet)
  if (-not $exists) {
    throw "Docker container '$name' not found. Start it first (or run backend/docker-compose.yml)."
  }

  $running = (docker ps --format "{{.Names}}" | Select-String -SimpleMatch $name -Quiet)
  if (-not $running) {
    docker start $name | Out-Host
  }
}

function Wait-Tcp([string]$hostname, [int]$port, [int]$timeoutSec = 60) {
  $deadline = (Get-Date).AddSeconds($timeoutSec)
  while ((Get-Date) -lt $deadline) {
    $ok = Test-NetConnection -ComputerName $hostname -Port $port -InformationLevel Quiet
    if ($ok) {
      return
    }
    Start-Sleep -Seconds 2
  }
  throw "Timeout waiting for TCP ${hostname}:${port}"
}

Ensure-NodeTools
Ensure-FlutterTools

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

Write-Host "[gate] repo: $root"

Write-Host "[gate] backend: format"
npm --workspace backend run format

Write-Host "[gate] backend: lint"
npm --workspace backend run lint

Write-Host "[gate] backend: unit tests"
npm --workspace backend run test -- --runInBand

Write-Host "[gate] backend: ensure postgres+redis (for e2e)"
Ensure-ContainerRunning "bumas-postgres"
Ensure-ContainerRunning "bumas-redis"
Wait-Tcp "127.0.0.1" 5432 90
Wait-Tcp "127.0.0.1" 6379 90

Write-Host "[gate] backend: e2e tests"
npm --workspace backend run test:e2e

Write-Host "[gate] backend: build"
npm --workspace backend run build

Write-Host "[gate] backend: audit (high+)"
npm audit --audit-level=high

Write-Host "[gate] mobile: pub get"
Set-Location (Join-Path $root "mobile_app")
flutter pub get

Write-Host "[gate] mobile: format"
dart format --set-exit-if-changed lib test

Write-Host "[gate] mobile: analyze"
flutter analyze --fatal-warnings --fatal-infos

Write-Host "[gate] mobile: test"
flutter test --coverage --test-randomize-ordering-seed random

Write-Host "[gate] mobile: build android dev(debug) + prod(release)"
flutter build apk --flavor dev --debug --dart-define=API_BASE_URL=https://bumas.infiatin.cloud/api
flutter build apk --flavor prod --release --dart-define=API_BASE_URL=https://bumas.infiatin.cloud/api

Write-Host "[gate] OK"
