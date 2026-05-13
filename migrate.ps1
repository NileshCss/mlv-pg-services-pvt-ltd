#!/usr/bin/env powershell
<#
.SYNOPSIS
    Monorepo migration script for MLV PG Services project
    
.DESCRIPTION
    Automates the migration from single-package to monorepo architecture
    
.PARAMETER BackupPath
    Optional: Custom backup directory path
    
.PARAMETER Force
    Optional: Skip confirmation prompts
    
.EXAMPLE
    .\migrate.ps1
    .\migrate.ps1 -Force
    .\migrate.ps1 -BackupPath "C:\backups"
    
.NOTES
    Run from the root project directory
#>

param(
    [string]$BackupPath = "$PSScriptRoot/../backups",
    [switch]$Force
)

# ─────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────

$ProjectRoot = Get-Location
$Timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$BackupDir = Join-Path $BackupPath "mlv_pg_services_$Timestamp"
$ErrorCount = 0
$SuccessCount = 0

# Color output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red; $script:ErrorCount++ }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

# ─────────────────────────────────────────────────────────
# Pre-flight Checks
# ─────────────────────────────────────────────────────────

function Test-PrerequisitesAndStructure {
    Write-Info "🔍 Running pre-flight checks..."
    
    # Check if we're in the right directory
    if (-not (Test-Path "package.json")) {
        Write-Error "❌ package.json not found. Run from project root directory."
        exit 1
    }
    
    # Check for new monorepo directories
    if (-not (Test-Path "frontend")) {
        Write-Error "❌ frontend/ directory not found. Run setup first."
        exit 1
    }
    
    if (-not (Test-Path "backend_new")) {
        Write-Error "❌ backend_new/ directory not found. Run setup first."
        exit 1
    }
    
    Write-Success "✅ Pre-flight checks passed"
}

# ─────────────────────────────────────────────────────────
# Backup
# ─────────────────────────────────────────────────────────

function Backup-CurrentState {
    Write-Info "💾 Creating backup..."
    
    try {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        
        # Copy current state before migration
        $ItemsToCopy = @(
            "app",
            "components", 
            "hooks",
            "store",
            "styles",
            "types",
            "public",
            "backend",
            "middleware.ts",
            "next.config.js",
            "next-env.d.ts",
            "tailwind.config.ts",
            "postcss.config.js",
            "tsconfig.json"
        )
        
        foreach ($item in $ItemsToCopy) {
            $sourcePath = Join-Path $ProjectRoot $item
            if (Test-Path $sourcePath) {
                Copy-Item -Path $sourcePath -Destination $BackupDir -Recurse -Force
                Write-Success "✅ Backed up: $item"
            }
        }
        
        Write-Success "✅ Backup created at: $BackupDir"
    } catch {
        Write-Error "❌ Backup failed: $_"
        exit 1
    }
}

# ─────────────────────────────────────────────────────────
# File Movement
# ─────────────────────────────────────────────────────────

function Copy-ToFrontend {
    Write-Info "📦 Moving frontend files..."
    
    $frontendMoves = @(
        @{ From = "app"; To = "frontend/app" },
        @{ From = "components"; To = "frontend/components" },
        @{ From = "hooks"; To = "frontend/hooks" },
        @{ From = "store"; To = "frontend/store" },
        @{ From = "styles"; To = "frontend/styles" },
        @{ From = "types"; To = "frontend/types" },
        @{ From = "public"; To = "frontend/public" },
        @{ From = "middleware.ts"; To = "frontend/middleware.ts" },
        @{ From = "next.config.js"; To = "frontend/next.config.js" },
        @{ From = "next-env.d.ts"; To = "frontend/next-env.d.ts" },
        @{ From = ".npmrc"; To = "frontend/.npmrc" }
    )
    
    foreach ($move in $frontendMoves) {
        $source = Join-Path $ProjectRoot $move.From
        $dest = Join-Path $ProjectRoot $move.To
        
        if (Test-Path $source) {
            try {
                if (Test-Path $dest) {
                    Write-Warning "⚠️  $($move.To) already exists, skipping..."
                } else {
                    Copy-Item -Path $source -Destination $dest -Recurse -Force
                    Write-Success "✅ Copied: $($move.From) → $($move.To)"
                    $script:SuccessCount++
                }
            } catch {
                Write-Error "❌ Failed to copy $($move.From): $_"
            }
        } else {
            Write-Warning "⚠️  Source not found: $($move.From)"
        }
    }
}

