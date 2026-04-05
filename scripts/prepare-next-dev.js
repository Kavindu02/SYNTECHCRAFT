const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workspacePath = process.cwd();
const lockPath = path.join(workspacePath, '.next', 'dev', 'lock');

function runCommand(command) {
  return execSync(command, {
    cwd: workspacePath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function stopExistingNextDevWindows() {
  const escapedWorkspace = workspacePath.replace(/'/g, "''");

  const psScript = [
    `$workspace = '${escapedWorkspace}'`,
    "$procs = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*next*dist*server*lib*start-server.js*' -and $_.CommandLine -like ('*' + $workspace + '*') }",
    "$killed = 0",
    "foreach ($proc in $procs) { try { Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop; $killed++; Write-Output ('killed=' + $proc.ProcessId) } catch { } }",
    "Write-Output ('killed_count=' + $killed)",
  ].join('; ');

  const command = `powershell -NoProfile -ExecutionPolicy Bypass -Command \"${psScript.replace(/\"/g, '\\\"')}\"`;
  const output = runCommand(command);
  const lines = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  let killedCount = 0;

  for (const line of lines) {
    if (line.startsWith('killed=')) {
      console.log(`[dev-prep] Stopped previous Next dev process ${line.slice('killed='.length)}.`);
      continue;
    }

    if (line.startsWith('killed_count=')) {
      const parsed = Number(line.slice('killed_count='.length));
      if (Number.isFinite(parsed) && parsed > 0) {
        killedCount = parsed;
      }
    }
  }

  return killedCount;
}

function stopExistingNextDevPosix() {
  const pattern = `next/dist/server/lib/start-server.js.*${workspacePath}`;

  try {
    runCommand(`pkill -f \"${pattern}\"`);
    return 1;
  } catch {
    return 0;
  }
}

function stopExistingNextDev() {
  try {
    if (process.platform === 'win32') {
      return stopExistingNextDevWindows();
    }

    return stopExistingNextDevPosix();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[dev-prep] Could not stop existing Next dev process automatically: ${message}`);
    return 0;
  }
}

function removeStaleLockFile() {
  if (!fs.existsSync(lockPath)) {
    return;
  }

  try {
    fs.rmSync(lockPath, { force: true });
    console.log('[dev-prep] Removed stale .next/dev/lock file.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[dev-prep] Failed to remove lock file: ${message}`);
  }
}

const stoppedCount = stopExistingNextDev();
removeStaleLockFile();

if (stoppedCount > 0) {
  console.log(`[dev-prep] Restarting Next dev with ${stoppedCount} previous instance(s) cleaned up.`);
}
