////////////////////////////////////////////////////////////
// Конфигурация
////////////////////////////////////////////////////////////

// Названия листов  
const ACL_SHEET = 'ACL';
const RETENTION_SHEET = 'retention';
const QUALITY_EXT_SHEET = ['quality_ext_1', 'quality_ext_2', 'quality_ext_3'];
// Секретный ключ
const SECRET_KEY = 'your-secret-key'; // Замените на ваш секретный ключ 

// Словари
// Оценка качества
const QUALITY_GRADES = {
    "": 0,
    "Пропуск": 0,
    "Плохо": 1,
    "Нормально": 2,
    "Хорошо": 3,
    "Отлично": 4
  }