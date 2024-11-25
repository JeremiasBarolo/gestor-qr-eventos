import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-eventos',
  standalone: false,

  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.scss'
})
export class EventosComponent {
  action:any
  eventos:any[] = []
  fecha_evento:any
  nombre_evento:any
  id_evento:any

  constructor(
    private apiService: ApiService,
    private router: Router,
  ){

  }

  ngOnInit(){
    this.cargarDatos()
  }


  cargarDatos(){
    this.apiService.getEventos().subscribe( (evento) =>{
      this.eventos = evento
    })
  }

  crearEvento(){
    let data = {nombre_evento: this.nombre_evento, fecha_evento:new Date(this.fecha_evento)}
    if(this.action ==  'crear'){
      this.apiService.createEventos(data).subscribe( (res)=>{
        if(res){
          this.eventos = []
          this.cargarDatos()
        }
      })
    }else{
      this.apiService.updateEventos(this.id_evento,data).subscribe( (res)=>{
        if(res){
          this.eventos = []
          this.cargarDatos()
        }
      })
    }
  }


  editar(data:any){
    this.nombre_evento = data.nombre_evento
    this.id_evento = data.id
    const fecha = new Date(data.fecha_evento);
    this.fecha_evento = fecha.toISOString().split('T')[0];
  }


  eliminarEvento(id:any){
    this.apiService.deleteEventos(id).subscribe((res)=>{
      if(res){
        this.eventos = []
        this.cargarDatos()
      }
    })
  }

  verEntradas(id: number) {
    this.router.navigate([`ver-entradas`, id]);
  }

}
