"use client";

import { editorTouchSm } from "@/components/editor/editorUi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  canFulfillmentEdit,
  getStockIssue,
  StockIssue,
} from "@/lib/orderStockStatus";
import { DrinkOrder, Order, Product } from "@/types";
import { AlertTriangle, PackageX, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type FulfillmentOrder = Order | DrinkOrder;

interface EditableLine {
  productId: string;
  product: Product;
  quantity: number;
}

interface OrderFulfillmentDialogProps {
  order: FulfillmentOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (items: Array<{ product: string; quantity: number }>) => Promise<void>;
  isSaving?: boolean;
}

function getIssueBadgeClass(issue: StockIssue): string {
  switch (issue) {
    case "unavailable":
      return "bg-red-100 text-red-800";
    case "insufficient":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-green-100 text-green-800";
  }
}

function StockStatusBadge({
  issue,
  label,
}: {
  issue: StockIssue;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap ${getIssueBadgeClass(issue)}`}
    >
      {issue === "unavailable" && <PackageX className="h-3 w-3 shrink-0" />}
      {label}
    </span>
  );
}

interface FulfillmentLineProps {
  line: EditableLine;
  editable: boolean;
  onQuantityChange: (productId: string, rawValue: string) => void;
  onRemoveLine: (productId: string) => void;
  t: (key: string) => string;
}

function FulfillmentLineMobile({
  line,
  editable,
  onQuantityChange,
  onRemoveLine,
  t,
}: FulfillmentLineProps) {
  const issue = getStockIssue(line.product, line.quantity);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 leading-snug min-w-0 flex-1">
          {line.product.name}
        </p>
        <StockStatusBadge issue={issue} label={t(`issue.${issue}`)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[11px] text-gray-500">{t("orderedQty")}</Label>
          {editable ? (
            <Input
              type="number"
              min={1}
              inputMode="numeric"
              value={line.quantity}
              onChange={(event) =>
                onQuantityChange(line.productId, event.target.value)
              }
              className="h-11 sm:h-9 text-base sm:text-sm"
            />
          ) : (
            <p className="text-sm font-medium tabular-nums">{line.quantity}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-gray-500">
            {t("warehouseStock")}
          </Label>
          <p className="text-sm font-medium tabular-nums pt-2 sm:pt-0">
            {line.product.amount} {line.product.unit}
          </p>
        </div>
      </div>

      {editable && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`${editorTouchSm} w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700`}
          onClick={() => onRemoveLine(line.productId)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {t("remove")}
        </Button>
      )}
    </div>
  );
}

export default function OrderFulfillmentDialog({
  order,
  open,
  onOpenChange,
  onSave,
  isSaving = false,
}: OrderFulfillmentDialogProps) {
  const t = useTranslations("editor.fulfillment");
  const [lines, setLines] = useState<EditableLine[]>([]);

  useEffect(() => {
    if (!open || !order) {
      return;
    }

    setLines(
      order.items
        .filter((item) => item.product && typeof item.product === "object")
        .map((item) => ({
          productId: item.product._id,
          product: item.product,
          quantity: item.quantity,
        })),
    );
  }, [open, order]);

  const issueCounts = useMemo(() => {
    return lines.reduce(
      (acc, line) => {
        const issue = getStockIssue(line.product, line.quantity);
        if (issue !== "ok") {
          acc[issue] += 1;
        }
        return acc;
      },
      { unavailable: 0, insufficient: 0 },
    );
  }, [lines]);

  const handleQuantityChange = (productId: string, rawValue: string) => {
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return;
    }

    setLines((current) =>
      current.map((line) =>
        line.productId === productId ? { ...line, quantity: parsed } : line,
      ),
    );
  };

  const handleRemoveLine = (productId: string) => {
    setLines((current) => current.filter((line) => line.productId !== productId));
  };

  const handleSave = async () => {
    if (!order || lines.length === 0) {
      return;
    }

    await onSave(
      lines.map((line) => ({
        product: line.productId,
        quantity: line.quantity,
      })),
    );
  };

  if (!order) {
    return null;
  }

  const editable = canFulfillmentEdit(order.status);
  const lineProps = {
    editable,
    onQuantityChange: handleQuantityChange,
    onRemoveLine: handleRemoveLine,
    t,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-4xl max-h-[min(92dvh,900px)] overflow-hidden flex flex-col p-4 sm:p-6 gap-0">
        <DialogHeader className="shrink-0 pb-3 sm:pb-4">
          <DialogTitle className="text-base sm:text-xl leading-snug pr-6">
            {t("title", { orderNumber: order.orderNumber })}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 min-h-0 -mx-1 px-1">
          <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2 text-sm">
            <div className="min-w-0 col-span-2 sm:col-span-1">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">
                {t("branch")}
              </p>
              <p className="font-medium truncate">{order.branch}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">
                {t("worker")}
              </p>
              <p className="font-medium truncate">{order.worker.username}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">
                {t("status")}
              </p>
              <p className="font-medium capitalize">{order.status}</p>
            </div>
          </div>

          {(issueCounts.unavailable > 0 || issueCounts.insufficient > 0) && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs sm:text-sm text-amber-900 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="leading-relaxed">{t("stockWarning")}</p>
            </div>
          )}

          {lines.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 text-center text-sm text-gray-500 py-10 px-4">
              {t("noItems")}
            </div>
          ) : (
            <>
              <div className="lg:hidden space-y-2.5">
                {lines.map((line) => (
                  <FulfillmentLineMobile
                    key={line.productId}
                    line={line}
                    {...lineProps}
                  />
                ))}
              </div>

              <div className="hidden lg:block overflow-x-auto border border-gray-200 rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t("product")}</TableHead>
                      <TableHead className="text-xs">{t("orderedQty")}</TableHead>
                      <TableHead className="text-xs">
                        {t("warehouseStock")}
                      </TableHead>
                      <TableHead className="text-xs">{t("stockStatus")}</TableHead>
                      {editable && (
                        <TableHead className="text-xs text-right">
                          {t("actions")}
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => {
                      const issue = getStockIssue(line.product, line.quantity);

                      return (
                        <TableRow key={line.productId}>
                          <TableCell className="text-sm font-medium max-w-[220px]">
                            <span className="line-clamp-2">{line.product.name}</span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {editable ? (
                              <Input
                                type="number"
                                min={1}
                                value={line.quantity}
                                onChange={(event) =>
                                  handleQuantityChange(
                                    line.productId,
                                    event.target.value,
                                  )
                                }
                                className="h-9 w-24"
                              />
                            ) : (
                              line.quantity
                            )}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums whitespace-nowrap">
                            {line.product.amount} {line.product.unit}
                          </TableCell>
                          <TableCell>
                            <StockStatusBadge
                              issue={issue}
                              label={t(`issue.${issue}`)}
                            />
                          </TableCell>
                          {editable && (
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRemoveLine(line.productId)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                {t("remove")}
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        {editable && (
          <DialogFooter className="shrink-0 pt-4 mt-2 border-t border-gray-100 flex-col-reverse sm:flex-row gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className={`${editorTouchSm} w-full sm:w-auto`}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || lines.length === 0}
              className={`${editorTouchSm} w-full sm:w-auto`}
            >
              {isSaving ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
