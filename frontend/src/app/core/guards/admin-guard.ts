import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth-service'; // Ajuste o caminho do seu serviço de auth
import { PoNotificationService } from '@po-ui/ng-components';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const poNotification = inject(PoNotificationService);

  // Obter a role do utilizador logado pelo Usuário
  const user = authService.getUser();

  // Valida se o objeto existe e se a role é 'admin'
  if (user && user.role === 'ADMIN') {
    return true;
  }
  // Se não for admin, bloqueia, avisa e redireciona para o catálogo
  poNotification.warning('Acesso restrito a administradores.');
  router.navigate(['/catalogo']);
  return false;
};
