$ErrorActionPreference = 'Stop'

$base = 'http://localhost:3000'
$project = 'C:\Users\BYNARYCRAFT\Desktop\archetypeos-mvp\talent-compass'

function Login-Session($email, $password, $callback) {
  $ws = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $csrf = (Invoke-RestMethod -Uri ($base + '/api/auth/csrf') -WebSession $ws -TimeoutSec 20).csrfToken
  $body = 'csrfToken=' + [uri]::EscapeDataString($csrf) +
    '&email=' + [uri]::EscapeDataString($email) +
    '&password=' + [uri]::EscapeDataString($password) +
    '&callbackUrl=' + [uri]::EscapeDataString($callback) +
    '&json=true'
  Invoke-WebRequest -Uri ($base + '/api/auth/callback/credentials?json=true') -Method POST -ContentType 'application/x-www-form-urlencoded' -Body $body -WebSession $ws -TimeoutSec 20 | Out-Null
  return $ws
}

function Assert-Status($status, $expected, $label) {
  if ($status -ne $expected) {
    throw "$label expected status $expected but got $status"
  }
}

$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

$server = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory $project -PassThru
Start-Sleep -Seconds 12

try {
  Write-Output '1) Login admin and supervisor...'
  $adminWs = Login-Session 'admin@archetype.local' 'admin123' ($base + '/admin/dashboard')
  $supervisorWs = Login-Session 'supervisor@archetype.local' 'supervisor123' ($base + '/supervisor')

  Write-Output '2) Check role-protected pages...'
  $adminAuditPage = Invoke-WebRequest -Uri ($base + '/admin/audit') -WebSession $adminWs -TimeoutSec 20
  Assert-Status ([int]$adminAuditPage.StatusCode) 200 'Admin audit page'

  $adminRoadmapsPage = Invoke-WebRequest -Uri ($base + '/admin/roadmaps') -WebSession $adminWs -TimeoutSec 20
  Assert-Status ([int]$adminRoadmapsPage.StatusCode) 200 'Admin roadmaps page'

  $supervisorProgressPage = Invoke-WebRequest -Uri ($base + '/supervisor/progress') -WebSession $supervisorWs -TimeoutSec 20
  Assert-Status ([int]$supervisorProgressPage.StatusCode) 200 'Supervisor progress page'

  Write-Output '3) Test admin roadmap CRUD APIs...'
  $newRoadmapPayload = @{
    name = "Smoke Roadmap $stamp"
    archetype = 'Maker'
    description = 'Smoke test roadmap'
  } | ConvertTo-Json

  $newRoadmapResp = Invoke-WebRequest -Uri ($base + '/api/admin/roadmaps') -Method POST -ContentType 'application/json' -Body $newRoadmapPayload -WebSession $adminWs -TimeoutSec 20
  Assert-Status ([int]$newRoadmapResp.StatusCode) 201 'Create roadmap'
  $newRoadmap = $newRoadmapResp.Content | ConvertFrom-Json

  $roadmapsResp = Invoke-WebRequest -Uri ($base + '/api/admin/roadmaps') -WebSession $adminWs -TimeoutSec 20
  Assert-Status ([int]$roadmapsResp.StatusCode) 200 'List roadmaps'

  $updateRoadmapPayload = @{
    name = "Smoke Roadmap Updated $stamp"
    archetype = 'Catalyst'
    description = 'Updated by smoke test'
  } | ConvertTo-Json

  $updateRoadmapResp = Invoke-WebRequest -Uri ($base + '/api/admin/roadmaps/' + $newRoadmap.id) -Method PATCH -ContentType 'application/json' -Body $updateRoadmapPayload -WebSession $adminWs -TimeoutSec 20
  Assert-Status ([int]$updateRoadmapResp.StatusCode) 200 'Update roadmap'

  $deleteRoadmapResp = Invoke-WebRequest -Uri ($base + '/api/admin/roadmaps/' + $newRoadmap.id) -Method DELETE -WebSession $adminWs -TimeoutSec 20
  Assert-Status ([int]$deleteRoadmapResp.StatusCode) 200 'Delete roadmap'

  Write-Output '4) Test admin archetype CRUD APIs...'
  $newArchetypePayload = @{
    name = "Smoke Archetype $stamp"
    description = 'Smoke test archetype'
    roadmapId = $null
  } | ConvertTo-Json

  $newArchetypeResp = Invoke-WebRequest -Uri ($base + '/api/admin/archetypes') -Method POST -ContentType 'application/json' -Body $newArchetypePayload -WebSession $adminWs -TimeoutSec 20
  Assert-Status ([int]$newArchetypeResp.StatusCode) 201 'Create archetype'
  $newArchetype = $newArchetypeResp.Content | ConvertFrom-Json

  $updateArchetypePayload = @{
    name = "Smoke Archetype Updated $stamp"
    description = 'Updated by smoke test'
    roadmapId = $null
  } | ConvertTo-Json

  $updateArchetypeResp = Invoke-WebRequest -Uri ($base + '/api/admin/archetypes/' + $newArchetype.id) -Method PATCH -ContentType 'application/json' -Body $updateArchetypePayload -WebSession $adminWs -TimeoutSec 20
  Assert-Status ([int]$updateArchetypeResp.StatusCode) 200 'Update archetype'

  $deleteArchetypeResp = Invoke-WebRequest -Uri ($base + '/api/admin/archetypes/' + $newArchetype.id) -Method DELETE -WebSession $adminWs -TimeoutSec 20
  Assert-Status ([int]$deleteArchetypeResp.StatusCode) 200 'Delete archetype'

  Write-Output '5) Test admin audit API + supervisor report API...'
  $auditResp = Invoke-WebRequest -Uri ($base + '/api/admin/audit-logs?page=1&pageSize=10') -WebSession $adminWs -TimeoutSec 20
  Assert-Status ([int]$auditResp.StatusCode) 200 'Audit logs API'

  $reportResp = Invoke-WebRequest -Uri ($base + '/api/supervisor/reports') -WebSession $supervisorWs -TimeoutSec 20
  Assert-Status ([int]$reportResp.StatusCode) 200 'Supervisor reports API'

  Write-Output '6) Verify supervisor cannot access admin APIs...'
  $forbiddenStatus = ''
  try {
    $null = Invoke-WebRequest -Uri ($base + '/api/admin/audit-logs') -WebSession $supervisorWs -TimeoutSec 20
    $forbiddenStatus = 'unexpected-200'
  }
  catch {
    if ($_.Exception.Response) {
      $forbiddenStatus = [string]$_.Exception.Response.StatusCode.value__
    } else {
      $forbiddenStatus = 'error'
    }
  }

  if ($forbiddenStatus -ne '403') {
    throw "Supervisor access gate failed for /api/admin/audit-logs (status=$forbiddenStatus)"
  }

  Write-Output 'Smoke test PASSED'
}
finally {
  if ($server -and !$server.HasExited) {
    Stop-Process -Id $server.Id -Force
  }
}
