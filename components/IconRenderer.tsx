
import React from 'react';
import * as Icons from 'lucide-react';
import { ICON_LIBRARY } from '../constants';

interface IconRendererProps {
  name: string;
  className?: string;
}

/**
 * Безопасный рендерер иконок из lucide-react
 * Проверяет существование иконки перед рендерингом
 */
export const IconRenderer: React.FC<IconRendererProps> = ({ name, className }) => {
  // Проверяем, что имя иконки не пустое
  if (!name || typeof name !== 'string') {
    return <Icons.HelpCircle className={className} />;
  }

  // Проверяем, что иконка есть в библиотеке доступных иконок
  if (!ICON_LIBRARY.includes(name)) {
    console.warn(`Icon "${name}" is not in the icon library. Using HelpCircle as fallback.`);
    return <Icons.HelpCircle className={className} />;
  }

  // Безопасное получение компонента иконки
  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[name];
  
  // Проверяем, что компонент существует и является функцией
  if (!IconComponent || typeof IconComponent !== 'function') {
    console.warn(`Icon component "${name}" not found in lucide-react. Using HelpCircle as fallback.`);
    return <Icons.HelpCircle className={className} />;
  }

  return <IconComponent className={className} />;
};
