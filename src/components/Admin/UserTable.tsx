import React, { useState, useMemo } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Users,
  Search,
  X,
} from "lucide-react";
import type { TeamUser, UserRole } from "./TeamManagement";
import { roleConfig } from "./TeamManagement";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table } from "@/components/ui/Table";

interface SortConfig {
  key: "name" | "username" | "role";
  direction: "asc" | "desc" | "none";
}

interface UserTableProps {
  users: TeamUser[];
  onEdit: (user: TeamUser) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  onDeleteConfirm?: (id: string) => void;
  deleteLoadingId?: string | null;
}

export function UserTable({
  users,
  onEdit,
  onDelete,
  loading = false,
  deleteLoadingId = null,
}: UserTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  });
  const [search, setSearch] = useState("");

  const handleSort = (key: SortConfig["key"]) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key
          ? prev.direction === "asc"
            ? "desc"
            : prev.direction === "desc"
            ? "none"
            : "asc"
          : "asc",
    }));
  };

  const getSortIcon = (key: SortConfig["key"]) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-3.5 w-3.5" />;
    if (sortConfig.direction === "asc") return <ArrowUp className="h-3.5 w-3.5" />;
    if (sortConfig.direction === "desc") return <ArrowDown className="h-3.5 w-3.5" />;
    return <ArrowUpDown className="h-3.5 w-3.5" />;
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        u =>
          u.name.toLowerCase().includes(searchLower) ||
          u.username.toLowerCase().includes(searchLower)
      );
    }

    if (sortConfig.direction !== "none") {
      result.sort((a, b) => {
        let aVal: string;
        let bVal: string;
        if (sortConfig.key === "role") {
          aVal = a.role;
          bVal = b.role;
        } else {
          aVal = a[sortConfig.key];
          bVal = b[sortConfig.key];
        }
        const cmp = aVal.localeCompare(bVal, "pt-BR");
        return sortConfig.direction === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [users, search, sortConfig]);

  if (loading) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="h-4 bg-white/10 rounded w-1/4" />
              <div className="h-4 bg-white/10 rounded w-1/6" />
              <div className="h-4 bg-white/10 rounded w-1/4" />
              <div className="h-4 bg-white/10 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <Input
          type="text"
          placeholder="Buscar por nome ou usuário..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
          rightIcon={search ? (
            <button
              onClick={() => setSearch("")}
              className="text-muted-foreground hover:text-white transition-colors"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          ) : undefined}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 text-white focus:ring-2 focus:ring-primary/50 transition-all"
          aria-label="Buscar usuários"
        />
        {search && (
          <p className="text-xs text-muted-foreground mt-2">
            Mostrando {filteredAndSortedUsers.length} de {users.length} usuário(s)
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table hoverable className="w-full text-left text-sm">
          <thead className="bg-white/5 text-muted-foreground text-xs uppercase font-bold">
            <tr>
              <th
                className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort("name")}
                aria-sort={sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1.5">
                  Nome / Usuário {getSortIcon("name")}
                </span>
              </th>
              <th
                className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort("role")}
                aria-sort={sortConfig.key === "role" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1.5">
                  Função {getSortIcon("role")}
                </span>
              </th>
              <th className="px-6 py-4">Acessos</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredAndSortedUsers.length > 0 ? (
              filteredAndSortedUsers.map(u => {
                const RoleIcon = roleConfig[u.role]?.icon || Users;
                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-xs text-primary font-mono">{u.username}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all group-hover:border-opacity-50 ${roleConfig[u.role]?.color || roleConfig.DEFAULT?.color || ""}`}>
                        <RoleIcon className="h-3 w-3" />
                        {roleConfig[u.role]?.label || "Padrão"}
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
                          onClick={() => onEdit(u)}
                          className="rounded-full hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label={`Editar ${u.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(u.id)}
                          disabled={deleteLoadingId === u.id}
                          className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label={`Excluir ${u.name}`}
                        >
                          {deleteLoadingId === u.id ? (
                            <span className="animate-spin text-xs">⟳</span>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {search
                      ? `Nenhum resultado para "${search}"`
                      : "Nenhum usuário encontrado"}
                  </p>
                  {search && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setSearch("")}
                      className="mt-2 p-0 h-auto"
                    >
                      Limpar busca
                    </Button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
         </Table>
      </div>
    </div>
  );
}
