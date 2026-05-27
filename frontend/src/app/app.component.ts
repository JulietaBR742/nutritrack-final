import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from './services/api.service';

type Page = 'login' | 'dashboard' | 'catalogo' | 'registro' | 'perfil' | 'historial' | 'recetas';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="page !== 'login'" class="nav">
      <div class="brand">NutriTrack Angular</div>
      <div class="nav-links">
        <button *ngFor="let item of navItems" (click)="navigate(item.key)">{{ item.label }}</button>
      </div>
      <div class="nav-user">
        <span>{{ user?.nombre }}</span>
        <button (click)="logout()">Salir</button>
      </div>
    </div>

    <section *ngIf="page === 'login'" class="login-shell">
      <div class="login-card">
        <h1>NutriTrack</h1>
        <p>Version Angular conectada a Flask + PyODBC</p>
        <div *ngIf="errorMessage" class="alert">{{ errorMessage }}</div>
        <input [(ngModel)]="loginForm.email" type="email" placeholder="Correo" />
        <input [(ngModel)]="loginForm.password" type="password" placeholder="Contrasena" />
        <button (click)="login()" [disabled]="loading">{{ loading ? 'Entrando...' : 'Iniciar sesion' }}</button>
        <button class="secondary" (click)="register()" [disabled]="loading">Registrarme</button>
      </div>
    </section>

    <main *ngIf="page !== 'login'" class="content">
      <div *ngIf="globalMessage" class="success">{{ globalMessage }}</div>

      <section *ngIf="page === 'dashboard'" class="grid-two">
        <div class="card hero">
          <h2>Resumen del dia</h2>
          <p>{{ dashboard?.fecha }}</p>
          <div class="stat-grid">
            <div>
              <strong>{{ dashboard?.consumido?.calorias || 0 | number:'1.0-0' }}</strong>
              <span>kcal</span>
            </div>
            <div>
              <strong>{{ dashboard?.consumido?.proteina || 0 | number:'1.0-0' }}</strong>
              <span>proteina</span>
            </div>
            <div>
              <strong>{{ dashboard?.consumido?.carbs || 0 | number:'1.0-0' }}</strong>
              <span>carbs</span>
            </div>
            <div>
              <strong>{{ dashboard?.consumido?.grasas || 0 | number:'1.0-0' }}</strong>
              <span>grasas</span>
            </div>
          </div>
        </div>
        <div class="card">
          <h3>Accesos rapidos</h3>
          <button (click)="navigate('registro')">Registrar comida</button>
          <button (click)="navigate('catalogo')">Ver catalogo</button>
          <button (click)="navigate('perfil')">Editar perfil</button>
          <hr />
          <h3>Notificaciones</h3>
          <button class="secondary" (click)="markNotificationsRead()">Marcar todas como leidas</button>
          <ul>
            <li *ngFor="let notification of notifications">
              {{ notification.titulo }} - {{ notification.mensaje }}
            </li>
          </ul>
        </div>
      </section>

      <section *ngIf="page === 'catalogo'" class="card">
        <h2>Catalogo nutricional</h2>
        <div class="toolbar">
          <input [(ngModel)]="catalogSearch" (ngModelChange)="loadCatalog()" placeholder="Buscar alimento" />
          <select [(ngModel)]="catalogCategory" (ngModelChange)="loadCatalog()">
            <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
          </select>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoria</th>
                <th>Calorias</th>
                <th>Proteina</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let alimento of alimentos">
                <td>{{ alimento.nombre }}</td>
                <td>{{ alimento.categoria }}</td>
                <td>{{ alimento.calorias_por_100g }}</td>
                <td>{{ alimento.proteina_g }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section *ngIf="page === 'registro'" class="grid-two">
        <div class="card">
          <h2>Nuevo registro</h2>
          <input [(ngModel)]="registroSearch" (ngModelChange)="searchFoods()" placeholder="Buscar alimento" />
          <select [(ngModel)]="registroForm.alimento_id">
            <option [ngValue]="0">Selecciona un alimento</option>
            <option *ngFor="let alimento of registroAlimentos" [ngValue]="alimento.id">
              {{ alimento.nombre }} - {{ alimento.calorias_por_100g }} kcal
            </option>
          </select>
          <select [(ngModel)]="registroForm.tiempo_comida">
            <option value="desayuno">Desayuno</option>
            <option value="almuerzo">Almuerzo</option>
            <option value="cena">Cena</option>
            <option value="colacion">Colacion</option>
          </select>
          <input [(ngModel)]="registroForm.cantidad_g" type="number" placeholder="Cantidad en gramos" />
          <button (click)="saveRegistro()">Guardar registro</button>
        </div>
        <div class="card">
          <h3>Registros de hoy</h3>
          <ul class="list">
            <li *ngFor="let registro of registros">
              <span>{{ registro.alimento_nombre }} - {{ registro.calorias_totales | number:'1.0-0' }} kcal</span>
              <button class="secondary" (click)="deleteRegistro(registro.id)">Eliminar</button>
            </li>
          </ul>
        </div>
      </section>

      <section *ngIf="page === 'perfil'" class="card form-stack">
        <h2>Mi perfil</h2>
        <input [(ngModel)]="perfil.nombre" placeholder="Nombre" />
        <input [(ngModel)]="perfil.email" placeholder="Email" disabled />
        <input [(ngModel)]="perfil.fecha_nacimiento" type="date" />
        <select [(ngModel)]="perfil.sexo">
          <option value="">Selecciona sexo</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="otro">Otro</option>
        </select>
        <input [(ngModel)]="perfil.altura_cm" type="number" placeholder="Altura cm" />
        <input [(ngModel)]="perfil.peso_kg" type="number" placeholder="Peso kg" />
        <input [(ngModel)]="perfil.meta_calorias" type="number" placeholder="Meta calorias" />
        <input [(ngModel)]="perfil.meta_proteina_g" type="number" placeholder="Meta proteina" />
        <input [(ngModel)]="perfil.meta_carbs_g" type="number" placeholder="Meta carbs" />
        <input [(ngModel)]="perfil.meta_grasas_g" type="number" placeholder="Meta grasas" />
        <button (click)="savePerfil()">Guardar perfil</button>
      </section>

      <section *ngIf="page === 'historial'" class="grid-two">
        <div class="card">
          <h2>Historial de peso</h2>
          <input [(ngModel)]="pesoForm.peso_kg" type="number" placeholder="Peso kg" />
          <input [(ngModel)]="pesoForm.nota" placeholder="Nota" />
          <button (click)="savePeso()">Registrar peso</button>
          <ul class="list">
            <li *ngFor="let item of pesos">{{ item.fecha }} - {{ item.peso_kg }} kg</li>
          </ul>
        </div>
        <div class="card">
          <h2>Agua de hoy</h2>
          <input [(ngModel)]="aguaForm.cantidad_ml" type="number" placeholder="Cantidad ml" />
          <button (click)="saveAgua()">Registrar agua</button>
          <p>Total: {{ agua?.total_ml || 0 }} ml</p>
          <ul class="list">
            <li *ngFor="let item of agua?.registros">{{ item.cantidad_ml }} ml</li>
          </ul>
        </div>
      </section>

      <section *ngIf="page === 'recetas'" class="grid-two">
        <div class="card form-stack">
          <h2>Nueva receta</h2>
          <input [(ngModel)]="recetaForm.nombre" placeholder="Nombre" />
          <textarea [(ngModel)]="recetaForm.descripcion" placeholder="Descripcion"></textarea>
          <input [(ngModel)]="recetaForm.tiempo_min" type="number" placeholder="Tiempo en minutos" />
          <div class="ingredient-builder">
            <select [(ngModel)]="ingredienteForm.alimento_id">
              <option [ngValue]="0">Ingrediente</option>
              <option *ngFor="let alimento of alimentos" [ngValue]="alimento.id">{{ alimento.nombre }}</option>
            </select>
            <input [(ngModel)]="ingredienteForm.cantidad_g" type="number" placeholder="Gramos" />
            <button class="secondary" (click)="addIngrediente()">Agregar</button>
          </div>
          <ul class="list">
            <li *ngFor="let ingrediente of recetaForm.ingredientes">
              {{ ingrediente.nombre }} - {{ ingrediente.cantidad_g }} g
            </li>
          </ul>
          <button (click)="saveReceta()">Guardar receta</button>
        </div>
        <div class="card">
          <h2>Recetas</h2>
          <ul class="list">
            <li *ngFor="let receta of recetas" (click)="viewReceta(receta.id)" class="clickable">
              {{ receta.nombre }} - {{ receta.calorias_total | number:'1.0-0' }} kcal
            </li>
          </ul>
          <div *ngIf="recetaDetalle">
            <h3>{{ recetaDetalle.nombre }}</h3>
            <p>{{ recetaDetalle.descripcion }}</p>
            <ul class="list">
              <li *ngFor="let ingrediente of recetaDetalle.ingredientes">
                {{ ingrediente.nombre }} - {{ ingrediente.cantidad_g }} g
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.5rem;
      background: var(--green-dark);
      color: white;
      position: sticky;
      top: 0;
    }
    .brand { font-weight: 700; }
    .nav-links, .nav-user { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
    .login-shell {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #173c2f, #2d6a4f);
    }
    .login-card, .card {
      background: var(--card);
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 12px 30px rgba(0,0,0,.08);
    }
    .login-card {
      width: min(420px, 100%);
      display: grid;
      gap: .75rem;
      text-align: center;
    }
    .content {
      padding: 1.5rem;
      display: grid;
      gap: 1.5rem;
    }
    .grid-two {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .hero { background: linear-gradient(135deg, #173c2f, #2d6a4f); color: white; }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }
    .stat-grid div {
      background: rgba(255,255,255,.1);
      border-radius: .75rem;
      padding: .85rem;
    }
    .stat-grid strong {
      display: block;
      font-size: 1.35rem;
    }
    .toolbar, .ingredient-builder {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: .75rem;
      margin-bottom: 1rem;
    }
    .form-stack {
      display: grid;
      gap: .75rem;
    }
    input, select, textarea, button {
      width: 100%;
      padding: .8rem .9rem;
      border-radius: .75rem;
      border: 1px solid #d2d6dc;
    }
    button {
      background: var(--green-light);
      color: white;
      border: none;
      cursor: pointer;
    }
    button.secondary {
      background: #e5e7eb;
      color: var(--text);
    }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td {
      padding: .75rem;
      border-bottom: 1px solid #e5e7eb;
      text-align: left;
    }
    .list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: .6rem;
    }
    .list li {
      display: flex;
      justify-content: space-between;
      gap: .75rem;
      padding: .75rem;
      background: #f8fafc;
      border-radius: .75rem;
    }
    .clickable { cursor: pointer; }
    .alert, .success {
      padding: .85rem 1rem;
      border-radius: .75rem;
    }
    .alert {
      background: #fff7ed;
      color: var(--danger);
    }
    .success {
      background: #ecfdf5;
      color: var(--green-mid);
    }
  `],
})
export class AppComponent implements OnInit {
  page: Page = 'login';
  user: any = null;
  loading = false;
  errorMessage = '';
  globalMessage = '';

  navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'catalogo', label: 'Catalogo' },
    { key: 'registro', label: 'Registro' },
    { key: 'perfil', label: 'Perfil' },
    { key: 'historial', label: 'Historial' },
    { key: 'recetas', label: 'Recetas' },
  ] as const;

  categories = ['todos', 'verduras', 'frutas', 'cereales', 'proteinas', 'lacteos', 'grasas', 'bebidas', 'otro'];

  loginForm = { email: '', password: '' };
  dashboard: any = null;
  notifications: any[] = [];
  alimentos: any[] = [];
  catalogSearch = '';
  catalogCategory = 'todos';
  registroSearch = '';
  registroAlimentos: any[] = [];
  registros: any[] = [];
  registroForm = { alimento_id: 0, tiempo_comida: 'desayuno', cantidad_g: null as number | null };
  perfil: any = {};
  pesos: any[] = [];
  agua: any = { registros: [], total_ml: 0 };
  pesoForm = { peso_kg: null as number | null, nota: '' };
  aguaForm = { cantidad_ml: null as number | null };
  recetas: any[] = [];
  recetaDetalle: any = null;
  recetaForm = { nombre: '', descripcion: '', tiempo_min: null as number | null, ingredientes: [] as any[] };
  ingredienteForm = { alimento_id: 0, cantidad_g: null as number | null };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('nutritrack_token');
    const usuario = localStorage.getItem('nutritrack_usuario');
    if (token && usuario) {
      this.user = JSON.parse(usuario);
      this.page = 'dashboard';
      this.loadDashboard();
      this.loadNotifications();
    }
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  private setMessage(message: string): void {
    this.globalMessage = message;
    setTimeout(() => {
      this.globalMessage = '';
    }, 2500);
  }

  async login(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      const response = await this.api.login(this.loginForm.email, this.loginForm.password);
      localStorage.setItem('nutritrack_token', response.token);
      localStorage.setItem('nutritrack_usuario', JSON.stringify(response.usuario));
      this.user = response.usuario;
      this.page = 'dashboard';
      await this.loadDashboard();
      await this.loadNotifications();
    } catch (error: any) {
      this.errorMessage = error?.error?.error || 'No se pudo iniciar sesion';
    } finally {
      this.loading = false;
    }
  }

  async register(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      const response = await this.api.registro({
        nombre: this.loginForm.email.split('@')[0] || 'Usuario',
        email: this.loginForm.email,
        password: this.loginForm.password,
      });
      localStorage.setItem('nutritrack_token', response.token);
      localStorage.setItem('nutritrack_usuario', JSON.stringify(response.usuario));
      this.user = response.usuario;
      this.page = 'dashboard';
      await this.loadDashboard();
      await this.loadNotifications();
    } catch (error: any) {
      this.errorMessage = error?.error?.error || 'No se pudo registrar el usuario';
    } finally {
      this.loading = false;
    }
  }

  logout(): void {
    localStorage.removeItem('nutritrack_token');
    localStorage.removeItem('nutritrack_usuario');
    this.user = null;
    this.page = 'login';
  }

  async navigate(page: Page): Promise<void> {
    this.page = page;
    if (page === 'dashboard') await this.loadDashboard();
    if (page === 'catalogo') await this.loadCatalog();
    if (page === 'registro') {
      await this.searchFoods();
      await this.loadRegistros();
    }
    if (page === 'perfil') await this.loadPerfil();
    if (page === 'historial') await this.loadHistorial();
    if (page === 'recetas') await this.loadRecetas();
  }

  async loadDashboard(): Promise<void> {
    this.dashboard = await this.api.resumen();
  }

  async loadNotifications(): Promise<void> {
    this.notifications = await this.api.listarNotificaciones();
  }

  async markNotificationsRead(): Promise<void> {
    await this.api.marcarTodasLeidas();
    await this.loadNotifications();
    this.setMessage('Notificaciones actualizadas');
  }

  async loadCatalog(): Promise<void> {
    this.alimentos = await this.api.listarAlimentos(this.catalogCategory, this.catalogSearch);
  }

  async searchFoods(): Promise<void> {
    this.registroAlimentos = await this.api.listarAlimentos('todos', this.registroSearch);
    if (this.alimentos.length === 0) {
      this.alimentos = [...this.registroAlimentos];
    }
  }

  async loadRegistros(): Promise<void> {
    this.registros = await this.api.listarRegistros(this.today());
  }

  async saveRegistro(): Promise<void> {
    await this.api.crearRegistro({
      alimento_id: this.registroForm.alimento_id,
      tiempo_comida: this.registroForm.tiempo_comida,
      cantidad_g: this.registroForm.cantidad_g,
    });
    this.registroForm = { alimento_id: 0, tiempo_comida: 'desayuno', cantidad_g: null };
    await this.loadRegistros();
    await this.loadDashboard();
    this.setMessage('Registro guardado');
  }

  async deleteRegistro(id: number): Promise<void> {
    await this.api.eliminarRegistro(id);
    await this.loadRegistros();
    await this.loadDashboard();
    this.setMessage('Registro eliminado');
  }

  async loadPerfil(): Promise<void> {
    this.perfil = await this.api.obtenerPerfil();
  }

  async savePerfil(): Promise<void> {
    await this.api.actualizarPerfil(this.perfil);
    this.setMessage('Perfil actualizado');
  }

  async loadHistorial(): Promise<void> {
    this.pesos = await this.api.obtenerPeso();
    this.agua = await this.api.obtenerAgua(this.today());
  }

  async savePeso(): Promise<void> {
    await this.api.registrarPeso(this.pesoForm);
    this.pesoForm = { peso_kg: null, nota: '' };
    await this.loadHistorial();
    this.setMessage('Peso registrado');
  }

  async saveAgua(): Promise<void> {
    await this.api.registrarAgua(this.aguaForm);
    this.aguaForm = { cantidad_ml: null };
    await this.loadHistorial();
    this.setMessage('Agua registrada');
  }

  async loadRecetas(): Promise<void> {
    this.recetas = await this.api.listarRecetas();
    if (this.alimentos.length === 0) {
      this.alimentos = await this.api.listarAlimentos();
    }
  }

  addIngrediente(): void {
    const selected = this.alimentos.find((item) => item.id === this.ingredienteForm.alimento_id);
    if (!selected || !this.ingredienteForm.cantidad_g) {
      return;
    }
    this.recetaForm.ingredientes.push({
      alimento_id: selected.id,
      cantidad_g: this.ingredienteForm.cantidad_g,
      nombre: selected.nombre,
    });
    this.ingredienteForm = { alimento_id: 0, cantidad_g: null };
  }

  async saveReceta(): Promise<void> {
    await this.api.crearReceta(this.recetaForm);
    this.recetaForm = { nombre: '', descripcion: '', tiempo_min: null, ingredientes: [] };
    await this.loadRecetas();
    this.setMessage('Receta guardada');
  }

  async viewReceta(id: number): Promise<void> {
    this.recetaDetalle = await this.api.obtenerReceta(id);
  }
}
