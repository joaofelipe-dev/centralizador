"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

export interface PedidosDepartment {
  id: string;
  name: string;
}

interface PedidosNavContextValue {
  departments: PedidosDepartment[];
  activeDepartmentId: string | null;
  selectDepartment: (id: string | null) => void;
  registerDepartments: (
    departments: PedidosDepartment[],
    activeDepartmentId: string | null,
    onSelect: (id: string | null) => void,
  ) => void;
  clearDepartments: () => void;
}

const defaultValue: PedidosNavContextValue = {
  departments: [],
  activeDepartmentId: null,
  selectDepartment: () => {},
  registerDepartments: () => {},
  clearDepartments: () => {},
};

const PedidosNavContext = createContext<PedidosNavContextValue>(defaultValue);

export function PedidosNavProvider({ children }: { children: React.ReactNode }) {
  const [departments, setDepartments] = useState<PedidosDepartment[]>([]);
  const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(null);
  const [onSelect, setOnSelect] = useState<(id: string | null) => void>(() => () => {});

  const registerDepartments = useCallback(
    (deps: PedidosDepartment[], activeId: string | null, handler: (id: string | null) => void) => {
      setDepartments(deps);
      setActiveDepartmentId(activeId);
      setOnSelect(() => handler);
    },
    [],
  );

  const clearDepartments = useCallback(() => {
    setDepartments([]);
    setActiveDepartmentId(null);
  }, []);

  const selectDepartment = useCallback((id: string | null) => onSelect(id), [onSelect]);

  return (
    <PedidosNavContext.Provider
      value={{ departments, activeDepartmentId, selectDepartment, registerDepartments, clearDepartments }}
    >
      {children}
    </PedidosNavContext.Provider>
  );
}

export function usePedidosNav() {
  return useContext(PedidosNavContext);
}