function Copy-ToBackend {
    Write-Info "📦 Moving backend files..."
    
    $sourcePath = Join-Path $ProjectRoot "backend"
    $destPath = Join-Path $ProjectRoot "backend_new/src"
    
    if (Test-Path $sourcePath) {
        try {
            # Copy all files except node_modules
            Get-ChildItem -Path $sourcePath -Recurse -Exclude "node_modules" | 
            Where-Object { -not $_.PSIsContainer } | 
            ForEach-Object {
                $relativePath = $_.FullName.Substring($sourcePath.Length + 1)
                $destFile = Join-Path $destPath $relativePath
                $destFileDir = Split-Path $destFile -Parent
                
                New-Item -ItemType Directory -Path $destFileDir -Force | Out-Null
                Copy-Item -Path $_.FullName -Destination $destFile -Force
            }
            
            Write-Success "✅ Copied backend files to backend_new/src/"
            $script:SuccessCount++
        } catch {
            Write-Error "❌ Failed to copy backend files: $_"
        }
    }
}

function Rename-BackendDirectory {
    Write-Info "🔄 Renaming backend directory..."
    
    try {
        $oldBackend = Join-Path $ProjectRoot "backend"
        $oldBackendRename = Join-Path $ProjectRoot "backend_old"
        $newBackend = Join-Path $ProjectRoot "backend_new"
        
        if (Test-Path $oldBackend) {
            Rename-Item -Path $oldBackend -NewName "backend_old" -Force
            Write-Success "✅ Renamed backend → backend_old"
        }
        
        if (Test-Path $newBackend) {
            Rename-Item -Path $newBackend -NewName "backend" -Force
            Write-Success "✅ Renamed backend_new → backend"
            $script:SuccessCount++
        }
    } catch {
        Write-Error "❌ Failed to rename backend directory: $_"
    }
}

# ─────────────────────────────────────────────────────────
# Environment Files
# ─────────────────────────────────────────────────────────

function Create-EnvironmentFiles {
    Write-Info "🔐 Creating environment files..."
    
    try {
        # Frontend .env.local
        $frontendEnv = Join-Path $ProjectRoot "frontend/.env.local"
        if (-not (Test-Path $frontendEnv)) {
            @"
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NODE_ENV=development
"@ | Set-Content $frontendEnv
            Write-Success "✅ Created: frontend/.env.local"
        } else {
            Write-Warning "⚠️  frontend/.env.local already exists"
        }
        
        # Backend .env.local
        $backendEnv = Join-Path $ProjectRoot "backend/.env.local"
        if (-not (Test-Path $backendEnv)) {
            @"
NODE_ENV=development
PORT=3001
JWT_SECRET=change_this_secret_in_production
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_service_key_here
CORS_ORIGIN=http://localhost:3000
"@ | Set-Content $backendEnv
            Write-Success "✅ Created: backend/.env.local"
        } else {
            Write-Warning "⚠️  backend/.env.local already exists"
        }
        
        $script:SuccessCount += 2
    } catch {
        Write-Error "❌ Failed to create environment files: $_"
    }
}

# ─────────────────────────────────────────────────────────
# Dependencies Installation
# ─────────────────────────────────────────────────────────

function Install-Dependencies {
    Write-Info "📦 Installing dependencies..."
    
    if (-not $Force) {
        $confirm = Read-Host "Install npm dependencies? (y/n)"
        if ($confirm -ne 'y') {
            Write-Warning "⚠️  Skipping dependency installation"
            return
        }
    }
    
    try {
        Write-Info "Installing root dependencies..."
        npm install
        Write-Success "✅ Root dependencies installed"
        
        Write-Info "Installing frontend dependencies..."
        Push-Location frontend
        npm install
        Pop-Location
        Write-Success "✅ Frontend dependencies installed"
        
        Write-Info "Installing backend dependencies..."
        Push-Location backend
        npm install
        Pop-Location
        Write-Success "✅ Backend dependencies installed"
        
        $script:SuccessCount += 3
    } catch {
        Write-Error "❌ Dependency installation failed: $_"
    }
}

