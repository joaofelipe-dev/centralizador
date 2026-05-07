import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { Store } from "@/types/product";
import type { UserRole } from "./TeamManagement";
import { StoresCombobox } from "./StoresCombobox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

interface UserFormData {
  username: string;
  name: string;
  email: string;
  password: string;
  storeIds: string[];
  role: UserRole;
}

interface FormErrors {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  storeIds?: string;
  role?: string;
}

interface UserFormProps {
  form: UserFormData;
  setForm: (form: UserFormData) => void;
  onSubmit: () => void;
  isEditing: boolean;
  loading?: boolean;
  allStores: Store[];
  onCancel?: () => void;
}

export function UserForm({
  form,
  setForm,
  onSubmit,
  isEditing,
  loading = false,
  allStores,
  onCancel,
}: UserFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!form.username.trim()) {
      newErrors.username = "Usuário é obrigatório";
    } else if (form.username.trim().length < 3) {
      newErrors.username = "Mínimo 3 caracteres";
    }
    if (!form.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "E-mail inválido";
    }
    if (!isEditing) {
      if (!form.password) {
        newErrors.password = "Senha é obrigatória";
      } else if (form.password.length < 6) {
        newErrors.password = "Mínimo 6 caracteres";
      }
    } else if (form.password && form.password.length > 0 && form.password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres";
    }
    if (form.storeIds.length === 0) {
      newErrors.storeIds = "Selecione pelo menos uma loja";
    }
    return newErrors;
  };

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setErrors(validate());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, touched]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({ username: true, name: true, email: true, password: true, storeIds: true });
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit();
  };

  const updateField = <K extends keyof UserFormData>(
    field: K,
    value: UserFormData[K]
  ) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            Dados da Conta
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            Usuário <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            placeholder="usuário"
            value={form.username}
            onChange={e => updateField("username", e.target.value.toLowerCase())}
            onBlur={() => handleBlur("username")}
            disabled={loading}
            status={errors.username && touched.username ? "error" : "default"}
            fullWidth
          />
          {errors.username && touched.username && (
            <p className="text-xs text-red-400 mt-1 animate-in fade-in duration-200">
              {errors.username}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            Nome Completo <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            placeholder="Nome completo"
            value={form.name}
            onChange={e => updateField("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            disabled={loading}
            status={errors.name && touched.name ? "error" : "default"}
            fullWidth
          />
          {errors.name && touched.name && (
            <p className="text-xs text-red-400 mt-1 animate-in fade-in duration-200">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1">E-mail</label>
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={form.email}
            onChange={e => updateField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            disabled={loading}
            status={errors.email && touched.email ? "error" : "default"}
            fullWidth
          />
          {errors.email && touched.email && (
            <p className="text-xs text-red-400 mt-1 animate-in fade-in duration-200">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            {isEditing ? "Nova Senha (opcional)" : "Senha"}
            {!isEditing && <span className="text-red-400">*</span>}
          </label>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={isEditing ? "Deixe em branco para manter" : "Senha"}
            value={form.password}
            onChange={e => updateField("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            disabled={loading}
            status={errors.password && touched.password ? "error" : "default"}
            fullWidth
            rightIcon={
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer text-muted-foreground hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </div>
            }
          />
          {errors.password && touched.password && (
            <p className="text-xs text-red-400 mt-1 animate-in fade-in duration-200">
              {errors.password}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            Permissões
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1">Função</label>
          <Select
            value={form.role}
            onChange={e => updateField("role", e.target.value as UserRole)}
            disabled={loading}
            status={errors.role && touched.role ? "error" : "default"}
          >
            <option value="DEFAULT">Padrão</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </div>

        <div>
          <StoresCombobox
            stores={allStores}
            selectedIds={form.storeIds}
            onChange={ids => updateField("storeIds", ids)}
            disabled={loading}
          />
          {errors.storeIds && touched.storeIds && (
            <p className="text-xs text-red-400 mt-1 animate-in fade-in duration-200">
              {errors.storeIds}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={loading}
            variant="outline"
            fullWidth
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          fullWidth
        >
          {loading && <Spinner size="sm" />}
          {isEditing ? "Salvar Alterações" : "Adicionar Membro"}
        </Button>
      </div>
    </form>
  );
}
