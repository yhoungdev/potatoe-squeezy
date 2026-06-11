import { createHmac, timingSafeEqual } from 'crypto';

export const verifyGitHubSignature = (
  payload: string,
  signature: string | undefined,
  secret: string,
) => {
  if (!signature || !signature.startsWith('sha256=')) {
    return false;
  }

  const expected = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  const expectedBytes = Uint8Array.from(expectedBuffer);
  const signatureBytes = Uint8Array.from(signatureBuffer);
  return timingSafeEqual(expectedBytes, signatureBytes);
};
