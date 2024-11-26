import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';


@Component({
  selector: 'app-entradas',
  standalone: false,

  templateUrl: './entradas.component.html',
  styleUrl: './entradas.component.scss'
})
export class EntradasComponent {

  id:any
  evento: any
  entradas:any
  cantidad_agregar = 0
  constructor(
    private route: ActivatedRoute,
    private apiService:ApiService
  ){
    this.route.params.subscribe(params => {
      this.id = params['id'] || null;
    });
  }


  ngOnInit(){
   this.cargarDatos()
  }

  cargarDatos(){
    this.apiService.getEvento(this.id).subscribe((res)=>{
      if(res){
        this.evento = res.evento
        this.entradas = res.entradas
        console.log(this.entradas);

      }
    })
  }

  generarEntradas(){

    if(this.cantidad_agregar <= 0){
      alert('a')
    }else{
      this.apiService.createQR({cantidad: this.cantidad_agregar, id_evento: this.id}).subscribe((res)=>{
        this.cargarDatos()
      })
    }


  }




}
