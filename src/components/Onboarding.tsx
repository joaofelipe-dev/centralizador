"use client";

import { useState } from "react";
import { 
  ShoppingBag, 
  ChevronRight,
  Store,
  ClipboardList,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Step, OnboardingProps } from "@/types/onboarding";

const steps: Step[] = [
  {
    title: "Seja bem-vindo!",
    description: "O Central Pedidos é a sua nova plataforma premium para gerenciar compras e suprimentos de forma inteligente.",
    icon: ShoppingBag,
    color: "bg-blue-500",
  },
  {
    title: "Selecione sua Loja",
    description: "Escolha em qual unidade você deseja realizar o pedido. Cada loja tem seu próprio catálogo e estoque.",
    icon: Store,
    color: "bg-purple-500",
  },
  {
    title: "Monte sua Lista",
    description: "Navegue pelas categorias e adicione os itens necessários ao seu carrinho com apenas alguns cliques.",
    icon: ClipboardList,
    color: "bg-yellow-500",
  },
  {
    title: "Envie o Pedido",
    description: "Revise tudo e envie! O administrador receberá sua solicitação instantaneamente no painel de controle.",
    icon: Send,
    color: "bg-green-500",
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const activeStep = steps[currentStep];

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto px-6 py-12 text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentStep ? "w-8 bg-primary" : "w-2 bg-white/10"
            }`}
          />
        ))}
      </div>

      <div className={`p-6 rounded-3xl ${activeStep.color} bg-opacity-10 ring-1 ring-white/10 shadow-2xl`}>
        <activeStep.icon className={`h-12 w-12 ${activeStep.color.replace('bg-', 'text-')}`} />
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight text-white">{activeStep.title}</h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {activeStep.description}
        </p>
      </div>

      <Button 
        onClick={nextStep}
        className="group relative flex items-center gap-2 rounded-full px-8 py-6 text-lg font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-105"
      >
        {currentStep === steps.length - 1 ? "Começar agora" : "Continuar"}
        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Button>

      {currentStep < steps.length - 1 && (
        <Button 
          onClick={onComplete}
          variant="ghost"
          size="sm"
          className="text-sm text-muted-foreground hover:text-white"
        >
          Pular introdução
        </Button>
      )}
    </div>
  );
}