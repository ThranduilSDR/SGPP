import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PoPageModule,
  PoTableModule,
  PoFieldModule,
  PoModalModule,
  PoButtonModule,
  PoModalComponent,
  PoTableColumn,
  PoTableAction,
  PoNotificationService,
} from '@po-ui/ng-components';
import { CategoryService } from '../../core/services/category-service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PoPageModule,
    PoTableModule,
    PoFieldModule,
    PoModalModule,
    PoButtonModule,
  ],
  templateUrl: './categorias.component.html',
})
export class CategoriasComponent implements OnInit {
  @ViewChild(PoModalComponent, { static: true }) categoryModal!: PoModalComponent;

  public loading: boolean = false;
  public allCategories: any[] = [];
  public filteredCategories: any[] = [];
  public filterValue: string = '';

  public currentCategory: any = { name: '', description: '' };
  public isEditMode: boolean = false;
  public isViewMode: boolean = false;
  public modalTitle: string = 'Nova Categoria';

  public columns: PoTableColumn[] = [
    { property: 'name', label: 'Nome' },
    { property: 'description', label: 'Descrição' },
  ];

  // Getters inteligentes: mudam os botões do modal automaticamente conforme o modo,
  // sem precisar de tocar no código do openNewModal ou openEditModal.
  get modalPrimaryAction() {
    if (this.isViewMode) {
      return { label: 'Fechar', action: () => this.categoryModal.close() };
    }
    return { label: 'Guardar', action: () => this.saveCategory() };
  }

  get modalSecondaryAction() {
    if (this.isViewMode) {
      return undefined; // Remove o botão cancelar na consulta
    }
    return { label: 'Cancelar', action: () => this.categoryModal.close() };
  }

  public actions: PoTableAction[] = [
    { action: this.openViewModal.bind(this), icon: 'po-icon-eye', label: 'Visualizar' }, // <--- Nova ação para atender ao requisito
    { action: this.openEditModal.bind(this), icon: 'po-icon-edit', label: 'Editar' },
    {
      action: this.deleteCategory.bind(this),
      icon: 'po-icon-delete',
      label: 'Excluir',
      type: 'danger',
    },
  ];

  constructor(
    private categoryService: CategoryService,
    private poNotification: PoNotificationService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data: any) => {
        this.loading = false;

        // Verifica se os dados vieram como array direto ou embrulhados em propriedades comuns do Sequelize/API
        if (Array.isArray(data)) {
          this.allCategories = data;
        } else if (data && Array.isArray(data.rows)) {
          this.allCategories = data.rows; // Caso o backend use paginação do Sequelize (rows/count)
        } else if (data && Array.isArray(data.data)) {
          this.allCategories = data.data; // Caso o backend embrulhe numa propriedade 'data'
        } else {
          this.allCategories = [];
        }

        this.filteredCategories = [...this.allCategories];

        // Olhe para o F12 (Console) do navegador para ver o formato exato que chegou da API
        console.log('Dados brutos da API:', data);
        console.log('Array processado para a tabela:', this.allCategories);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erro na requisição:', err);
        this.poNotification.error('Erro ao carregar lista de categorias.');
      },
    });
  }

  // Lógica idêntica à aprovada no filtro de utilizadores
  onFilterChange(value: string): void {
    const searchString = (value || '').toLowerCase().trim();

    if (!searchString) {
      this.filteredCategories = [...this.allCategories];
      return;
    }

    this.filteredCategories = this.allCategories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchString) ||
        (cat.description && cat.description.toLowerCase().includes(searchString)),
    );
  }

  // Consulta a API por ID e abre o modal em modo de visualização (apenas leitura)
  openViewModal(category: any): void {
    if (category.id) {
      this.categoryService.getCategoryById(category.id).subscribe({
        next: (data) => {
          this.isViewMode = true; // Ativa a leitura e oculta o botão guardar via getter
          this.modalTitle = 'Detalhes da Categoria';
          this.currentCategory = { ...data };
          this.categoryModal.open();
        },
        error: () => this.poNotification.error('Erro ao carregar detalhes da categoria.'),
      });
    }
  }

  openNewModal(): void {
    this.isEditMode = false;
    this.isViewMode = false;
    this.modalTitle = 'Nova Categoria';
    this.currentCategory = { name: '', description: '' };
    this.categoryModal.open();
  }

  openEditModal(category: any): void {
    this.isEditMode = true;
    this.isViewMode = false;
    this.modalTitle = 'Editar Categoria';
    this.currentCategory = { ...category };
    this.categoryModal.open();
  }

  saveCategory(): void {
    if (this.isViewMode) return;

    if (!this.currentCategory.name) {
      this.poNotification.warning('O nome da categoria é obrigatório.');
      return;
    }

    if (this.isEditMode && this.currentCategory.id) {
      this.categoryService.updateCategory(this.currentCategory.id, this.currentCategory).subscribe({
        next: () => {
          this.poNotification.success('Categoria atualizada com sucesso!');
          this.categoryModal.close();
          this.loadCategories();
        },
        error: () => this.poNotification.error('Erro ao atualizar categoria.'),
      });
    } else {
      this.categoryService.createCategory(this.currentCategory).subscribe({
        next: () => {
          this.poNotification.success('Categoria criada com sucesso!');
          this.categoryModal.close();
          this.loadCategories();
        },
        error: () => this.poNotification.error('Erro ao criar categoria.'),
      });
    }
  }

  deleteCategory(category: any): void {
    if (category.id) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.poNotification.success('Categoria excluída com sucesso!');
          this.loadCategories();
        },
        error: () => this.poNotification.error('Erro ao excluir categoria.'),
      });
    }
  }
}
