import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainComponentComponent } from './components/main-component/main-component.component';
import { EntradasComponent } from './components/entradas/entradas.component';
import { EventosComponent } from './components/eventos/eventos.component';



const routes: Routes = [
  { path: '', component: LoginComponent},
  { path: 'login', component: LoginComponent},
  {
    path: '',
    component: MainComponentComponent,
    children: [
      { path: 'inicio', component: EventosComponent },
      { path: 'ver-entradas/:id', component: EntradasComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
