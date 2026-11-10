import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { LayoutComponent } from './features/layout/layout.component';
import { authGuard } from './core/guards/auth-guard';
import { CatalogComponent } from './features/catalogo/catalogo.component';
import { PerfilComponent } from './features/perfil/perfil.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { CategoriesComponent } from './features/categorias/categorias.component';
import { ProductsComponent } from './features/produtos/produtos.component';

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
      { path: 'catalogo', component: CatalogComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'categorias', component: CategoriesComponent },
      { path: 'produtos', component: ProductsComponent },
      { path: 'usuarios', component: UsuariosComponent },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
