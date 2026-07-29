#requires -Version 5.1
<#
.SYNOPSIS
    Installs context-docs-kit into the user-level Claude Code directories.

.DESCRIPTION
    Two-track install, because skills and agents behave differently:

      Skill  -> directory junction from ~/.claude/skills/bootstrapping-context-docs
                into this repo. Edits to SKILL.md and references/ are live with no
                re-sync. Junctions need no admin rights, unlike directory symlinks.

      Agents -> copied as flat files into ~/.claude/agents/. Copied rather than
                linked because whether Claude Code discovers agents in a
                *subdirectory* of ~/.claude/agents is not something this script
                should bet on. Re-run after editing an agent definition.

    Idempotent. Safe to run repeatedly. Never deletes a real directory.

.PARAMETER Force
    Replace a real (non-junction) directory at the skill install path. Without
    this the script refuses and tells you what it found, so a hand-written skill
    is never silently destroyed.

.PARAMETER Uninstall
    Remove the junction and the copied agent files. Leaves the repo untouched.

.EXAMPLE
    .\scripts\sync-local.ps1
.EXAMPLE
    .\scripts\sync-local.ps1 -Uninstall
#>
[CmdletBinding()]
param(
    [switch]$Force,
    [switch]$Uninstall
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot  = Split-Path -Parent $PSScriptRoot
$SkillName = 'bootstrapping-context-docs'

$SkillSource = Join-Path $RepoRoot "skills\$SkillName"
$AgentSource = Join-Path $RepoRoot 'agents'

$ClaudeHome = Join-Path $env:USERPROFILE '.claude'
$SkillLink  = Join-Path $ClaudeHome "skills\$SkillName"
$AgentDest  = Join-Path $ClaudeHome 'agents'

function Write-Step   { param($m) Write-Host "  $m" }
function Write-Ok     { param($m) Write-Host "  [ok]   $m"   -ForegroundColor Green }
function Write-Warn2  { param($m) Write-Host "  [warn] $m"   -ForegroundColor Yellow }
function Write-Err2   { param($m) Write-Host "  [fail] $m"   -ForegroundColor Red }

function Test-IsJunction {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return $false }
    $item = Get-Item -LiteralPath $Path -Force
    return [bool]($item.Attributes -band [IO.FileAttributes]::ReparsePoint)
}

Write-Host ''
Write-Host 'context-docs-kit' -ForegroundColor Cyan
Write-Host "  repo: $RepoRoot"
Write-Host ''

# ---------------------------------------------------------------- uninstall ---
if ($Uninstall) {
    Write-Host 'Uninstalling.' -ForegroundColor Cyan

    if (Test-IsJunction $SkillLink) {
        # Remove-Item on a junction removes the link, not the target contents.
        [IO.Directory]::Delete($SkillLink, $false)
        Write-Ok "removed junction $SkillLink"
    }
    elseif (Test-Path -LiteralPath $SkillLink) {
        Write-Warn2 "$SkillLink is a real directory, not our junction. Left in place."
    }
    else {
        Write-Step "no junction at $SkillLink"
    }

    $removed = 0
    Get-ChildItem -LiteralPath $AgentSource -Filter '*.md' | ForEach-Object {
        $target = Join-Path $AgentDest $_.Name
        if (Test-Path -LiteralPath $target) {
            Remove-Item -LiteralPath $target -Force
            $removed++
        }
    }
    Write-Ok "removed $removed agent file(s) from $AgentDest"
    Write-Host ''
    Write-Host 'Done. Restart Claude Code for the change to register.' -ForegroundColor Cyan
    Write-Host ''
    return
}

# ------------------------------------------------------------ sanity checks ---
if (-not (Test-Path -LiteralPath $SkillSource)) {
    Write-Err2 "skill source missing: $SkillSource"
    exit 1
}
if (-not (Test-Path -LiteralPath (Join-Path $SkillSource 'SKILL.md'))) {
    Write-Err2 "no SKILL.md in $SkillSource"
    exit 1
}
if (-not (Test-Path -LiteralPath $AgentSource)) {
    Write-Err2 "agent source missing: $AgentSource"
    exit 1
}

foreach ($dir in @((Split-Path -Parent $SkillLink), $AgentDest)) {
    if (-not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Ok "created $dir"
    }
}

# -------------------------------------------------------------- skill link ----
Write-Host 'Skill' -ForegroundColor Cyan

if (Test-IsJunction $SkillLink) {
    $current = (Get-Item -LiteralPath $SkillLink -Force).Target
    $resolved = if ($current -is [array]) { $current[0] } else { $current }

    if ($resolved -and ($resolved.TrimEnd('\') -ieq $SkillSource.TrimEnd('\'))) {
        Write-Ok "junction already points here - nothing to do"
    }
    else {
        Write-Warn2 "junction points elsewhere: $resolved"
        [IO.Directory]::Delete($SkillLink, $false)
        New-Item -ItemType Junction -Path $SkillLink -Target $SkillSource | Out-Null
        Write-Ok "repointed junction -> $SkillSource"
    }
}
elseif (Test-Path -LiteralPath $SkillLink) {
    # A real directory. Do not destroy it without explicit consent.
    $fileCount = (Get-ChildItem -LiteralPath $SkillLink -Recurse -File -ErrorAction SilentlyContinue |
                  Measure-Object).Count
    if ($Force) {
        Write-Warn2 "replacing real directory ($fileCount file(s)) at $SkillLink"
        Remove-Item -LiteralPath $SkillLink -Recurse -Force
        New-Item -ItemType Junction -Path $SkillLink -Target $SkillSource | Out-Null
        Write-Ok "created junction -> $SkillSource"
    }
    else {
        Write-Err2 "$SkillLink exists as a real directory with $fileCount file(s)."
        Write-Host  "         Not touching it. Move or delete it, or re-run with -Force" `
                    -ForegroundColor Red
        Write-Host  "         if you are sure those files are disposable." -ForegroundColor Red
        exit 1
    }
}
else {
    New-Item -ItemType Junction -Path $SkillLink -Target $SkillSource | Out-Null
    Write-Ok "created junction $SkillLink -> $SkillSource"
}

# ------------------------------------------------------------------ agents ----
Write-Host ''
Write-Host 'Agents' -ForegroundColor Cyan

$created = 0; $updated = 0; $same = 0
Get-ChildItem -LiteralPath $AgentSource -Filter '*.md' | Sort-Object Name | ForEach-Object {
    $target = Join-Path $AgentDest $_.Name

    if (-not (Test-Path -LiteralPath $target)) {
        Copy-Item -LiteralPath $_.FullName -Destination $target
        Write-Ok "created $($_.Name)"
        $created++
    }
    else {
        $srcHash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
        $dstHash = (Get-FileHash -LiteralPath $target      -Algorithm SHA256).Hash
        if ($srcHash -eq $dstHash) {
            $same++
        }
        else {
            Copy-Item -LiteralPath $_.FullName -Destination $target -Force
            Write-Ok "updated $($_.Name)"
            $updated++
        }
    }
}
Write-Step "$created created, $updated updated, $same already current"

# ------------------------------------------------------------------ summary ---
Write-Host ''
Write-Host 'Installed.' -ForegroundColor Cyan
Write-Host "  skill  $SkillLink  (live - edits need no re-sync)"
Write-Host "  agents $AgentDest  (re-run this script after editing an agent)"
Write-Host ''
Write-Host '  Restart Claude Code, then confirm the skill and the six agents are listed.'
Write-Host ''
