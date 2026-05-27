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
    <div *ngIf="page !== 'login'" class="navbar">
      <div class="brand">NutriTrack</div>

      <div class="nav-center">
        <button
          type="button"
          *ngFor="let item of navItems"
          (click)="navigate(item.key)"
          [class.active]="page === item.key"
          class="nav-btn"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="nav-right">
        <div class="notif-wrap">
          <button type="button" class="icon-btn" (click)="toggleNotifications()">
            Notificaciones
            <span *ngIf="unreadNotifications > 0" class="notif-badge">{{ unreadNotifications }}</span>
          </button>
          <div *ngIf="showNotifications" class="notif-panel">
            <div class="notif-head">
              <strong>Notificaciones</strong>
              <button type="button" class="text-btn" (click)="markNotificationsRead()">Marcar todas leidas</button>
            </div>
            <div *ngIf="notifications.length === 0" class="notif-empty">Sin notificaciones</div>
            <div *ngFor="let notification of notifications.slice(0, 5)" class="notif-item" [class.unread]="!notification.leida">
              <p>{{ notification.titulo }}</p>
              <span>{{ notification.mensaje }}</span>
            </div>
          </div>
        </div>

        <button type="button" class="profile-chip" (click)="navigate('perfil')">
          <span class="avatar">{{ initials }}</span>
          <span>{{ firstName }}</span>
        </button>

        <button type="button" class="logout-btn" (click)="logout()">Salir</button>
      </div>
    </div>

    <section *ngIf="page === 'login'" class="login-page">
      <div class="login-glow login-glow-right"></div>
      <div class="login-glow login-glow-left"></div>
      <div class="login-card">
        <div class="login-header">
          <div class="logo-badge">NT</div>
          <h1>NutriTrack</h1>
          <p>Tu companero de alimentacion saludable</p>
        </div>

        <div *ngIf="errorMessage" class="alert danger">{{ errorMessage }}</div>

        <label>Correo electronico</label>
        <input [(ngModel)]="loginForm.email" type="email" placeholder="usuario@email.com" />

        <label>Contrasena</label>
        <input [(ngModel)]="loginForm.password" type="password" placeholder="********" />

        <button type="button" class="primary-btn" (click)="login()" [disabled]="loading">
          {{ loading ? 'Entrando...' : 'Iniciar sesion' }}
        </button>
        <button type="button" class="secondary-btn wide-btn" (click)="register()" [disabled]="loading">
          Registrarme
        </button>
      </div>
    </section>

    <main *ngIf="page !== 'login'" class="page-shell">
      <div *ngIf="globalMessage" class="alert success">{{ globalMessage }}</div>
      <div *ngIf="errorMessage && page !== 'login'" class="alert danger">{{ errorMessage }}</div>

      <section *ngIf="page === 'dashboard'" class="dashboard-page">
        <div class="hero-card">
          <div>
            <p class="hero-eyebrow">Buenos dias</p>
            <h2>{{ user?.nombre || 'Usuario' }}</h2>
            <div class="macro-row">
              <span>Prot: <b>{{ dashboard?.consumido?.proteina || 0 | number:'1.0-0' }}g</b></span>
              <span>Carb: <b>{{ dashboard?.consumido?.carbs || 0 | number:'1.0-0' }}g</b></span>
              <span>Gras: <b>{{ dashboard?.consumido?.grasas || 0 | number:'1.0-0' }}g</b></span>
            </div>
            <p class="hero-sub">
              {{ caloriesRemaining | number:'1.0-0' }} kcal restantes para tu meta
            </p>
          </div>
          <div class="goal-pill">
            <strong>{{ dashboard?.consumido?.calorias || 0 | number:'1.0-0' }}</strong>
            <span>/ {{ dashboard?.metas?.meta_calorias || 2000 | number:'1.0-0' }}</span>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <p>Agua hoy</p>
            <strong>{{ ((dashboard?.agua_ml || 0) / 1000) | number:'1.1-1' }} L</strong>
            <span>meta: 2.5 L</span>
          </div>
          <div class="stat-card">
            <p>Peso actual</p>
            <strong>{{ dashboard?.peso_actual?.peso_kg || '--' }} kg</strong>
            <span>{{ dashboard?.peso_actual?.fecha || 'Sin registro' }}</span>
          </div>
          <div class="stat-card">
            <p>Dias con datos</p>
            <strong>{{ dashboard?.semana?.length || 0 }}</strong>
            <span>en la ultima semana</span>
          </div>
          <div class="stat-card">
            <p>Restantes</p>
            <strong>{{ caloriesRemaining | number:'1.0-0' }} kcal</strong>
            <span>para tu meta</span>
          </div>
        </div>

        <div class="two-col">
          <div class="panel-card">
            <div class="panel-head">
              <h3>Calorias - ultimos 7 dias</h3>
            </div>
            <div *ngIf="(dashboard?.semana?.length || 0) === 0" class="empty-text">Sin datos esta semana</div>
            <div *ngIf="(dashboard?.semana?.length || 0) > 0" class="bars">
              <div *ngFor="let day of dashboard?.semana" class="bar-col">
                <div class="bar-fill" [style.height.%]="barHeight(day.calorias)"></div>
                <span>{{ shortDate(day.fecha) }}</span>
              </div>
            </div>
          </div>

          <div class="panel-card">
            <div class="panel-head">
              <h3>Accesos rapidos</h3>
            </div>
            <button type="button" class="quick-link" (click)="navigate('registro')">Registrar comida</button>
            <button type="button" class="quick-link" (click)="navigate('catalogo')">Ver catalogo</button>
            <button type="button" class="quick-link" (click)="navigate('perfil')">Mi perfil y metas</button>
          </div>
        </div>
      </section>

      <section *ngIf="page === 'catalogo'" class="section-page">
        <div class="section-header">
          <div>
            <h2>Catalogo Nutricional</h2>
            <p>Consulta alimentos y sus valores por cada 100 gramos.</p>
          </div>
          <div class="filters-row">
            <input [(ngModel)]="catalogSearch" (ngModelChange)="loadCatalog()" placeholder="Buscar alimento..." />
            <select [(ngModel)]="catalogCategory" (ngModelChange)="loadCatalog()">
              <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
            </select>
          </div>
        </div>

        <div class="food-grid">
          <div *ngFor="let alimento of alimentos" class="food-card">
            <div class="food-emoji">{{ emojiForCategory(alimento.categoria) }}</div>
            <div class="food-body">
              <h4>{{ alimento.nombre }}</h4>
              <p>{{ alimento.categoria }}</p>
              <div class="food-meta">
                <span>{{ alimento.calorias_por_100g }} kcal</span>
                <small>/ 100g</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section *ngIf="page === 'registro'" class="section-page">
        <div class="section-header">
          <div>
            <h2>Nuevo Registro</h2>
            <p>Agrega lo que consumiste hoy.</p>
          </div>
        </div>

        <div class="two-col">
          <div class="panel-card form-card">
            <h3>Registrar comida</h3>
            <div class="chip-row">
              <button
                type="button"
                *ngFor="let meal of mealOptions"
                class="chip-btn"
                [class.active]="registroForm.tiempo_comida === meal.key"
                (click)="registroForm.tiempo_comida = meal.key"
              >
                {{ meal.label }}
              </button>
            </div>
            <input [(ngModel)]="registroSearch" (ngModelChange)="searchFoods()" placeholder="Buscar alimento..." />
            <select [(ngModel)]="registroForm.alimento_id">
              <option [ngValue]="0">Selecciona un alimento</option>
              <option *ngFor="let alimento of registroAlimentos" [ngValue]="alimento.id">
                {{ alimento.nombre }} - {{ alimento.calorias_por_100g }} kcal
              </option>
            </select>
            <input [(ngModel)]="registroForm.cantidad_g" type="number" placeholder="Cantidad en gramos" />

            <div *ngIf="selectedFood && registroForm.cantidad_g" class="estimate-box">
              <b>Estimado:</b>
              {{ estimatedCalories | number:'1.0-0' }} kcal ·
              P: {{ estimatedProtein | number:'1.0-0' }}g ·
              C: {{ estimatedCarbs | number:'1.0-0' }}g ·
              G: {{ estimatedFat | number:'1.0-0' }}g
            </div>

            <div class="actions-row">
              <button type="button" class="secondary-btn" (click)="clearRegistro()">Limpiar</button>
              <button type="button" class="primary-btn" (click)="saveRegistro()">Guardar</button>
            </div>
          </div>

          <div class="panel-card">
            <h3>Registros de hoy</h3>
            <div *ngIf="registros.length === 0" class="empty-text">Sin registros hoy.</div>
            <div *ngFor="let registro of registros" class="list-row">
              <div>
                <strong>{{ registro.alimento_nombre }}</strong>
                <p>{{ registro.tiempo_comida }} · {{ registro.cantidad_g }} g</p>
              </div>
              <div class="row-actions">
                <span>{{ registro.calorias_totales | number:'1.0-0' }} kcal</span>
                <button type="button" class="danger-btn" (click)="deleteRegistro(registro.id)">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section *ngIf="page === 'perfil'" class="section-page">
        <div class="profile-hero">
          <div class="profile-avatar">{{ initials }}</div>
          <div>
            <h2>{{ perfil?.nombre || user?.nombre }}</h2>
            <p>{{ perfil?.email || user?.email }}</p>
          </div>
        </div>

        <div class="profile-stats">
          <div class="mini-stat">
            <strong>{{ perfil?.peso_kg || '—' }}</strong>
            <span>Peso actual</span>
          </div>
          <div class="mini-stat">
            <strong>{{ perfil?.altura_cm || '—' }}</strong>
            <span>Altura</span>
          </div>
          <div class="mini-stat">
            <strong>{{ bmi }}</strong>
            <span>IMC</span>
          </div>
        </div>

        <div class="two-col">
          <div class="panel-card form-card">
            <h3>Datos personales</h3>
            <input [(ngModel)]="perfil.nombre" placeholder="Nombre completo" />
            <input [(ngModel)]="perfil.email" placeholder="Email" disabled />
            <input [(ngModel)]="perfil.fecha_nacimiento" type="date" />
            <select [(ngModel)]="perfil.sexo">
              <option value="">Selecciona sexo</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
            <input [(ngModel)]="perfil.altura_cm" type="number" placeholder="Altura (cm)" />
            <input [(ngModel)]="perfil.peso_kg" type="number" placeholder="Peso actual (kg)" />
          </div>

          <div class="panel-card form-card">
            <h3>Meta calorica diaria</h3>
            <input [(ngModel)]="perfil.meta_calorias" type="number" placeholder="Calorias por dia" />
            <input [(ngModel)]="perfil.meta_proteina_g" type="number" placeholder="Proteina (g)" />
            <input [(ngModel)]="perfil.meta_carbs_g" type="number" placeholder="Carbohidratos (g)" />
            <input [(ngModel)]="perfil.meta_grasas_g" type="number" placeholder="Grasas (g)" />
            <button type="button" class="primary-btn" (click)="savePerfil()">Guardar perfil</button>
          </div>
        </div>
      </section>

      <section *ngIf="page === 'historial'" class="section-page">
        <div class="section-header inline-tabs">
          <div>
            <h2>Historial</h2>
          </div>
          <div class="chip-row">
            <button type="button" class="chip-btn" [class.active]="historialView === 'peso'" (click)="historialView = 'peso'">Peso</button>
            <button type="button" class="chip-btn" [class.active]="historialView === 'agua'" (click)="historialView = 'agua'">Agua</button>
          </div>
        </div>

        <div *ngIf="historialView === 'peso'" class="two-col">
          <div class="panel-card form-card">
            <h3>Registrar peso</h3>
            <input [(ngModel)]="pesoForm.peso_kg" type="number" placeholder="Peso (kg)" />
            <input [(ngModel)]="pesoForm.nota" placeholder="Nota opcional" />
            <button type="button" class="primary-btn" (click)="savePeso()">Registrar</button>
          </div>
          <div class="panel-card">
            <h3>Evolucion de peso</h3>
            <div *ngIf="pesos.length === 0" class="empty-text">Sin registros aun</div>
            <div *ngFor="let item of pesos" class="list-row">
              <div>
                <strong>{{ longDate(item.fecha) }}</strong>
                <p>{{ item.nota || 'Sin nota' }}</p>
              </div>
              <span>{{ item.peso_kg }} kg</span>
            </div>
          </div>
        </div>

        <div *ngIf="historialView === 'agua'" class="two-col">
          <div class="panel-card form-card">
            <h3>Registrar agua</h3>
            <div class="chip-row">
              <button type="button" class="chip-btn" *ngFor="let amount of waterAmounts" (click)="aguaForm.cantidad_ml = amount">{{ amount }} ml</button>
            </div>
            <input [(ngModel)]="aguaForm.cantidad_ml" type="number" placeholder="Otro monto" />
            <button type="button" class="primary-btn" (click)="saveAgua()">Registrar</button>
          </div>
          <div class="panel-card">
            <h3>Consumo de hoy</h3>
            <p class="water-total">{{ ((agua?.total_ml || 0) / 1000) | number:'1.2-2' }} L</p>
            <div class="progress-track">
              <div class="progress-fill" [style.width.%]="waterProgress"></div>
            </div>
            <div *ngFor="let item of agua?.registros" class="list-row">
              <span>{{ item.hora || '--:--' }}</span>
              <strong>{{ item.cantidad_ml }} ml</strong>
            </div>
          </div>
        </div>
      </section>

      <section *ngIf="page === 'recetas'" class="section-page">
        <div class="section-header inline-tabs">
          <div>
            <h2>Recetas</h2>
            <p>Recetas guardadas y personalizadas.</p>
          </div>
          <div class="chip-row">
            <button type="button" class="chip-btn" [class.active]="recetasView === 'lista'" (click)="recetasView = 'lista'">Mis recetas</button>
            <button type="button" class="chip-btn" [class.active]="recetasView === 'nueva'" (click)="recetasView = 'nueva'">Nueva receta</button>
          </div>
        </div>

        <div *ngIf="recetasView === 'lista'" class="recipe-grid">
          <button type="button" *ngFor="let receta of recetas" class="recipe-card" (click)="viewReceta(receta.id)">
            <div class="recipe-icon">Receta</div>
            <h4>{{ receta.nombre }}</h4>
            <p>{{ receta.descripcion || 'Sin descripcion' }}</p>
            <div class="recipe-meta">
              <span *ngIf="receta.tiempo_min">{{ receta.tiempo_min }} min</span>
              <span>{{ receta.calorias_total | number:'1.0-0' }} kcal</span>
            </div>
          </button>
          <div *ngIf="recetas.length === 0" class="panel-card empty-card">
            <p>No hay recetas aun.</p>
          </div>
        </div>

        <div *ngIf="recetasView === 'detalle' && recetaDetalle" class="panel-card">
          <button type="button" class="text-btn left-text" (click)="recetasView = 'lista'">Volver</button>
          <h3>{{ recetaDetalle.nombre }}</h3>
          <p>{{ recetaDetalle.descripcion }}</p>
          <div *ngFor="let ingrediente of recetaDetalle.ingredientes" class="list-row">
            <span>{{ ingrediente.nombre }}</span>
            <strong>{{ ingrediente.cantidad_g }} g</strong>
          </div>
        </div>

        <div *ngIf="recetasView === 'nueva'" class="panel-card form-card recipe-form">
          <h3>Nueva receta</h3>
          <input [(ngModel)]="recetaForm.nombre" placeholder="Nombre de la receta" />
          <textarea [(ngModel)]="recetaForm.descripcion" placeholder="Descripcion"></textarea>
          <input [(ngModel)]="recetaForm.tiempo_min" type="number" placeholder="Tiempo en minutos" />

          <div class="ingredient-builder">
            <select [(ngModel)]="ingredienteForm.alimento_id">
              <option [ngValue]="0">Ingrediente</option>
              <option *ngFor="let alimento of alimentos" [ngValue]="alimento.id">{{ alimento.nombre }}</option>
            </select>
            <input [(ngModel)]="ingredienteForm.cantidad_g" type="number" placeholder="Gramos" />
            <button type="button" class="secondary-btn" (click)="addIngrediente()">Agregar</button>
          </div>

          <div *ngFor="let ingrediente of recetaForm.ingredientes" class="list-row">
            <span>{{ ingrediente.nombre }}</span>
            <div class="row-actions">
              <strong>{{ ingrediente.cantidad_g }} g</strong>
              <button type="button" class="danger-btn" (click)="removeIngrediente(ingrediente.alimento_id)">Quitar</button>
            </div>
          </div>

          <div class="actions-row">
            <button type="button" class="secondary-btn" (click)="resetReceta()">Cancelar</button>
            <button type="button" class="primary-btn" (click)="saveReceta()">Guardar receta</button>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 20;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0 36px;
      background: var(--green-dark);
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      color: white;
    }
    .brand {
      font-family: 'Georgia', serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--green-soft);
    }
    .nav-center, .nav-right, .chip-row, .row-actions, .filters-row, .actions-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .nav-btn {
      background: none;
      border: none;
      padding: 6px 2px;
      color: rgba(255,255,255,0.55);
      font-size: 14px;
      font-weight: 600;
      border-bottom: 2px solid transparent;
      cursor: pointer;
    }
    .nav-btn.active {
      color: white;
      border-bottom-color: var(--green-light);
    }
    .icon-btn, .logout-btn, .profile-chip, .text-btn {
      border: none;
      cursor: pointer;
    }
    .icon-btn {
      position: relative;
      background: rgba(255,255,255,0.08);
      color: white;
      padding: 8px 12px;
      border-radius: 10px;
    }
    .notif-wrap { position: relative; }
    .notif-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 999px;
      background: var(--orange);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
      color: white;
    }
    .notif-panel {
      position: absolute;
      right: 0;
      top: 44px;
      width: 320px;
      background: white;
      border-radius: 14px;
      box-shadow: var(--shadow);
      overflow: hidden;
      color: var(--text-dark);
    }
    .notif-head, .notif-item {
      padding: 12px 16px;
    }
    .notif-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--cream-dark);
    }
    .notif-item {
      border-bottom: 1px solid var(--cream-dark);
      background: white;
    }
    .notif-item.unread {
      background: #f0faf5;
    }
    .notif-item p {
      margin: 0 0 4px;
      font-size: 13px;
      font-weight: 700;
    }
    .notif-item span, .notif-empty {
      color: var(--text-light);
      font-size: 12px;
    }
    .notif-empty { padding: 16px; text-align: center; }
    .text-btn {
      background: none;
      color: var(--green-mid);
      font-size: 12px;
      font-weight: 700;
    }
    .left-text { padding: 0; margin-bottom: 12px; }
    .profile-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      background: none;
      color: white;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--green-light), var(--orange));
      font-size: 13px;
      font-weight: 700;
    }
    .logout-btn {
      background: none;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      padding: 6px 10px;
      color: rgba(255,255,255,0.7);
    }
    .login-page {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a3a2a 0%, #0f2d1f 60%, #1a3a2a 100%);
      overflow: hidden;
      padding: 24px;
    }
    .login-glow {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }
    .login-glow-right {
      top: -120px;
      right: -120px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(82,183,136,.12) 0%, transparent 70%);
    }
    .login-glow-left {
      bottom: -100px;
      left: -100px;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(224,122,58,.08) 0%, transparent 70%);
    }
    .login-card {
      width: min(460px, 100%);
      padding: 52px;
      border-radius: 24px;
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 24px 64px rgba(0,0,0,0.4);
      color: white;
      position: relative;
      z-index: 1;
    }
    .login-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .logo-badge {
      width: 64px;
      height: 64px;
      margin: 0 auto 12px;
      border-radius: 18px;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg,#52b788,#95d5b2);
      color: white;
      font-weight: 700;
      font-size: 22px;
    }
    .login-card h1, .section-header h2, .panel-head h3, .panel-card h3, .hero-card h2, .profile-hero h2 {
      font-family: 'Georgia', serif;
      margin: 0;
    }
    .login-card p {
      margin-top: 8px;
      color: rgba(255,255,255,0.58);
    }
    .login-card label {
      display: block;
      margin: 14px 0 6px;
      font-size: 11px;
      font-weight: 700;
      color: rgba(255,255,255,0.64);
      text-transform: uppercase;
      letter-spacing: .5px;
    }
    .page-shell {
      padding: 28px 36px;
      background: var(--cream);
      min-height: calc(100vh - 64px);
    }
    .alert {
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 18px;
      font-size: 14px;
    }
    .alert.success {
      background: #e8f5ee;
      border: 1px solid var(--green-light);
      color: var(--green-mid);
      font-weight: 600;
    }
    .alert.danger {
      background: #fff3e0;
      border: 1px solid var(--orange);
      color: var(--orange);
    }
    .hero-card {
      background: var(--green-dark);
      color: white;
      border-radius: var(--radius);
      padding: 28px 32px 38px;
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: center;
      position: relative;
      overflow: hidden;
    }
    .hero-eyebrow {
      color: rgba(255,255,255,0.5);
      font-size: 13px;
      margin: 0 0 4px;
    }
    .macro-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 14px 0 10px;
    }
    .macro-row span {
      padding: 6px 14px;
      border-radius: 20px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      font-size: 12px;
    }
    .hero-sub {
      font-size: 12px;
      color: rgba(255,255,255,0.5);
      margin: 0;
    }
    .goal-pill {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.08);
      border: 10px solid var(--green-light);
      text-align: center;
    }
    .goal-pill strong {
      font-size: 20px;
    }
    .goal-pill span {
      font-size: 10px;
      color: rgba(255,255,255,0.6);
    }
    .stats-grid, .food-grid, .recipe-grid, .profile-stats {
      display: grid;
      gap: 16px;
    }
    .stats-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin: 28px 0;
    }
    .stat-card, .mini-stat {
      background: white;
      border-radius: var(--radius);
      padding: 20px;
      box-shadow: var(--shadow-sm);
    }
    .stat-card p, .mini-stat span {
      margin: 0 0 6px;
      font-size: 11px;
      color: var(--text-light);
      text-transform: uppercase;
      letter-spacing: .5px;
      font-weight: 700;
    }
    .stat-card strong, .mini-stat strong, .water-total {
      font-size: 22px;
      color: var(--green-mid);
    }
    .stat-card span {
      font-size: 12px;
      color: var(--text-light);
    }
    .two-col {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 20px;
      align-items: start;
    }
    .panel-card {
      background: white;
      border-radius: var(--radius);
      padding: 22px;
      box-shadow: var(--shadow-sm);
    }
    .panel-card h3 {
      font-size: 17px;
      color: var(--green-dark);
      margin-bottom: 16px;
    }
    .panel-head {
      margin-bottom: 16px;
    }
    .quick-link {
      width: 100%;
      text-align: left;
      padding: 12px;
      background: var(--cream);
      border: none;
      border-radius: 12px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .bars {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      height: 100px;
    }
    .bar-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .bar-fill {
      width: 100%;
      min-height: 4px;
      border-radius: 6px 6px 0 0;
      background: var(--green-light);
    }
    .bar-col span {
      font-size: 11px;
      color: var(--text-light);
      font-weight: 600;
    }
    .section-page {
      display: grid;
      gap: 20px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      background: white;
      padding: 16px 22px;
      border-radius: var(--radius);
      box-shadow: 0 2px 10px rgba(0,0,0,.05);
    }
    .section-header p {
      margin: 4px 0 0;
      color: var(--text-light);
      font-size: 13px;
    }
    .food-grid {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
    .food-card {
      background: white;
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .food-emoji {
      height: 90px;
      display: grid;
      place-items: center;
      font-size: 42px;
      background: linear-gradient(135deg,#d8f3dc,#95d5b2);
    }
    .food-body {
      padding: 12px;
    }
    .food-body h4 {
      margin: 0;
      font-size: 13px;
    }
    .food-body p {
      margin: 2px 0 8px;
      color: var(--text-light);
      font-size: 11px;
      text-transform: capitalize;
    }
    .food-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 700;
      color: var(--green-mid);
    }
    .food-meta small {
      background: #e8f5ee;
      color: var(--green-mid);
      border-radius: 20px;
      padding: 2px 8px;
      font-size: 10px;
    }
    .form-card input, .form-card select, .form-card textarea,
    .filters-row input, .filters-row select {
      width: 100%;
      padding: 11px 14px;
      border: 2px solid var(--cream-dark);
      border-radius: 10px;
      background: var(--cream);
      outline: none;
    }
    .estimate-box {
      background: #e8f5ee;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 13px;
    }
    .list-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: var(--cream);
      border-radius: 10px;
      margin-bottom: 8px;
    }
    .list-row p {
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--text-light);
    }
    .danger-btn {
      background: #fce4ec;
      color: #e57373;
      border: none;
      border-radius: 8px;
      padding: 6px 10px;
      font-weight: 700;
      cursor: pointer;
    }
    .primary-btn {
      background: linear-gradient(135deg,#52b788,#40916c);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 12px 18px;
      font-weight: 700;
      cursor: pointer;
    }
    .secondary-btn, .chip-btn {
      background: var(--cream-dark);
      color: var(--text-mid);
      border: none;
      border-radius: 10px;
      padding: 11px 16px;
      cursor: pointer;
      font-weight: 600;
    }
    .wide-btn { width: 100%; margin-top: 10px; }
    .chip-btn {
      border-radius: 20px;
      padding: 7px 16px;
      font-size: 13px;
    }
    .chip-btn.active {
      background: var(--green-light);
      color: white;
    }
    .profile-hero {
      background: linear-gradient(160deg,var(--green-dark) 0%,#2d6a4f 100%);
      padding: 40px 36px 60px;
      border-radius: var(--radius);
      color: white;
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg,#52b788,#e07a3a);
      display: grid;
      place-items: center;
      font-size: 26px;
      font-weight: 700;
      border: 3px solid rgba(255,255,255,0.3);
    }
    .profile-hero p {
      margin-top: 4px;
      color: rgba(255,255,255,0.65);
    }
    .profile-stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin-top: -28px;
    }
    .mini-stat { text-align: center; }
    .progress-track {
      height: 10px;
      border-radius: 20px;
      background: var(--cream-dark);
      overflow: hidden;
      margin: 12px 0 18px;
    }
    .progress-fill {
      height: 100%;
      border-radius: 20px;
      background: linear-gradient(90deg,#52b788,#95d5b2);
    }
    .recipe-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .recipe-card {
      text-align: left;
      background: linear-gradient(135deg,#1a3a2a,#0f2d1f);
      color: white;
      border: none;
      border-radius: var(--radius);
      padding: 24px;
      cursor: pointer;
    }
    .recipe-card h4 {
      font-family: 'Georgia', serif;
      margin: 0 0 6px;
      font-size: 17px;
    }
    .recipe-card p {
      color: rgba(255,255,255,0.68);
      font-size: 12px;
      min-height: 32px;
    }
    .recipe-meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 12px;
    }
    .recipe-meta span, .recipe-icon {
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
    }
    .recipe-icon {
      display: inline-block;
      margin-bottom: 8px;
    }
    .recipe-form textarea {
      min-height: 90px;
      resize: vertical;
    }
    .ingredient-builder {
      display: grid;
      grid-template-columns: 1.2fr .8fr auto;
      gap: 10px;
    }
    .empty-text, .empty-card {
      color: var(--text-light);
      font-size: 13px;
    }
    @media (max-width: 1100px) {
      .stats-grid, .food-grid, .recipe-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .two-col {
        grid-template-columns: 1fr;
      }
      .section-header {
        flex-direction: column;
        align-items: stretch;
      }
    }
    @media (max-width: 760px) {
      .navbar {
        height: auto;
        padding: 14px 16px;
        flex-direction: column;
        align-items: stretch;
      }
      .nav-center, .nav-right {
        justify-content: center;
      }
      .page-shell {
        padding: 18px 16px;
      }
      .login-card {
        padding: 32px 22px;
      }
      .stats-grid, .food-grid, .recipe-grid, .profile-stats {
        grid-template-columns: 1fr;
      }
      .profile-hero {
        padding: 28px 22px 44px;
      }
      .ingredient-builder {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class AppComponent implements OnInit {
  page: Page = 'login';
  user: any = null;
  loading = false;
  errorMessage = '';
  globalMessage = '';
  showNotifications = false;
  historialView: 'peso' | 'agua' = 'peso';
  recetasView: 'lista' | 'nueva' | 'detalle' = 'lista';

  navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'registro', label: 'Registro' },
    { key: 'catalogo', label: 'Catalogo' },
    { key: 'historial', label: 'Historial' },
    { key: 'recetas', label: 'Recetas' },
    { key: 'perfil', label: 'Perfil' },
  ] as const;

  mealOptions = [
    { key: 'desayuno', label: 'Desayuno' },
    { key: 'almuerzo', label: 'Almuerzo' },
    { key: 'cena', label: 'Cena' },
    { key: 'colacion', label: 'Colacion' },
  ];

  categories = ['todos', 'verduras', 'frutas', 'cereales', 'proteinas', 'lacteos', 'grasas', 'bebidas', 'otro'];
  waterAmounts = [150, 250, 350, 500];

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
      void this.safeRun(async () => {
        await this.loadDashboard();
        await this.loadNotifications();
      });
    }
  }

  get firstName(): string {
    return this.user?.nombre?.split(' ')[0] || '';
  }

  get initials(): string {
    return this.user?.nombre
      ? this.user.nombre.split(' ').map((word: string) => word[0]).join('').slice(0, 2).toUpperCase()
      : '?';
  }

  get unreadNotifications(): number {
    return this.notifications.filter((notification) => !notification.leida).length;
  }

  get selectedFood(): any {
    return this.registroAlimentos.find((item) => item.id === this.registroForm.alimento_id);
  }

  get estimatedCalories(): number {
    return this.estimateMacro('calorias_por_100g');
  }

  get estimatedProtein(): number {
    return this.estimateMacro('proteina_g');
  }

  get estimatedCarbs(): number {
    return this.estimateMacro('carbs_g');
  }

  get estimatedFat(): number {
    return this.estimateMacro('grasas_g');
  }

  get bmi(): string {
    if (!this.perfil?.peso_kg || !this.perfil?.altura_cm) {
      return '—';
    }
    const height = Number(this.perfil.altura_cm) / 100;
    return (Number(this.perfil.peso_kg) / (height * height)).toFixed(1);
  }

  get caloriesRemaining(): number {
    const goal = Number(this.dashboard?.metas?.meta_calorias || 2000);
    const consumed = Number(this.dashboard?.consumido?.calorias || 0);
    return Math.max(goal - consumed, 0);
  }

  get waterProgress(): number {
    return Math.min(((this.agua?.total_ml || 0) / 2500) * 100, 100);
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  private async safeRun(task: () => Promise<void>, fallback = 'Ocurrio un error inesperado'): Promise<void> {
    this.errorMessage = '';
    try {
      await task();
    } catch (error: any) {
      this.errorMessage = error?.error?.error || error?.message || fallback;
    }
  }

  private setMessage(message: string): void {
    this.globalMessage = message;
    setTimeout(() => {
      this.globalMessage = '';
    }, 2500);
  }

  private estimateMacro(key: string): number {
    if (!this.selectedFood || !this.registroForm.cantidad_g) {
      return 0;
    }
    return (Number(this.selectedFood[key]) * Number(this.registroForm.cantidad_g)) / 100;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  barHeight(value: number): number {
    const days = this.dashboard?.semana || [];
    const max = Math.max(...days.map((day: any) => Number(day.calorias || 0)), 1);
    return (Number(value || 0) / max) * 100;
  }

  shortDate(value: string): string {
    return new Date(value).toLocaleDateString('es-MX', { weekday: 'short' });
  }

  longDate(value: string): string {
    return new Date(value).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  emojiForCategory(category: string): string {
    const map: Record<string, string> = {
      verduras: '🥦',
      frutas: '🍎',
      cereales: '🌾',
      proteinas: '🍗',
      lacteos: '🥛',
      grasas: '🥑',
      bebidas: '🥤',
      otro: '🍽️',
    };
    return map[category] || '🍽️';
  }

  async login(): Promise<void> {
    this.loading = true;
    await this.safeRun(async () => {
      const response = await this.api.login(this.loginForm.email, this.loginForm.password);
      localStorage.setItem('nutritrack_token', response.token);
      localStorage.setItem('nutritrack_usuario', JSON.stringify(response.usuario));
      this.user = response.usuario;
      this.page = 'dashboard';
      await this.loadDashboard();
      await this.loadNotifications();
    }, 'No se pudo iniciar sesion');
    this.loading = false;
  }

  async register(): Promise<void> {
    this.loading = true;
    await this.safeRun(async () => {
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
    }, 'No se pudo registrar el usuario');
    this.loading = false;
  }

  logout(): void {
    localStorage.removeItem('nutritrack_token');
    localStorage.removeItem('nutritrack_usuario');
    this.user = null;
    this.page = 'login';
    this.showNotifications = false;
    this.errorMessage = '';
  }

  async navigate(page: Page): Promise<void> {
    this.page = page;
    this.showNotifications = false;
    await this.safeRun(async () => {
      if (page === 'dashboard') {
        await this.loadDashboard();
      }
      if (page === 'catalogo') {
        await this.loadCatalog();
      }
      if (page === 'registro') {
        await this.searchFoods();
        await this.loadRegistros();
      }
      if (page === 'perfil') {
        await this.loadPerfil();
      }
      if (page === 'historial') {
        await this.loadHistorial();
      }
      if (page === 'recetas') {
        this.recetasView = 'lista';
        await this.loadRecetas();
      }
    }, 'No se pudo cargar la seccion');
  }

  async loadDashboard(): Promise<void> {
    this.dashboard = await this.api.resumen();
  }

  async loadNotifications(): Promise<void> {
    this.notifications = await this.api.listarNotificaciones();
  }

  async markNotificationsRead(): Promise<void> {
    await this.safeRun(async () => {
      await this.api.marcarTodasLeidas();
      await this.loadNotifications();
      this.setMessage('Notificaciones actualizadas');
    }, 'No se pudieron actualizar las notificaciones');
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

  clearRegistro(): void {
    this.registroForm = { alimento_id: 0, tiempo_comida: 'desayuno', cantidad_g: null };
    this.registroSearch = '';
  }

  async saveRegistro(): Promise<void> {
    await this.safeRun(async () => {
      await this.api.crearRegistro({
        alimento_id: this.registroForm.alimento_id,
        tiempo_comida: this.registroForm.tiempo_comida,
        cantidad_g: this.registroForm.cantidad_g,
      });
      this.clearRegistro();
      await this.loadRegistros();
      await this.loadDashboard();
      this.setMessage('Registro guardado');
    }, 'No se pudo guardar el registro');
  }

  async deleteRegistro(id: number): Promise<void> {
    await this.safeRun(async () => {
      await this.api.eliminarRegistro(id);
      await this.loadRegistros();
      await this.loadDashboard();
      this.setMessage('Registro eliminado');
    }, 'No se pudo eliminar el registro');
  }

  async loadPerfil(): Promise<void> {
    this.perfil = await this.api.obtenerPerfil();
  }

  async savePerfil(): Promise<void> {
    await this.safeRun(async () => {
      await this.api.actualizarPerfil(this.perfil);
      await this.loadPerfil();
      this.setMessage('Perfil actualizado');
    }, 'No se pudo actualizar el perfil');
  }

  async loadHistorial(): Promise<void> {
    this.pesos = await this.api.obtenerPeso();
    this.agua = await this.api.obtenerAgua(this.today());
  }

  async savePeso(): Promise<void> {
    await this.safeRun(async () => {
      await this.api.registrarPeso(this.pesoForm);
      this.pesoForm = { peso_kg: null, nota: '' };
      await this.loadHistorial();
      this.setMessage('Peso registrado');
    }, 'No se pudo registrar el peso');
  }

  async saveAgua(): Promise<void> {
    await this.safeRun(async () => {
      await this.api.registrarAgua(this.aguaForm);
      this.aguaForm = { cantidad_ml: null };
      await this.loadHistorial();
      this.setMessage('Agua registrada');
    }, 'No se pudo registrar el agua');
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
      this.errorMessage = 'Selecciona un ingrediente y una cantidad';
      return;
    }
    this.errorMessage = '';
    this.recetaForm.ingredientes.push({
      alimento_id: selected.id,
      cantidad_g: this.ingredienteForm.cantidad_g,
      nombre: selected.nombre,
    });
    this.ingredienteForm = { alimento_id: 0, cantidad_g: null };
  }

  removeIngrediente(alimentoId: number): void {
    this.recetaForm.ingredientes = this.recetaForm.ingredientes.filter((item) => item.alimento_id !== alimentoId);
  }

  resetReceta(): void {
    this.recetaForm = { nombre: '', descripcion: '', tiempo_min: null, ingredientes: [] };
    this.recetasView = 'lista';
  }

  async saveReceta(): Promise<void> {
    await this.safeRun(async () => {
      await this.api.crearReceta(this.recetaForm);
      this.recetaForm = { nombre: '', descripcion: '', tiempo_min: null, ingredientes: [] };
      await this.loadRecetas();
      this.recetasView = 'lista';
      this.setMessage('Receta guardada');
    }, 'No se pudo guardar la receta');
  }

  async viewReceta(id: number): Promise<void> {
    await this.safeRun(async () => {
      this.recetaDetalle = await this.api.obtenerReceta(id);
      this.recetasView = 'detalle';
    }, 'No se pudo cargar la receta');
  }
}
