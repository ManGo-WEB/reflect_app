import React from 'react';
import * as HeroiconsOutline from '@heroicons/react/24/outline';

interface IconRendererProps {
  name: string;
  className?: string;
}

/**
 * Безопасный рендерер иконок из Heroicons
 * Маппинг старых имен Lucide на новые имена Heroicons
 */
export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = '' }) => {
  // Проверяем, что имя иконки не пустое
  if (!name || typeof name !== 'string') {
    const QuestionMarkCircleIcon = HeroiconsOutline.QuestionMarkCircleIcon;
    return <QuestionMarkCircleIcon className={className} />;
  }

  // Маппинг старых имен Lucide на Heroicons
  const iconNameMap: Record<string, string> = {
    // Основные иконки из констант
    'User': 'UserIcon',
    'UserIcon': 'UserIcon',
    'Smile': 'FaceSmileIcon',
    'SmileIcon': 'FaceSmileIcon',
    'Calendar': 'CalendarIcon',
    'CalendarIcon': 'CalendarIcon',
    'MessageCircle': 'ChatBubbleLeftIcon',
    'MessageCircleIcon': 'ChatBubbleLeftIcon',
    'MessageSquare': 'ChatBubbleLeftSquareIcon',
    'MessageSquareIcon': 'ChatBubbleLeftSquareIcon',
    'HelpCircle': 'QuestionMarkCircleIcon',
    'HelpCircleIcon': 'QuestionMarkCircleIcon',
    
    // Остальные иконки из ICON_LIBRARY
    'Briefcase': 'BriefcaseIcon',
    'Home': 'HomeIcon',
    'Heart': 'HeartIcon',
    'Lightbulb': 'LightBulbIcon',
    'Star': 'StarIcon',
    'Coffee': 'CakeIcon', // В Heroicons нет Coffee, используем Cake как альтернативу
    'Cloud': 'CloudIcon',
    'Moon': 'MoonIcon',
    'Sun': 'SunIcon',
    'Book': 'BookOpenIcon',
    'Camera': 'CameraIcon',
    'Music': 'MusicalNoteIcon',
    'Map': 'MapIcon',
    'Zap': 'BoltIcon',
    'Target': 'TargetIcon', // В Heroicons это может быть другая иконка
    
    // Дополнительные иконки, используемые в компонентах
    'X': 'XMarkIcon',
    'Mail': 'EnvelopeIcon',
    'Lock': 'LockClosedIcon',
    'AlertCircle': 'ExclamationCircleIcon',
    'Eye': 'EyeIcon',
    'EyeOff': 'EyeSlashIcon',
    'Plus': 'PlusIcon',
    'Edit': 'PencilIcon',
    'Trash': 'TrashIcon',
    'Trash2': 'TrashIcon',
    'Save': 'CheckIcon',
    'Check': 'CheckIcon',
    'Search': 'MagnifyingGlassIcon',
    'Filter': 'FunnelIcon',
    'ChevronLeft': 'ChevronLeftIcon',
    'ChevronRight': 'ChevronRightIcon',
    'ChevronDown': 'ChevronDownIcon',
    'ChevronUp': 'ChevronUpIcon',
    'MoreVertical': 'EllipsisVerticalIcon',
    'Download': 'ArrowDownTrayIcon',
    'TrendingUp': 'ArrowTrendingUpIcon',
    'BarChart': 'ChartBarIcon',
    'PieChart': 'ChartPieIcon',
    'Settings': 'Cog6ToothIcon',
    'LogOut': 'ArrowRightOnRectangleIcon',
    'Loader': 'ArrowPathIcon',
    'Sparkles': 'SparklesIcon',
    'FileText': 'DocumentTextIcon',
    'AlertTriangle': 'ExclamationTriangleIcon',
    'Info': 'InformationCircleIcon',
  };

  // Нормализуем имя иконки
  const normalizedName = name.trim();
  
  // Получаем имя иконки из маппинга или используем как есть
  const heroiconName = iconNameMap[normalizedName] || normalizedName;
  
  // Получаем компонент иконки
  const icons = HeroiconsOutline as any;
  let IconComponent = icons[heroiconName];
  
  // Если не найдено и не заканчивается на Icon, пробуем с суффиксом Icon
  if (!IconComponent && !heroiconName.endsWith('Icon')) {
    IconComponent = icons[`${heroiconName}Icon`];
  }
  
  // Если имя заканчивается на Icon, пробуем без суффикса
  if (!IconComponent && heroiconName.endsWith('Icon')) {
    const nameWithoutIcon = heroiconName.slice(0, -4);
    IconComponent = icons[nameWithoutIcon];
  }
  
  // Если иконка найдена, рендерим её (React компоненты могут быть функциями или объектами)
  if (IconComponent) {
    // Проверяем, что это React компонент (функция или объект с render методом)
    if (typeof IconComponent === 'function' || (typeof IconComponent === 'object' && IconComponent !== null)) {
      return <IconComponent className={className} />;
    }
  }
  
  // Fallback на QuestionMarkCircleIcon
  const QuestionMarkCircleIcon = HeroiconsOutline.QuestionMarkCircleIcon;
  return <QuestionMarkCircleIcon className={className} />;
};
