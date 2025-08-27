import { useState } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Search, RefreshCw, Calendar, Tags, ArrowUpDown, Coins, Filter } from "lucide-react";
import type { FilterState } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

interface FiltersSearchProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function FiltersSearch({ filters, onFiltersChange }: FiltersSearchProps) {
  const [isAmountFilterOpen, setIsAmountFilterOpen] = useState(false);
  const [tempMinAmount, setTempMinAmount] = useState(filters.minAmount?.toString() || "");
  const [tempMaxAmount, setTempMaxAmount] = useState(filters.maxAmount?.toString() || "");

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

  const handleAmountFilterApply = () => {
    const minAmount = tempMinAmount ? parseFloat(tempMinAmount) : undefined;
    const maxAmount = tempMaxAmount ? parseFloat(tempMaxAmount) : undefined;
    
    onFiltersChange({
      ...filters,
      minAmount: minAmount && minAmount > 0 ? minAmount : undefined,
      maxAmount: maxAmount && maxAmount > 0 ? maxAmount : undefined,
    });
    setIsAmountFilterOpen(false);
  };

  const handleAmountFilterReset = () => {
    setTempMinAmount("");
    setTempMaxAmount("");
    onFiltersChange({
      ...filters,
      minAmount: undefined,
      maxAmount: undefined,
    });
    setIsAmountFilterOpen(false);
  };

  const handleReset = () => {
    setTempMinAmount("");
    setTempMaxAmount("");
    onFiltersChange({
      search: "",
      category: "",
      type: "all",
      dateRange: "month",
      minAmount: undefined,
      maxAmount: undefined,
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
    return CATEGORIES[filters.category as keyof typeof CATEGORIES]?.label || "Все категории";
  };

  const getAmountLabel = () => {
    if (filters.minAmount || filters.maxAmount) {
      const min = filters.minAmount ? `от ${filters.minAmount}₽` : "";
      const max = filters.maxAmount ? `до ${filters.maxAmount}₽` : "";
      return `${min} ${max}`.trim();
    }
    return "Любая сумма";
  };

  const hasActiveFilters = filters.search || filters.category || filters.type !== "all" || 
    filters.dateRange !== "month" || filters.minAmount || filters.maxAmount;

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
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  Фильтры активны
                </Badge>
              )}
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
                  {Object.entries(CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      {category.label}
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

            {/* Amount Range Filter */}
            <Popover open={isAmountFilterOpen} onOpenChange={setIsAmountFilterOpen}>
              <PopoverTrigger asChild>
                <div className="filter-chip bg-muted hover:bg-muted/80 rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer transition-all" data-testid="button-amount-filter">
                  <Coins className="text-muted-foreground w-4 h-4" />
                  <span className="text-sm font-medium text-foreground">{getAmountLabel()}</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Фильтр по сумме</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="min-amount" className="text-xs">От (₽)</Label>
                      <Input
                        id="min-amount"
                        type="number"
                        placeholder="Мин."
                        value={tempMinAmount}
                        onChange={(e) => setTempMinAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        data-testid="input-min-amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-amount" className="text-xs">До (₽)</Label>
                      <Input
                        id="max-amount"
                        type="number"
                        placeholder="Макс."
                        value={tempMaxAmount}
                        onChange={(e) => setTempMaxAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        data-testid="input-max-amount"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAmountFilterReset}
                      className="flex-1"
                      data-testid="button-reset-amount"
                    >
                      Сбросить
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAmountFilterApply}
                      className="flex-1"
                      data-testid="button-apply-amount"
                    >
                      Применить
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
