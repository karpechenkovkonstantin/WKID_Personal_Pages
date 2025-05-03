////////////////////////////////////////////////////////////
// Конфигурация
////////////////////////////////////////////////////////////

// Названия листов  
const USERS_SHEET = 'users';
const INFO_SHEET = 'info';
const RETENTION_SHEET = 'retention';
const QUALITY_SHEET = 'quality';
const QUALITY_EXT_SHEET = ['quality_ext_1', 'quality_ext_2', 'quality_ext_3'];
// Секретный ключ
const SECRET_KEY = 'your-secret-key'; // Замените на ваш секретный ключ 

// Словари
// Оценка качества
const QUALITY_GRADES = {
    "": 0,
    "Пропуск": 0,
    "Ужасно": 1,
    "Плохо": 2,
    "Нормально": 3,
    "Хорошо": 4,
    "Отлично": 5
  }