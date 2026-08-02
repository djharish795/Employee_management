'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function getMasterAdminToken() { 
  if (typeof window !== 'undefined') return sessionStorage.getItem('master_token');
  return null;
}
export function setMasterAdminToken(t: string) { 
  if (typeof window !== 'undefined') sessionStorage.setItem('master_token', t);
}
export function clearMasterAdminToken() { 
  if (typeof window !== 'undefined') sessionStorage.removeItem('master_token');
}

type Step = 'closed' | 'pin' | 'otp' | 'success';

export default function MasterAdminEntryPoint() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('pin');
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pinRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'otp') setTimeout(() => otpRef.current?.focus(), 100);
  }, [step]);

  const handlePinSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError('PIN must be exactly 6 digits');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const API = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
      const res = await fetch(`${API}/api/v1/master-admin/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid PIN');
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, [pin]);

  const handleOtpSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('OTP must be exactly 6 digits');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const API = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
      const res = await fetch(`${API}/api/v1/master-admin/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');
      setMasterAdminToken(data.token);
      setStep('success');
      setTimeout(() => {
        setStep('closed');
        router.push('/observatory');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, [otp, router]);

  if (step === 'closed') return null;

  return (
    <div className="flex items-center justify-center p-4 w-full">
      <div className="bg-card text-card-foreground border border-border rounded-xl p-10 w-full max-w-md shadow-2xl transition-all">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔐</div>
          <h2 className="text-xl font-bold m-0">Crewbase Observatory</h2>
          <p className="text-muted-foreground text-sm mt-1.5">
            {step === 'pin' ? 'Enter your master PIN' : 'Enter the OTP sent to your email'}
          </p>
        </div>

        <div className="flex gap-2 mb-7">
          {['pin', 'otp'].map((s, i) => (
            <div key={s} className={`flex-1 h-1 rounded-sm transition-colors duration-300 ${
              (step === 'pin' && i === 0) || (step === 'otp' && i <= 1) || step === 'success'
                ? 'bg-primary' : 'bg-muted'
            }`} />
          ))}
        </div>

        {step === 'pin' && (
          <form onSubmit={handlePinSubmit}>
            <div className="mb-5">
              <input
                ref={pinRef}
                type="password"
                inputMode="numeric"
                maxLength={6}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full p-4 text-2xl tracking-[12px] text-center bg-input/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>
            {error && <p className="text-destructive text-sm mb-4 text-center">{error}</p>}
            <button 
              type="submit" 
              disabled={loading || pin.length !== 6} 
              className={`w-full p-3.5 rounded-lg border-none font-semibold text-sm transition-all ${
                pin.length === 6 ? 'bg-primary text-primary-foreground cursor-pointer hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {loading ? 'Verifying...' : 'Continue →'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit}>
            <p className="text-muted-foreground text-sm mb-4 text-center">
              ✉️ Check your registered email for a 6-digit code
            </p>
            <div className="mb-5">
              <input
                ref={otpRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="0 0 0 0 0 0"
                className="w-full p-4 text-2xl tracking-[12px] text-center bg-input/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>
            {error && <p className="text-destructive text-sm mb-4 text-center">{error}</p>}
            <button 
              type="submit" 
              disabled={loading || otp.length !== 6} 
              className={`w-full p-3.5 rounded-lg border-none font-semibold text-sm transition-all ${
                otp.length === 6 ? 'bg-primary text-primary-foreground cursor-pointer hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {loading ? 'Verifying...' : 'Access Observatory →'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-green-500 font-semibold text-lg">Access Granted</p>
            <p className="text-muted-foreground text-sm">Redirecting to Observatory...</p>
          </div>
        )}
      </div>
    </div>
  );
}
