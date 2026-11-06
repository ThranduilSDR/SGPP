import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core'; // Ferramentas centrais do Angular
import { provideRouter } from '@angular/router'; // Provedor do sistema de rotas
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Importa o cliente HTTP e a função moderna para interceptors funcionais
import { PoHttpRequestModule } from '@po-ui/ng-components'; // Módulo de requisições HTTP auxiliares do PO-UI

import { routes } from './app.routes'; // Importa as rotas mapeadas da aplicação
import { authInterceptor } from './core/interceptors/auth-interceptor'; // Importa o nosso interceptor funcional de token JWT

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), // Melhora a performance de detecção de mudanças do Angular
    provideRouter(routes), // Configura e ativa o roteamento na aplicação

    // Configura o Cliente HTTP globalmente injetando o interceptor moderno
    provideHttpClient(
      withInterceptors([authInterceptor]), // Passa o interceptor funcional diretamente num array (sem usar 'FromDi')
    ),

    importProvidersFrom(PoHttpRequestModule), // Importa módulos legados do PO-UI que ainda dependem do padrão antigo
  ],
};
