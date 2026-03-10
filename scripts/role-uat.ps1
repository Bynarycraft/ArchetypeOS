$ErrorActionPreference = 'Stop'

$project = 'C:\Users\BYNARYCRAFT\Desktop\archetypeos-mvp\talent-compass'
$base = 'http://localhost:3000'

function Test-Route {
  param(
    [Microsoft.PowerShell.Commands.WebRequestSession]$WebSession,
    [string]$Path
  )

  try {
    $resp = Invoke-WebRequest -Uri ($base + $Path) -WebSession $WebSession -MaximumRedirection 0 -ErrorAction Stop
    return [pscustomobject]@{ Path = $Path; Status = [int]$resp.StatusCode; Location = $resp.Headers.Location }
  }
  catch {
    $resp = $_.Exception.Response
    if ($resp) {
      return [pscustomobject]@{ Path = $Path; Status = [int]$resp.StatusCode; Location = $resp.Headers['Location'] }
    }
    return [pscustomobject]@{ Path = $Path; Status = 'ERR'; Location = $_.Exception.Message }
  }
}

function Login-Role {
  param(
    [string]$Email,
    [string]$Password
  )

  $ws = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $csrf = (Invoke-WebRequest -Uri ($base + '/api/auth/csrf') -WebSession $ws).Content | ConvertFrom-Json

  $body = @{
    csrfToken = $csrf.csrfToken
    email = $Email
    password = $Password
    json = 'true'
    callbackUrl = ($base + '/dashboard')
  }

  $null = Invoke-WebRequest -Method Post -Uri ($base + '/api/auth/callback/credentials') -WebSession $ws -Body $body -ContentType 'application/x-www-form-urlencoded'
  $session = (Invoke-WebRequest -Uri ($base + '/api/auth/session') -WebSession $ws).Content | ConvertFrom-Json

  return [pscustomobject]@{ WebSession = $ws; Session = $session }
}

$server = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory $project -PassThru
Start-Sleep -Seconds 12

$report = @()

try {
  $anonymous = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  foreach ($path in @('/auth','/auth/signin','/dashboard','/courses','/tests','/admin/users','/supervisor')) {
    $r = Test-Route -WebSession $anonymous -Path $path
    $report += [pscustomobject]@{ Actor='anonymous'; SessionRole='none'; Path=$r.Path; Status=$r.Status; Location=$r.Location }
  }

  $users = @(
    @{ Role='candidate'; Email='candidate@archetype.local'; Password='candidate123' },
    @{ Role='learner'; Email='learner1@archetype.local'; Password='learner123' },
    @{ Role='supervisor'; Email='supervisor@archetype.local'; Password='supervisor123' },
    @{ Role='admin'; Email='admin@archetype.local'; Password='admin123' }
  )

  foreach ($user in $users) {
    try {
      $logged = Login-Role -Email $user.Email -Password $user.Password
      $sessionRole = if ($logged.Session.user.role) { $logged.Session.user.role } else { 'none' }

      foreach ($path in @('/dashboard','/courses','/tests','/tracker','/roadmap','/profile','/supervisor','/admin/users')) {
        $r = Test-Route -WebSession $logged.WebSession -Path $path
        $report += [pscustomobject]@{ Actor=$user.Role; SessionRole=$sessionRole; Path=$r.Path; Status=$r.Status; Location=$r.Location }
      }
    }
    catch {
      $report += [pscustomobject]@{ Actor=$user.Role; SessionRole='login_failed'; Path='(login)'; Status='ERR'; Location=$_.Exception.Message }
    }
  }
}
finally {
  if ($server -and !$server.HasExited) {
    Stop-Process -Id $server.Id -Force
  }
}

$report | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $project 'scripts\role-uat-report.json')
$report | Sort-Object Actor, Path | Format-Table -AutoSize
