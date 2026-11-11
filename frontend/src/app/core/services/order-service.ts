import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = 'http://localhost:5000/api/orders';

  constructor(private http: HttpClient) {}

  // Realiza o checkout criando um pedido a partir do carrinho atual
  createOrder(): Observable<any> {
    return this.http.post<any>(this.apiUrl, {});
  }

  // Lista os pedidos (Admin vê todos, utilizador comum vê apenas os seus)
  getOrders(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Obtém detalhes completos de um pedido específico
  getOrderById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Cancela um pedido pendente/finalizado e devolve os itens ao estoque
  cancelOrder(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
