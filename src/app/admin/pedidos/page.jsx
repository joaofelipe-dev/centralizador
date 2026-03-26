"use client";

import { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ArrowLeft,
  Loader2,
  Package,
  Tags
} from "lucide-react";
import { Button } from "@/components/Button/Button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function PedidosAdminPage() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: ""
  });
  const [editingId, setEditingId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadProducts();
    }
  }, [user, loading, router]);

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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback("");

    const payload = {
      name: formData.name,
      category: formData.category || "Geral",
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0
    };

    try {
      if (editingId) {
        await api.updateProduct(editingId, payload);
        setFeedback("Item atualizado com sucesso!");
      } else {
        await api.createProduct(payload);
        setFeedback("Item criado com sucesso!");
      }
      
      setFormData({ name: "", category: "", price: "", stock: "" });
      setEditingId(null);
      setIsModalOpen(false);
      await loadProducts();
    } catch (error) {
      setFeedback(error.message || "Erro ao salvar item.");
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category || "",
      price: product.price.toString(),
      stock: product.stock.toString()
    });
    setIsModalOpen(true);
  }

  async function handleDelete(id) {
    if (!confirm("Deseja realmente excluir este item?")) return;
    try {
      await api.deleteProduct(id);
      await loadProducts();
    } catch (error) {
      alert("Erro ao excluir item.");
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.push('/admin')}
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold tracking-tight">Gerenciar Pedidos (Itens)</h1>
          </div>
          
          <Button 
            onClick={() => {
              setEditingId(null);
              setFormData({ name: "", category: "", price: "", stock: "" });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-full"
          >
            <Plus className="h-4 w-4" />
            Novo Item
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8 animate-slide-up">
        {/* Search & Feedback */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {feedback && <p className="text-sm text-primary animate-pulse">{feedback}</p>}
        </div>

        {/* Products Grid */}
        {isFetching ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="glass-card group p-5 space-y-4 hover:border-primary/30 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{product.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Tags className="h-3 w-3" />
                      {product.category || "Sem categoria"}
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
        )}

        {/* Empty State */}
        {!isFetching && filteredProducts.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/20" />
            <p className="text-muted-foreground">Nenhum item encontrado.</p>
          </div>
        )}
      </main>

      {/* Modal / Overlay Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md p-8 space-y-6 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-bold">{editingId ? "Editar Item" : "Novo Item"}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Nome do Produto</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Ex: Alface Americana"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                  <input 
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Ex: Verduras"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Preço (R$)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Estoque Inicial</label>
                <input 
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-primary"
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
          </div>
        </div>
      )}
    </div>
  );
}
