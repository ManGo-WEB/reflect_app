/**
 * Утилиты для работы с цветами категорий
 * Решает проблему динамических классов Tailwind через явный маппинг
 */

export type ColorName = 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'orange' | 'pink' | 'teal' | 'indigo';

const COLOR_CLASSES: Record<ColorName, {
  bg100: string;
  bg500: string;
  text500: string;
  text600: string;
}> = {
  blue: {
    bg100: 'bg-blue-100',
    bg500: 'bg-blue-500',
    text500: 'text-blue-500',
    text600: 'text-blue-600',
  },
  green: {
    bg100: 'bg-green-100',
    bg500: 'bg-green-500',
    text500: 'text-green-500',
    text600: 'text-green-600',
  },
  red: {
    bg100: 'bg-red-100',
    bg500: 'bg-red-500',
    text500: 'text-red-500',
    text600: 'text-red-600',
  },
  purple: {
    bg100: 'bg-purple-100',
    bg500: 'bg-purple-500',
    text500: 'text-purple-500',
    text600: 'text-purple-600',
  },
  yellow: {
    bg100: 'bg-yellow-100',
    bg500: 'bg-yellow-500',
    text500: 'text-yellow-500',
    text600: 'text-yellow-600',
  },
  orange: {
    bg100: 'bg-orange-100',
    bg500: 'bg-orange-500',
    text500: 'text-orange-500',
    text600: 'text-orange-600',
  },
  pink: {
    bg100: 'bg-pink-100',
    bg500: 'bg-pink-500',
    text500: 'text-pink-500',
    text600: 'text-pink-600',
  },
  teal: {
    bg100: 'bg-teal-100',
    bg500: 'bg-teal-500',
    text500: 'text-teal-500',
    text600: 'text-teal-600',
  },
  indigo: {
    bg100: 'bg-indigo-100',
    bg500: 'bg-indigo-500',
    text500: 'text-indigo-500',
    text600: 'text-indigo-600',
  },
};

const DEFAULT_COLOR: ColorName = 'blue';

/**
 * Получить классы для фона и текста категории
 */
export const getColorClasses = (color: string): { bg100: string; text600: string } => {
  const colorName = (color as ColorName) || DEFAULT_COLOR;
  const classes = COLOR_CLASSES[colorName] || COLOR_CLASSES[DEFAULT_COLOR];
  return {
    bg100: classes.bg100,
    text600: classes.text600,
  };
};

/**
 * Получить класс для фона цвета (bg-{color}-500)
 */
export const getBg500Class = (color: string): string => {
  const colorName = (color as ColorName) || DEFAULT_COLOR;
  return COLOR_CLASSES[colorName]?.bg500 || COLOR_CLASSES[DEFAULT_COLOR].bg500;
};

/**
 * Получить класс для текста цвета (text-{color}-500)
 */
export const getText500Class = (color: string): string => {
  const colorName = (color as ColorName) || DEFAULT_COLOR;
  return COLOR_CLASSES[colorName]?.text500 || COLOR_CLASSES[DEFAULT_COLOR].text500;
};
