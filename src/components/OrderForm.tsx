"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Package,
  Plus,
  Minus,
  Send,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  Carrot,
  Apple,
  LeafyGreen,
  Loader2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/components/utils/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { DateInput } from "@/components/DateInput/DateInput";
import { ProductFilter } from "@/components/ProductFilter";
import { usePedidosNav } from "@/context/PedidosNavContext";
import type { Store, Category, Product } from "@/types/product";
import type { Cart, CartItem } from "@/types/product";

interface ProductRowProps {
  product: Product;
  categoryName: string;
  cartItem?: CartItem;
  expanded: boolean;
  onToggleExpand: (id: string) => void;
  updateField: (
    id: string,
    field: keyof CartItem,
    value: number | boolean,
  ) => void;
  handleInputChange: (
    id: string,
    field: "quantity" | "currentStock",
    value: string,
  ) => void;
  getProductIcon: (categoryName: string) => React.ReactNode;
}

const ProductRow = React.memo(
  ({
    product,
    categoryName,
    cartItem,
    expanded,
    onToggleExpand,
    updateField,
    handleInputChange,
    getProductIcon,
  }: ProductRowProps) => {
    const hasCDStock = (product.stockCD ?? 0) > 0;
    const confirmed = cartItem?.confirmed ?? false;

    return (
      <Card
        variant="default"
        padding="sm"
        className={cn(
          "bg-card rounded-xl flex flex-col gap-3 transition-colors border-2",
          hasCDStock && !confirmed && "border-primary",
          confirmed && "border-success bg-success/10",
          !hasCDStock &&
            !confirmed &&
            "border-border hover:border-foreground/30",
        )}
        onClick={() => onToggleExpand(product.id)}
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 flex items-center justify-center rounded-md bg-muted shrink-0">
            {getProductIcon(categoryName)}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground whitespace-normal leading-tight text-sm lg:text-base">
              {product.name}
            </h3>
          </div>

          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shrink-0",
              hasCDStock
                ? "bg-primary/10 border-primary/20"
                : "bg-card border-border",
            )}
          >
            <Package
              className={cn(
                "h-3.5 w-3.5",
                hasCDStock ? "text-primary" : "text-muted-foreground",
              )}
            />
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              CD:
            </span>
            <span
              className={cn(
                "text-xs font-bold",
                hasCDStock ? "text-primary" : "text-muted-foreground",
              )}
            >
              {product.stockCD ?? 0}
            </span>
          </div>

          <Button
            type="button"
            variant={confirmed ? "default" : "ghost"}
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              updateField(product.id, "confirmed", !confirmed);
            }}
            className={cn(
              "h-11 w-11 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0",
              confirmed
                ? "bg-success text-success-foreground hover:bg-success/90"
                : "border-2 border-border bg-card text-muted-foreground hover:border-success hover:bg-success/10 hover:text-success",
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>

          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform shrink-0",
              expanded && "rotate-180",
            )}
          />
        </div>

        {expanded && (
          <div className="flex flex-col gap-4 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border w-fit">
              <Package
                className={cn(
                  "h-3.5 w-3.5",
                  hasCDStock ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Estoque CD:
              </span>
              <span
                className={cn(
                  "text-xs font-bold",
                  hasCDStock ? "text-primary" : "text-muted-foreground",
                )}
              >
                {product.stockCD ?? 0}
              </span>
            </div>

            <div className="flex flex-col items-end sm:items-baseline sm:flex-row gap-4">
              <div className="flex-1">
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wide mb-2">
                  Estoque Atual
                </span>
                <div className="flex items-center gap-1 rounded-md border border-border bg-muted p-1 w-fit">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateField(product.id, "currentStock", -1);
                    }}
                    className="h-11 w-11 rounded-md hover:bg-surface-hover active:scale-95 transition-transform text-foreground"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={
                      (cartItem?.currentStock ?? 0) > 0
                        ? cartItem?.currentStock
                        : ""
                    }
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleInputChange(
                        product.id,
                        "currentStock",
                        e.target.value,
                      )
                    }
                    placeholder="0"
                    className="w-14 h-11 bg-transparent border-0 text-center text-lg font-bold tabular-nums text-foreground focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateField(product.id, "currentStock", 1);
                    }}
                    className="h-11 w-11 rounded-md hover:bg-surface-hover active:scale-95 transition-transform text-foreground"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1">
                <span className="block text-xs text-primary uppercase font-bold tracking-wide mb-2">
                  Pedir Agora
                </span>
                <div className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 p-1 w-fit">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateField(product.id, "quantity", -1);
                    }}
                    className="h-11 w-11 rounded-md hover:bg-primary/15 active:scale-95 transition-transform text-primary"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={
                      (cartItem?.quantity ?? 0) > 0 ? cartItem?.quantity : ""
                    }
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleInputChange(product.id, "quantity", e.target.value)
                    }
                    placeholder="0"
                    className="w-14 h-11 bg-transparent border-0 text-center text-lg font-bold tabular-nums text-foreground focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateField(product.id, "quantity", 1);
                    }}
                    className="h-11 w-11 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  },
);

