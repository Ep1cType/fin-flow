import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import type { FinancialSummary } from "@/lib/types";

interface DashboardSummaryProps {
  summary?: FinancialSummary;
  isLoading?: boolean;
}

export default function DashboardSummary({ summary, isLoading }: DashboardSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBalanceChangeColor = (balance: number) => {
    return balance >= 0 ? "text-emerald-600" : "text-red-600";
  };

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }

  if (!summary) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>Не удалось загрузить сводку</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Balance Card */}
      <Card className="shadow-sm" data-testid="card-balance">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Текущий баланс</p>
              <p className={`text-3xl font-bold mt-2 ${getBalanceChangeColor(summary.balance)}`} data-testid="text-balance">
                {formatCurrency(summary.balance)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Всего транзакций: {summary.totalTransactions}
              </p>
            </div>
            <div className="bg-primary/10 rounded-full p-3">
              <Wallet className="text-primary w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Card */}
      <Card className="shadow-sm" data-testid="card-income">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Доходы за месяц</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2" data-testid="text-monthly-income">
                {formatCurrency(summary.monthlyIncome)}
              </p>
              <p className="text-sm text-emerald-600 mt-1">
                +{summary.incomeTransactionCount} транзакций
              </p>
            </div>
            <div className="bg-emerald-50 rounded-full p-3">
              <TrendingUp className="text-emerald-600 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card className="shadow-sm" data-testid="card-expenses">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Расходы за месяц</p>
              <p className="text-3xl font-bold text-red-600 mt-2" data-testid="text-monthly-expenses">
                {formatCurrency(summary.monthlyExpenses)}
              </p>
              <p className="text-sm text-red-600 mt-1">
                +{summary.expenseTransactionCount} транзакций
              </p>
            </div>
            <div className="bg-red-50 rounded-full p-3">
              <TrendingDown className="text-red-600 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
