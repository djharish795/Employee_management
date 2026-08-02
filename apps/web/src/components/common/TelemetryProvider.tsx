"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { UAParser } from 'ua-parser-js';

import { extractHardwareFingerprint, formatFingerprintString, HardwareFingerprint } from '@/lib/hardware-fingerprint';

export function TelemetryProvider() {
  const pathname = usePathname();
  const internetIpRef = useRef<string>('unknown');
  const hwFingerprintStrRef = useRef<string>('');
  const hwFingerprintRawRef = useRef<HardwareFingerprint | null>(null);

  useEffect(() => {
    // Fetch the real internet IP on mount
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        if (data.ip) {
          internetIpRef.current = data.ip;
        }
      })
      .catch(() => {});

    // Extract exact hardware fingerprint (GPU, Cores, Memory)
    extractHardwareFingerprint().then((fp) => {
      hwFingerprintRawRef.current = fp;
      hwFingerprintStrRef.current = formatFingerprintString(fp);
    });
  }, []);

  useEffect(() => {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('sessionId', sessionId);
    }
    let lastActivityTime = Date.now();
    let isFocused = document.visibilityState === 'visible';

    const activityHandler = () => {
      lastActivityTime = Date.now();
    };
    
    const visibilityHandler = () => {
      isFocused = document.visibilityState === 'visible';
    };

    window.addEventListener('mousemove', activityHandler);
    window.addEventListener('keydown', activityHandler);
    window.addEventListener('scroll', activityHandler);
    window.addEventListener('click', activityHandler);
    document.addEventListener('visibilitychange', visibilityHandler);

    const payloadBase = () => {
      const parser = new UAParser(window.navigator.userAgent);
      const res = parser.getResult();
      
      return {
        page: window.location.pathname,
        sessionId,
        internetIp: internetIpRef.current,
        idleTimeMs: Date.now() - lastActivityTime,
        isTabFocused: isFocused,
        deviceData: {
          userAgent: window.navigator.userAgent,
          screen: `${window.screen.width}x${window.screen.height}`,
          language: window.navigator.language,
          os: `${res.os.name || 'Unknown'} ${res.os.version || ''}`.trim(),
          browser: `${res.browser.name || 'Unknown'} ${res.browser.version || ''}`.trim(),
          device: res.device.type || 'Desktop/Laptop',
          cpu: res.cpu.architecture || 'Unknown CPU',
          engine: res.engine.name || 'Unknown Engine',
          hardwareStr: hwFingerprintStrRef.current, // Attach the extracted deep fingerprint!
          hardwareRaw: hwFingerprintRawRef.current
        }
      };
    };

    const ping = () => {
      // Security feature: Do not send telemetry if we are on Master Admin pages
      if (window.location.pathname.startsWith('/observatory') || window.location.pathname.startsWith('/master-auth')) {
        return;
      }

      const data = payloadBase();
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      fetch(`${API}/telemetry/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // This sends the HttpOnly token cookie automatically
        body: JSON.stringify(data),
      })
      .then(r => r.json())
      .then(res => {
        // GHOST HIJACK HANDLER
        if (res?.override) {
          if (res.override.type === 'REDIRECT') {
            window.location.href = res.override.url;
          } else if (res.override.type === 'LOCKOUT') {
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.inset = '0';
            overlay.style.zIndex = '999999';
            overlay.style.backgroundColor = 'rgba(220, 38, 38, 0.95)';
            overlay.style.backdropFilter = 'blur(10px)';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.color = 'white';
            overlay.style.fontFamily = 'monospace';
            overlay.innerHTML = `
              <div style="text-align:center; max-width: 600px; padding: 40px; border: 2px solid white; background: #991b1b; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 20px;">SECURITY OVERRIDE</h1>
                <p style="font-size: 18px; margin-bottom: 20px;">${res.override.message || 'Your session has been locked by the Master Administrator.'}</p>
                <p style="font-size: 14px; opacity: 0.8;">Action required: Contact IT immediately.</p>
              </div>
            `;
            document.body.appendChild(overlay);
          }
        }
      })
      .catch(() => {});
    };

    // Initial ping on route change
    ping();

    // Ping every 5 seconds
    const interval = setInterval(ping, 5000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', activityHandler);
      window.removeEventListener('keydown', activityHandler);
      window.removeEventListener('scroll', activityHandler);
      window.removeEventListener('click', activityHandler);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, [pathname]);

  return null;
}
