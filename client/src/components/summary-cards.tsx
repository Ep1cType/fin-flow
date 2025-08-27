import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import type { FinancialSummary } from "@/lib/types";

interface SummaryCardsProps {
  summary: FinancialSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Balance Card */}
      <Card className="shadow-sm" data-testid="card-balance">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Текущий баланс</p>
              <p className="text-3xl font-bold text-foreground mt-2" data-testid="text-balance">
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
