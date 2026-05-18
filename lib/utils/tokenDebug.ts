// lib/utils/tokenDebug.ts
export const debugToken = () => {
  const token = localStorage.getItem('token') || getCookie('token');
  
  if (!token) {
    console.log('❌ No token found');
    return;
  }

  try {
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    
    const exp = new Date(payload.exp * 1000);
    const iat = new Date(payload.iat * 1000);
    const now = new Date();
    
    const totalDuration = (exp.getTime() - iat.getTime()) / (1000 * 60 * 60);
    const timeRemaining = (exp.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    console.log('🔐 TOKEN DEBUG INFO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Issued at:', iat.toLocaleString());
    console.log('Expires at:', exp.toLocaleString());
    console.log('Current time:', now.toLocaleString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total duration: ${totalDuration.toFixed(2)} hours`);
    console.log(`Time remaining: ${timeRemaining.toFixed(2)} hours`);
    console.log(`Is expired: ${now > exp ? 'YES ❌' : 'NO ✅'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Payload:', payload);
    
    return {
      issuedAt: iat,
      expiresAt: exp,
      totalDurationHours: totalDuration,
      timeRemainingHours: timeRemaining,
      isExpired: now > exp,
      payload
    };
  } catch (error) {
    console.error('Error decoding token:', error);
  }
};

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}