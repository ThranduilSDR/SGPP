import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  PoPageModule,
  PoTableModule,
  PoButtonModule,
  PoModalModule,
  PoModalComponent,
  PoFieldModule,
  PoNotificationService,
  PoTableAction,
  PoTableColumn,
  PoSelectOption,
} from '@po-ui/ng-components';
import { ProductService } from '../../core/services/product-service';
import { CategoryService } from '../../core/services/category-service';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PoPageModule,
    PoTableModule,
    PoButtonModule,
    PoModalModule,
    PoFieldModule,
  ],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.scss',
})
export class ProdutosComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private poNotification = inject(PoNotificationService);
  private fb = inject(FormBuilder);

  @ViewChild('productModal', { static: false }) productModal!: PoModalComponent;

  public loading = false;
  public isEditing = false;
  public isViewMode = false;
  public modalTitle = 'Novo Produto';
  public selectedProductId: string | null = null;

  // Filtros da tela
  public filterText: string = '';
  public filterCategory: string = '';
  public filterStatus: string = '';

  public allProducts: any[] = [];
  public filteredProducts: any[] = [];
  public categoryOptions: PoSelectOption[] = [];

  // Opções para o filtro de status
  public statusOptions: PoSelectOption[] = [
    { label: 'Ativo', value: 'true' },
    { label: 'Inativo', value: 'false' },
  ];

  // Configuração das colunas da tabela (incluindo Código e Status)
  public columns: PoTableColumn[] = [
    { property: 'code', label: 'Código' },
    { property: 'name', label: 'Nome' },
    { property: 'categoryName', label: 'Categoria' },
    { property: 'price', label: 'Preço', type: 'currency', format: 'BRL' },
    { property: 'stock', label: 'Stock' },
    {
      property: 'active',
      label: 'Status',
      type: 'label',
      labels: [
        { value: true as any, color: 'color-10', label: 'Ativo' },
        { value: false as any, color: 'color-07', label: 'Inativo' },
      ],
    },
  ];

  public actions: PoTableAction[] = [
    { action: (row: any) => this.openViewModal(row), label: 'Visualizar', icon: 'an an-eye' },
    { action: (row: any) => this.openEditModal(row), label: 'Editar', icon: 'an an-pencil' },
    {
      action: (row: any) => this.deleteProduct(row),
      label: 'Excluir',
      icon: 'an an-trash',
      type: 'danger',
    },
  ];

  public productForm: FormGroup = this.fb.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    categoryId: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    active: [true, [Validators.required]],
  });

  ngOnInit(): void {
    this.loadData();
  }

  //Carrega produtos e categorias em paralelo e cruza o nome da categoria

  loadData(): void {
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

        // Apenas opções reais de categorias
        this.categoryOptions = categoriesList.map((cat: any) => {
          categoryMap.set(cat.id, cat.name);
          return { label: cat.name, value: cat.id };
        });

        const rawProducts = Array.isArray(res.products)
          ? res.products
          : res.products.rows || res.products.data || [];

        this.allProducts = rawProducts.map((prod: any) => ({
          ...prod,
          categoryName: categoryMap.get(prod.categoryId) || 'Categoria não encontrada',
        }));

        this.applyFilters();
      },
      error: () => {
        this.loading = false;
        this.poNotification.error('Erro ao carregar dados dos produtos.');
      },
    });
  }

  /**
   * Limpa todos os filtros aplicados e restaura a tabela completa
   */
  clearFilters(): void {
    this.filterText = '';
    this.filterCategory = '';
    this.filterStatus = '';
    this.applyFilters();
  }
  //Aplica os filtros considerando '', null ou undefined como "sem filtro"

  applyFilters(): void {
    const searchString = (this.filterText || '').toLowerCase().trim();

    this.filteredProducts = this.allProducts.filter((prod) => {
      const matchesText =
        !searchString ||
        (prod.name && prod.name.toLowerCase().includes(searchString)) ||
        (prod.code && prod.code.toLowerCase().includes(searchString));

      const matchesCategory = !this.filterCategory || prod.categoryId === this.filterCategory;
      const matchesStatus = !this.filterStatus || String(prod.active) === this.filterStatus;

      return matchesText && matchesCategory && matchesStatus;
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.isViewMode = false;
    this.selectedProductId = null;
    this.productForm.enable();
    this.productForm.reset({ price: 0, stock: 0, active: true });
    this.modalTitle = 'Novo Produto';
    this.productModal.open();
  }

  openEditModal(product: any): void {
    this.isEditing = true;
    this.isViewMode = false;
    this.selectedProductId = product.id || null;
    this.productForm.enable();
    this.productForm.patchValue({
      code: product.code,
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      stock: product.stock,
      description: product.description,
      active: product.active,
    });
    this.modalTitle = 'Editar Produto';
    this.productModal.open();
  }

  // Consulta a API por ID (GET /api/products/:id) e abre o modal em modo de leitura

  openViewModal(product: any): void {
    if (!product.id) return;

    this.isEditing = false;
    this.isViewMode = true;
    this.modalTitle = 'Detalhes do Produto';

    this.loading = true;
    this.productService.getProductById(product.id).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.productForm.patchValue({
          code: data.code,
          name: data.name,
          categoryId: data.categoryId,
          price: data.price,
          stock: data.stock,
          description: data.description,
          active: data.active,
        });
        this.productForm.disable(); // Bloqueia todos os campos para consulta
        this.productModal.open();
      },
      error: () => {
        this.loading = false;
        this.poNotification.error('Erro ao carregar detalhes do produto.');
      },
    });
  }

  saveProduct(): void {
    if (this.isViewMode) return;

    if (this.productForm.invalid) {
      this.poNotification.warning('Preencha os campos obrigatórios corretamente.');
      return;
    }

    const formData = this.productForm.value;

    if (this.isEditing && this.selectedProductId) {
      this.productService.updateProduct(this.selectedProductId, formData).subscribe({
        next: () => {
          this.poNotification.success('Produto atualizado com sucesso!');
          this.productModal.close();
          this.loadData();
        },
        error: (err) => {
          this.poNotification.error(err.error?.message || 'Erro ao atualizar produto.');
        },
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: () => {
          this.poNotification.success('Produto criado com sucesso!');
          this.productModal.close();
          this.loadData();
        },
        error: (err) => {
          this.poNotification.error(err.error?.message || 'Erro ao criar produto.');
        },
      });
    }
  }

  deleteProduct(product: any): void {
    if (!product.id) return;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.poNotification.success('Produto excluído com sucesso!');
        this.loadData();
      },
      error: () => {
        this.poNotification.error('Erro ao excluir produto.');
      },
    });
  }
}
