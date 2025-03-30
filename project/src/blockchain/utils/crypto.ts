import { createHash } from 'crypto';

export const sha256 = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const generateKeyPair = async () => {
  // Generate random values for demo purposes
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  
  // Convert to hex string for public key
  const publicKey = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Create private key by hashing public key with timestamp
  const timestamp = Date.now().toString();
  const privateKeyData = publicKey + timestamp;
  const privateKey = await sha256(privateKeyData);
  
  return { publicKey, privateKey };
};