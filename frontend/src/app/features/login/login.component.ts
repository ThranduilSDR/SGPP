import { Component, inject } from '@angular/core'; // Importa o decorador de componentes e a função inject do Angular
import { Router } from '@angular/router'; // Importa o serviço de roteamento para navegar entre telas
import { PoPageLoginModule } from '@po-ui/ng-templates'; // Importa o módulo oficial do template de login do PO-UI
import { PoNotificationService } from '@po-ui/ng-components'; // Importa o serviço do PO-UI para exibir mensagens flutuantes (sucesso/erro)
import { AuthService } from '../../core/services/auth-service'; // Importa o serviço de autenticação que criamos anteriormente

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PoPageLoginModule],
  template: `
    <!-- Componente pronto do PO-UI que desenha a tela de login corporativa -->
    <po-page-login
      p-title="SGPP - Gestão de Pedidos"
      [p-loading]="loading"
      (p-login-submit)="onLogin($event)"
    >
    </po-page-login>
  `,
})
export class LoginComponent {
  // Injeção de dependências moderna utilizando a função inject()
  private authService = inject(AuthService);
  private router = inject(Router);
  private poNotification = inject(PoNotificationService);

  loading = false; // Variável de controle para mostrar o ícone de carregamento (spinner) no botão

  // Método executado automaticamente quando o usuário preenche o login e clica em entrar
  onLogin(formData: any) {
    this.loading = true; // Ativa o estado de carregamento na tela

    // Mapeia os dados recebidos do componente visual para o formato esperado pelo backend
    const credenciais = {
      email: formData.login,
      password: formData.password,
    };

    // Aciona o método de login do AuthService
    this.authService.login(credenciais).subscribe({
      next: () => {
        this.loading = false; // Desativa o carregamento
        this.poNotification.success('Autenticação realizada com sucesso!'); // Exibe balão verde de sucesso
        this.router.navigate(['/home']); // Redireciona o usuário para a tela principal do sistema
      },
      error: (err) => {
        this.loading = false; // Desativa o carregamento mesmo se der erro
        // Pega a mensagem de erro do backend ou exibe uma padrão
        const msg = err.error?.message || 'Falha ao realizar login. Verifique as credenciais.';
        this.poNotification.error(msg); // Exibe balão vermelho de erro
      },
    });
  }
}
