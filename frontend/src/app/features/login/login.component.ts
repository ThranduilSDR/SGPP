import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PoPageLoginModule, PoComponentsModule } from '@po-ui/ng-templates';
import { PoNotificationService } from '@po-ui/ng-components';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PoPageLoginModule, PoComponentsModule],
  template: `
    <po-page-login
      p-title="SGPP - Gestão de Pedidos"
      [p-loading]="loading"
      (p-login)="onLogin($event)"
    >
    </po-page-login>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private poNotification = inject(PoNotificationService);

  loading = false;

  onLogin(formData: any) {
    this.loading = true;

    // Ajuste o objeto conforme o body esperado no backend (ex: email ou login)
    const credentials = {
      login: formData.login,
      password: formData.password,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        this.poNotification.success('Autenticação realizada com sucesso!');
        this.router.navigate(['/home']); // Redireciona para o painel principal
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'Falha ao realizar login. Verifique as credenciais.';
        this.poNotification.error(msg);
      },
    });
  }
}
