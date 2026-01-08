
import { Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Работа', icon: 'BriefcaseIcon', color: 'blue' },
  { id: '2', name: 'Семья', icon: 'HomeIcon', color: 'green' },
  { id: '3', name: 'Здоровье', icon: 'HeartIcon', color: 'red' },
  { id: '4', name: 'Идеи', icon: 'LightBulbIcon', color: 'yellow' },
  { id: '5', name: 'Личное', icon: 'UserIcon', color: 'purple' },
  { id: '6', name: 'Настроение', icon: 'FaceSmileIcon', color: 'orange' },
];

export const ICON_LIBRARY = [
  'BriefcaseIcon', 'HomeIcon', 'HeartIcon', 'LightBulbIcon', 'UserIcon', 'FaceSmileIcon',
  'StarIcon', 'CakeIcon', 'CloudIcon', 'MoonIcon', 'SunIcon', 'BookOpenIcon', 
  'CameraIcon', 'MusicalNoteIcon', 'MapIcon', 'BoltIcon', 'CalendarIcon',
  'ChatBubbleLeftIcon', 'ChatBubbleLeftSquareIcon', 'QuestionMarkCircleIcon',
  'SparklesIcon', 'RocketLaunchIcon', 'FireIcon', 'BeakerIcon', 'GlobeAltIcon',
  'TrophyIcon', 'PuzzlePieceIcon', 'PaintBrushIcon', 'AcademicCapIcon', 'ShoppingBagIcon'
];

export const COLORS = [
  'blue', 'green', 'red', 'purple', 'yellow', 'orange', 'pink', 'teal', 'indigo'
];

// Константы для Dashboard
export const DASHBOARD_CONSTANTS = {
  // Количество дней для начальной загрузки (24 недели = 168 дней)
  INITIAL_DAYS_COUNT: 168,
  // Количество недель назад от текущей недели
  WEEKS_BACK: 8,
  // Количество дней в неделе
  DAYS_PER_WEEK: 7,
  // Количество дней для подгрузки при скролле (4 недели)
  LOAD_MORE_DAYS: 28,
  // Порог скролла в пикселях для подгрузки контента
  SCROLL_THRESHOLD: 600,
  // Отступ сверху при прокрутке к текущей дате (под навигацию)
  SCROLL_TOP_OFFSET: 80,
  // Задержка для инициализации скролла (мс)
  INITIAL_SCROLL_DELAY: 150,
} as const;