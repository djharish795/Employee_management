/**
 * kill-port.js
 * Kills any process occupying port 3001 before the dev server starts.
 * This prevents EADDRINUSE errors when restarting `npm run dev`.
 */
const { execSync } = require('child_process');

const PORT = 3001;

try {
  if (process.platform === 'win32') {
    // Windows: find and kill the PID using netstat
    const output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const lines = output.split('\n').filter(Boolean);
    const pids = new Set();
    for (const line of lines) {
      // Only grab LISTENING entries so we don't kill connected clients
      if (line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') pids.add(pid);
      }
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`[kill-port] Killed stale PID ${pid} on port ${PORT}`);
      } catch (_) {
        // Already gone — ignore
      }
    }
  } else {
    // macOS / Linux: use lsof
    const output = execSync(`lsof -ti tcp:${PORT}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const pids = output.split('\n').filter(Boolean);
    for (const pid of pids) {
      try {
        execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        console.log(`[kill-port] Killed stale PID ${pid} on port ${PORT}`);
      } catch (_) {
        // Already gone — ignore
      }
    }
  }
} catch (_) {
  // Nothing was using the port — all good
}
