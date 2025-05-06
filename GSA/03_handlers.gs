////////////////////////////////////////////////////////////
// Основные обработчики
////////////////////////////////////////////////////////////

function handleAuthentication(e) {
  const contents = e?.postData?.contents ? JSON.parse(e.postData.contents) : {};
  const username = contents?.username || '';
  const password = contents?.password || '';
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ACL_SHEET);
  const data = sheet.getDataRange().getValues();
  
  const user = data.slice(1).find(col => 
    col[0].toString() === username.toString() && 
    col[1].toString() === hashPassword(password).toString() && 
    col[4].toString().toUpperCase() === "TRUE"
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

const handleGetTeachersList = (e) => {
  const contents = e?.postData?.contents ? JSON.parse(e.postData.contents) : {};
  const token = contents?.token || '';
  const payload = verifyJWT(token);
  if (!payload) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid token' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  if (!payload.group.split(';').map(group => group).includes('g1')) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'User is not have access to this function' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ACL_SHEET);
  const data = sheet.getDataRange().getValues();
  const teachers = data.slice(1).map(row => row[5]).filter(teacher => teacher !== "");
  return ContentService.createTextOutput(JSON.stringify({ teachers }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleAuthTelegram(e) {
  const telegramId = e?.postData?.contents ? JSON.parse(e.postData.contents).telegramId : '';
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ACL_SHEET);
  const data = sheet.getDataRange().getValues();
  
  const user = data.slice(1).find(col => 
    col[3].toString() === telegramId.toString() && 
    col[4].toString().toUpperCase() === "TRUE"
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
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ACL_SHEET);
  if (!sheet) {
    return { error: 'ACL sheet not found' };
  }

  const data = sheet.getDataRange().getValues();
  if (!data || data.length < 2) {
    return { error: 'No user data found' };
  }
  
  const user = data.slice(1).find(row => row[0] === payload.userid);
  if (user) {
    // Проверяем, что все необходимые поля существуют
    const userInfo = {
      group: user[2] || '',
      name: user[5] || '',
      email: user[6] || '',
      position: user[7] || '',
      department: user[8] || ''
    };

    return userInfo;
  }

  return { error: 'User not found' };
}

function handleGetUserRetention(e) {
  try {
    const contents = e?.postData?.contents ? JSON.parse(e.postData.contents) : {};
    const token = contents?.token || '';
    const payload = verifyJWT(token);
    if (!payload) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid token' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    let searchName = payload.name;
    if (payload.group.split(';').map(group => group).includes('g1')) {
      searchName = contents?.teacherId || payload.name;
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(RETENTION_SHEET);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Retention sheet not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const retention = data.slice(1).find(row => row[0].toString().startsWith(searchName.toString())); 
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

function handleGetUserQuality(e) {
  try {
    const contents = e?.postData?.contents ? JSON.parse(e.postData.contents) : {};
    const token = contents?.token || '';
    const payload = verifyJWT(token);
    
    if (!payload) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid token' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    let searchName = payload.name;
    if (payload.group.split(';').map(group => group).includes('g1')) {
      searchName = contents?.teacherId || payload.name;
    }
    // Инициализируем пустые массивы и объекты для хранения результатов
    const allGrades = [];
    const allGradesInfo = {};
    const dict = {};
    
    // Перебираем все таблицы QUALITY_EXT_SHEET
    for (const sheetName of QUALITY_EXT_SHEET) {
      const extSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      
      // Если таблица не существует, пропускаем
      if (!extSheet) continue;
      
      const extData = extSheet.getDataRange().getValues();
      const extStartIndex = 8;
      const extEndIndex = extData.slice(extStartIndex).findIndex(row => row[1]?.length === 0) + extStartIndex;
      const extBody = extData.slice(extStartIndex, extEndIndex);
      const extRawDict = extBody.map(row => row[1]);
      const extDates = extData[3].map(date => new Date(date).toLocaleDateString('en-CA'));
      const extFiles = extData[1].map(file => file);
      const extRecords = extData[2].map(record => record);
      const extRatings = extData[7].map(rating => rating);
      
      // Добавляем записи словаря
      extRawDict.forEach((item, index) => {
        dict[index] = item;
      });
      
      const extUserIndices = extData[0].reduce((acc, row, index) => {
        if (row.startsWith(searchName)) acc.push(index);
        return acc;
      }, []);
      
      extUserIndices.forEach(userIndex => {
        // Добавляем оценки
        if (QUALITY_GRADES[extRatings[userIndex]] > 0) {
          allGrades.push({
            day: extDates[userIndex],
            value: QUALITY_GRADES[extRatings[userIndex]]
          });
          // Добавляем информацию о оценках
          allGradesInfo[extDates[userIndex]] = {
            reaction: extBody
            .map((row, rowIndex) => ({ 
              dictIndex: rowIndex,
              value: row[userIndex]
            }))
            .filter(item => item.value !== "Не противоречит"),
            files: extFiles[userIndex],
            records: extRecords[userIndex],
            dates: extDates[userIndex],
          };
        }
      });
    }
    
    // Проверяем, если данные не найдены
    if (allGrades.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'User quality data not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Сортируем оценки по дате
    allGrades.sort((a, b) => new Date(a.day) - new Date(b.day));
    
    // Определяем первую и последнюю дату через min и max
    const dateTimes = allGrades.map(grade => new Date(grade.day).getTime());
    const firstDate = new Date(Math.min(...dateTimes)).toLocaleDateString('en-CA');
    const lastDate = new Date(Math.max(...dateTimes)).toLocaleDateString('en-CA');
    
    const answer = {
      grades: {
        quality: allGrades, 
        period: {start: firstDate, end: lastDate}
      }, 
      reviews: {
        grades: allGradesInfo, 
        dict: dict
      }
    };
    
    return ContentService.createTextOutput(JSON.stringify(answer))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (e) {
    console.error('Error in handleGetUserQuality:', e);
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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ACL_SHEET);
    const data = sheet.getDataRange().getValues();
    
    const user = data.slice(1).find(row => row[0] === payload.userid && row[4].toString().toUpperCase() === "TRUE");
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