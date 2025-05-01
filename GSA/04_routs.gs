////////////////////////////////////////////////////////////
// Основные маршруты
////////////////////////////////////////////////////////////

function doPost(e) {
  try {
    let response;
    let action;

    if (e.postData.contents) {
      const data = JSON.parse(e.postData.contents)||{};
      action = data.action;
    } else {
      action = e.parameter.action;
    }
    
    switch (action) {
      case 'authenticate':
        response = handleAuthentication(e);
        break;
      case 'verifyToken':
        response = handleVerifyToken(e);
        break;
      case 'authTelegram':
        response = handleAuthTelegram(e);
        break;
      case 'getUserRetention':
        response = handleGetUserRetention(e);
        break;
      default:
        response = ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
          .setMimeType(ContentService.MimeType.JSON);
    }
    
    return response;
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() })).setMimeType(ContentService.MimeType.JSON)
  }
}

function doGet(e) {
  let response;
  try {
    response = HtmlService.createHtmlOutputFromFile('plug').setTitle('Personal Page plug');
  }
  catch (error) {
    response = ContentService.createTextOutput(JSON.stringify({ error: error.toString() })).setMimeType(ContentService.MimeType.JSON)
  }
  finally {
    return response;
  }
} 