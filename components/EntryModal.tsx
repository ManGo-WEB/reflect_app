
import React, { useState, useRef, useEffect } from 'react';
import { Category, Entry } from '../types';
import { IconRenderer } from './IconRenderer';
import { getColorClasses, getText500Class } from '../utils/colorUtils';
import { formatISOStringForInput, formatISOStringForDisplay, getTodayDateString } from '../utils/dateUtils';
import { 
  XMarkIcon as X,
  CalendarIcon,
  ChevronDownIcon as ChevronDown,
  CheckIcon as Check
} from '@heroicons/react/24/outline';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (text: string, categoryId: string, date: string, entryId?: string) => void;
  entry?: Entry | null; // Для режима редактирования
}

export const EntryModal: React.FC<EntryModalProps> = ({ isOpen, onClose, categories, onSubmit, entry }) => {
  const [text, setText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [isoDate, setIsoDate] = useState(() => getTodayDateString());
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Инициализация формы при открытии модального окна или изменении entry
  useEffect(() => {
    if (isOpen) {
      if (entry) {
        // Режим редактирования
        setText(entry.text);
        setSelectedCategoryId(entry.categoryId);
        setIsoDate(formatISOStringForInput(entry.createdAt));
      } else {
        // Режим создания
        setText('');
        setSelectedCategoryId(categories[0]?.id || '');
        setIsoDate(getTodayDateString());
      }
    }
  }, [isOpen, entry, categories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Обработка Escape для закрытия модального окна
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isCatDropdownOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isCatDropdownOpen, onClose]);

  // Управление фокусом при открытии модального окна
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Фокусируемся на первом интерактивном элементе
      const firstInput = modalRef.current.querySelector('input, textarea, button') as HTMLElement;
      firstInput?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!text.trim()) return;
    onSubmit(text, selectedCategoryId, isoDate, entry?.id);
    // Сброс формы
    setText('');
    setIsoDate(getTodayDateString());
    onClose();
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[rgba(0,0,0,0.5)] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-lg rounded-lg elevation-16 overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col"
      >
        <div className="p-6 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <h2 id="entry-modal-title" className="text-xl font-medium text-[rgba(0,0,0,0.87)]">
              {entry ? 'Редактировать запись' : 'Новый момент'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgba(0,0,0,0.04)] rounded-full transition-colors ripple"
              aria-label="Закрыть модальное окно"
            >
              <X className="w-5 h-5 text-[rgba(0,0,0,0.6)]" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Секция выбора даты - ОБЫЧНЫЙ INPUT */}
            <div className="relative">
              <label htmlFor="entry-date-input" className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-2">
                Дата записи
              </label>
              <div 
                className="relative flex items-center cursor-pointer" 
                onClick={() => {
                  if (dateInputRef.current) {
                    if (dateInputRef.current.showPicker) {
                      dateInputRef.current.showPicker();
                    } else {
                      dateInputRef.current.focus();
                      dateInputRef.current.click();
                    }
                  }
                }}
              >
                <CalendarIcon className="absolute left-3 w-5 h-5 text-[#1976D2] pointer-events-none z-10" />
                <input
                  id="entry-date-input"
                  ref={dateInputRef}
                  type="date"
                  value={isoDate}
                  onChange={(e) => {
                    if (e.target.value) setIsoDate(e.target.value);
                  }}
                  className="w-full h-12 bg-[rgba(0,0,0,0.04)] border-b-2 border-[rgba(0,0,0,0.42)] focus:border-[#1976D2] rounded-t pl-10 pr-4 text-[rgba(0,0,0,0.87)] font-normal outline-none transition-all appearance-none [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-datetime-edit]:hidden [&::-webkit-datetime-edit-fields-wrapper]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden cursor-pointer"
                  style={{ color: 'transparent' }}
                  aria-label="Дата записи"
                />
                <div className="absolute left-10 right-4 text-[rgba(0,0,0,0.87)] font-normal text-sm pointer-events-none">
                  {formatISOStringForDisplay(isoDate)}
                </div>
              </div>
            </div>

            {/* Секция выбора категории */}
            <div className="relative" ref={dropdownRef}>
              <label htmlFor="category-select" className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-2">
                Контекст
              </label>
              <button
                id="category-select"
                type="button"
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                className="w-full h-12 bg-[rgba(0,0,0,0.04)] border-b-2 border-[rgba(0,0,0,0.42)] hover:border-[#1976D2] rounded-t px-4 flex items-center justify-between transition-all outline-none ripple"
                aria-expanded={isCatDropdownOpen}
                aria-haspopup="listbox"
                aria-label="Выбрать категорию"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {selectedCategory && (
                    <div className={`flex-shrink-0 ${getText500Class(selectedCategory.color)}`}>
                      <IconRenderer name={selectedCategory.icon} className="w-5 h-5" />
                    </div>
                  )}
                  <span className="text-slate-700 font-semibold truncate">
                    {selectedCategory?.name || 'Выбрать'}
                  </span>
                </div>
                <ChevronDown className={`flex-shrink-0 w-4 h-4 text-[rgba(0,0,0,0.6)] transition-transform duration-200 ${isCatDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCatDropdownOpen && (
                <div
                  className="absolute top-full left-0 w-full mt-1 bg-white elevation-8 z-50 py-1 max-h-64 overflow-y-auto no-scrollbar rounded-lg"
                  role="listbox"
                  aria-label="Список категорий"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      role="option"
                      aria-selected={selectedCategoryId === cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setIsCatDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[rgba(0,0,0,0.04)] transition-colors ripple ${selectedCategoryId === cat.id ? 'bg-[#E3F2FD]' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getColorClasses(cat.color).bg100} ${getColorClasses(cat.color).text600} elevation-1`}>
                          <IconRenderer name={cat.icon} className="w-4 h-4" />
                        </div>
                        <span className={`font-normal text-sm ${selectedCategoryId === cat.id ? 'text-[#1976D2]' : 'text-[rgba(0,0,0,0.87)]'}`}>
                          {cat.name}
                        </span>
                      </div>
                      {selectedCategoryId === cat.id && <Check className="w-4 h-4 text-[#1976D2]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="entry-text-input" className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-2">
              Ваши мысли
            </label>
            <textarea
              id="entry-text-input"
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Что произошло? Используйте #теги..."
              className="w-full h-40 p-4 rounded-lg bg-[rgba(0,0,0,0.04)] border-b-2 border-[rgba(0,0,0,0.42)] focus:border-[#1976D2] resize-none text-[rgba(0,0,0,0.87)] text-base leading-relaxed placeholder:text-[rgba(0,0,0,0.38)] transition-all outline-none"
              aria-label="Текст записи"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="w-full py-3 bg-[#1976D2] text-white rounded-lg font-medium text-base hover:bg-[#1565C0] elevation-2 disabled:opacity-38 disabled:elevation-0 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 ripple"
            aria-label={entry ? 'Сохранить изменения' : 'Сохранить запись'}
          >
            {entry ? 'Сохранить изменения' : 'Сохранить запись'}
          </button>
        </div>
      </div>
    </div>
  );
};
