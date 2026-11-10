import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PoModule, PoNotificationService } from '@po-ui/ng-components';
import { CartService } from '../../core/services/cart-service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, FormsModule, PoModule],
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.scss'],
})
export class CarrinhoComponent implements OnInit {
  public loading: boolean = false;
  public cartItems: any[] = [];
  public cartTotal: number = 0;

  constructor(
    private cartService: CartService,
    private poNotification: PoNotificationService,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (res: any) => {
        this.loading = false;
        // Ajuste conforme a estrutura JSON que o backend retorna (ex: res.items ou res)
        this.cartItems = res.items || res.rows || (Array.isArray(res) ? res : []);
        this.calculateTotal();
      },
      error: () => {
        this.loading = false;
        this.poNotification.error('Erro ao carregar o carrinho de compras.');
      },
    });
  }

  calculateTotal(): void {
    this.cartTotal = this.cartItems.reduce((acc, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 0;
      return acc + price * quantity;
    }, 0);
  }

  // Ajustar quantidade de um item (respeitando >= 1 e stock)
  updateQuantity(item: any, newQuantity: number): void {
    if (newQuantity < 1) {
      this.poNotification.warning('A quantidade mínima permitida é 1.');
      return;
    }

    const stock = item.product?.stock ?? item.stock ?? 9999;
    if (newQuantity > stock) {
      this.poNotification.warning(`Quantidade solicitada excede o stock disponível (${stock}).`);
      return;
    }

    this.cartService.updateItemQuantity(item.id, newQuantity).subscribe({
      next: () => {
        item.quantity = newQuantity;
        this.calculateTotal();
        this.poNotification.success('Quantidade atualizada.');
      },
      error: (err) => {
        this.poNotification.error(err.error?.message || 'Erro ao atualizar quantidade.');
      },
    });
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId).subscribe({
      next: () => {
        this.poNotification.success('Item removido do carrinho.');
        this.loadCart();
      },
      error: () => {
        this.poNotification.error('Erro ao remover o item.');
      },
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.poNotification.success('Carrinho esvaziado.');
        this.cartItems = [];
        this.cartTotal = 0;
      },
      error: () => {
        this.poNotification.error('Erro ao limpar o carrinho.');
      },
    });
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      this.poNotification.warning('O carrinho está vazio.');
      return;
    }
    // Redireciona para a rota de fecho de pedido / vendas
    this.router.navigate(['/home/checkout']); // ou '/home/pedidos/novo'
  }
}
