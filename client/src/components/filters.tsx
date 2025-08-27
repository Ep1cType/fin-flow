import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, RefreshCw, Calendar, Tags, ArrowUpDown, Coins } from "lucide-react";
import type { FilterState } from "@/lib/types";
import type { Category } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function Filters({ filters, onFiltersChange }: FiltersProps) {
  // Get categories from API
  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, category: value === "all" ? "" : value });
  };

  const handleTypeChange = (value: "all" | "income" | "expense") => {
    onFiltersChange({ ...filters, type: value });
  };

  const handleDateRangeChange = (value: FilterState["dateRange"]) => {
    onFiltersChange({ ...filters, dateRange: value });
  };

  const handleReset = () => {
    onFiltersChange({
      search: "",
      category: "",
      type: "all",
      dateRange: "month",
    });
  };

  const getDateRangeLabel = () => {
    switch (filters.dateRange) {
      case "today": return "Сегодня";
      case "week": return "Неделя";
      case "month": return "Этот месяц";
      case "year": return "Этот год";
      case "custom": return "Период";
      default: return "Все время";
    }
  };

  const getTypeLabel = () => {
    switch (filters.type) {
      case "income": return "Доходы";
      case "expense": return "Расходы";
      default: return "Все типы";
    }
  };

  const getCategoryLabel = () => {
    if (!filters.category) return "Все категории";
    const category = categoriesQuery.data?.find(cat => cat.key === filters.category);
    return category?.label || "Все категории";
  };

  return (
    <Card className="shadow-sm mb-8" data-testid="card-filters">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search and Actions Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Поиск по транзакциям..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Button
              variant="ghost"
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-reset-filters"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Сбросить
            </Button>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {/* Date Range Filter */}
            <div className="filter-chip bg-muted hover:bg-muted/80 rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer transition-all">
              <Calendar className="text-muted-foreground w-4 h-4" />
              <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="border-0 p-0 h-auto bg-transparent text-sm font-medium text-foreground" data-testid="select-date-range">
                  <SelectValue>{getDateRangeLabel()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все время</SelectItem>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="week">Неделя</SelectItem>
                  <SelectItem value="month">Этот месяц</SelectItem>
                  <SelectItem value="year">Этот год</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="filter-chip bg-muted hover:bg-muted/80 rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer transition-all">
              <Tags className="text-muted-foreground w-4 h-4" />
              <Select value={filters.category || "all"} onValueChange={handleCategoryChange}>
                <SelectTrigger className="border-0 p-0 h-auto bg-transparent text-sm font-medium text-foreground" data-testid="select-category">
                  <SelectValue>{getCategoryLabel()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categoriesQuery.data?.map((category) => (
                    <SelectItem key={category.id} value={category.key}>
                      <div className="flex items-center gap-2">
                        <i className={category.icon}></i>
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="filter-chip bg-muted hover:bg-muted/80 rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer transition-all">
              <ArrowUpDown className="text-muted-foreground w-4 h-4" />
              <Select value={filters.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="border-0 p-0 h-auto bg-transparent text-sm font-medium text-foreground" data-testid="select-type">
                  <SelectValue>{getTypeLabel()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="income">Доходы</SelectItem>
                  <SelectItem value="expense">Расходы</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Range Placeholder */}
            <Badge variant="outline" className="filter-chip bg-muted hover:bg-muted/80 px-3 py-2 flex items-center gap-2 cursor-pointer transition-all">
              <Coins className="text-muted-foreground w-4 h-4" />
              <span className="text-sm font-medium text-foreground">Любая сумма</span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
