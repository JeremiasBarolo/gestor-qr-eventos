import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-eventos',
  standalone: false,

  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.scss'
})
export class EventosComponent {
  action:string = 'crear'
  eventos:any[] = []
  fecha_evento:any
  nombre_evento:any
  id_evento:any
  searchTerm: string = '';
  eventosFiltrados: any[] = [];
  creando_evento = false


  constructor(
    private apiService: ApiService,
    private router: Router,
  ){

  }

  @ViewChild(AlertComponent) alertComponent!: AlertComponent;

  ngOnInit(){
    this.cargarDatos()
  }


  cargarDatos() {
    this.apiService.getEventos().subscribe((evento) => {
      this.eventos = evento;
      this.eventosFiltrados = [...this.eventos]; // Inicializa con todos los eventos
    });
  }

  filtrarEventos() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.eventosFiltrados = [...this.eventos]; // Mostrar todos si no hay término
    } else {
      this.eventosFiltrados = this.eventos.filter((evento) =>
        evento.nombre_evento.toLowerCase().includes(term)
      );
    }
  }

  crearEvento(evento?:any) {
    this.creando_evento = true
    let data = {
      nombre_evento: this.nombre_evento,
      fecha_evento: new Date(this.fecha_evento),
    };

    if(!data.nombre_evento){
      alert("El nombre del evento es obligatorio")
      return
    }

    if(!data.fecha_evento){
      alert("La fecha del evento es obligatoria")
      return
    }


    if (this.action == 'crear') {
      this.apiService.createEventos(data)
      .subscribe((res) => {
        if (res) {
          this.eventos = [];
          this.cargarDatos();
          this.modalClose()
          this.alertComponent.triggerAlert(`Se creo exitosamente el evento`, 'success');
          this.creando_evento = false

        }
      });
    } else {
      this.apiService.updateEventos(this.id_evento, data).subscribe((res) => {
        if (res) {
          this.eventos = [];
          this.cargarDatos();
          this.modalClose()

          this.alertComponent.triggerAlert(`Se actualizo exitosamente el evento`, 'success');
        }
      });
    }

  }

  editar(data: any) {
    this.action = 'editar'
    this.nombre_evento = data.nombre_evento;
    this.id_evento = data.id;
    const fecha = new Date(data.fecha_evento);
    this.fecha_evento = fecha.toISOString().split('T')[0];
  }

  eliminarEvento(id: any, evento:any) {
    if(confirm("Confirma eliminar el evento?\nSe eliminaran todas las entradas asociadas")){
      this.apiService.deleteEventos(id).subscribe((res) => {
        if (res) {
          this.eventos = [];
          this.cargarDatos();
          this.alertComponent.triggerAlert(`Se elimino exitosamente el evento: ${evento.nombre_evento}`, 'success');
        }
      });
    }
  }

  verEntradas(id: number) {
    this.router.navigate([`ver-entradas`, id]);
  }

  modalClose(){
    this.nombre_evento = ''
    this.fecha_evento = ''
    this.action = 'crear'
  }
}
