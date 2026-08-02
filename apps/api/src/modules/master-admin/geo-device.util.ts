import * as geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

export interface GeoInfo {
  city?: string;
  country?: string;
  isp?: string;
  isOffice?: boolean;
}

export interface DeviceInfo {
  deviceType: string;
  browser: string;
  os: string;
}

/**
 * Resolves IP address to geographic information using geoip-lite (100% offline, DPDPA compliant).
 * No data ever leaves the AWS VPC.
 */
export function resolveGeoInfo(ip: string): GeoInfo {
  try {
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return { city: 'Local Network', country: 'IN', isp: 'Private' };
    }

    const geo = geoip.lookup(ip);
    if (!geo) return { city: 'Unknown', country: 'Unknown', isp: 'Unknown' };

    const officeIpRange = process.env.OFFICE_IP_RANGE;
    const isOffice = officeIpRange ? ip.startsWith(officeIpRange) : false;

    return {
      city: geo.city || geo.region || 'Unknown',
      country: geo.country || 'Unknown',
      isp: 'Unknown',
      isOffice,
    };
  } catch {
    return { city: 'Unknown', country: 'Unknown', isp: 'Unknown' };
  }
}

/**
 * Parses User-Agent string into structured device information.
 */
export function parseDeviceInfo(userAgent: string): DeviceInfo {
  try {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const deviceTypeRaw = result.device?.type;
    let deviceType = 'DESKTOP';
    if (deviceTypeRaw === 'mobile') deviceType = 'MOBILE';
    else if (deviceTypeRaw === 'tablet') deviceType = 'TABLET';

    return {
      deviceType,
      browser: result.browser?.name || 'Unknown',
      os: result.os?.name || 'Unknown',
    };
  } catch {
    return { deviceType: 'DESKTOP', browser: 'Unknown', os: 'Unknown' };
  }
}
