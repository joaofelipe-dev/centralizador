interface FooterProps {
  className?: string;
}

export const Footer = ({ className }: FooterProps) => {
    return (
        <footer className={`py-6 border-t border-border bg-card text-center ${className ?? ''}`}>
            <p className="text-xs text-muted-foreground tracking-wide">
                João Felipe <strong>Centralizador de Pedidos © 2026</strong>
            </p>
        </footer>
    )
}