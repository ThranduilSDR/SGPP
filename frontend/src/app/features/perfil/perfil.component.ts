import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PoPageModule,
  PoWidgetModule,
  PoFieldModule,
  PoButtonModule,
  PoNotificationService,
} from '@po-ui/ng-components';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, PoPageModule, PoWidgetModule, PoFieldModule, PoButtonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private poNotification = inject(PoNotificationService);

  // Dados do utilizador obtidos via GET /api/auth/me
  public userData: any = null;
  public loadingProfile = false;

  // Objeto para o formulário de alteração de senha
  public passwordData = {
    oldPassword: '',
    newPassword: '',
  };
  public loadingPassword = false;

  ngOnInit(): void {
    this.carregarDadosPerfil();
  }

  // Busca os dados atualizados do utilizador no backend
  carregarDadosPerfil(): void {
    this.loadingProfile = true;
    this.authService.getMe().subscribe({
      next: (response) => {
        this.userData = response;
        this.loadingProfile = false;
      },
      error: (err) => {
        this.loadingProfile = false;
        this.poNotification.error('Não foi possível carregar os dados do perfil.');
      },
    });
  }

  // Envia a solicitação de alteração de senha para o backend
  onUpdatePassword(): void {
    if (!this.passwordData.oldPassword || !this.passwordData.newPassword) {
      this.poNotification.warning('Preencha a senha atual e a nova senha.');
      return;
    }

    this.loadingPassword = true;
    this.authService.changePassword(this.passwordData).subscribe({
      next: () => {
        this.loadingPassword = false;
        this.poNotification.success('Senha alterada com sucesso!');
        this.passwordData = { oldPassword: '', newPassword: '' }; // Limpa os campos
      },
      error: (err) => {
        this.loadingPassword = false;
        const msg = err.error?.message || 'Erro ao alterar a senha. Verifique os dados.';
        this.poNotification.error(msg);
      },
    });
  }
}
