import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = 'http://localhost:5000/api/cart';

  constructor(private http: HttpClient) {}

  // Retorna o carrinho ativo do usuário logado e seus itens
  getCart(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Adiciona um produto ao carrinho (incrementa quantidade se já existir)
  addItem(productId: string, quantity: number = 1): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/items`, { productId, quantity });
  }

  // Atualiza a quantidade de um item específico no carrinho
  updateItemQuantity(itemId: string, quantity: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/items/${itemId}`, { quantity });
  }

  // Remove um item específico do carrinho
  removeItem(itemId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/items/${itemId}`);
  }

  // Esvazia todo o carrinho
  clearCart(): Observable<any> {
    return this.http.delete<any>(this.apiUrl + '/items');
  }
}
