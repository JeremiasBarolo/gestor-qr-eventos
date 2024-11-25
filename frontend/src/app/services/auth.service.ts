import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode }from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public API_URL = 'http://localhost:8080';



  constructor(
    private http: HttpClient,
    private router:Router
  ) {


  }





  getUsername(){
    const token = localStorage.getItem('access_token')
    if(token){
      try {

        const decodedToken: any = jwtDecode(token);

        return decodedToken.username

      } catch (error) {
        console.log(error);

      }
    }
  }

  // LOGIN
  login(user:any){
    return this.http.post(`${this.API_URL}/login`, {username: user.user, password: user.pass}).toPromise()
  }


  logout(): void {
    localStorage.removeItem("access_token");
    this.router.navigate(['login']);
  }


}
