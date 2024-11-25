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
    this.apiService.getEvento(this.id).subscribe((res)=>{
      if(res){
        this.evento = res[0]
        this.entradas = res.entradas
        console.log(this.entradas);

      }
    })
  }

  generarEntradas(e:any){
    e.preventDefault();
    if(this.cantidad_agregar == 0){
      return
    }

  this.apiService.createQR({cantidad: this.cantidad_agregar, id_evento: this.id}).subscribe((res)=>{
    console.log(res)
  })

  }




}
