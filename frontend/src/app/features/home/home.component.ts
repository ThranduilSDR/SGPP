import { Component, inject } from '@angular/core'; // Ferramentas centrais do Angular
import { CommonModule } from '@angular/common'; // Módulo com diretivas comuns (ex: ngIf, pipes)
import {
  PoPageModule,
  PoToolbarModule,
  PoButtonModule,
  PoWidgetModule,
} from '@po-ui/ng-components'; // Componentes corporativos visuais do PO-UI
import { AuthService } from '../../core/services/auth-service'; // Serviço de autenticação

@Component({
  selector: 'app-home', // Selector HTML do componente (<app-home></app-home>)
  standalone: true, // Componente autônomo do Angular 21
  imports: [CommonModule, PoPageModule, PoToolbarModule, PoButtonModule, PoWidgetModule], // Importação dos módulos do PO-UI que usaremos no template HTML
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  // Injeta o AuthService para termos acesso aos dados do utilizador e ao método de logout
  public authService = inject(AuthService);

  // Recupera os dados do utilizador salvos no localStorage no momento do login
  public user = this.authService.getUser();

  // Método acionado ao clicar no botão de Sair

  onLogout(): void {
    this.authService.logout(); // Apaga os tokens e redireciona para /login
  }
}
