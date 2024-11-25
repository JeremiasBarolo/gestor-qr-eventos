import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // ENDPOSINTS
  public API_URL = 'http://localhost:8080';
  public QR_URL = 'http://localhost:8080/api/v1/QR';
  public EVENTOS_URL = 'http://localhost:8080/api/v1/eventos';
  public AUTH_URL = 'http://localhost:8080/api/v1/auth';



  constructor(private http: HttpClient, private authService:AuthService) { }


  // LOGIN
  login(user:any){
    return this.http.post(`${this.API_URL}/login`, {email: user.user, password: user.pass}).toPromise();
  }


  // QR CRUD

  getQRs(): Observable<any> {
    return this.http.get(`${this.QR_URL}`);
  }

  getQR(id: number): Observable<any> {
    return this.http.get(`${this.QR_URL}/${id}`);
  }

  createQR(data: any): Observable<any> {
    return this.http.post(this.QR_URL, data);
  }

  updateQR(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.QR_URL}/${id}`, data);
  }

  deleteQR(id: number): Observable<any> {
    return this.http.delete(`${this.QR_URL}/${id}`);
  }



  // USUARIOS CRUD
  getUsuarios(): Observable<any> {
    return this.http.get(this.AUTH_URL);
  }

  getUsuario(id: number): Observable<any> {
    return this.http.get(`${this.AUTH_URL}/${id}`);
  }

  createUsuario(data: any): Observable<any> {
    return this.http.post(this.AUTH_URL, data);
  }

  updateUsuario(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.AUTH_URL}/${id}`, data);
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.AUTH_URL}/${id}`);
  }



  // Eventos CRUD
  getEventos(): Observable<any> {
    return this.http.get(`${this.EVENTOS_URL}`);
  }

  getEvento(id: number): Observable<any> {
    return this.http.get(`${this.EVENTOS_URL}/${id}`);
  }

  createEventos(data: any): Observable<any> {
    return this.http.post(this.EVENTOS_URL, data);
  }

  updateEventos(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.EVENTOS_URL}/${id}`, data);
  }

  deleteEventos(id: number): Observable<any> {
    return this.http.delete(`${this.EVENTOS_URL}/${id}`);
  }




}
