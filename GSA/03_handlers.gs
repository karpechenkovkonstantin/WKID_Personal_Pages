////////////////////////////////////////////////////////////
// Основные обработчики
////////////////////////////////////////////////////////////

function handleAuthentication(e) {
  const contents = e?.postData?.contents ? JSON.parse(e.postData.contents) : {};
  const username = contents?.username || '';
  const password = contents?.password || '';
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(USERS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  const user = data.slice(1).find(col => 
    col[0].toString() === username.toString() && 
    col[1].toString() === hashPassword(password).toString() && 
    col[3].toString().toUpperCase() === "TRUE"
  );

  if (user) {
    const userInfo = handleGetUserInfo({userid: username})
    const payload = {
      userid: username,
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
      ...userInfo
    };
    const token = createJWT(payload);
    
    return ContentService.createTextOutput(JSON.stringify({ token }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid credentials' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleAuthTelegram(e) {
  const telegramId = e?.postData?.contents ? JSON.parse(e.postData.contents).telegramId : '';
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(USERS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  const user = data.slice(1).find(col => 
    col[2].toString() === telegramId.toString() && 
    col[3].toString().toUpperCase() === "TRUE"
  );

  if (user) {
    const userInfo = handleGetUserInfo({userid: user[0]})
    const payload = {
      userid: user[0],
      telegramid: telegramId,
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
      ...userInfo
    };
    const token = createJWT(payload);
    
    return ContentService.createTextOutput(JSON.stringify({ token }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'User not found, or not active', telegramId: telegramId, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleGetUserInfo(payload) {
  if (!payload) {
    return { error: 'Invalid token' };
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(INFO_SHEET);
  if (!sheet) {
    return { error: 'Info sheet not found' };
  }

  const data = sheet.getDataRange().getValues();
  if (!data || data.length < 2) {
    return { error: 'No user data found' };
  }
  
  const user = data.slice(1).find(row => row[0] === payload.userid);
  if (user) {
    // Проверяем, что все необходимые поля существуют
    const userInfo = {
      name: user[1] || '',
      email: user[2] || '',
      position: user[3] || '',
      department: user[4] || ''
    };

    return userInfo;
  }

  return { error: 'User not found' };
}

function handleGetUserRetention(e) {
  try {
    const token = e?.postData?.contents ? JSON.parse(e.postData.contents).token : '';
    const payload = verifyJWT(token);
    
    if (!payload) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid token' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(RETENTION_SHEET);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Retention sheet not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const retention = data.slice(1).find(row => row[0].toString().startsWith(payload.name.toString())); 
    if (retention) {
      const filteredData = retention.slice(4).filter((_, index) => index % 4 === 0);
      return ContentService.createTextOutput(JSON.stringify({ retention: filteredData }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: 'User retention data not found' }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (e) {
    console.error('Error in handleGetUserRetention:', e);
    return ContentService.createTextOutput(JSON.stringify({ 
      error: 'Internal server error',
      details: e.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

// Обработка проверки токена
function handleVerifyToken(e) {
  try {
    const token = e?.postData?.contents ? JSON.parse(e.postData.contents).token : '';
    const payload = verifyJWT(token);
    
    if (!payload) {
      return ContentService.createTextOutput(JSON.stringify({ valid: false }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Проверяем, существует ли пользователь в таблице
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(USERS_SHEET);
    const data = sheet.getDataRange().getValues();
    
    const user = data.slice(1).find(row => row[0] === payload.userid && row[3].toString().toUpperCase() === "TRUE");
    if (user) {
      return ContentService.createTextOutput(JSON.stringify({ valid: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ valid: false }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    console.error('Token verification error:', e);
    return ContentService.createTextOutput(JSON.stringify({ valid: false }))
      .setMimeType(ContentService.MimeType.JSON);
  }
} 