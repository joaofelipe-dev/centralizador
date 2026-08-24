/**
 * Base URL da API, compartilhada pelo cliente HTTP e pelo motor de sincronização
 * offline — os dois precisam concordar, ou a fila tenta reenviar para um host que
 * não existe em produção.
 *
 * NEXT_PUBLIC_API_URL é inlinado no bundle em tempo de build. O fallback com
 * `:3333` só faz sentido em desenvolvimento, quando o backend roda na mesma
 * máquina que serve o frontend.
 */
export const API_URL =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:3333`
      : 'http://localhost:3333'
