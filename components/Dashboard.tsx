
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Entry, Category } from '../types';
import { DayCard } from './DayCard';
import { DASHBOARD_CONSTANTS } from '../constants';
import { addDays, subDays, startOfToday, isSameDay, startOfWeek, format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DashboardProps {
  entries: Entry[];
  categories: Category[];
  onEditEntry?: (entry: Entry) => void;
  onDeleteEntry?: (entryId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ entries, categories, onEditEntry, onDeleteEntry }) => {
  const [days, setDays] = useState<Date[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const isInitialScrollDone = useRef(false);

  // 1. Инициализация расширенного диапазона дней
  useEffect(() => {
    const today = startOfToday();
    const currentMonday = startOfWeek(today, { weekStartsOn: 1 });
    
    // Генерируем начальный диапазон дней
    // Это создает запас контента, чтобы "Сегодня" никогда не было у самого края
    const weeksBackInDays = DASHBOARD_CONSTANTS.WEEKS_BACK * DASHBOARD_CONSTANTS.DAYS_PER_WEEK;
    const startPoint = subDays(currentMonday, weeksBackInDays); 
    
    const initialDays = [];
    for (let i = 0; i < DASHBOARD_CONSTANTS.INITIAL_DAYS_COUNT; i++) {
      initialDays.push(addDays(startPoint, i));
    }
    
    setDays(initialDays);
  }, []);

  // 2. Улучшенная логика прокрутки к текущей дате
  useEffect(() => {
    if (days.length > 0 && !isInitialScrollDone.current) {
      // Используем небольшой таймаут, чтобы дождаться отрисовки сетки браузером
      const timer = setTimeout(() => {
        const todayElement = document.getElementById('today-marker');
        const container = containerRef.current;

        if (todayElement && container) {
          // Вычисляем позицию элемента относительно контейнера
          const offsetTop = todayElement.offsetTop;
          // Прокручиваем контейнер с учетом отступа под верхнюю навигацию
          container.scrollTop = offsetTop - DASHBOARD_CONSTANTS.SCROLL_TOP_OFFSET;
          isInitialScrollDone.current = true;
        }
      }, DASHBOARD_CONSTANTS.INITIAL_SCROLL_DELAY);

      return () => clearTimeout(timer);
    }
  }, [days]);

  // Группировка дней по неделям (по 7 дней)
  const weeks = useMemo(() => {
    const chunks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      chunks.push(days.slice(i, i + 7));
    }
    return chunks;
  }, [days]);

  const loadMorePast = () => {
    if (loadingRef.current || days.length === 0) return;
    loadingRef.current = true;
    
    const oldestDay = days[0];
    const newDays = [];
    // Добавляем дни для подгрузки
    for (let i = DASHBOARD_CONSTANTS.LOAD_MORE_DAYS; i >= 1; i--) {
      newDays.push(subDays(oldestDay, i));
    }

    const container = containerRef.current;
    if (!container) return;

    const prevScrollHeight = container.scrollHeight;
    const prevScrollTop = container.scrollTop;

    setDays(prev => [...newDays, ...prev]);
    
    requestAnimationFrame(() => {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
      loadingRef.current = false;
    });
  };

  const loadMoreFuture = () => {
    if (loadingRef.current || days.length === 0) return;
    loadingRef.current = true;
    const newestDay = days[days.length - 1];
    const newDays = [];
    for (let i = 1; i <= DASHBOARD_CONSTANTS.LOAD_MORE_DAYS; i++) {
      newDays.push(addDays(newestDay, i));
    }
    setDays(prev => [...prev, ...newDays]);
    loadingRef.current = false;
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // Пороги для подгрузки контента при скролле
    if (scrollTop <= DASHBOARD_CONSTANTS.SCROLL_THRESHOLD) {
      loadMorePast();
    }
    if (scrollHeight - scrollTop <= clientHeight + DASHBOARD_CONSTANTS.SCROLL_THRESHOLD) {
      loadMoreFuture();
    }
  };

  // Мемоизированная группировка записей по дням
  const entriesByDayMap = useMemo(() => {
    const map = new Map<string, Entry[]>();
    entries.forEach(entry => {
      const entryDate = new Date(entry.createdAt);
      const dateKey = format(entryDate, 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(entry);
    });
    return map;
  }, [entries]);

  const entriesByDay = (date: Date): Entry[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return entriesByDayMap.get(dateKey) || [];
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto px-4 py-8 no-scrollbar bg-[#FAFAFA] relative"
    >
      <div className="max-w-[2400px] mx-auto space-y-16 pb-96">
        {weeks.map((weekDays, weekIdx) => (
          <div key={`week-${weekIdx}`} className="space-y-6">
            {/* Заголовок недели */}
            <div className="flex items-center gap-4 px-2">
              <div className="h-[1px] flex-1 bg-[rgba(0,0,0,0.12)]" />
              <span className="text-xs font-medium text-[rgba(0,0,0,0.6)] uppercase tracking-wider whitespace-nowrap">
                {format(weekDays[0], 'd MMM', { locale: ru })} — {format(weekDays[6], 'd MMM', { locale: ru })}
              </span>
              <div className="h-[1px] flex-1 bg-[rgba(0,0,0,0.12)]" />
            </div>

            {/* Сетка недели */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 [@media(min-width:1200px)]:grid-cols-7 gap-4">
              {weekDays.map((date) => {
                const isCurrent = isSameDay(date, startOfToday());
                return (
                  <div 
                    key={date.toISOString()} 
                    id={isCurrent ? 'today-marker' : undefined}
                    className="relative"
                  >
                    <DayCard 
                      date={date}
                      entries={entriesByDay(date)}
                      categories={categories}
                      onEditEntry={onEditEntry}
                      onDeleteEntry={onDeleteEntry}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
