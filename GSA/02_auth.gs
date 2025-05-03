////////////////////////////////////////////////////////////
// Вспомогательные функции для работы с JWT
////////////////////////////////////////////////////////////

// Функция для создания JWT
function createJWT(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // Convert to UTF-8 before encoding
  const encodedHeader = Utilities.base64EncodeWebSafe(
    Utilities.newBlob(JSON.stringify(header)).setContentType('application/json').getBytes()
  );
  const encodedPayload = Utilities.base64EncodeWebSafe(
    Utilities.newBlob(JSON.stringify(payload)).setContentType('application/json').getBytes()
  );
  const signature = Utilities.computeHmacSha256Signature(
    encodedHeader + '.' + encodedPayload,
    SECRET_KEY
  );
  const encodedSignature = Utilities.base64EncodeWebSafe(signature);
  
  return encodedHeader + '.' + encodedPayload + '.' + encodedSignature;
}

// Функция для проверки JWT
function verifyJWT(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signature = Utilities.base64DecodeWebSafe(encodedSignature);
    const expectedSignature = Utilities.computeHmacSha256Signature(
      encodedHeader + '.' + encodedPayload,
      SECRET_KEY
    );
    
    if (!signature.every((byte, i) => byte === expectedSignature[i])) {
      return null;
    }
    
    const payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(encodedPayload)).getDataAsString());
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (e) {
    console.error('JWT verification error:', e);
    return null;
  }
}

// Функция хеширования пароля
function hashPassword(password) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
    .map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2))
    .join('');
} 