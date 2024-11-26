import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';


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


  async exportAllToPdf() {
    const margin = 10; // Margen del PDF
    const pageWidth = 210; // Ancho A4 en mm (JS PDF usa mm)
    const qrSize = 70; // Tamaño del QR reducido a 70px
    const titleFontSize = 20; // Reducir tamaño de fuente del título
    const descFontSize = 14; // Reducir tamaño de fuente de la descripción
    const contentFontSize = 12; // Reducir tamaño de fuente del contenido

    for (const entrada of this.entradas) {
      if (!entrada.uuid) {
        continue;
      }

      // Generar QR como base64 usando QRCode
      const qrDataUrl = await QRCode.toDataURL(
        `http://192.168.0.11:8080/api/v1/validate/${entrada.uuid}`,
        { width: 400, margin: 2 }
      );

      // Crear PDF
      const pdf = new jsPDF();

      // Título del Evento
      const title = this.evento?.nombre_evento || 'Evento';
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(titleFontSize);
      pdf.text(title, pageWidth / 2, margin + titleFontSize, { align: 'center' });

      // Descripción del Evento
      const description = 'Aqui esta tu entrada! Que disfrutes del evento!';
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(descFontSize);
      pdf.text(description, pageWidth / 2, margin + titleFontSize + 8, { align: 'center' });

      // Posición del QR
      const qrYPosition = margin + titleFontSize + descFontSize + 15; // Ajustar espacio
      pdf.addImage(qrDataUrl, 'PNG', (pageWidth - qrSize) / 2, qrYPosition, qrSize, qrSize);

      // Detalles de la entrada (UUID y Estado)
      const textYPosition = qrYPosition + qrSize + 8; // Reducir espacio entre QR y texto
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(contentFontSize);
      pdf.text(`UUID: ${entrada.uuid}`, pageWidth / 2, textYPosition, { align: 'center' });
      pdf.text(
        `Estado: ${entrada.usado === 1 ? 'Invalida' : 'Valida'}`,
        pageWidth / 2,
        textYPosition + 5,
        { align: 'center' }
      );

      // Formatear la fecha
      const fecha = this.evento?.fecha_evento ? new Date(this.evento.fecha_evento) : null;
      const formattedDate = fecha ? `${this.pad(fecha.getDate())}/${this.pad(fecha.getMonth() + 1)}/${fecha.getFullYear().toString().slice(-2)}` : 'Fecha no disponible';

      // Agregar la fecha formateada al PDF
      pdf.text(`Fecha: ${formattedDate}`, pageWidth / 2, textYPosition + 10, { align: 'center' });

      // Guardar PDF con un nombre único basado en el UUID
      pdf.save(`codigo-qr-${this.evento.nombre_evento}-${entrada.uuid.slice(0,5)}.pdf`);
    }
  }

  // Método auxiliar para asegurarse de que el día y mes sean de dos dígitos
  pad(num: number) {
    return num < 10 ? `0${num}` : num.toString();
  }

}