ProductRow.displayName = "ProductRow";

function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0] || "";
}

interface OrderFormProps {
  store: Store;
  onBack: () => void;
}

const DRAFT_KEY = "order_form_draft";

interface Draft {
  storeId: string;
  cart: Cart;
  orderDate: string;
  isReviewing: boolean;
  expandedProducts: string[];
  filter: { search: string; categoryId: string | null };
  scrollY: number;
}

function saveDraft(storeId: string, data: Omit<Draft, "storeId">) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ storeId, ...data }));
  } catch {
    /* quota exceeded */
  }
}

function loadDraft(storeId: string): Partial<Draft> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed: Draft = JSON.parse(raw);
    if (parsed.storeId !== storeId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function OrderForm({ store, onBack }: OrderFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [orderDate, setOrderDate] = useState<string>(getTomorrowDate());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attentionAcknowledged, setAttentionAcknowledged] = useState(false);
  const [filter, setFilter] = useState<{
    search: string;
    categoryId: string | null;
  }>({ search: "", categoryId: null });

  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set(),
  );

  const { registerDepartments, clearDepartments } = usePedidosNav();

  const toggleExpanded = useCallback((id: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      const draft = loadDraft(store.id);
      if (draft) {
        setCart(draft.cart || {});
        if (draft.orderDate) setOrderDate(draft.orderDate);
        if (draft.isReviewing) setIsReviewing(true);
        if (draft.expandedProducts)
          setExpandedProducts(new Set(draft.expandedProducts));
        if (draft.filter) setFilter(draft.filter);
      }

      try {
        const categoriesData = await api.getCategories();
        const order = ["Legumes", "Frutas", "Verduras"];
        const sorted = [...(categoriesData || [])].sort((a, b) => {
          const idxA = order.indexOf(a.name);
          const idxB = order.indexOf(b.name);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });
        setCategories(sorted);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [store.id]);

  useEffect(() => {
    if (isLoading) return;
    const restoredScrollY = loadDraft(store.id)?.scrollY;
    if (restoredScrollY) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: restoredScrollY, behavior: "instant" });
      });
    }
  }, [isLoading, store.id]);

  useEffect(() => {
    if (isLoading || isReviewing || isSuccess || categories.length === 0) {
      clearDepartments();
      return;
    }

    registerDepartments(
      categories.map((cat) => ({ id: cat.id, name: cat.name })),
      filter.categoryId,
      (categoryId) => {
        setFilter((prev) => ({ ...prev, categoryId }));
        requestAnimationFrame(() => {
          document
            .getElementById("pedidos-catalog")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      },
    );

    return () => clearDepartments();
  }, [
    isLoading,
    isReviewing,
    isSuccess,
    categories,
    filter.categoryId,
    registerDepartments,
    clearDepartments,
  ]);

  useEffect(() => {
    if (isSuccess || isLoading) return;
    const timer = setTimeout(() => {
      const enriched: Cart = {};
      for (const [id, item] of Object.entries(cart)) {
        if (item.productName) {
          enriched[id] = item;
        } else {
          let name = "";
          for (const cat of categories) {
            const p = cat.products?.find((pr) => pr.id === id);
            if (p) {
              name = p.name;
              break;
            }
          }
          enriched[id] = { ...item, productName: name || undefined };
        }
      }
      saveDraft(store.id, {
        cart: enriched,
        orderDate,
        isReviewing,
        expandedProducts: [...expandedProducts],
        filter,
        scrollY: window.scrollY,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [
    cart,
    orderDate,
    isReviewing,
    expandedProducts,
    filter,
    store.id,
    isSuccess,
    isLoading,
    categories,
  ]);

  const updateField = React.useCallback(
    (id: string, field: keyof CartItem, value: number | boolean) => {
      setCart((prev) => {
        const current = prev[id] || {
          productId: id,
          quantity: 0,
          currentStock: 0,
        };
        if (typeof value === "boolean") {
          if (value === true) {
            setAttentionAcknowledged(false);
          }
          return { ...prev, [id]: { ...current, [field]: value } };
        }
        const nextValue = Math.max(
          0,
          ((current[field] as number) || 0) + value,
        );
        return { ...prev, [id]: { ...current, [field]: nextValue } };
      });
    },
    [],
  );

  const handleInputChange = React.useCallback(
    (id: string, field: "quantity" | "currentStock", value: string) => {
      const cleaned = value.replace(/^0+(?!$)/, "");
      const nextValue =
        cleaned === "" ? 0 : Math.max(0, parseInt(cleaned) || 0);
      setCart((prev) => {
        const current = prev[id] || {
          productId: id,
          quantity: 0,
          currentStock: 0,
        };
        return {
          ...prev,
          [id]: { ...current, [field]: nextValue, [`${field}Raw`]: cleaned },
        };
      });
    },
    [],
  );

  const handleSubmit = async () => {
    setError(null);

    const itemsWithReview = Object.entries(cart)
      .filter(([_, data]) => data.needsReview === true)
      .map(([productId]) => productId);

    if (itemsWithReview.length > 0 && !attentionAcknowledged) {
      const productNames = itemsWithReview
        .map((id) => {
          for (const cat of categories) {
            const product = cat.products?.find((p) => p.id === id);
            if (product) return product.name;
          }
          return String(id);
        })
        .join(", ");
      setError(`Produto(s) em atenção precisam ser revisados: ${productNames}`);
      setAttentionAcknowledged(false);
      return;
    }

    const orderItems = Object.entries(cart)
      .filter(
        ([_, data]) =>
          (Number(data.quantity) || 0) > 0 ||
          (Number(data.currentStock) || 0) > 0,
      )
      .map(([productId, data]) => ({
        productId,
        quantity: Number(data.quantity) || 0,
        currentStock: Number(data.currentStock) || 0,
      }));

    if (orderItems.length === 0) {
      setError(
        "Escolha pelo menos um item para o pedido ou informe o estoque.",
      );
      return;
    }

    if (!isReviewing) {
      setIsReviewing(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        storeId: store.id,
        items: orderItems,
        orderDate: orderDate,
      };

      await api.createOrder(orderData);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error("Erro na submissão:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setIsSubmitting(false);
    }
  };

  const totalItems = Object.values(cart).reduce(
    (a, b) => a + (b.quantity || 0),
    0,
  );

  const hasItems = Object.values(cart).some(
    (item) => (item.quantity || 0) > 0 || (item.currentStock || 0) > 0,
  );

  const getIconForCategory = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("legume"))
      return <Carrot className="h-5 w-5 text-orange-500" />;
    if (lowerName.includes("fruta"))
      return <Apple className="h-5 w-5 text-destructive" />;
    if (lowerName.includes("tempero") || lowerName.includes("verdura"))
      return <LeafyGreen className="h-5 w-5 text-green-500" />;
    return <Package className="h-5 w-5 text-blue-500" />;
  };

  const getProductIcon = React.useCallback((categoryName: string) => {
    const lowerName = categoryName.toLowerCase();
    if (lowerName.includes("legume")) return <Carrot className="h-6 w-6" />;
    if (lowerName.includes("fruta")) return <Apple className="h-6 w-6" />;
    return <LeafyGreen className="h-6 w-6" />;
  }, []);

  const filteredProducts = useMemo(() => {
    let result: Product[] = [];
    for (const cat of categories) {
      if (filter.categoryId && cat.id !== filter.categoryId) continue;

      const filtered =
        cat.products?.filter((p) =>
          p.name.toLowerCase().includes(filter.search.toLowerCase()),
        ) || [];
      result.push(...filtered);
    }
    return result;
  }, [categories, filter]);

  const totalProductCount = useMemo(() => {
    return categories.reduce(
      (sum, cat) => sum + (cat.products?.length || 0),
      0,
    );
  }, [categories]);

  const getCategoryName = React.useCallback(
    (productId: string) => {
      for (const cat of categories) {
        if (cat.products?.find((p) => p.id === productId)) {
          return cat.name;
        }
      }
      return "";
    },
    [categories],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Carregando lista de produtos...
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-slide-up">
        <div className="h-20 w-20 bg-success/10 text-success flex items-center justify-center rounded-full mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Pedido Enviado!</h2>
        <p className="text-muted-foreground mb-8">
          Seu pedido para a <strong>{store.name}</strong> foi processado com
          sucesso.
        </p>
        <Button onClick={onBack} variant="default" className="px-8">
          Novo Pedido
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full bg-background mx-auto p-4 animate-slide-up">
        {/* Error Alert */}
        {error && (
          <div className="fixed bottom-24 left-4 right-4 z-[130] animate-slide-up">
            <div className="flex items-center gap-3 rounded-lg border border-destructive bg-destructive px-4 py-3 text-destructive-foreground shadow-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm flex-1">{error}</span>
              <button
                onClick={() => {
                  setAttentionAcknowledged(true);
                  setError(null);
                }}
                className="shrink-0 rounded-md bg-destructive-foreground/15 px-3 py-2 text-xs font-bold hover:bg-destructive-foreground/25 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-4">
          <Button
            onClick={isReviewing ? () => setIsReviewing(false) : onBack}
            variant="ghost"
            size="icon"
            className="rounded-full bg-secondary/10 text-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isReviewing ? "Revisar Pedido" : store.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isReviewing
                ? "Confirme os itens selecionados"
                : "Novo Pedido de Compra"}
            </p>
          </div>
        </div>
        <div className="text-center mt-8">
          <h2 className="w-full text-2xl font-bold text-foreground">
            Pedido de compras
          </h2>
          <p className="text-sm text-muted-foreground mb-6 px-4">
            Selecione os produtos e as quantidades desejadas para criar um novo
            pedido de compra para a <strong>{store.name}</strong>. Você poderá
            revisar seu pedido antes de enviar.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {!isReviewing && (
            <Card
              variant="default"
              padding="sm"
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground font-medium">
                  Data do Pedido:
                </span>
              </div>
              <DateInput
                value={orderDate}
                onChange={setOrderDate}
                min={getTomorrowDate()}
              />
            </Card>
          )}

          {isReviewing ? (
            <div className="space-y-6 pb-32">
              <Card variant="default" padding="lg" className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Resumo do Pedido
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(orderDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {(() => {
                    const productsInCart = categories
                      .flatMap((c) => c.products || [])
                      .filter(
                        (p) =>
                          (cart[p.id]?.quantity || 0) > 0 ||
                          (cart[p.id]?.currentStock || 0) > 0,
                      )
                      .map((p) => ({ id: p.id, name: p.name }));
                    const missingIds = Object.entries(cart)
                      .filter(
                        ([id, item]) =>
                          !productsInCart.find((p) => p.id === id) &&
                          ((item.quantity || 0) > 0 ||
                            (item.currentStock || 0) > 0),
                      )
                      .map(([id, item]) => ({
                        id,
                        name: item.productName || id,
                      }));
                    const allProducts = [...productsInCart, ...missingIds];
                    return allProducts.map((product) => {
                      const item = cart[product.id];
                      return (
                        <div
                          key={product.id}
                          className="flex items-center justify-between py-3 border-b border-border last:border-0 group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                              {product.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-6">
                            {(item?.currentStock ?? 0) > 0 && (
                              <div className="text-right">
                                <p className="text-[9px] uppercase font-bold text-muted-foreground">
                                  Estoque
                                </p>
                                <p className="text-sm font-mono text-muted-foreground">
                                  {item?.currentStock ?? 0}
                                </p>
                              </div>
                            )}
                            <div className="text-right min-w-[60px]">
                              <p className="text-[9px] uppercase font-bold text-primary">
                                Pedido
                              </p>
                              <p className="text-sm font-mono text-foreground font-black">
                                {item?.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </Card>

              <Button
                onClick={() => setIsReviewing(false)}
                variant="outline"
                className="w-full h-12 border-border text-foreground hover:bg-card"
              >
                Voltar ao Catálogo
              </Button>
            </div>
          ) : (
            <div id="pedidos-catalog" className="relative space-y-4 pb-32 scroll-mt-20">
              <ProductFilter
                categories={categories}
                selectedCategory={filter.categoryId}
                searchTerm={filter.search}
                filteredCount={filteredProducts.length}
                totalCount={totalProductCount}
                onCategoryChange={(categoryId) =>
                  setFilter({ ...filter, categoryId })
                }
                onSearchChange={(search) => setFilter({ ...filter, search })}
                onClear={() => setFilter({ search: "", categoryId: null })}
              />

              <div className="relative flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium">
                    {Object.values(cart).filter((i) => i.confirmed).length} /{" "}
                    {Object.keys(cart).length} conferidos
                  </span>

                  <Button
                    onClick={() => {
                      setCart((prev) => {
                        const next = { ...prev };
                        for (const id of Object.keys(next)) {
                          next[id] = {
                            ...next[id]!,
                            confirmed: true,
                          } as CartItem;
                        }
                        return next;
                      });
                    }}
                    disabled={Object.keys(cart).length === 0}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Conferir Todos
                  </Button>

                  <Button
                    onClick={() => setCart({})}
                    disabled={Object.keys(cart).length === 0}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Limpar Pedido Completo
                  </Button>
                </div>

                {filteredProducts.length === 0 ? (
                  <Card
                    variant="default"
                    padding="lg"
                    className="rounded-xl  text-center"
                  >
                    <p className="text-muted-foreground text-sm">
                      Nenhum produto encontrado com os filtros selecionados.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        categoryName={getCategoryName(product.id)}
                        cartItem={cart[product.id]}
                        expanded={expandedProducts.has(product.id)}
                        onToggleExpand={toggleExpanded}
                        updateField={updateField}
                        handleInputChange={handleInputChange}
                        getProductIcon={getProductIcon}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {hasItems && (
        <div className="fixed bottom-24 left-0 right-0 px-4 flex justify-center z-[80] md:bottom-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full max-w-sm h-16 rounded-lg font-bold shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <div className="flex items-center justify-between w-full px-4">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-black bg-primary-foreground/20 tabular-nums">
                    {totalItems}
                  </div>
                  <span>{isReviewing ? "Confirmar e Enviar" : "Revisar Pedido"}</span>
                </div>
                <Send className="h-5 w-5" />
              </div>
            )}
          </Button>
        </div>
      )}
    </>
  );
}
