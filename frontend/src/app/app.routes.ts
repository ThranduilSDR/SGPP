import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';
import { LoginComponent } from './features/login/login.component';
import { LayoutComponent } from './features/layout/layout.component';
import { authGuard } from './core/guards/auth-guard';
import { CatalogoComponent } from './features/catalogo/catalogo.component';
import { PerfilComponent } from './features/perfil/perfil.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { CategoriasComponent } from './features/categorias/categorias.component';
import { ProdutosComponent } from './features/produtos/produtos.component';
import { CarrinhoComponent } from './features/carrinho/carrinho.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Rota Pai Protegida pelo Layout (Menu Lateral + Toolbar Superior)
  {
    path: 'home',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'catalogo', pathMatch: 'full' },

      { path: 'catalogo', component: CatalogoComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'carrinho', component: CarrinhoComponent },

      // Rotas protegidas pelo adminGuard (Apenas Administradores)
      { path: 'categorias', component: CategoriasComponent, canActivate: [adminGuard] },
      { path: 'produtos', component: ProdutosComponent, canActivate: [adminGuard] },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [adminGuard] },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
