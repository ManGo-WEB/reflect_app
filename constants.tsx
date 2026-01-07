
import { Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Работа', icon: 'Briefcase', color: 'blue' },
  { id: '2', name: 'Семья', icon: 'Home', color: 'green' },
  { id: '3', name: 'Здоровье', icon: 'Heart', color: 'red' },
  { id: '4', name: 'Идеи', icon: 'Lightbulb', color: 'yellow' },
  { id: '5', name: 'Личное', icon: 'User', color: 'purple' },
  { id: '6', name: 'Настроение', icon: 'Smile', color: 'orange' },
];

export const ICON_LIBRARY = [
  'Briefcase', 'Home', 'Heart', 'Lightbulb', 'User', 'Smile', 'Star', 'Coffee', 
  'Cloud', 'Moon', 'Sun', 'Book', 'Camera', 'Music', 'Map', 'Zap', 'Target'
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