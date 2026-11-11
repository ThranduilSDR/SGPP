import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PoModule, PoNotificationService } from '@po-ui/ng-components';
import { OrderService } from '../../core/services/order-service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, PoModule],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss'],
})
export class PedidosComponent implements OnInit {
  public loading: boolean = false;
  public orders: any[] = [];
  public selectedOrder: any = null;

  constructor(
    private orderService: OrderService,
    private poNotification: PoNotificationService,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (res: any) => {
        this.loading = false;
        this.orders = Array.isArray(res) ? res : res.rows || res.data || [];
      },
      error: () => {
        this.loading = false;
        this.poNotification.error('Erro ao carregar a lista de pedidos.');
      },
    });
  }

  openOrderDetails(orderId: string, modal: any): void {
    this.orderService.getOrderById(orderId).subscribe({
      next: (res: any) => {
        this.selectedOrder = res;
        modal.open();
      },
      error: () => {
        this.poNotification.error('Erro ao carregar os detalhes do pedido.');
      },
    });
  }

  cancelOrder(orderId: string): void {
    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        this.poNotification.success('Pedido cancelado e stock restaurado com sucesso.');
        this.loadOrders();
      },
      error: (err) => {
        this.poNotification.error(err.error?.message || 'Erro ao cancelar o pedido.');
      },
    });
  }

  getStatusType(status: string): any {
    if (status === 'FINALIZADO') return 'success';
    if (status === 'CANCELADO') return 'danger';
    return 'warning';
  }
}
