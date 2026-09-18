"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InventoryProductFilters,
  InventoryStatusFilter,
  ProductCategory,
} from "@/types";
import { useTranslations } from "next-intl";

interface InventoryFiltersProps {
  filters: InventoryProductFilters;
  onChange: (filters: InventoryProductFilters) => void;
}

const CATEGORIES: ProductCategory[] = [
  "store-supplies",
  "food-products",
  "frozen-products",
  "main-products",
  "desserts",
  "drinks",
  "beverages",
  "packaging-materials",
  "cleaning-materials",
  "vegetables",
  "others",
];

export default function InventoryFilters({
  filters,
  onChange,
}: InventoryFiltersProps) {
  const t = useTranslations("inventory");

  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_220px_180px]">
      <Input
        value={filters.search ?? ""}
        onChange={(event) =>
          onChange({ ...filters, search: event.target.value, page: 1 })
        }
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
        className="h-11 sm:h-10"
      />
      <Select
        value={filters.category ?? "all"}
        onValueChange={(category) =>
          onChange({
            ...filters,
            category: category as ProductCategory | "all",
            page: 1,
          })
        }
      >
        <SelectTrigger className="h-11 sm:h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allCategories")}</SelectItem>
          {CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category.replaceAll("-", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.status ?? "all"}
        onValueChange={(status) =>
          onChange({
            ...filters,
            status: status as InventoryStatusFilter,
            page: 1,
          })
        }
      >
        <SelectTrigger className="h-11 sm:h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allStatuses")}</SelectItem>
          <SelectItem value="uninitialized">{t("notCounted")}</SelectItem>
          <SelectItem value="available">{t("available")}</SelectItem>
          <SelectItem value="low">{t("low")}</SelectItem>
          <SelectItem value="out">{t("out")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
