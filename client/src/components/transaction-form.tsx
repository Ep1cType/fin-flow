import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertTransactionSchema } from "@shared/schema";
import type { Transaction, InsertTransaction } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES } from "@/lib/types";
import { z } from "zod";

const formSchema = insertTransactionSchema.extend({
  date: z.string().min(1, "Дата обязательна"),
});

type FormData = z.infer<typeof formSchema>;

interface TransactionFormProps {
  transaction?: Transaction | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TransactionForm({ 
  transaction, 
  onSuccess,
  onCancel 
}: TransactionFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: transaction ? {
      type: transaction.type,
      description: transaction.description,
      amount: parseFloat(transaction.amount),
      category: transaction.category,
      note: transaction.note || "",
      date: new Date(transaction.date).toISOString().split('T')[0],
    } : {
      type: "expense",
      description: "",
      amount: 0,
      category: "",
      note: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: InsertTransaction) => {
      await apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      toast({
        title: "Транзакция создана",
        description: "Новая транзакция была успешно добавлена",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать транзакцию",
        variant: "destructive",
      });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async (data: InsertTransaction) => {
      await apiRequest("PUT", `/api/transactions/${transaction!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      toast({
        title: "Транзакция обновлена",
        description: "Транзакция была успешно обновлена",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить транзакцию",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const transactionData: InsertTransaction = {
      ...data,
      date: new Date(data.date),
    };

    if (transaction) {
      updateTransactionMutation.mutate(transactionData);
    } else {
      createTransactionMutation.mutate(transactionData);
    }
  };

  const isLoading = createTransactionMutation.isPending || updateTransactionMutation.isPending;

  // Get categories based on transaction type
  const selectedType = form.watch("type");
  const availableCategories = Object.entries(CATEGORIES).filter(([key]) => {
    if (selectedType === "income") {
      return ["salary", "freelance", "business", "investment", "gift", "other"].includes(key);
    } else {
      return ["food", "transport", "utilities", "entertainment", "healthcare", "shopping", "education", "other"].includes(key);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Transaction Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тип транзакции</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex gap-4"
                  data-testid="radio-transaction-type"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <label htmlFor="income" className="text-sm">Доход</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <label htmlFor="expense" className="text-sm">Расход</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Введите описание..." 
                  {...field}
                  data-testid="input-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Сумма (₽)</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  data-testid="input-amount"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Категория</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableCategories.map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Дата</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field}
                  data-testid="input-date"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Заметка (необязательно)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Дополнительная информация..."
                  rows={3}
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                  data-testid="textarea-note"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={onCancel}
              disabled={isLoading}
              data-testid="button-cancel"
            >
              Отмена
            </Button>
          )}
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
  );
}
