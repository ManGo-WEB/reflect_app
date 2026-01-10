
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Entry, Category, Report } from '../types';
import { generateAIReport } from '../services/geminiService';
import { useToast } from '../hooks/useToast';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  SparklesIcon as Brain,
  ClockIcon as History,
  ArrowPathIcon as Loader2,
  DocumentTextIcon as FileText,
  ChevronRightIcon as ChevronRight,
  TrashIcon as Trash2
} from '@heroicons/react/24/outline';
import { ConfirmDialog } from './ConfirmDialog';

interface ReportsProps {
  entries: Entry[];
  categories: Category[];
  reports: Report[];
  onReportGenerated: (report: Report) => void;
  onDeleteReport?: (reportId: string) => void;
}

const PERIOD_LABELS = {
  'Day': 'День',
  'Week': 'Неделя',
  'Month': 'Месяц'
};

const PERIOD_REPORT_LABELS = {
  'Day': 'Ежедневный',
  'Week': 'Недельный',
  'Month': 'Месячный'
};

export const Reports: React.FC<ReportsProps> = ({ entries, categories, reports, onReportGenerated, onDeleteReport }) => {
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [period, setPeriod] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [hoveredReportId, setHoveredReportId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; reportId: string | null }>({
    isOpen: false,
    reportId: null,
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      let startDate = startOfDay(new Date());
      const endDate = endOfDay(new Date());

      if (period === 'Week') startDate = startOfDay(subDays(new Date(), 7));
      if (period === 'Month') startDate = startOfDay(subDays(new Date(), 30));

      const filteredEntries = entries.filter(e => {
        const d = new Date(e.createdAt);
        return d >= startDate && d <= endDate;
      });

      const content = await generateAIReport(filteredEntries, categories, period);
      
      const newReport: Report = {
        id: crypto.randomUUID(),
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        content,
        generatedAt: new Date().toISOString()
      };

      onReportGenerated(newReport);
      setSelectedReport(newReport);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Произошла ошибка при генерации отчета');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation();
    setConfirmDelete({ isOpen: true, reportId });
  };

  const handleConfirmDelete = () => {
    if (confirmDelete.reportId) {
      onDeleteReport?.(confirmDelete.reportId);
      // Если удаляемый отчет был выбран, сбрасываем выбор
      if (selectedReport?.id === confirmDelete.reportId) {
        setSelectedReport(null);
      }
      setConfirmDelete({ isOpen: false, reportId: null });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ isOpen: false, reportId: null });
  };

  return (
    <div className="h-full max-w-4xl mx-auto p-4 md:p-8 pb-32 md:pb-8 overflow-y-auto no-scrollbar bg-[#FAFAFA]">
      <header className="mb-8">
        <h1 className="text-2xl font-medium text-[rgba(0,0,0,0.87)] mb-1">AI Аналитика</h1>
        <p className="text-sm text-[rgba(0,0,0,0.6)]">Найдите скрытые закономерности в вашей жизни.</p>
      </header>

      {selectedReport ? (
        <div className="bg-white rounded-lg p-6 elevation-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-[#E3F2FD] text-[#1976D2] text-xs font-medium rounded-full uppercase tracking-wider mb-2">
                {PERIOD_REPORT_LABELS[selectedReport.period as keyof typeof PERIOD_REPORT_LABELS]} отчет
              </span>
              <h2 className="text-lg font-medium text-[rgba(0,0,0,0.87)]">
                {format(new Date(selectedReport.startDate), 'dd.MM.yyyy', { locale: ru })} — {format(new Date(selectedReport.endDate), 'dd.MM.yyyy', { locale: ru })}
              </h2>
            </div>
            <button 
              onClick={() => setSelectedReport(null)}
              className="text-sm font-medium text-[rgba(0,0,0,0.6)] hover:text-[rgba(0,0,0,0.87)] transition-colors ripple px-3 py-1 rounded"
            >
              Назад к списку
            </button>
          </div>
          <div className="prose prose-slate max-w-none markdown-content">
            <ReactMarkdown
              components={{
                h2: ({...props}) => <h2 className="text-xl font-medium text-[rgba(0,0,0,0.87)] mt-8 mb-4 first:mt-0" {...props} />,
                h3: ({...props}) => <h3 className="text-lg font-medium text-[rgba(0,0,0,0.87)] mt-6 mb-3" {...props} />,
                p: ({...props}) => <p className="text-sm text-[rgba(0,0,0,0.87)] leading-relaxed mb-4" {...props} />,
                ul: ({...props}) => <ul className="list-disc list-inside mb-4 space-y-2 text-sm text-[rgba(0,0,0,0.87)]" {...props} />,
                ol: ({...props}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-sm text-[rgba(0,0,0,0.87)]" {...props} />,
                li: ({...props}) => <li className="leading-relaxed" {...props} />,
                strong: ({...props}) => <strong className="font-medium text-[rgba(0,0,0,0.87)]" {...props} />,
                em: ({...props}) => <em className="italic" {...props} />,
                blockquote: ({...props}) => <blockquote className="border-l-4 border-[#1976D2] pl-4 italic my-4 text-[rgba(0,0,0,0.6)]" {...props} />,
              }}
            >
              {selectedReport.content}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <h3 className="text-sm font-medium text-[rgba(0,0,0,0.6)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4" /> Новый анализ
            </h3>
            <div className="bg-white rounded-lg p-6 elevation-2">
              <p className="text-sm text-[rgba(0,0,0,0.6)] mb-6">Выберите период времени, и Gemini проанализирует ваши записи.</p>
              
              <div className="flex gap-2 mb-6">
                {(['Day', 'Week', 'Month'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ripple ${
                      period === p 
                        ? 'bg-[#1976D2] text-white elevation-1' 
                        : 'bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.08)]'
                    }`}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>

              <button
                disabled={loading || entries.length === 0}
                onClick={generateReport}
                className="w-full py-3 bg-[#1976D2] text-white rounded-lg font-medium text-base hover:bg-[#1565C0] elevation-2 disabled:opacity-38 disabled:elevation-0 transition-all flex items-center justify-center gap-3 active:scale-[0.98] ripple"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Создать отчет
                  </>
                )}
              </button>
              {entries.length === 0 && <p className="text-center text-xs text-[#D32F2F] mt-2 font-medium">Сначала добавьте записи!</p>}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-medium text-[rgba(0,0,0,0.6)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <History className="w-4 h-4" /> История
            </h3>
            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="bg-[rgba(0,0,0,0.04)] border-2 border-dashed border-[rgba(0,0,0,0.12)] rounded-lg p-10 flex flex-col items-center justify-center text-[rgba(0,0,0,0.38)]">
                  <FileText className="w-10 h-10 mb-2" />
                  <p className="text-sm font-normal">История пуста</p>
                </div>
              ) : (
                reports.map(report => {
                  const isHovered = hoveredReportId === report.id;
                  return (
                    <div
                      key={report.id}
                      className="relative group"
                      onMouseEnter={() => setHoveredReportId(report.id)}
                      onMouseLeave={() => setHoveredReportId(null)}
                    >
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="w-full bg-white p-4 rounded-lg elevation-1 hover:elevation-4 flex items-center justify-between transition-all ripple"
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-[#1976D2] uppercase">{PERIOD_REPORT_LABELS[report.period as keyof typeof PERIOD_REPORT_LABELS]}</span>
                            <span className="text-xs text-[rgba(0,0,0,0.6)]">• {format(new Date(report.generatedAt), 'dd.MM.yyyy, HH:mm', { locale: ru })}</span>
                          </div>
                          <p className="font-normal text-sm text-[rgba(0,0,0,0.87)]">
                            {format(new Date(report.startDate), 'dd.MM.yyyy', { locale: ru })} — {format(new Date(report.endDate), 'dd.MM.yyyy', { locale: ru })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isHovered && onDeleteReport && (
                            <button
                              onClick={(e) => handleDeleteClick(e, report.id)}
                              className="p-1.5 hover:bg-[#FFEBEE] text-[rgba(0,0,0,0.6)] hover:text-[#D32F2F] rounded-full transition-all ripple z-10"
                              title="Удалить отчет"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <ChevronRight className="w-5 h-5 text-[rgba(0,0,0,0.38)] group-hover:text-[#1976D2] transition-colors" />
                        </div>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Удалить отчет?"
        message="Вы уверены, что хотите удалить этот отчет? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </div>
  );
};
