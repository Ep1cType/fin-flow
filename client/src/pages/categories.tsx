import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCategorySchema, type Category, type InsertCategory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = insertCategorySchema.extend({
  key: z.string().min(1, "Ключ обязателен").regex(/^[a-zA-Z0-9_-]+$/, "Ключ может содержать только буквы, цифры, тире и подчеркивания"),
  label: z.string().min(1, "Название обязательно"),
  icon: z.string().min(1, "Иконка обязательна"),
  color: z.string().min(1, "Цвет обязателен"),
  type: z.enum(["income", "expense", "both"]),
});

type FormData = z.infer<typeof formSchema>;

interface CategoryModalProps {
  category?: Category | null;
  onClose: () => void;
}

function CategoryModal({ category, onClose }: CategoryModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: category ? {
      key: category.key,
      label: category.label,
      icon: category.icon,
      color: category.color,
      type: category.type,
      isDefault: category.isDefault,
    } : {
      key: "",
      label: "",
      icon: "fas fa-circle",
      color: "bg-blue-100 text-blue-800",
      type: "expense",
      isDefault: "false",
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      await apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Категория создана",
        description: "Новая категория была успешно добавлена",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать категорию",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      await apiRequest("PUT", `/api/categories/${category!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Категория обновлена",
        description: "Категория была успешно обновлена",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить категорию",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (category) {
      updateCategoryMutation.mutate(data);
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const isLoading = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  const colorOptions = [
    { value: "bg-red-100 text-red-800", label: "Красный" },
    { value: "bg-orange-100 text-orange-800", label: "Оранжевый" },
    { value: "bg-yellow-100 text-yellow-800", label: "Жёлтый" },
    { value: "bg-green-100 text-green-800", label: "Зелёный" },
    { value: "bg-blue-100 text-blue-800", label: "Синий" },
    { value: "bg-indigo-100 text-indigo-800", label: "Индиго" },
    { value: "bg-purple-100 text-purple-800", label: "Фиолетовый" },
    { value: "bg-pink-100 text-pink-800", label: "Розовый" },
    { value: "bg-gray-100 text-gray-800", label: "Серый" },
  ];

  const iconOptions = [
    { value: "fas fa-circle", label: "Круг" },
    { value: "fas fa-shopping-cart", label: "Корзина покупок" },
    { value: "fas fa-home", label: "Дом" },
    { value: "fas fa-car", label: "Автомобиль" },
    { value: "fas fa-gamepad", label: "Игры" },
    { value: "fas fa-medkit", label: "Медицина" },
    { value: "fas fa-graduation-cap", label: "Образование" },
    { value: "fas fa-money-bill-wave", label: "Деньги" },
    { value: "fas fa-briefcase", label: "Портфель" },
    { value: "fas fa-chart-line", label: "График" },
    { value: "fas fa-gift", label: "Подарок" },
    { value: "fas fa-question-circle", label: "Вопрос" },
  ];

  return (
    <DialogContent className="sm:max-w-md" data-testid="modal-category">
      <DialogHeader>
        <DialogTitle>
          {category ? "Редактировать категорию" : "Добавить категорию"}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Key */}
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ключ категории</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="my-category" 
                    {...field}
                    disabled={!!category} // Не разрешаем менять ключ для существующих категорий
                    data-testid="input-category-key"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Label */}
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Моя категория" 
                    {...field}
                    data-testid="input-category-label"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип категории</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-4"
                    data-testid="radio-category-type"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="income" id="income" />
                      <Label htmlFor="income" className="text-sm">Доходы</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="expense" id="expense" />
                      <Label htmlFor="expense" className="text-sm">Расходы</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both" className="text-sm">Оба</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Icon */}
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Иконка</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger data-testid="select-category-icon">
                      <SelectValue placeholder="Выберите иконку" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {iconOptions.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <i className={value}></i>
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Color */}
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Цвет</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger data-testid="select-category-color">
                      <SelectValue placeholder="Выберите цвет" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colorOptions.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Badge className={value}>{label}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
              data-testid="button-cancel"
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
              data-testid="button-save"
            >
              {isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}

export default function Categories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense" | "both">("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Категория удалена",
        description: "Категория была успешно удалена",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить категорию. Возможно, это категория по умолчанию.",
        variant: "destructive",
      });
    },
  });

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить эту категорию?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "income": return "Доходы";
      case "expense": return "Расходы";
      case "both": return "Оба";
      default: return type;
    }
  };

  const filteredCategories = categoriesQuery.data?.filter(category => {
    if (filterType === "all") return true;
    return category.type === filterType || category.type === "both";
  }) || [];

  if (categoriesQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Settings className="text-primary w-6 h-6" />
                <h1 className="text-xl font-semibold text-foreground">Настройка категорий</h1>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Загрузка категорий...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Settings className="text-primary w-6 h-6" />
              <h1 className="text-xl font-semibold text-foreground">Настройка категорий</h1>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-add-category"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить категорию
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <Card className="shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
                data-testid="filter-all"
              >
                Все категории
              </Button>
              <Button
                variant={filterType === "income" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("income")}
                data-testid="filter-income"
              >
                Доходы
              </Button>
              <Button
                variant={filterType === "expense" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("expense")}
                data-testid="filter-expense"
              >
                Расходы
              </Button>
              <Button
                variant={filterType === "both" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("both")}
                data-testid="filter-both"
              >
                Универсальные
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <Card className="shadow-sm" data-testid="card-categories">
          <CardHeader>
            <CardTitle>Категории ({filteredCategories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Категории не найдены
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                  <Card key={category.id} className="hover:shadow-md transition-shadow" data-testid={`category-card-${category.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-lg">
                            <i className={category.icon}></i>
                          </div>
                          <div>
                            <p className="font-medium" data-testid={`category-label-${category.id}`}>{category.label}</p>
                            <Badge 
                              className={`${category.color} text-xs`}
                              data-testid={`category-type-${category.id}`}
                            >
                              {getTypeLabel(category.type)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            data-testid={`button-edit-${category.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {category.isDefault !== "true" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={deleteCategoryMutation.isPending}
                              data-testid={`button-delete-${category.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {category.isDefault === "true" && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Категория по умолчанию
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Category Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <CategoryModal
          category={editingCategory}
          onClose={handleCloseModal}
        />
      </Dialog>
    </div>
  );
}