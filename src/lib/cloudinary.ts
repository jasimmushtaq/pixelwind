export async function generateCloudinarySignature(folder: string, apiSecret: string) {
  const timestamp = Math.round(new Date().getTime() / 1000).toString();
  
  const params: string[] = [];
  if (folder) params.push(`folder=${folder}`);
  params.push(`timestamp=${timestamp}`);
  
  const stringToSign = params.sort().join('&') + apiSecret;
  
  // Hash using SHA-1 (Web Crypto API)
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return { signature, timestamp };
}
