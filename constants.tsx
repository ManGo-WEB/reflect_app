
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
