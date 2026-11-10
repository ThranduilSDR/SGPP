import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
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
} from '@po-ui/ng-components';
import { UserService, User } from '../../core/services/user-service';

@Component({
  selector: 'app-usuarios',
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
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
})
export class UsuariosComponent implements OnInit {
  private userService = inject(UserService);
  private poNotification = inject(PoNotificationService);
  private fb = inject(FormBuilder);

  @ViewChild('userModal', { static: false }) userModal!: PoModalComponent;

  public users: User[] = [];
  public loading = false;
  public isEditing = false;
  public isViewMode = false; // Controla se o modal está em modo de consulta (apenas leitura)
  public modalTitle = 'Novo Utilizador'; //Título dinâmico do modal
  public selectedUserId: string | null = null;
  //variável para decidir acerca do reset de senha via adm
  public changePassword = false;

  public filterValue: string = '';
  public allUsers: User[] = []; // Guarda a lista total da API
  public filteredUsers: User[] = []; // Lista reativa que aparece na tabela

  // Getters inteligentes para alterar os botões do rodapé do modal dinamicamente
  get modalPrimaryAction() {
    if (this.isViewMode) {
      return { label: 'Fechar', action: () => this.userModal.close() };
    }
    return { label: 'Guardar', action: () => this.saveUser() };
  }

  get modalSecondaryAction() {
    if (this.isViewMode) {
      return undefined; // Remove o botão cancelar na visualização
    }
    return { label: 'Cancelar', action: () => this.userModal.close() };
  }

  // Configuração das colunas da tabela corporativa
  public columns: PoTableColumn[] = [
    { property: 'name', label: 'Nome' },
    { property: 'email', label: 'E-mail' },
    { property: 'role', label: 'Perfil' },
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

  // Ações contextuais por linha
  public actions: PoTableAction[] = [
    { action: (row: any) => this.openViewModal(row), label: 'Visualizar', icon: 'an an-eye' }, // <--- NOVO
    { action: (row: any) => this.openEditModal(row), label: 'Editar', icon: 'an an-pencil' },
    { action: (row: any) => this.toggleStatus(row), label: 'Ativar/Inativar', icon: 'an an-power' },
  ];

  public userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['OPERATOR', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  // Método que consome a API e preenche as listas
  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.allUsers = data;
        this.filteredUsers = data; // Inicializa a tabela com todos os registos
      },
      error: () => {
        this.loading = false;
        this.poNotification.error('Erro ao carregar lista de utilizadores.');
      },
    });
  }

  // Lógica executada instantaneamente a cada letra digitada no input
  onFilterChange(value: string): void {
    const searchString = (value || '').toLowerCase().trim();

    if (!searchString) {
      this.filteredUsers = [...this.allUsers]; // Se apagar o texto, mostra todos
      return;
    }

    // Filtra com base no Nome ou no E-mail
    this.filteredUsers = this.allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchString) ||
        user.email.toLowerCase().includes(searchString),
    );
  }

  //criação do usuário
  openCreateModal(): void {
    this.isEditing = false;
    this.isViewMode = false;
    this.selectedUserId = null;
    this.changePassword = true; // No cadastro, a senha é sempre obrigatória/visível
    this.userForm.enable();
    this.userForm.reset({ role: 'OPERATOR' });
    this.modalTitle = 'Novo Utilizador';
    this.userModal.open();
  }

  //edição de usuário
  openEditModal(user: User): void {
    this.isEditing = true;
    this.isViewMode = false;
    this.selectedUserId = user.id || null;
    this.changePassword = false; // Na edição, começa fechado para evitar redefinições acidentais
    this.userForm.enable(); // Reativa o formulário caso venha de um modo de visualização
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '', // Senha fica em branco na edição para não sobrescrever sem querer
    });
    // Na edição, a senha começa opcional
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.modalTitle = 'Editar Utilizador';
    this.userModal.open();
  }

  //Consulta a API por ID, e abre o modal em modo de apenas leitura
  openViewModal(user: User): void {
    if (!user.id) return;

    this.isEditing = false;
    this.isViewMode = true; // Ativa o modo de visualização
    this.changePassword = false;
    this.modalTitle = 'Detalhes do Utilizador';

    this.loading = true;
    this.userService.getUserById(user.id).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.userForm.patchValue({
          name: data.name,
          email: data.email,
          role: data.role,
          password: '',
        });
        this.userForm.disable(); // Desativa todos os campos do formulário para impedir edição
        this.userModal.open();
      },
      error: () => {
        this.loading = false;
        this.poNotification.error('Erro ao carregar detalhes do utilizador.');
      },
    });
  }

  // Método disparado pelo switch/checkbox de alterar senha
  onTogglePasswordChange(event: boolean): void {
    this.changePassword = event;
    const passwordControl = this.userForm.get('password');

    if (this.changePassword) {
      passwordControl?.setValidators([Validators.required]);
    } else {
      passwordControl?.clearValidators();
      passwordControl?.setValue('');
    }
    passwordControl?.updateValueAndValidity();
  }

  saveUser(): void {
    if (this.isViewMode) return;

    if (this.userForm.invalid) {
      this.poNotification.warning('Preencha os campos obrigatórios corretamente.');
      return;
    }

    const formData = this.userForm.value;

    if (this.isEditing && this.selectedUserId) {
      this.userService.updateUser(this.selectedUserId, formData).subscribe({
        next: () => {
          this.poNotification.success('Utilizador atualizado com sucesso!');
          this.userModal.close();
          this.loadUsers();
        },
        error: (err) => {
          this.poNotification.error(err.error?.message || 'Erro ao atualizar utilizador.');
        },
      });
    } else {
      this.userService.createUser(formData).subscribe({
        next: () => {
          this.poNotification.success('Utilizador criado com sucesso!');
          this.userModal.close();
          this.loadUsers();
        },
        error: (err) => {
          this.poNotification.error(err.error?.message || 'Erro ao criar utilizador.');
        },
      });
    }
  }

  toggleStatus(user: User): void {
    if (!user.id) return;
    const newStatus = !user.active;

    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        this.poNotification.success('Status do utilizador atualizado com sucesso!');
        this.loadUsers();
      },
      error: () => {
        this.poNotification.error('Erro ao alterar o status do utilizador.');
      },
    });
  }
}
