"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import {
  ShoppingBag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Package,
  Tags,
  Clock
} from "lucide-react";
import { Button } from "@/components/Button/Button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Product, Category } from "@/types/product";
import { PageNav } from "@/components/PageNav";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/Admin/ConfirmDialog";
import { toast } from "sonner";

export default function PedidosAdminPage() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    price: "",
    stock: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadInitialData();
    }
  }, [user, loading, router]);

  async function loadInitialData() {
    setIsFetching(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsFetching(false);
    }
  }

  async function loadProducts() {
    setIsFetching(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setIsFetching(false);
    }
  }

  const filteredProducts = products.filter((p: Product) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categories.find(c => c.id === p.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload = {
      name: formData.name,
      categoryId: formData.categoryId,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0
    };

    try {
      if (editingId) {
        await api.updateProduct(editingId, payload);
        toast.success("Item atualizado com sucesso!");
      } else {
        await api.createProduct(payload);
        toast.success("Item criado com sucesso!");
      }

      setFormData({ name: "", categoryId: "", price: "", stock: "" });
      setEditingId(null);
      setIsModalOpen(false);
      loadProducts();
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'Erro ao salvar'}`);
    }
  }

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price.toString(),
      stock: product.stock.toString()
    });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteProduct(confirmDelete);
      toast.success("Item excluído com sucesso!");
      loadProducts();
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'Erro ao excluir'}`);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  };

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalStockCD = products.reduce((sum, p) => sum + (p.stockCD || 0), 0);

  if (loading || isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando produtos...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <PageNav
        title="Gestão de Pedidos"
        description="Catálogo de produtos e estoques"
        backHref="/admin"
        icon={<ShoppingBag className="h-5 w-5 text-primary" />}
        actions={
          <Button
            onClick={() => {
              setEditingId(null);
              setFormData({ name: "", categoryId: "", price: "", stock: "" });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-full"
          >
            <Plus className="h-4 w-4" />
            Novo Item
          </Button>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8 animate-slide-up">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-xl text-center border border-white/5 bg-white/5">
            <Package className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Total de Produtos</h2>
            <p className="text-3xl font-bold text-primary">{products.length}</p>
          </div>
          <div className="glass-card p-6 rounded-xl text-center border border-white/5 bg-white/5">
            <ShoppingBag className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Estoque das Lojas</h2>
            <p className="text-3xl font-bold text-yellow-500">{totalStock}</p>
          </div>
          <div className="glass-card p-6 rounded-xl text-center border border-white/5 bg-white/5">
            <Clock className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Estoque CD</h2>
            <p className="text-3xl font-bold text-purple-500">{totalStockCD}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome ou categoria..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="glass-card group p-5 space-y-4 hover:border-primary/30 transition-all duration-300 border border-white/5 bg-white/5 rounded-xl">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Tags className="h-3 w-3" />
                    {categories.find(c => c.id === product.categoryId)?.name || "Sem categoria"}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(product)}
                    className="h-8 w-8 rounded-full hover:bg-white/5"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                    className="h-8 w-8 rounded-full hover:bg-red-500/10 text-red-500/50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-end pt-2 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Estoque</p>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-bold">{product.stock}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Preço</p>
                  <p className="text-xl font-bold text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/20" />
            <p className="text-muted-foreground">Nenhum item encontrado.</p>
          </div>
        )}
      </main>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="glass-card border border-white/10 bg-[#121212] rounded-2xl"
      >
        <h2 className="text-2xl font-bold mb-6">{editingId ? "Editar Item" : "Novo Item"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Nome do Produto</label>
            <Input
              required
              variant="glass"
              value={formData.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Alface Americana"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Categoria</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-primary appearance-none text-white"
              >
                <option value="" className="bg-[#1a1a1a]">Selecionar...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-[#1a1a1a]">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Preço (R$)</label>
            <Input
              required
              variant="glass"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
            />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Estoque Inicial</label>
            <Input
              variant="glass"
              type="number"
              value={formData.stock}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              placeholder="0"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl"
            >
              {editingId ? "Salvar Alterações" : "Criar Item"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
        onConfirm={confirmDeleteAction}
        loading={isDeleting}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
        confirmText="Excluir"
      />
    </div>
  );
}
