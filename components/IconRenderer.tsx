
import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
}

/**
 * Безопасный рендерер иконок из lucide-react
 */
export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = '' }) => {
  // Проверяем, что имя иконки не пустое
  if (!name || typeof name !== 'string') {
    const HelpCircle = LucideIcons.HelpCircle as React.ComponentType<{ className?: string }>;
    return <HelpCircle className={className} />;
  }

  // Нормализуем имя иконки
  const normalizedName = name.trim();
  const icons = LucideIcons as any;
  
  // Вариант 1: Прямое совпадение
  let IconComponent = icons[normalizedName];
  
  // Вариант 2: Если не найдено и не заканчивается на Icon, пробуем с суффиксом Icon
  if (!IconComponent && !normalizedName.endsWith('Icon')) {
    IconComponent = icons[`${normalizedName}Icon`];
  }
  
  // Вариант 3: Если имя заканчивается на Icon, пробуем без суффикса
  if (!IconComponent && normalizedName.endsWith('Icon')) {
    const nameWithoutIcon = normalizedName.slice(0, -4);
    IconComponent = icons[nameWithoutIcon];
  }
  
  // Если иконка найдена и является функцией, рендерим её
  if (IconComponent && typeof IconComponent === 'function') {
    const Icon = IconComponent as React.ComponentType<{ className?: string }>;
    return <Icon className={className} />;
  }
  
  // Fallback на HelpCircle
  const HelpCircle = LucideIcons.HelpCircle as React.ComponentType<{ className?: string }>;
  return <HelpCircle className={className} />;
};
