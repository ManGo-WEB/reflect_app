
import React, { useState } from 'react';
import { format, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Entry, Category } from '../types';
import { IconRenderer } from './IconRenderer';
import { Edit2, Trash2 } from 'lucide-react';

interface DayCardProps {
  date: Date;
  entries: Entry[];
  categories: Category[];
  onEditEntry?: (entry: Entry) => void;
  onDeleteEntry?: (entryId: string) => void;
}

export const DayCard: React.FC<DayCardProps> = ({ date, entries, categories, onEditEntry, onDeleteEntry }) => {
  const today = isToday(date);
  const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);
  
  const getDayTitle = () => {
    // Формат: "Пн, 30 Дек" для компактности
    const formatted = format(date, 'EEEE, d MMM', { locale: ru });
    // Убираем точку в конце, если она есть
    const withoutDot = formatted.replace(/\.$/, '');
    return withoutDot.charAt(0).toUpperCase() + withoutDot.slice(1);
  };

  const getCategory = (id: string) => categories.find(c => c.id === id);

  const handleDeleteClick = (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      onDeleteEntry?.(entryId);
    }
  };

  const handleEditClick = (e: React.MouseEvent, entry: Entry) => {
    e.stopPropagation();
    onEditEntry?.(entry);
  };

  return (
    <div 
      className={`flex flex-col w-full h-[380px] rounded-lg overflow-hidden transition-all duration-200 ${
        today 
          ? 'elevation-8 bg-white scale-[1.02] z-10 border-2 border-[#1976D2]' 
          : 'elevation-1 bg-white hover:elevation-4'
      }`}
    >
      <div className={`p-4 border-b flex flex-col justify-center sticky top-0 z-10 ${
        today ? 'bg-[#E3F2FD] border-[rgba(25,118,210,0.12)]' : 'bg-white border-[rgba(0,0,0,0.12)]'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-medium truncate leading-tight ${today ? 'text-[#1976D2]' : 'text-[rgba(0,0,0,0.87)]'}`}>
            {getDayTitle()}
          </h3>
          {today && (
            <span className="flex-shrink-0 w-2 h-2 bg-[#1976D2] rounded-full animate-pulse shadow-[0_0_8px_rgba(25,118,210,0.6)]" />
          )}
        </div>
        <p className={`text-xs font-medium mt-1 text-[rgba(0,0,0,0.6)] ${today ? 'text-[#1976D2]' : ''}`}>
          {format(date, 'yyyy')}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {entries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[rgba(0,0,0,0.38)]">
            <IconRenderer name="Calendar" className="w-6 h-6 mb-2" />
            <p className="text-xs font-medium text-[rgba(0,0,0,0.38)]">Пусто</p>
          </div>
        ) : (
          entries.map((entry) => {
            const cat = getCategory(entry.categoryId);
            const isHovered = hoveredEntryId === entry.id;
            return (
              <div 
                key={entry.id} 
                className="flex gap-3 group relative cursor-pointer"
                onMouseEnter={() => setHoveredEntryId(entry.id)}
                onMouseLeave={() => setHoveredEntryId(null)}
                onClick={() => onEditEntry?.(entry)}
              >
                <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-${cat?.color || 'slate'}-100 text-${cat?.color || 'slate'}-600 elevation-1`}>
                  <IconRenderer name={cat?.icon || 'MessageCircle'} className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 relative">
                  {/* Иконки редактирования и удаления при наведении - поверх текста */}
                  {isHovered && (onEditEntry || onDeleteEntry) && (
                    <div className="absolute top-0 right-0 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 elevation-2 z-10">
                      {onEditEntry && (
                        <button
                          onClick={(e) => handleEditClick(e, entry)}
                          className="p-1.5 hover:bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.6)] hover:text-[#1976D2] rounded-full transition-all ripple"
                          title="Редактировать"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDeleteEntry && (
                        <button
                          onClick={(e) => handleDeleteClick(e, entry.id)}
                          className="p-1.5 hover:bg-[#FFEBEE] text-[rgba(0,0,0,0.6)] hover:text-[#D32F2F] rounded-full transition-all ripple"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-[rgba(0,0,0,0.87)] leading-relaxed font-normal break-words pr-0">
                    {entry.text.split(' ').map((word, i) => (
                      word.startsWith('#') 
                        ? <span key={i} className="text-[#1976D2] font-medium">{word} </span>
                        : <span key={i}>{word} </span>
                    ))}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
