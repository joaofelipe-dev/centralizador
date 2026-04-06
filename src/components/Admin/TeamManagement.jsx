import React from "react";
import { MoreVertical, LogOut, Shield, User, Eye } from "lucide-react";
import { Button } from "@/components/Button/Button";

const roleConfig = {
  ADMIN: { label: 'Admin', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Shield },
  SUPERVISOR: { label: 'Supervisor', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Eye },
  DEFAULT: { label: 'Padrão', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: User },
};

export function TeamManagement({ 
  users, 
  allStores, 
  form, 
  setForm, 
  handleUserSubmit, 
  handleDelete, 
  editUserId, 
  setEditUserId 
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Gerenciar Equipe</h2>
      <div className="glass-card p-6">
        <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input 
            type="text" 
            placeholder="Usuário" 
            value={form.username} 
            onChange={e => setForm({...form, username: e.target.value.toLowerCase()})} 
            className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
          />
          <input 
            type="text" 
            placeholder="Nome completo" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
          />
          <input 
            type="email" 
            placeholder="E-mail" 
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
            className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
          />
          <select
            value={form.role}
            onChange={e => setForm({...form, role: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          >
            <option className="bg-black text-white" value="DEFAULT">Padrão</option>
            <option className="bg-black text-white" value="SUPERVISOR">Supervisor</option>
            <option className="bg-black text-white" value="ADMIN">Admin</option>
          </select>
          <input 
            type="password" 
            placeholder={editUserId ? "Nova Senha (opcional)" : "Senha"} 
            value={form.password} 
            onChange={e => setForm({...form, password: e.target.value})} 
            className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
          />
          
          <div className="md:col-span-5">
            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2 block">Lojas com Acesso (Multiseleção)</label>
            <select 
              multiple 
              value={form.storeIds} 
              onChange={e => setForm({...form, storeIds: Array.from(e.target.selectedOptions, o => o.value)})} 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white h-32 custom-scrollbar focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              {allStores.map(s => <option key={s.id} value={s.id} className="py-1">{s.name}</option>)}
            </select>
          </div>
          <Button type="submit" className="md:col-span-1 h-12 font-bold shadow-lg shadow-primary/20">
            {editUserId ? 'Salvar Alterações' : 'Adicionar Membro'}
          </Button>
          {editUserId && (
            <Button variant="glass" onClick={() => {setEditUserId(null); setForm({ username: '', name: '', email: '', password: '', storeIds: [], role: 'DEFAULT' });}} className="md:col-span-1 h-12">
              Cancelar
            </Button>
          )}
        </form>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-muted-foreground text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Nome / Usuário</th>
                <th className="px-6 py-4">Função</th>
                <th className="px-6 py-4">Acessos</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => {
                const RoleIcon = roleConfig[u.role]?.icon || User;
                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-xs text-primary font-mono">{u.username}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${roleConfig[u.role]?.color || roleConfig.DEFAULT.color}`}>
                        <RoleIcon className="h-3 w-3" />
                        {roleConfig[u.role]?.label || 'Padrão'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(u.stores || []).map(s => (
                          <span key={s.id} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-muted-foreground">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setEditUserId(u.id); 
                            setForm({
                              username: u.username, 
                              name: u.name, 
                              email: u.email || '', 
                              password: '', 
                              storeIds: u.stores.map(s => s.id),
                              role: u.role || 'DEFAULT'
                            })
                          }}
                          className="rounded-full hover:bg-white/10"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(u.id)} 
                          className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                        >
                          <LogOut className="h-4 w-4 rotate-180" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
