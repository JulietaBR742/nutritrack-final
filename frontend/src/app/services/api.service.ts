import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://35.253.4.191:5000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('nutritrack_token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private get<T>(endpoint: string) {
    return firstValueFrom(this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers: this.getHeaders() }));
  }

  private post<T>(endpoint: string, body: unknown) {
    return firstValueFrom(this.http.post<T>(`${this.apiUrl}${endpoint}`, body, { headers: this.getHeaders() }));
  }

  private put<T>(endpoint: string, body: unknown = {}) {
    return firstValueFrom(this.http.put<T>(`${this.apiUrl}${endpoint}`, body, { headers: this.getHeaders() }));
  }

  private delete<T>(endpoint: string) {
    return firstValueFrom(this.http.delete<T>(`${this.apiUrl}${endpoint}`, { headers: this.getHeaders() }));
  }

  login(email: string, password: string) {
    return this.post<{ token: string; usuario: any }>('/auth/login', { email, password });
  }

  registro(payload: any) {
    return this.post<{ token: string; usuario: any }>('/auth/registro', payload);
  }

  resumen() {
    return this.get<any>('/dashboard');
  }

  listarAlimentos(categoria = 'todos', buscar = '') {
    const params = new URLSearchParams();
    if (categoria && categoria !== 'todos') params.set('categoria', categoria);
    if (buscar) params.set('buscar', buscar);
    return this.get<any[]>(`/alimentos${params.toString() ? `?${params.toString()}` : ''}`);
  }

  crearAlimento(payload: any) {
    return this.post<any>('/alimentos', payload);
  }

  listarRegistros(fecha: string) {
    return this.get<any[]>(`/registros?fecha=${fecha}`);
  }

  crearRegistro(payload: any) {
    return this.post<any>('/registros', payload);
  }

  eliminarRegistro(id: number) {
    return this.delete<any>(`/registros/${id}`);
  }

  obtenerPerfil() {
    return this.get<any>('/perfil');
  }

  actualizarPerfil(payload: any) {
    return this.put<any>('/perfil', payload);
  }

  obtenerPeso() {
    return this.get<any[]>('/historial/peso');
  }

  registrarPeso(payload: any) {
    return this.post<any>('/historial/peso', payload);
  }

  obtenerAgua(fecha: string) {
    return this.get<any>(`/historial/agua?fecha=${fecha}`);
  }

  registrarAgua(payload: any) {
    return this.post<any>('/historial/agua', payload);
  }

  listarRecetas() {
    return this.get<any[]>('/recetas');
  }

  obtenerReceta(id: number) {
    return this.get<any>(`/recetas/${id}`);
  }

  crearReceta(payload: any) {
    return this.post<any>('/recetas', payload);
  }

  listarNotificaciones() {
    return this.get<any[]>('/notificaciones');
  }

  marcarTodasLeidas() {
    return this.put<any>('/notificaciones/leer-todas');
  }
}
