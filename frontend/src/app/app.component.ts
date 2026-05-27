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
    <nav *ngIf="page !== 'login'" class="navbar">
      <div class="brand">NutriTrack</div>

      <div class="nav-links">
        <button type="button" *ngFor="let item of navItems" class="nav-btn" [class.active]="page === item.key" (click)="navigate(item.key)">
          {{ item.label }}
        </button>
      </div>

      <div class="nav-tools">
        <div class="notif-wrap">
          <button type="button" class="icon-btn" (click)="toggleNotifications()">
            🔔
            <span *ngIf="unreadNotifications > 0" class="notif-badge">{{ unreadNotifications }}</span>
          </button>
          <div *ngIf="showNotifications" class="notif-panel">
            <div class="notif-header">
              <span>Notificaciones</span>
              <button type="button" class="link-btn" (click)="markNotificationsRead()">Marcar todas</button>
            </div>
            <div *ngIf="notifications.length === 0" class="notif-empty">Sin notificaciones</div>
            <div *ngFor="let notification of notifications.slice(0, 5)" class="notif-item" [class.unread]="!notification.leida">
              <p>{{ notification.titulo }}</p>
              <small>{{ notification.mensaje }}</small>
            </div>
          </div>
        </div>

        <button type="button" class="profile-btn" (click)="navigate('perfil')">
          <span class="avatar">{{ initials }}</span>
          <span>{{ firstName }}</span>
        </button>

        <button type="button" class="logout-btn" (click)="logout()">Salir</button>
      </div>
    </nav>

    <section *ngIf="page === 'login'" class="login-page">
      <div class="login-orb orb-right"></div>
      <div class="login-orb orb-left"></div>
      <div class="login-card">
        <div class="login-icon">🌿</div>
        <h1>NutriTrack</h1>
        <p>Tu companero de alimentacion saludable</p>

        <div *ngIf="errorMessage" class="alert danger">{{ errorMessage }}</div>

        <label>Correo electronico</label>
        <input [(ngModel)]="loginForm.email" type="email" placeholder="usuario@email.com" />

        <label>Contrasena</label>
        <input [(ngModel)]="loginForm.password" type="password" placeholder="********" />

        <button type="button" class="primary-btn wide" (click)="login()" [disabled]="loading">
          {{ loading ? 'Entrando...' : 'Iniciar sesion' }}
        </button>
        <button type="button" class="ghost-btn wide" (click)="register()" [disabled]="loading">Registrarme</button>
      </div>
    </section>

    <main *ngIf="page !== 'login'" class="page-shell">
      <div *ngIf="globalMessage" class="alert success">{{ globalMessage }}</div>
      <div *ngIf="errorMessage && page !== 'login'" class="alert danger">{{ errorMessage }}</div>

      <section *ngIf="page === 'dashboard'" class="dashboard">
        <div class="hero-card">
          <div class="hero-copy">
            <p class="hero-label">Buenos dias</p>
            <h2>{{ user?.nombre || 'Usuario' }}</h2>
            <div class="macro-row">
              <span>🥩 Prot: <b>{{ dashboard?.consumido?.proteina || 0 | number:'1.0-0' }}g</b></span>
              <span>🌾 Carb: <b>{{ dashboard?.consumido?.carbs || 0 | number:'1.0-0' }}g</b></span>
              <span>🥑 Gras: <b>{{ dashboard?.consumido?.grasas || 0 | number:'1.0-0' }}g</b></span>
            </div>
            <p class="hero-text">{{ caloriesRemaining | number:'1.0-0' }} kcal restantes para tu meta</p>
          </div>

          <div class="goal-ring">
            <strong>{{ dashboard?.consumido?.calorias || 0 | number:'1.0-0' }}</strong>
            <small>/ {{ dashboard?.metas?.meta_calorias || 2000 | number:'1.0-0' }}</small>
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
            <h3>Calorias - ultimos 7 dias</h3>
            <div *ngIf="(dashboard?.semana?.length || 0) === 0" class="empty-text">Sin datos esta semana</div>
            <div *ngIf="(dashboard?.semana?.length || 0) > 0" class="bars">
              <div *ngFor="let day of dashboard?.semana" class="bar-col">
                <div class="bar-fill" [style.height.%]="barHeight(day.calorias)"></div>
                <span>{{ shortDate(day.fecha) }}</span>
              </div>
            </div>
          </div>

          <div class="panel-card">
            <h3>Accesos rapidos</h3>
            <button type="button" class="quick-link" (click)="navigate('registro')">📝 Registrar comida</button>
            <button type="button" class="quick-link" (click)="navigate('catalogo')">📚 Ver catalogo</button>
            <button type="button" class="quick-link" (click)="navigate('perfil')">👤 Mi perfil y metas</button>
          </div>
        </div>
      </section>

      <section *ngIf="page === 'catalogo'" class="section-page">
        <div class="section-header">
          <div>
            <h2>📚 Catalogo Nutricional</h2>
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
          <article *ngFor="let alimento of alimentos" class="food-card">
            <div class="food-emoji">{{ emojiForCategory(alimento.categoria) }}</div>
            <div class="food-body">
              <h4>{{ alimento.nombre }}</h4>
              <p>{{ alimento.categoria }}</p>
              <div class="food-meta">
                <span>{{ alimento.calorias_por_100g }} kcal</span>
                <small>/ 100g</small>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section *ngIf="page === 'registro'" class="section-page">
        <div class="section-header">
          <div>
            <h2>📝 Nuevo Registro</h2>
            <p>Agrega lo que consumiste hoy.</p>
          </div>
        </div>

        <div class="two-col">
          <div class="panel-card form-card">
            <h3>Registrar comida</h3>
            <div class="chip-row">
              <button type="button" *ngFor="let meal of mealOptions" class="chip-btn" [class.active]="registroForm.tiempo_comida === meal.key" (click)="registroForm.tiempo_comida = meal.key">
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
              <button type="button" class="ghost-btn" (click)="clearRegistro()">Limpiar</button>
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
          <div class="stat-card center">
            <strong>{{ perfil?.peso_kg || '—' }}</strong>
            <span>Peso actual</span>
          </div>
          <div class="stat-card center">
            <strong>{{ perfil?.altura_cm || '—' }}</strong>
            <span>Altura</span>
          </div>
          <div class="stat-card center">
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
        <div class="section-header">
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
        <div class="section-header">
          <div>
            <h2>🍽️ Recetas</h2>
            <p>Recetas guardadas y personalizadas.</p>
          </div>
          <div class="chip-row">
            <button type="button" class="chip-btn" [class.active]="recetasView === 'lista'" (click)="recetasView = 'lista'">Mis recetas</button>
            <button type="button" class="chip-btn" [class.active]="recetasView === 'nueva'" (click)="recetasView = 'nueva'">Nueva receta</button>
          </div>
        </div>

        <div *ngIf="recetasView === 'lista'" class="recipe-grid">
          <article *ngFor="let receta of recetas; let i = index" class="recipe-card" [style.background]="recipeGradient(i)" (click)="viewReceta(receta.id)">
            <div class="recipe-icon">🍽️</div>
            <h4>{{ receta.nombre }}</h4>
            <p>{{ receta.descripcion || 'Sin descripcion' }}</p>
            <div class="recipe-meta">
              <span *ngIf="receta.tiempo_min">⏱️ {{ receta.tiempo_min }} min</span>
              <span>{{ receta.calorias_total | number:'1.0-0' }} kcal</span>
            </div>
          </article>

          <div *ngIf="recetas.length === 0" class="panel-card empty-card">
            <p>No hay recetas aun.</p>
          </div>
        </div>

        <div *ngIf="recetasView === 'detalle' && recetaDetalle" class="panel-card">
          <button type="button" class="link-btn back-link" (click)="recetasView = 'lista'">← Volver</button>
          <h3>{{ recetaDetalle.nombre }}</h3>
          <p>{{ recetaDetalle.descripcion }}</p>
          <div class="recipe-meta detail-meta">
            <span *ngIf="recetaDetalle.tiempo_min">⏱️ {{ recetaDetalle.tiempo_min }} min</span>
            <span>{{ recetaDetalle.calorias_total | number:'1.0-0' }} kcal totales</span>
          </div>
          <div *ngFor="let ingrediente of recetaDetalle.ingredientes" class="list-row">
            <span>{{ ingrediente.nombre }}</span>
            <div class="row-actions">
              <small>{{ ingrediente.cantidad_g }} g</small>
              <strong>{{ recipeIngredientCalories(ingrediente) | number:'1.0-0' }} kcal</strong>
            </div>
          </div>
        </div>

        <div *ngIf="recetasView === 'nueva'" class="panel-card form-card recipe-form">
          <h3>Nueva receta</h3>
          <input [(ngModel)]="recetaForm.nombre" placeholder="Nombre de la receta" />
          <textarea [(ngModel)]="recetaForm.descripcion" placeholder="Descripcion"></textarea>
          <input [(ngModel)]="recetaForm.tiempo_min" type="number" placeholder="Tiempo en minutos" />

          <h4 class="subheading">Ingredientes</h4>
          <div class="recipe-search">
            <input [(ngModel)]="recetaSearch" (ngModelChange)="searchRecipeIngredients()" placeholder="Buscar ingrediente..." />
            <div *ngIf="recetaSuggestions.length > 0" class="suggestions-panel">
              <button type="button" *ngFor="let suggestion of recetaSuggestions" class="suggestion-row" (click)="addSuggestedIngrediente(suggestion)">
                <span>{{ emojiForCategory(suggestion.categoria) }} {{ suggestion.nombre }}</span>
                <strong>{{ suggestion.calorias_por_100g }} kcal/100g</strong>
              </button>
            </div>
          </div>

          <div *ngFor="let ingrediente of recetaForm.ingredientes" class="ingredient-row">
            <span>{{ ingrediente.nombre }}</span>
            <div class="row-actions">
              <input class="ingredient-input" type="number" [ngModel]="ingrediente.cantidad_g" (ngModelChange)="updateIngredienteCantidad(ingrediente.alimento_id, $event)" />
              <small>g</small>
              <strong>{{ recipeIngredientCalories(ingrediente) | number:'1.0-0' }} kcal</strong>
              <button type="button" class="danger-btn" (click)="removeIngrediente(ingrediente.alimento_id)">✕</button>
            </div>
          </div>

          <div *ngIf="recetaForm.ingredientes.length > 0" class="estimate-box total-box">
            <span>Total estimado</span>
            <strong>{{ totalRecetaCalorias | number:'1.0-0' }} kcal</strong>
          </div>

          <div class="actions-row">
            <button type="button" class="ghost-btn" (click)="resetReceta()">Cancelar</button>
            <button type="button" class="primary-btn" (click)="saveReceta()">Guardar receta</button>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host { display: block; }
    .navbar {
      position: sticky;
      top: 0;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      min-height: 64px;
      padding: 0 36px;
      background: var(--green-dark);
      box-shadow: 0 4px 20px rgba(0,0,0,.25);
      color: white;
    }
    .brand {
      font-family: Georgia, serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--green-soft);
      white-space: nowrap;
    }
    .nav-links, .nav-tools, .chip-row, .filters-row, .actions-row, .row-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .nav-links {
      flex: 1;
      justify-content: center;
      min-width: 0;
    }
    .nav-btn {
      background: none;
      border: none;
      color: rgba(255,255,255,.58);
      font-size: 14px;
      font-weight: 600;
      padding: 6px 2px;
      border-bottom: 2px solid transparent;
      cursor: pointer;
    }
    .nav-btn.active {
      color: white;
      border-bottom-color: var(--green-light);
    }
    .icon-btn, .profile-btn, .logout-btn, .link-btn {
      border: none;
      cursor: pointer;
    }
    .notif-wrap { position: relative; }
    .icon-btn {
      position: relative;
      background: rgba(255,255,255,.08);
      border-radius: 10px;
      color: white;
      padding: 8px 12px;
      font-size: 18px;
    }
    .notif-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      min-width: 18px;
      height: 18px;
      border-radius: 999px;
      background: var(--orange);
      color: white;
      font-size: 10px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    .notif-panel {
      position: absolute;
      top: 44px;
      right: 0;
      width: 320px;
      background: white;
      border-radius: 14px;
      box-shadow: var(--shadow);
      overflow: hidden;
      color: var(--text-dark);
    }
    .notif-header, .notif-item {
      padding: 12px 16px;
    }
    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--cream-dark);
    }
    .notif-item {
      border-bottom: 1px solid var(--cream-dark);
    }
    .notif-item.unread {
      background: #f0faf5;
    }
    .notif-item p {
      margin: 0 0 4px;
      font-size: 13px;
      font-weight: 700;
    }
    .notif-item small, .notif-empty {
      color: var(--text-light);
      font-size: 12px;
    }
    .notif-empty {
      padding: 16px;
      text-align: center;
    }
    .link-btn {
      background: none;
      color: var(--green-mid);
      font-size: 12px;
      font-weight: 700;
      padding: 0;
    }
    .back-link {
      margin-bottom: 12px;
    }
    .profile-btn {
      background: none;
      color: white;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .avatar, .profile-avatar {
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--green-light), var(--orange));
      color: white;
      font-weight: 700;
    }
    .avatar {
      width: 36px;
      height: 36px;
      font-size: 13px;
    }
    .logout-btn {
      background: none;
      border: 1px solid rgba(255,255,255,.2);
      color: rgba(255,255,255,.72);
      border-radius: 8px;
      padding: 6px 10px;
    }
    .login-page {
      position: relative;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background: linear-gradient(135deg, #1a3a2a 0%, #0f2d1f 60%, #1a3a2a 100%);
      overflow: hidden;
    }
    .login-orb {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }
    .orb-right {
      top: -120px;
      right: -120px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(82,183,136,.12) 0%, transparent 70%);
    }
    .orb-left {
      bottom: -100px;
      left: -100px;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(224,122,58,.08) 0%, transparent 70%);
    }
    .login-card {
      width: min(460px, 100%);
      padding: 52px;
      background: rgba(255,255,255,.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 24px;
      box-shadow: 0 24px 64px rgba(0,0,0,.4);
      color: white;
      position: relative;
      z-index: 1;
    }
    .login-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 12px;
      border-radius: 18px;
      background: linear-gradient(135deg,#52b788,#95d5b2);
      display: grid;
      place-items: center;
      font-size: 30px;
    }
    .login-card h1 {
      margin: 0;
      text-align: center;
      font-family: Georgia, serif;
      font-size: 28px;
    }
    .login-card p {
      margin: 6px 0 22px;
      text-align: center;
      color: rgba(255,255,255,.55);
      font-size: 14px;
    }
    .login-card label {
      display: block;
      margin-bottom: 6px;
      color: rgba(255,255,255,.62);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
    }
    .page-shell {
      max-width: 1240px;
      margin: 0 auto;
      padding: 28px 36px 40px;
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
      padding: 28px 36px 44px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      overflow: hidden;
    }
    .hero-label {
      margin: 0 0 4px;
      color: rgba(255,255,255,.5);
      font-size: 13px;
    }
    .hero-card h2, .section-header h2, .panel-card h3, .profile-hero h2 {
      margin: 0;
      font-family: Georgia, serif;
    }
    .macro-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 16px 0 10px;
    }
    .macro-row span {
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 12px;
    }
    .hero-text {
      margin: 0;
      color: rgba(255,255,255,.5);
      font-size: 12px;
    }
    .goal-ring {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      border: 10px solid var(--green-light);
      background: rgba(255,255,255,.08);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      flex-shrink: 0;
    }
    .goal-ring strong {
      font-size: 20px;
    }
    .goal-ring small {
      color: rgba(255,255,255,.6);
      font-size: 10px;
    }
    .stats-grid, .food-grid, .profile-stats, .recipe-grid {
      display: grid;
      gap: 16px;
    }
    .stats-grid {
      margin: 28px 0;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
    .stat-card, .panel-card, .food-card {
      background: white;
      border-radius: var(--radius);
      box-shadow: var(--shadow-sm);
    }
    .stat-card, .panel-card {
      padding: 20px 22px;
    }
    .stat-card p, .stat-card span {
      margin: 0;
    }
    .stat-card p {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-light);
      text-transform: uppercase;
      letter-spacing: .5px;
    }
    .stat-card strong {
      display: block;
      font-size: 22px;
      margin: 6px 0 4px;
    }
    .stat-card span {
      font-size: 12px;
      color: var(--text-light);
    }
    .center {
      text-align: center;
    }
    .two-col {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      gap: 20px;
      align-items: start;
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
    .quick-link {
      width: 100%;
      text-align: left;
      border: none;
      border-radius: var(--radius-sm);
      background: var(--cream);
      padding: 10px 12px;
      margin-bottom: 10px;
      font-weight: 600;
      cursor: pointer;
    }
    .section-page {
      display: grid;
      gap: 20px;
    }
    .section-header {
      background: white;
      border-radius: var(--radius);
      box-shadow: 0 2px 10px rgba(0,0,0,.05);
      padding: 16px 22px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .section-header p {
      margin: 4px 0 0;
      color: var(--text-light);
      font-size: 13px;
    }
    .food-grid {
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    }
    .food-card {
      overflow: hidden;
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
      margin-bottom: 12px;
    }
    .estimate-box {
      background: #e8f5ee;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 13px;
      margin-bottom: 12px;
    }
    .list-row, .ingredient-row {
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
    .list-row small, .ingredient-row small {
      color: var(--text-light);
      font-size: 12px;
    }
    .primary-btn, .ghost-btn, .chip-btn, .danger-btn {
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 700;
      padding: 11px 18px;
    }
    .primary-btn {
      background: linear-gradient(135deg,#52b788,#40916c);
      color: white;
    }
    .ghost-btn, .chip-btn {
      background: var(--cream-dark);
      color: var(--text-mid);
    }
    .wide { width: 100%; }
    .chip-btn {
      border-radius: 20px;
      padding: 7px 16px;
      font-size: 13px;
    }
    .chip-btn.active {
      background: var(--green-light);
      color: white;
    }
    .danger-btn {
      background: #fce4ec;
      color: #e57373;
      padding: 6px 10px;
    }
    .profile-hero {
      background: linear-gradient(160deg,var(--green-dark) 0%,#2d6a4f 100%);
      border-radius: var(--radius);
      padding: 40px 36px 60px;
      color: white;
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .profile-avatar {
      width: 80px;
      height: 80px;
      font-size: 26px;
      border: 3px solid rgba(255,255,255,.3);
    }
    .profile-hero p {
      margin: 4px 0 0;
      color: rgba(255,255,255,.65);
    }
    .profile-stats {
      margin-top: -28px;
      position: relative;
      z-index: 2;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }
    .water-total {
      font-size: 40px;
      font-weight: 700;
      color: var(--green-mid);
      text-align: center;
      margin: 0 0 6px;
    }
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
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }
    .recipe-card {
      border-radius: var(--radius);
      color: white;
      padding: 24px;
      cursor: pointer;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .recipe-card h4 {
      margin: 0 0 6px;
      font-family: Georgia, serif;
      font-size: 17px;
    }
    .recipe-card p {
      margin: 0;
      font-size: 12px;
      color: rgba(255,255,255,.68);
      min-height: 32px;
    }
    .recipe-icon, .recipe-meta span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 20px;
      background: rgba(255,255,255,.1);
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
    }
    .recipe-icon {
      margin-bottom: 10px;
    }
    .recipe-meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 12px;
    }
    .detail-meta {
      margin-bottom: 18px;
    }
    .recipe-form textarea {
      min-height: 90px;
      resize: vertical;
    }
    .subheading {
      margin: 4px 0 10px;
      color: var(--green-dark);
      font-size: 15px;
      font-weight: 700;
    }
    .recipe-search {
      position: relative;
      margin-bottom: 8px;
    }
    .suggestions-panel {
      border: 2px solid var(--cream-dark);
      border-radius: 10px;
      overflow: hidden;
      background: white;
    }
    .suggestion-row {
      width: 100%;
      border: none;
      border-bottom: 1px solid var(--cream-dark);
      background: white;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      text-align: left;
      cursor: pointer;
      color: var(--text-dark);
    }
    .suggestion-row:last-child {
      border-bottom: none;
    }
    .ingredient-input {
      width: 74px;
      padding: 7px 10px;
      border: 2px solid var(--cream-dark);
      border-radius: 8px;
      background: white;
    }
    .total-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .empty-text, .empty-card p {
      color: var(--text-light);
      font-size: 13px;
    }
    @media (max-width: 1100px) {
      .two-col {
        grid-template-columns: 1fr;
      }
      .section-header {
        flex-direction: column;
      }
    }
    @media (max-width: 760px) {
      .navbar {
        padding: 14px 16px;
        flex-direction: column;
        align-items: stretch;
      }
      .nav-links, .nav-tools {
        justify-content: center;
      }
      .page-shell {
        padding: 18px 16px 32px;
      }
      .login-card {
        padding: 32px 22px;
      }
      .hero-card {
        padding: 24px 22px 30px;
        flex-direction: column;
        align-items: flex-start;
      }
      .stats-grid, .food-grid, .profile-stats, .recipe-grid {
        grid-template-columns: 1fr;
      }
      .profile-hero {
        padding: 28px 22px 44px;
      }
      .list-row, .ingredient-row {
        flex-direction: column;
        align-items: stretch;
      }
      .row-actions, .filters-row, .actions-row {
        width: 100%;
      }
      .row-actions > * {
        flex: 1;
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
  recetaSearch = '';
  recetaSuggestions: any[] = [];

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

  get totalRecetaCalorias(): number {
    return this.recetaForm.ingredientes.reduce(
      (total, ingrediente) => total + this.recipeIngredientCalories(ingrediente),
      0,
    );
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

  recipeGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg,#1a3a2a,#0f2d1f)',
      'linear-gradient(135deg,#7b3f00,#4a2000)',
      'linear-gradient(135deg,#2d6a4f,#1a3a2a)',
      'linear-gradient(135deg,#1a2a3a,#0f1f2d)',
    ];
    return gradients[index % gradients.length];
  }

  recipeIngredientCalories(ingrediente: any): number {
    return (Number(ingrediente.calorias_por_100g || 0) * Number(ingrediente.cantidad_g || 0)) / 100;
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
    this.recetaDetalle = null;
    if (this.alimentos.length === 0) {
      this.alimentos = await this.api.listarAlimentos();
    }
  }

  async searchRecipeIngredients(): Promise<void> {
    if (this.recetaSearch.trim().length < 2) {
      this.recetaSuggestions = [];
      return;
    }
    this.recetaSuggestions = (await this.api.listarAlimentos('todos', this.recetaSearch)).slice(0, 6);
  }

  addSuggestedIngrediente(alimento: any): void {
    const exists = this.recetaForm.ingredientes.some((item) => item.alimento_id === alimento.id);
    if (exists) {
      this.errorMessage = 'Ese ingrediente ya esta agregado';
      return;
    }
    this.errorMessage = '';
    this.recetaForm.ingredientes.push({
      alimento_id: alimento.id,
      nombre: alimento.nombre,
      cantidad_g: 100,
      calorias_por_100g: alimento.calorias_por_100g,
    });
    this.recetaSearch = '';
    this.recetaSuggestions = [];
  }

  updateIngredienteCantidad(alimentoId: number, cantidad: number): void {
    this.recetaForm.ingredientes = this.recetaForm.ingredientes.map((item) =>
      item.alimento_id === alimentoId
        ? { ...item, cantidad_g: Number(cantidad) || 0 }
        : item,
    );
  }

  removeIngrediente(alimentoId: number): void {
    this.recetaForm.ingredientes = this.recetaForm.ingredientes.filter((item) => item.alimento_id !== alimentoId);
  }

  resetReceta(): void {
    this.recetaForm = { nombre: '', descripcion: '', tiempo_min: null, ingredientes: [] };
    this.recetaSearch = '';
    this.recetaSuggestions = [];
    this.recetasView = 'lista';
  }

  async saveReceta(): Promise<void> {
    await this.safeRun(async () => {
      if (!this.recetaForm.nombre || this.recetaForm.ingredientes.length === 0) {
        throw new Error('Nombre e ingredientes son requeridos');
      }
      await this.api.crearReceta({
        nombre: this.recetaForm.nombre,
        descripcion: this.recetaForm.descripcion,
        tiempo_min: this.recetaForm.tiempo_min ? Number(this.recetaForm.tiempo_min) : null,
        ingredientes: this.recetaForm.ingredientes.map((item) => ({
          alimento_id: item.alimento_id,
          cantidad_g: item.cantidad_g,
        })),
      });
      this.resetReceta();
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
