
import React, { useState } from 'react';
import { Category } from '../types';
import { ICON_LIBRARY, COLORS } from '../constants';
import { IconRenderer } from './IconRenderer';
import { getColorClasses, getBg500Class } from '../utils/colorUtils';
import { 
  PlusIcon as Plus,
  XMarkIcon as X,
  TrashIcon as Trash2,
  PencilIcon as Edit2,
  CheckIcon as Check
} from '@heroicons/react/24/outline';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (name: string, icon: string, color: string) => void;
  onUpdate: (id: string, name: string, icon: string, color: string) => void;
  onDelete: (id: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', icon: ICON_LIBRARY[0], color: COLORS[0] });

  const resetForm = () => {
    setFormData({ name: '', icon: ICON_LIBRARY[0], color: COLORS[0] });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (cat: Category) => {
    setFormData({ name: cat.name, icon: cat.icon, color: cat.color });
    setEditingId(cat.id);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    if (editingId) {
      onUpdate(editingId, formData.name, formData.icon, formData.color);
    } else {
      onAdd(formData.name, formData.icon, formData.color);
    }
    resetForm();
  };

  return (
    <div className="h-full max-w-4xl mx-auto p-4 md:p-8 overflow-y-auto no-scrollbar bg-[#FAFAFA]">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-medium text-[rgba(0,0,0,0.87)] mb-1">Контексты</h1>
          <p className="text-sm text-[rgba(0,0,0,0.6)]">Как вы помечаете свои моменты.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-3 bg-[#1976D2] text-white rounded-full hover:bg-[#1565C0] transition-all elevation-4 active:scale-95 ripple"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="bg-white p-4 rounded-lg elevation-1 hover:elevation-4 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getColorClasses(cat.color).bg100} ${getColorClasses(cat.color).text600} elevation-1`}>
                <IconRenderer name={cat.icon} className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-[rgba(0,0,0,0.87)]">{cat.name}</h3>
                <span className={`text-xs font-normal text-[rgba(0,0,0,0.6)] uppercase`}>{cat.color}</span>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(cat)}
                className="p-2 hover:bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.6)] hover:text-[rgba(0,0,0,0.87)] rounded-full transition-all ripple"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(cat.id)}
                className="p-2 hover:bg-[#FFEBEE] text-[rgba(0,0,0,0.6)] hover:text-[#D32F2F] rounded-full transition-all ripple"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4">
          <div className="bg-white w-full max-w-md rounded-lg elevation-16 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-[rgba(0,0,0,0.87)]">{editingId ? 'Редактировать категорию' : 'Новая категория'}</h2>
              <button onClick={resetForm} className="p-2 hover:bg-[rgba(0,0,0,0.04)] rounded-full ripple"><X className="w-5 h-5 text-[rgba(0,0,0,0.6)]" /></button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-2">Название</label>
                <input 
                  autoFocus
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[rgba(0,0,0,0.04)] border-b-2 border-[rgba(0,0,0,0.42)] focus:border-[#1976D2] rounded-t p-3 focus:outline-none text-base font-normal transition-all"
                  placeholder="Например, Чтение"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-2">Иконка</label>
                <div className="grid grid-cols-6 gap-2 h-32 overflow-y-auto no-scrollbar p-1">
                  {ICON_LIBRARY.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`p-3 rounded-lg flex items-center justify-center border-2 transition-all ripple ${
                        formData.icon === icon 
                          ? 'border-[#1976D2] bg-[#E3F2FD] text-[#1976D2] elevation-1' 
                          : 'border-[rgba(0,0,0,0.12)] bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.08)]'
                      }`}
                    >
                      <IconRenderer name={icon} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-2">Цвет</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${getBg500Class(color)} ripple ${
                        formData.color === color 
                          ? 'border-[#1976D2] scale-110 elevation-2' 
                          : 'border-transparent hover:elevation-1'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                disabled={!formData.name.trim()}
                onClick={handleSubmit}
                className="w-full py-3 bg-[#1976D2] text-white rounded-lg font-medium text-base hover:bg-[#1565C0] elevation-2 disabled:opacity-38 disabled:elevation-0 transition-all flex items-center justify-center gap-2 ripple"
              >
                <Check className="w-5 h-5" /> {editingId ? 'Обновить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
