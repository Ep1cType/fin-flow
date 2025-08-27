import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";
import type { FilterState, FinancialSummary } from "@/lib/types";
import SummaryCards from "@/components/summary-cards";
import Filters from "@/components/filters";
import TransactionTable from "@/components/transaction-table";
import TransactionModal from "@/components/transaction-modal";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    type: "all",
    dateRange: "month",
  });
  
  const { toast } = useToast();

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.category) queryParams.append("category", filters.category);
  if (filters.type !== "all") queryParams.append("type", filters.type);
  
  // Date range handling
  if (filters.dateRange !== "all") {
    const now = new Date();
    let startDate: Date | undefined, endDate: Date | undefined;
    
    switch (filters.dateRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case "custom":
        if (filters.customStartDate) startDate = filters.customStartDate;
        if (filters.customEndDate) endDate = filters.customEndDate;
        break;
      default:
        startDate = new Date(0);
        endDate = now;
    }
    
    if (startDate && endDate) {
      queryParams.append("startDate", startDate.toISOString().split('T')[0]);
      queryParams.append("endDate", endDate.toISOString().split('T')[0]);
    }
  }
  
  if (filters.minAmount) queryParams.append("minAmount", filters.minAmount.toString());
  if (filters.maxAmount) queryParams.append("maxAmount", filters.maxAmount.toString());

  const transactionsQuery = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", queryParams.toString()],
    queryFn: async () => {
      const url = `/api/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Не удалось загрузить транзакции");
      return response.json();
    },
  });

  const summaryQuery = useQuery<FinancialSummary>({
    queryKey: ["/api/summary"],
  });

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleExportData = () => {
    if (!transactionsQuery.data) return;
    
    const csv = [
      "Дата,Описание,Категория,Тип,Сумма,Заметка",
      ...transactionsQuery.data.map(t => 
        `${new Date(t.date).toLocaleDateString("ru-RU")},${t.description},${t.category},${t.type === "income" ? "Доход" : "Расход"},${t.amount},${t.note || ""}`
      )
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: "Экспорт завершен",
      description: "Данные экспортированы в CSV файл",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <i className="fas fa-chart-line text-primary text-2xl"></i>
              <h1 className="text-xl font-semibold text-foreground">Учет Финансов</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-add-transaction"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить транзакцию
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExportData}
                disabled={!transactionsQuery.data?.length}
                data-testid="button-export-data"
              >
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {summaryQuery.data && <SummaryCards summary={summaryQuery.data} />}

        {/* Filters */}
        <Filters filters={filters} onFiltersChange={setFilters} />

        {/* Transactions Table */}
        <TransactionTable
          transactions={transactionsQuery.data || []}
          isLoading={transactionsQuery.isLoading}
          onEditTransaction={handleEditTransaction}
        />
      </main>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        transaction={editingTransaction}
      />
    </div>
  );
}
