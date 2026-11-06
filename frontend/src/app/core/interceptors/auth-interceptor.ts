import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

/**
 * =================================================================
 * FUNCIONAMENTO DO INTERCEPTOR FUNCIONAL:
 * =================================================================
 * O 'authInterceptor' é uma função (do tipo HttpInterceptorFn) que atua como
 * um "pedágio" ou "filtro de segurança" automático para **todas** as requisições
 * HTTP que saem do seu front-end em direção ao backend (ex: buscar lista de produtos,
 * cadastrar um pedido, etc.).
 *
 * Sem ele, você teria que injetar manualmente o token de acesso em cada serviço
 * ou requisição que fizesse no sistema. Com ele, o Angular faz isso sozinho.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Injeta o AuthService para podermos consultar se existe um token salvo
  const authService = inject(AuthService);

  // Pega o Token JWT armazenado no localStorage (via AuthService)
  const token = authService.getToken();

  // Verifica se o token realmente existe (ou seja, se o usuário está logado)
  if (token) {
    /**
     * =================================================================
     * NECESSIDADE DE CLONAR A REQUISIÇÃO (req.clone)
     * =================================================================
     * No Angular, os objetos de requisição HTTP (`HttpRequest`) são **imutáveis**.
     * Isso significa que você não pode simplesmente modificar a requisição
     * original (`req`) alterando suas propriedades diretamente.
     *
     * Para contornar essa regra de segurança do framework, usamos o método `.clone()`.
     * Ele tira uma "cópia fiel" da requisição original e nos permite injetar
     * novos dados nela — neste caso, adicionando o cabeçalho de autorização.
     */
    const cloned = req.clone({
      setHeaders: {
        // Padrão mundial de mercado para autenticação via API (Bearer Token)
        // O backend vai ler este cabeçalho para saber quem está a fazer a requisição.
        Authorization: `Bearer ${token}`,
      },
    });

    // Envia a requisição *clonada* (agora turbinada com o token) para a frente do fluxo
    return next(cloned);
  }

  /**
   * Se o usuário NÃO estiver logado (por exemplo, quando ele está na própria
   * tela de envio de login e senha, onde ainda não existe token), o interceptor
   * não faz nada.
   *
   * Ele simplesmente chama `next(req)` passando a requisição original limpa e sem alteração.
   */
  return next(req);
};
