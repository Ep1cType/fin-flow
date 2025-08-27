import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from "@shared/schema";
import { CATEGORIES } from "@/lib/types";

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEditTransaction: (transaction: Transaction) => void;
}

export default function TransactionTable({ 
  transactions, 
  isLoading, 
  onEditTransaction 
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      toast({
        title: "Транзакция удалена",
        description: "Транзакция была успешно удалена",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить транзакцию",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("ru-RU");
  };

  const getCategoryInfo = (categoryKey: string) => {
    return CATEGORIES[categoryKey as keyof typeof CATEGORIES] || {
      label: categoryKey,
      icon: "fas fa-question-circle",
      color: "bg-gray-100 text-gray-800"
    };
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить эту транзакцию?")) {
      deleteTransactionMutation.mutate(id);
    }
  };

  // Pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Транзакции</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm overflow-hidden" data-testid="card-transactions">
      <CardHeader className="border-b border-border">
        <CardTitle>Транзакции</CardTitle>
        <p className="text-sm text-muted-foreground" data-testid="text-total-transactions">
          Всего найдено: {transactions.length} транзакций
        </p>
      </CardHeader>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-left">Дата</TableHead>
              <TableHead className="text-left">Описание</TableHead>
              <TableHead className="text-left">Категория</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <TableHead className="text-center">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Транзакции не найдены
                </TableCell>
              </TableRow>
            ) : (
              currentTransactions.map((transaction) => {
                const categoryInfo = getCategoryInfo(transaction.category);
                return (
                  <TableRow 
                    key={transaction.id} 
                    className="hover:bg-muted/50 transition-colors"
                    data-testid={`row-transaction-${transaction.id}`}
                  >
                    <TableCell className="text-sm" data-testid={`text-date-${transaction.id}`}>
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium" data-testid={`text-description-${transaction.id}`}>
                          {transaction.description}
                        </p>
                        {transaction.note && (
                          <p className="text-xs text-muted-foreground" data-testid={`text-note-${transaction.id}`}>
                            {transaction.note}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`${categoryInfo.color} text-xs font-medium`}
                        data-testid={`badge-category-${transaction.id}`}
                      >
                        <i className={`${categoryInfo.icon} mr-1`}></i>
                        {categoryInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span 
                        className={`text-sm font-semibold ${
                          transaction.type === "income" ? "text-emerald-600" : "text-red-600"
                        }`}
                        data-testid={`text-amount-${transaction.id}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditTransaction(transaction)}
                          className="text-muted-foreground hover:text-primary"
                          data-testid={`button-edit-${transaction.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-muted-foreground hover:text-destructive"
                          disabled={deleteTransactionMutation.isPending}
                          data-testid={`button-delete-${transaction.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {transactions.length > 0 && (
        <div className="bg-muted/30 px-6 py-3 flex items-center justify-between border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Показано</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-border rounded px-2 py-1 text-sm bg-background"
              data-testid="select-items-per-page"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-muted-foreground">
              из {transactions.length} записей
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Назад
            </Button>
            <span className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded">
              {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-testid="button-next-page"
            >
              Вперед
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