# ─────────────────────────────────────────────────────────
# Verification
# ─────────────────────────────────────────────────────────

function Verify-Migration {
    Write-Info "✔️  Verifying migration..."
    
    $errors = 0
    
    # Check directory structure
    $requiredDirs = @(
        "frontend/app",
        "frontend/components",
        "frontend/hooks",
        "frontend/store",
        "frontend/styles",
        "backend/src",
        "shared"
    )
    
    foreach ($dir in $requiredDirs) {
        $path = Join-Path $ProjectRoot $dir
        if (Test-Path $path) {
            Write-Success "✅ Directory exists: $dir"
        } else {
            Write-Error "❌ Missing directory: $dir"
            $errors++
        }
    }
    
    # Check package.json files
    $requiredFiles = @(
        "package.json",
        "frontend/package.json",
        "backend/package.json",
        "shared/package.json"
    )
    
    foreach ($file in $requiredFiles) {
        $path = Join-Path $ProjectRoot $file
        if (Test-Path $path) {
            Write-Success "✅ File exists: $file"
        } else {
            Write-Error "❌ Missing file: $file"
            $errors++
        }
    }
    
    if ($errors -eq 0) {
        Write-Success "✅ Migration verification passed!"
    } else {
        Write-Error "❌ Migration verification failed with $errors error(s)"
    }
    
    return $errors -eq 0
}

# ─────────────────────────────────────────────────────────
# Cleanup
# ─────────────────────────────────────────────────────────

function Cleanup-LegacyFiles {
    Write-Info "🧹 Cleaning up legacy files..."
    
    if (-not $Force) {
        $confirm = Read-Host "Remove legacy directories? (y/n)"
        if ($confirm -ne 'y') {
            Write-Warning "⚠️  Skipping cleanup"
            return
        }
    }
    
    $itemsToRemove = @(
        "app",
        "components",
        "hooks",
        "store",
        "styles",
        "types",
        "public",
        "backend_old",
        "next.config.js",
        "next-env.d.ts",
        "middleware.ts",
        "tailwind.config.ts",
        "postcss.config.js",
        "tsconfig.json"
    )
    
    foreach ($item in $itemsToRemove) {
        $path = Join-Path $ProjectRoot $item
        if (Test-Path $path) {
            try {
                Remove-Item -Path $path -Recurse -Force
                Write-Success "✅ Removed: $item"
                $script:SuccessCount++
            } catch {
                Write-Error "❌ Failed to remove $item: $_"
            }
        }
    }
}

# ─────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────

function Show-Summary {
    Write-Host ""
    Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "         Migration Summary" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Success "✅ Successful operations: $SuccessCount"
    Write-Error "❌ Failed operations: $ErrorCount"
    Write-Info "📁 Backup location: $BackupDir"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Review changes in new structure"
    Write-Host "  2. Update environment files (.env.local)"
    Write-Host "  3. Test builds: npm run build:frontend && npm run build:backend"
    Write-Host "  4. Start development: npm run dev"
    Write-Host ""
}

# ─────────────────────────────────────────────────────────
# Main Execution
# ─────────────────────────────────────────────────────────

function Main {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  MLV PG Services - Monorepo Migration Script   ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    # Pre-flight checks
    Test-PrerequisitesAndStructure
    
    # Backup
    Backup-CurrentState
    
    # Migration
    Copy-ToFrontend
    Copy-ToBackend
    Rename-BackendDirectory
    Create-EnvironmentFiles
    
    # Verification
    if (-not (Verify-Migration)) {
        Write-Error "Migration verification failed!"
        exit 1
    }
    
    # Optional: Install dependencies
    if (-not $Force) {
        $installDeps = Read-Host "Install dependencies now? (y/n)"
        if ($installDeps -eq 'y') {
            Install-Dependencies
        }
    } else {
        Install-Dependencies
    }
    
    # Optional: Cleanup
    if (-not $Force) {
        $cleanup = Read-Host "Remove legacy files? (y/n, careful!)"
        if ($cleanup -eq 'y') {
            Cleanup-LegacyFiles
        }
    }
    
    # Summary
    Show-Summary
    
    if ($ErrorCount -gt 0) {
        exit 1
    }
}

# Run main
Main
