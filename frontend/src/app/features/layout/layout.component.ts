import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { PoMenuModule, PoToolbarModule, PoPageModule, PoMenuItem } from '@po-ui/ng-components';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, PoMenuModule, PoToolbarModule, PoPageModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Recupera os dados do utilizador para exibir no topo direito
  public user = this.authService.getUser();

  // Configuração do perfil e ações do canto superior direito (Conta -> Meu Perfil, Sair)
  public profileActions = [
    { label: 'Meu Perfil', action: () => this.router.navigate(['/home/perfil']) },
    { label: 'Sair', action: () => this.authService.logout(), icon: 'po-icon-exit' },
  ];

  // Configuração do Menu Lateral baseado estritamente no escopo
  public menus: Array<PoMenuItem> = [
    // {
    //   label: 'Home',
    //   action: () => this.router.navigate(['/home']),
    //   icon: 'po-icon-cart',
    //   shortLabel: 'Home',
    // },
    {
      label: 'Catálogo / Carrinho',
      action: () => this.router.navigate(['/home/catalogo']),
      icon: 'an an-shopping-cart',
      shortLabel: 'Catálogo',
    },
    {
      label: 'Cadastros',
      icon: 'an an-users',
      subItems: [
        { label: 'Utilizadores', action: () => this.router.navigate(['/home/usuarios']) },
        { label: 'Categorias', action: () => this.router.navigate(['/home/categorias']) },
        { label: 'Produtos', action: () => this.router.navigate(['/home/produtos']) },
      ],
    },
    {
      label: 'Vendas',
      icon: 'an an-currency-dollar',
      subItems: [
        { label: 'Catálogo / Carrinho', action: () => this.router.navigate(['/home/catalogo']) },
        { label: 'Pedidos', action: () => this.router.navigate(['/home/pedidos']) },
      ],
    },
  ];
}
