interface FooterProps {
  className?: string;
}

export const Footer = ({ className }: FooterProps) => {
    return (
        <footer className={`py-6 border-t border-white/5 bg-background/50 text-center ${className ?? ''}`}>
            <p className="text-[10px] text-muted-foreground/50 tracking-[0.2em]">
                João Felipe <strong>Centralizador de Pedidos © 2026</strong>
            </p>
        </footer>
    )
}