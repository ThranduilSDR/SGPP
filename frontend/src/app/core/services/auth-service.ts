import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// Interface que define o contrato do objeto retornado pelo backend (Token + Dados do Usuário)
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
}

@Injectable({
  providedIn: 'root', // Torna o serviço global e disponível em toda a aplicação sem precisar registrar em módulos
})
export class AuthService {
  private http = inject(HttpClient); // Ferramenta nativa do Angular para chamadas HTTP (POST, GET, etc.)
  private router = inject(Router); // Ferramenta para navegar entre as rotas (redirecionar telas)

  // URL base da sua API backend Node.js
  private apiUrl = 'http://localhost:3000/api/auth';

  /**
   * =================================================================
   * FUNCIONAMENTO DE SIGNALS E O ESTADO BOOLEANO DE AUTENTICAÇÃO:
   * =================================================================
   * O 'isAuthenticated' é um Signal do Angular 21. Ele armazena um valor booleano
   * (true ou false) que reage a mudanças.
   *
   * Ele chama o método privado 'hasToken()' para checar de imediato: se o navegador
   * já tiver um token salvo (ex: se o usuário der F5 na página), ele nasce como 'true'.
   * Caso contrário, nasce como 'false'.
   */
  public isAuthenticated = signal<boolean>(this.hasToken());

  /**
   * Método auxiliar estritamente BOOLEANO (`true` ou `false`):
   * - 'localStorage.getItem('token')' vai ao navegador buscar se o token existe.
   * - Se existir, retorna a string do token. Se não existir, retorna 'null'.
   * - O operador duplo de negação '!!' serve para converter qualquer valor em booleano puro:
   *   Exemplo:
   *     Se houver token (string) -> !string vira false -> !!vira TRUE.
   *     Se for null (vazio)      -> !null vira true   -> !!vira FALSE.
   */
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Método responsável por executar o login no backend:
   * Recebe as credenciais, dispara o POST e utiliza o operador 'tap' do RxJS
   * para escutar a resposta e executar ações colaterais sem alterar o fluxo principal.
   */
  login(credentials: { login: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        // Verifica se a resposta da API realmente trouxe o token JWT
        if (response && response.token) {
          /**
           * =================================================================
           * FUNCIONAMENTO DO LOCALSTORAGE:
           * =================================================================
           * O 'localStorage' é um espaço de armazenamento interno do próprio navegador web.
           * Diferente das variáveis comuns do TypeScript (que somem se você fechar a aba
           * ou atualizar a página), o localStorage persiste os dados até que sejam
           * explicitamente apagados ou o navegador seja limpo.
           *
           * - setItem('chave', 'valor'): Salva um dado no navegador.
           *   Como o token é uma string pura, guardamos direto.
           *   Como o 'response.user' é um objeto JavaScript, precisamos usar 'JSON.stringify()'
           *   para transformá-lo em texto, pois o localStorage só aceita strings.
           */
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));

          // Atualiza o Signal para 'true'. Qualquer tela ou componente que escute
          // esse signal saberá instantaneamente que o usuário está logado.
          this.isAuthenticated.set(true);
        }
      }),
    );
  }

  /**
   * Método de Logout (Encerrar Sessão):
   * Limpa os rastros do usuário no navegador.
   */
  logout(): void {
    // Remove do localStorage os dados salvos anteriormente
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Altera o Signal booleano de volta para 'false'
    this.isAuthenticated.set(false);

    // Força o redirecionamento imediato para a tela de login
    this.router.navigate(['/login']);
  }

  /**
   * Método utilitário que retorna o token puro para ser usado pelo AuthInterceptor
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Recupera os dados do usuário logado convertendo a string JSON de volta para objeto
   */
  getUser() {
    const user = localStorage.getItem('user');
    // Se existir string salva, converte com JSON.parse; se não, retorna null
    return user ? JSON.parse(user) : null;
  }
}
