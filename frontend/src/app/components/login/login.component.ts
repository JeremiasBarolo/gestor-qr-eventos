import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';




@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {

  imagenLogo = 'assets/images/logobase.png';


  username:any=""
  password:any=""


  constructor(
    private authService: AuthService,
    private router:Router,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {

  }

  login(){
    const user = {
      user: this.username,
      pass: this.password
    }


    this.authService.login(user)
    .then((res:any) => {
      console.log(res);


      localStorage.setItem("access_token", res.token)
      this.router.navigate(['inicio'])
    })
    .catch((err) => {

    })
  }



}
