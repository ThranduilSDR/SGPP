import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PoModule, PoSelectOption, PoNotificationService } from '@po-ui/ng-components';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../core/services/product-service';
import { CategoryService } from '../../core/services/category-service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, PoModule],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss'],
})
export class CatalogComponent implements OnInit {
  public loading: boolean = false;

  // Listas
  public allProducts: any[] = [];
  public filteredProducts: any[] = [];
  public categoryOptions: PoSelectOption[] = [];

  // Filtros
  public filterText: string = '';
  public filterCategory: string = '';

  // Modal de Detalhes / Compra
  public selectedProduct: any = null;
  public purchaseQuantity: number = 1;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private poNotification: PoNotificationService,
  ) {}

  ngOnInit(): void {
    this.loadCatalogData();
  }

  loadCatalogData(): void {
    this.loading = true;

    forkJoin({
      products: this.productService.getProducts(),
      categories: this.categoryService.getCategories(),
    }).subscribe({
      next: (res: any) => {
        this.loading = false;

        const categoriesList = Array.isArray(res.categories)
          ? res.categories
          : res.categories.rows || res.categories.data || [];
        const categoryMap = new Map<string, string>();

        this.categoryOptions = categoriesList.map((cat: any) => {
          categoryMap.set(cat.id, cat.name);
          return { label: cat.name, value: cat.id };
        });

        const rawProducts = Array.isArray(res.products)
          ? res.products
          : res.products.rows || res.products.data || [];

        // Regra: Exibir SOMENTE produtos ativos (active === true)
        this.allProducts = rawProducts
          .filter((prod: any) => prod.active === true)
          .map((prod: any) => ({
            ...prod,
            categoryName: categoryMap.get(prod.categoryId) || 'Categoria não encontrada',
          }));

        this.applyFilters();
      },
      error: () => {
        this.loading = false;
        this.poNotification.error('Erro ao carregar o catálogo de produtos.');
      },
    });
  }

  // Retorna o tipo da tag de forma segura para o PO-UI
  getTagType(stock: number): any {
    return stock > 0 ? 'success' : 'danger';
  }

  // Retorna o texto formatado para a tag de stock
  getTagValue(stock: number): string {
    return stock > 0 ? `Stock: ${stock}` : 'Indisponível';
  }

  applyFilters(): void {
    const searchString = (this.filterText || '').toLowerCase().trim();

    this.filteredProducts = this.allProducts.filter((prod) => {
      const matchesText =
        !searchString ||
        (prod.name && prod.name.toLowerCase().includes(searchString)) ||
        (prod.code && prod.code.toLowerCase().includes(searchString));

      const matchesCategory = !this.filterCategory || prod.categoryId === this.filterCategory;

      return matchesText && matchesCategory;
    });
  }

  clearFilters(): void {
    this.filterText = '';
    this.filterCategory = '';
    this.applyFilters();
  }

  // Abre o Modal de Detalhes do Produto
  openProductDetails(product: any): void {
    this.selectedProduct = product;
    this.purchaseQuantity = product.stock > 0 ? 1 : 0;
    // Se utilizar o po-modal por template reference, pode dar .open() aqui ou ligar a uma variável booleana
    const modalElement = document.getElementById('productModal') as any;
    // Nota: No PO-UI costumamos usar a directiva de componente modal com .open()
  }

  // Adicionar ao Carrinho respeitando o stock disponível
  addToCart(product: any): void {
    if (product.stock <= 0) {
      this.poNotification.warning('Este produto encontra-se indisponível no momento.');
      return;
    }

    // Lógica futura de carrinho (ex: serviço de carrinho ou estado global)
    this.poNotification.success(`Produto "${product.name}" adicionado ao carrinho!`);
  }
}
