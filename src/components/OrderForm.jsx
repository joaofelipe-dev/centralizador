"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Minus,
  Send,
  CheckCircle2,
  ChevronLeft,
  Carrot,
  Apple,
  LeafyGreen,
  Loader2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/Button/Button";
import { api } from "@/lib/api";
import { DateInput } from "@/components/DateInput/DateInput";

const ProductRow = React.memo(
  ({
    product,
    categoryName,
    cartItem,
    updateField,
    handleInputChange,
    getProductIcon,
  }) => (
    <div className={`glass-card p-4 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all hover:border-white/10 group ${cartItem?.needsReview ? 'border-red-500/50 bg-red-500/5' : ''}`}>
      <div className="flex items-center gap-4 flex-1">
        <button
          type="button"
          onClick={() => updateField(product.id, "needsReview", !cartItem?.needsReview)}
          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
            cartItem?.needsReview 
              ? 'border-red-500 bg-red-500 text-white' 
              : 'border-white/20 hover:border-red-500/50'
          }`}
        >
          {cartItem?.needsReview && <AlertCircle className="h-4 w-4" />}
        </button>
        <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
          {getProductIcon(categoryName)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white group-hover:text-primary transition-colors whitespace-normal break-words leading-tight">
            {product.name}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-center w-full lg:w-[120px] px-3 py-2 lg:py-0 rounded-lg bg-white/5 lg:bg-transparent">
        <span className="text-[10px] lg:hidden text-muted-foreground uppercase font-bold tracking-wider">
          Estoque CD
        </span>
        <div className="flex items-center gap-1 min-w-[60px] justify-center">
          <Package className="h-3.5 w-3.5 text-primary/50" />
          <span className="text-sm font-bold text-primary">{product.stock ?? 0}</span>
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-center w-full lg:w-[160px]">
        <span className="text-[10px] lg:hidden text-muted-foreground uppercase font-bold tracking-wider">
          Estoque Atual
        </span>
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 shadow-inner">
          <button
            onClick={() => updateField(product.id, "currentStock", -1)}
            className="h-8 w-8 lg:h-10 lg:w-10 flex items-center justify-center rounded-lg hover:bg-white/10 active:scale-90 transition-all text-muted-foreground hover:text-white"
          >
            <Minus className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={cartItem?.currentStockRaw ?? cartItem?.currentStock ?? ''}
            onChange={(e) =>
              handleInputChange(product.id, "currentStock", e.target.value)
            }
            placeholder="0"
            className="w-12 lg:w-14 bg-transparent text-center text-sm lg:text-base font-bold text-white focus:outline-none"
          />
          <button
            onClick={() => updateField(product.id, "currentStock", 1)}
            className="h-8 w-8 lg:h-10 lg:w-10 flex items-center justify-center rounded-lg hover:bg-white/10 active:scale-90 transition-all text-muted-foreground hover:text-white"
          >
            <Plus className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-end w-full lg:w-[160px]">
        <span className="text-[10px] lg:hidden text-muted-foreground uppercase font-bold tracking-wider">
          Pedir Agora
        </span>
        <div className="flex items-center gap-1 bg-primary/10 p-1 rounded-xl border border-primary/20 shadow-inner">
          <button
            onClick={() => updateField(product.id, "quantity", -1)}
            className="h-8 w-8 lg:h-10 lg:w-10 flex items-center justify-center rounded-lg hover:bg-white/10 active:scale-90 transition-all text-primary"
          >
            <Minus className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={cartItem?.quantityRaw ?? cartItem?.quantity ?? ''}
            onChange={(e) =>
              handleInputChange(product.id, "quantity", e.target.value)
            }
            placeholder="0"
            className="w-12 lg:w-14 bg-transparent text-center text-sm lg:text-base font-bold text-white focus:outline-none"
          />
          <button
            onClick={() => updateField(product.id, "quantity", 1)}
            className="h-8 w-8 lg:h-10 lg:w-10 flex items-center justify-center rounded-lg bg-primary text-white hover:opacity-80 active:scale-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
          </button>
        </div>
      </div>
    </div>
  ),
);

ProductRow.displayName = "ProductRow";

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

export default function OrderForm({ store, onBack }) {
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState({});
  const [orderDate, setOrderDate] = useState(getTomorrowDate());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const categoriesData = await api.getCategories();
        setCategories(categoriesData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const updateField = React.useCallback((id, field, value) => {
    setCart((prev) => {
      const current = prev[id] || { quantity: 0, currentStock: 0 };
      if (typeof value === 'boolean') {
        return { ...prev, [id]: { ...current, [field]: value } };
      }
      const nextValue = Math.max(0, (current[field] || 0) + value);
      return { ...prev, [id]: { ...current, [field]: nextValue } };
    });
  }, []);

  const handleInputChange = React.useCallback((id, field, value) => {
    const cleaned = value.replace(/^0+(?!$)/, '');
    const nextValue = cleaned === "" ? 0 : Math.max(0, parseInt(cleaned) || 0);
    setCart((prev) => {
      const current = prev[id] || { quantity: 0, currentStock: 0 };
      return { ...prev, [id]: { ...current, [field]: nextValue, [`${field}Raw`]: cleaned } };
    });
  }, []);

  const handleSubmit = async () => {
    setError(null);
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

      console.log("Final Order Submitted:", JSON.stringify(orderData, null, 2));
      await api.createOrder(orderData);
      setIsSuccess(true);
    } catch (err) {
      console.error("Erro na submissão:", err);
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const totalItems = Object.values(cart).reduce(
    (a, b) => a + (b.quantity || 0),
    0,
  );

  const getIconForCategory = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("legume"))
      return <Carrot className="h-5 w-5 text-orange-500" />;
    if (lowerName.includes("fruta"))
      return <Apple className="h-5 w-5 text-red-500" />;
    if (lowerName.includes("tempero") || lowerName.includes("verdura"))
      return <LeafyGreen className="h-5 w-5 text-green-500" />;
    return <Package className="h-5 w-5 text-blue-500" />;
  };

  const getProductIcon = React.useCallback((categoryName) => {
    const lowerName = categoryName.toLowerCase();
    if (lowerName.includes("legume")) return <Carrot className="h-6 w-6" />;
    if (lowerName.includes("fruta")) return <Apple className="h-6 w-6" />;
    return <LeafyGreen className="h-6 w-6" />;
  }, []);

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
        <h2 className="text-lg font-bold text-red-500 mb-2">
          Ops! Algo deu errado
        </h2>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-slide-up">
        <div className="h-20 w-20 bg-green-500/10 text-green-500 flex items-center justify-center rounded-full mb-6">
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
    <div className="w-full max-w-4xl mx-auto p-4 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="w-full text-2xl font-bold text-white">
          Pedido de compras
        </h2>
        <p className="text-sm text-muted-foreground mb-6 px-4">
          Selecione os produtos e as quantidades desejadas para criar um novo
          pedido de compra para a <strong>{store.name}</strong>. Você poderá
          revisar seu pedido antes de enviar.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={isReviewing ? () => setIsReviewing(false) : onBack}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-secondary/50 text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white">
              {isReviewing ? "Revisar Pedido" : store.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isReviewing
                ? "Confirme os itens selecionados"
                : "Novo Pedido de Compra"}
            </p>
          </div>
        </div>

        {!isReviewing && (
          <div className="glass-card p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm text-white font-medium">
                Data do Pedido:
              </span>
            </div>
            <DateInput
              value={orderDate}
              onChange={setOrderDate}
              min={getTomorrowDate()}
            />
          </div>
        )}

        {isReviewing ? (
          <div className="space-y-6 pb-32">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Resumo do Pedido
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(orderDate).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>

              <div className="space-y-3">
                {categories
                  .flatMap((c) => c.products)
                  .filter(
                    (p) =>
                      (cart[p.id]?.quantity || 0) > 0 ||
                      (cart[p.id]?.currentStock || 0) > 0,
                  )
                  .map((product) => {
                    const item = cart[product.id];
                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                            {product.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          {item.currentStock > 0 && (
                            <div className="text-right">
                              <p className="text-[9px] uppercase font-bold text-muted-foreground">
                                Estoque
                              </p>
                              <p className="text-sm font-mono text-white/60">
                                {item.currentStock}
                              </p>
                            </div>
                          )}
                          <div className="text-right min-w-[60px]">
                            <p className="text-[9px] uppercase font-bold text-primary">
                              Pedido
                            </p>
                            <p className="text-sm font-mono text-white font-black">
                              {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <Button
              onClick={() => setIsReviewing(false)}
              variant="outline"
              className="w-full h-12 border-white/10 text-white hover:bg-white/5"
            >
              Voltar ao Catálogo
            </Button>
          </div>
        ) : (
          <div className="space-y-8 pb-32">
            {categories.map((category) => (
              <div key={category.id} className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  {getIconForCategory(category.name)}
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {category.name}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="hidden lg:grid grid-cols-[1fr_120px_160px_160px] gap-4 px-6 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    <span>Produto</span>
                    <span className="text-center">Estoque CD</span>
                    <span className="text-center">Estoque Atual</span>
                    <span className="text-right pr-4">Quantidade</span>
                  </div>

                  {category.products.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      categoryName={category.name}
                      cartItem={cart[product.id]}
                      updateField={updateField}
                      handleInputChange={handleInputChange}
                      getProductIcon={getProductIcon}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalItems > 0 && (
          <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-[100]">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full max-w-sm h-16 rounded-2xl font-bold shadow-2xl border-primary/20 hover:border-primary/50 transition-all ${isReviewing ? "bg-primary text-white" : "glass"}`}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center justify-between w-full px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`${isReviewing ? "bg-white text-primary" : "bg-primary text-white"} h-7 w-7 rounded-full flex items-center justify-center text-xs font-black`}
                    >
                      {totalItems}
                    </div>
                    <span className={isReviewing ? "text-white" : "text-white"}>
                      {isReviewing ? "Confirmar e Enviar" : "Revisar Pedido"}
                    </span>
                  </div>
                  {isReviewing ? (
                    <Send className="h-5 w-5 text-white" />
                  ) : (
                    <Send className="h-5 w-5 text-primary" />
                  )}
                </div>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
