import { inject } from '@angular/core'; // Importa a função de injeção de dependências
import { CanActivateFn, Router } from '@angular/router'; // Tipagem do Guard funcional e o serviço de navegação
import { AuthService } from '../services/auth-service'; // Importa o nosso serviço de autenticação

/**
 * =================================================================
 * FUNCIONAMENTO DO AUTHGUARD FUNCIONAL:
 * =================================================================
 * O Guard atua como um "segurança de porta" nas rotas do Angular.
 * Antes de o navegador carregar o componente da rota (ex: /home),
 * este Guard executa e retorna:
 *   - true:  Acesso permitido (o utilizador entra na página).
 *   - false: Acesso negado (o utilizador é travado e redirecionado).
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Injeta a instância do AuthService
  const router = inject(Router); // Injeta o Router para fazer redirecionamento

  // Verifica se o Signal de autenticação está true (ou se há token no localStorage)
  if (authService.isAuthenticated()) {
    return true; // Permite o acesso à rota
  }

  // Se não estiver autenticado, redireciona para a tela de login
  router.navigate(['/login']);
  return false; // Bloqueia o acesso à rota solicitada
};
