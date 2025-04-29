// Константы для работы с таблицами
const USERS_SHEET = 'users';
const INFO_SHEET = 'info';
const SECRET_KEY = 'your-secret-key'; // Замените на ваш секретный ключ

// Функция для обработки запросов
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'authenticate') {
    return handleAuthentication(e);
  } else if (action === 'getUserInfo') {
    return handleGetUserInfo(e);
  } else if (action === 'verifyToken') {
    return handleVerifyToken(e);
  }
  
  // Возвращаем HTML для React приложения
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Personal Pages')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Обработка аутентификации
function handleAuthentication(e) {
  const username = e.parameter.username;
  const password = e.parameter.password;
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(USERS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username && data[i][1] === hashPassword(password) && data[i][2].toString().toUpperCase() === "TRUE") {
      const payload = {
        username: username,
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      };
      const token = createJWT(payload);
      
      return ContentService.createTextOutput(JSON.stringify({ token }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid credentials' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Получение информации о пользователе
function handleGetUserInfo(e) {
  try {
    const token = e.parameter.token;
    const payload = verifyJWT(token);
    
    if (!payload) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid token' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(INFO_SHEET);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === payload.username) {
        return ContentService.createTextOutput(JSON.stringify({
          name: data[i][1],
          email: data[i][2],
          position: data[i][3],
          department: data[i][4]
        }))
        .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: 'User not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Обработка проверки токена
function handleVerifyToken(e) {
  try {
    const token = e.parameter.token;
    const payload = verifyJWT(token);
    
    if (!payload) {
      return ContentService.createTextOutput(JSON.stringify({ valid: false }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Проверяем, существует ли пользователь в таблице
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(USERS_SHEET);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === payload.username &&  data[i][2].toString().toUpperCase() === "TRUE") {
        return ContentService.createTextOutput(JSON.stringify({ valid: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ valid: false }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    console.error('Token verification error:', e);
    return ContentService.createTextOutput(JSON.stringify({ valid: false }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Вспомогательные функции для работы с JWT
function createJWT(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const encodedHeader = Utilities.base64EncodeWebSafe(JSON.stringify(header));
  const encodedPayload = Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  const signature = Utilities.computeHmacSha256Signature(
    encodedHeader + '.' + encodedPayload,
    SECRET_KEY
  );
  const encodedSignature = Utilities.base64EncodeWebSafe(signature);
  
  return encodedHeader + '.' + encodedPayload + '.' + encodedSignature;
}

function verifyJWT(token) {
  try {
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