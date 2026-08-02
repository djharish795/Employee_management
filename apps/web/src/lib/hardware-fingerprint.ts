export interface HardwareFingerprint {
  gpuRenderer: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  model: string;
  platform: string;
  architecture: string;
  bitness: string;
  screenResolution: string;
  colorDepth: number;
}

export async function extractHardwareFingerprint(): Promise<HardwareFingerprint> {
  const fingerprint: HardwareFingerprint = {
    gpuRenderer: 'Unknown GPU',
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || 0,
    model: 'Unknown Model',
    platform: navigator.platform || 'Unknown Platform',
    architecture: 'Unknown',
    bitness: 'Unknown',
    screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'Unknown',
    colorDepth: typeof window !== 'undefined' ? window.screen.colorDepth : 0,
  };

  // 1. WebGL Extraction for GPU Model
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer) fingerprint.gpuRenderer = renderer;
      }
    }
  } catch (e) {
    // Ignore canvas/webgl errors
  }

  // 2. High Entropy User-Agent Client Hints API (Chromium-only)
  // This can extract the exact hardware model name (e.g. Pixel 7, ThinkPad, etc.) if the browser permits it.
  try {
    if ((navigator as any).userAgentData && typeof (navigator as any).userAgentData.getHighEntropyValues === 'function') {
      const hints = await (navigator as any).userAgentData.getHighEntropyValues(['model', 'platform', 'platformVersion', 'architecture', 'bitness']);
      if (hints.model) fingerprint.model = hints.model;
      if (hints.platform) fingerprint.platform = `${hints.platform} ${hints.platformVersion || ''}`.trim();
      if (hints.architecture) fingerprint.architecture = hints.architecture;
      if (hints.bitness) fingerprint.bitness = hints.bitness;
    }
  } catch (e) {
    // Ignore hint API errors
  }

  return fingerprint;
}

/**
 * Converts the raw fingerprint into a dense, human-readable MNC-style string.
 * E.g., "Model: ThinkPad T14 | GPU: NVIDIA RTX 3080 | CPU: 16-Core | RAM: 32GB+"
 */
export function formatFingerprintString(fp: HardwareFingerprint): string {
  const parts = [];
  
  if (fp.model && fp.model !== 'Unknown Model' && fp.model !== '""' && fp.model !== "''") {
    parts.push(`Model: ${fp.model}`);
  }
  
  if (fp.gpuRenderer !== 'Unknown GPU') {
    // Clean up generic prefixes from WebGL
    const cleanGpu = fp.gpuRenderer.replace(/ANGLE \((.*)\)/, '$1').replace(/Direct3D.*/, '').trim();
    parts.push(`GPU: ${cleanGpu}`);
  }

  if (fp.hardwareConcurrency > 0) {
    parts.push(`CPU: ${fp.hardwareConcurrency}-Core`);
  }

  if (fp.deviceMemory > 0) {
    parts.push(`RAM: ${fp.deviceMemory}GB+`);
  }

  // Fallback if absolutely nothing could be extracted (very rare)
  if (parts.length === 0) {
    parts.push(`Platform: ${fp.platform} (${fp.screenResolution})`);
  }

  return parts.join(' • ');
}
