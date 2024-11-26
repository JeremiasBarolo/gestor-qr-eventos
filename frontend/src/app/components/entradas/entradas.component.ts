import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { AlertComponent } from '../alert/alert.component';
import JSZip from 'jszip'; // Asegúrate de tener instalada esta librería
import * as FileSaver from 'file-saver';


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
  mostrarCantidad:boolean = false
  constructor(
    private route: ActivatedRoute,
    private apiService:ApiService,
    private router:Router
  ){
    this.route.params.subscribe(params => {
      this.id = params['id'] || null;
    });
  }

  @ViewChild(AlertComponent) alertComponent!: AlertComponent;

  ngOnInit(){
   this.cargarDatos()
  }

  cargarDatos(){
    this.apiService.getEvento(this.id).subscribe((res)=>{
      if(res){
        this.evento = res.evento[0]
        this.entradas = res.evento[0].entradas

        if(this.entradas[0].uuid){
          this.mostrarCantidad = true
        }


      }
    })
  }

  generarEntradas(){

    if(this.cantidad_agregar <= 0){
      this.alertComponent.triggerAlert('Debe asignar una cantidad superior a 0', 'info');
    }else{
      this.apiService.createQR({cantidad: this.cantidad_agregar, id_evento: this.id}).subscribe((res)=>{
        this.evento = {}
        this.cargarDatos()
        this.alertComponent.triggerAlert(`Se crearon ${this.cantidad_agregar} nuevas entradas`, 'success');
        this.cantidad_agregar = 0
      })
    }


  }

  async exportAllToPdf2(evento: any) {
    const cardWidth = 180;  // Ancho de la entrada
    const cardHeight = 85;  // Alto de la entrada

    const zip = new JSZip(); // Crear una nueva instancia del archivo ZIP

    for (const entrada of evento.entradas) {
      if (!entrada.uuid) continue;

      const qrDataUrl = await QRCode.toDataURL(
        `http://192.168.0.11:8080/api/v1/validate/${entrada.uuid}`,
        { width: 400, margin: 2 }
      );

      const pdf = new jsPDF({
        unit: 'mm',
        orientation: 'landscape',               // Unidad en milímetros
        format: [cardWidth, cardHeight], // Tamaño personalizado del PDF (el tamaño exacto de la entrada)
        compress: true            // Para optimizar el tamaño del archivo PDF
      });

      // Fondo de color con gradiente (ajustado al tamaño de la entrada)
      pdf.setFillColor(51, 51, 153);
      pdf.rect(0, 0, cardWidth, cardHeight, 'F'); // Rellenamos todo el tamaño de la entrada

      // Borde del ticket con esquinas redondeadas
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(0, 0, cardWidth, cardHeight, 5, 5, 'S');

      // Elementos decorativos (linea punteada)
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(cardWidth - 45, 0, cardWidth - 45, cardHeight);  // Línea vertical en la parte derecha

      // Cabecera del ticket con nombre del evento
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text(evento.nombre_evento || 'Evento', 10, 15);

      // Información del evento
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);

      // Fecha y estado del ticket
      const fecha = evento?.fecha_evento ? new Date(evento.fecha_evento) : null;
      const formattedDate = fecha
        ? `${this.pad(fecha.getDate())}/${this.pad(fecha.getMonth() + 1)}/${fecha.getFullYear()}`
        : 'TBA';

      pdf.text(`Fecha: ${formattedDate}`, 10, 45);
      pdf.text(`Estado: ${entrada.usado === 1 ? 'USADA' : 'VALIDA'}`, 10, 55);

      // UUID pequeño
      pdf.setFontSize(8);
      pdf.text(`ID: ${entrada.uuid}`, 10, 75);

      // Parte derecha - Código QR
      pdf.addImage(qrDataUrl, 'PNG', cardWidth - 40, 25, 30, 30);

      // Elemento decorativo circular
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineDashPattern([1, 1], 0);
      pdf.circle(cardWidth - 25, 70, 2, 'S');

      // Generar el PDF como Blob para agregarlo al ZIP
      const pdfBlob = pdf.output('blob');

      // Añadir el archivo PDF al ZIP con el nombre correspondiente
      zip.file(`entrada_${entrada.uuid.slice(0, 5)}.pdf`, pdfBlob);
    }

    // Generar el archivo ZIP y ofrecer la descarga
    zip.generateAsync({ type: 'blob' }).then((content) => {
      FileSaver.saveAs(content, `entrada-${evento.nombre_evento}.zip`);
    });
  }

  // Método auxiliar para formatear la fecha con ceros a la izquierda
  pad(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

}

