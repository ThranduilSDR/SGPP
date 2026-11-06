import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { LayoutComponent } from './features/layout/layout.component';
import { HomeComponent } from './features/home/home.component';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Rota Pai Protegida pelo Layout (Menu Lateral + Toolbar Superior)
  {
    path: 'home',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // Após login, redireciona por padrão para o Catálogo / Carrinho[cite: 4]
      { path: '', redirectTo: 'catalogo', pathMatch: 'full' },

      // Tela principal / dashboard temporária
      { path: 'catalogo', component: HomeComponent },

      // Espaços reservados para as próximas telas do módulo de Cadastros e Vendas
      // { path: 'usuarios', component: UsuariosComponent },
      // { path: 'produtos', component: ProdutosComponent },
      // { path: 'pedidos', component: PedidosComponent },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
