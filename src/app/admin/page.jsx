"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  Search,
  MoreVertical,
  LogOut,
  Loader2,
  Package
} from "lucide-react";
import { Button } from "@/components/Button/Button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { stores } from "@/constants/stores";
import { useRouter } from "next/navigation";

const stats = [
  { label: "Pedidos Hoje", value: "24", icon: ShoppingBag, color: "text-blue-500" },
  { label: "Aguardando", value: "08", icon: Clock, color: "text-yellow-500" },
  { label: "Concluídos", value: "16", icon: CheckCircle2, color: "text-green-500" },
  { label: "Usuários", value: "12", icon: Users, color: "text-purple-500" },
  { label: "Itens Catálogo", value: "11", icon: Package, color: "text-orange-500" },
];

const recentOrders = [
  { id: "ORD-7281", store: "Loja Matriz", items: 12, total: "R$ 450,00", status: "Pendente" },
  { id: "ORD-7280", store: "Filial 01", items: 5, total: "R$ 120,50", status: "Concluído" },
  { id: "ORD-7279", store: "Filial 02", items: 8, total: "R$ 310,00", status: "Concluído" },
  { id: "ORD-7278", store: "Loja Matriz", items: 15, total: "R$ 890,00", status: "Pendente" },
];

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '', stores: [] });
  const [editUserId, setEditUserId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && !user.isAdmin) {
      router.push('/');
      return;
    }

    if (user) {
      loadUsers();
    }
  }, [user, loading, router]);

  async function loadUsers() {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Falha ao carregar usuários:', error);
      setFeedback('Erro ao carregar usuários.');
    }
  }

  function resetForm() {
    setForm({ username: '', name: '', email: '', password: '', stores: [] });
    setEditUserId(null);
    setFeedback('');
  }

  const validateForm = () => {
    if (!form.username.trim() || !form.name.trim() || form.stores.length === 0) {
      setFeedback('Usuário, nome e pelo menos uma loja são obrigatórios.');
      return false;
    }

    if (form.username.length < 3) {
      setFeedback('Usuário deve ter no mínimo 3 caracteres.');
      return false;
    }

    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setFeedback('E-mail inválido.');
      return false;
    }

    if (!editUserId && form.password.length < 6) {
      setFeedback('Senha deve ter no mínimo 6 caracteres.');
      return false;
    }

    return true;
  };

  async function handleUserSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editUserId) {
        const payload = { username: form.username, name: form.name, stores: form.stores };
        if (form.email) payload.email = form.email;
        if (form.password) payload.password = form.password;

        await api.updateUser(editUserId, payload);
        setFeedback('Usuário atualizado com sucesso.');
      } else {
        await api.createUser(form);
        setFeedback('Usuário criado com sucesso.');
      }

      resetForm();
      await loadUsers();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setFeedback(error?.message || 'Erro ao salvar usuário.');
    }
  }

  function handleEdit(userItem) {
    setEditUserId(userItem.id);
    setForm({
      username: userItem.username || '',
      name: userItem.name || '',
      email: userItem.email || '',
      password: '',
      stores: userItem.stores || [],
    });
    setFeedback('');
  }

  async function handleDelete(id) {
    if (!confirm('Deseja realmente excluir este usuário?')) return;

    try {
      await api.deleteUser(id);
      setFeedback('Usuário excluído.');
      await loadUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setFeedback('Erro ao excluir usuário.');
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
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.push('/pedidos')}
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold tracking-tight">Painel Administrativo</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              size="icon"
              className="rounded-full text-red-500 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8 animate-slide-up">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => router.push('/admin/pedidos')}
            className="glass-card p-6 flex items-center gap-6 cursor-pointer hover:border-primary/50 transition-all group"
          >
            <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Gerenciar Itens (Pedidos)</h3>
              <p className="text-sm text-muted-foreground">Cadastre novos produtos, ajuste preços e controle o estoque disponível para as lojas.</p>
            </div>
          </div>
          
          <div className="glass-card p-6 flex items-center gap-6 opacity-50 cursor-not-allowed">
            <div className="p-4 rounded-2xl bg-secondary/10 text-secondary">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Relatórios Avançados</h3>
              <p className="text-sm text-muted-foreground">Analise o histórico de pedidos por loja e otimize seus custos de aquisição.</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className={`p-2 w-fit rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Orders Table Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Pedidos Recentes</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar pedido..."
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4 font-medium">ID Pedido</th>
                    <th className="px-6 py-4 font-medium">Loja</th>
                    <th className="px-6 py-4 font-medium">Itens</th>
                    <th className="px-6 py-4 font-medium">Total</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.map((order, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-primary">{order.id}</td>
                      <td className="px-6 py-4 text-sm font-medium">{order.store}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{order.items} uni.</td>
                      <td className="px-6 py-4 text-sm font-medium">{order.total}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                          order.status === 'Pendente' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Usuários CRUD */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Gerenciar Usuários</h2>
          </div>

          <div className="glass-card p-6">
            <form onSubmit={handleUserSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <input
                type="text"
                placeholder="Usuário (min 3 chars)"
                value={form.username}
                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value.toLowerCase() }))}
                className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              />
              <input
                type="text"
                placeholder="Nome"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              />
              <input
                type="email"
                placeholder="E-mail (opcional)"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              />
              <input
                type="password"
                placeholder="Senha (min 6 caracteres)"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              />
              <select
                multiple
                value={form.stores}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setForm((prev) => ({ ...prev, stores: selected }))
                }}
                className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              >
                <option value="">Selecione a loja</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.name}>
                    {store.name}
                  </option>
                ))}
              </select>

              <div className="md:col-span-4 flex items-center gap-2">
                <Button type="submit" className="w-full md:w-auto">
                  {editUserId ? 'Atualizar Usuário' : 'Criar Usuário'}
                </Button>
                {editUserId && (
                  <Button type="button" variant="secondary" onClick={resetForm} className="w-full md:w-auto">
                    Cancelar Edição
                  </Button>
                )}
              </div>
            </form>
            {feedback && <p className="mt-3 text-sm text-amber-300">{feedback}</p>}
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Usuário</th>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Lojas</th>
                    <th className="px-4 py-3">Criado em</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/2">
                      <td className="px-4 py-3 font-mono text-primary">{u.username}</td>
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3 text-xs">{u.stores && u.stores.length > 0 ? u.stores.join(', ') : '-'} </td>
                      <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(u)}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => handleDelete(u.id)}>
                            <LogOut className="h-4 w-4 rotate-180" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
