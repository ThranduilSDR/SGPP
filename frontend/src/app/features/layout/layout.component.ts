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

  // Configuração do Menu Lateral
  public menus: Array<PoMenuItem> = [];

  ngOnInit(): void {
    this.buildMenu();
  }

  buildMenu(): void {
    const currentUser = this.authService.getUser();
    const isAdmin = currentUser && currentUser.role === 'ADMIN';

    // Menu base visível para todos os perfis (ex: Catálogo)
    const baseMenus: Array<PoMenuItem> = [
      {
        label: 'Catálogo',
        action: () => this.router.navigate(['/home/catalogo']),
        icon: 'an an-shopping-cart',
        shortLabel: 'Catálogo',
      },
    ];

    // Se o usuário for administrador, adiciona o menu de Cadastros
    if (isAdmin) {
      baseMenus.push({
        label: 'Cadastros',
        icon: 'an an-users',
        subItems: [
          { label: 'Utilizadores', action: () => this.router.navigate(['/home/usuarios']) },
          { label: 'Categorias', action: () => this.router.navigate(['/home/categorias']) },
          { label: 'Produtos', action: () => this.router.navigate(['/home/produtos']) },
        ],
      });
    }

    // Menu de Vendas visível para todos
    baseMenus.push({
      label: 'Vendas',
      icon: 'an an-currency-dollar',
      subItems: [
        { label: 'Carrinho', action: () => this.router.navigate(['/home/carrinho']) },
        { label: 'Pedidos', action: () => this.router.navigate(['/home/pedidos']) },
      ],
    });

    this.menus = baseMenus;
  }
}
