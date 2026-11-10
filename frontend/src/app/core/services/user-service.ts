import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface estrita para os dados do Utilizador
export interface User {
  id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR';
  active?: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/users';

  // 1. Listar todos os utilizadores (GET /api/users)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // 2. Consultar um utilizador específico pelo ID (GET /api/users/:id)
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // 3. Criar um novo utilizador (POST /api/users)
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // 4. Atualizar um utilizador existente (PUT /api/users/:id)
  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  // 5. Ativar/Desativar utilizador (PUT /api/users/:id/status)
  updateUserStatus(id: string, status: boolean): Observable<User> {
    // O backend espera um objeto contendo 'active' no body da requisição
    return this.http.put<User>(`${this.apiUrl}/${id}/status`, { active: status });
  }
}
