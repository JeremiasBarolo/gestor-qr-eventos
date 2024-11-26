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

    }else{
      this.apiService.createQR({cantidad: this.cantidad_agregar, id_evento: this.id}).subscribe((res)=>{
        this.evento = {}
        this.cargarDatos()
      })
    }


  }


  async exportAllToPdf(evento: any) {
    const pageWidth = 210;
    const pageHeight = 297;
    const cardWidth = 180;
    const cardHeight = 85;
    const marginX = (pageWidth - cardWidth) / 2;
    const marginY = 20;

    for (const entrada of evento.entradas) {
      if (!entrada.uuid) continue;

      const qrDataUrl = await QRCode.toDataURL(
        `http://192.168.0.11:8080/api/v1/validate/${entrada.uuid}`,
        { width: 400, margin: 2 }
      );

      const pdf = new jsPDF();
      
      // Background gradient
      const gradient = pdf.setFillColor(51, 51, 153);
      pdf.rect(marginX, marginY, cardWidth, cardHeight, 'F');

      // Ticket border with rounded corners
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(marginX, marginY, cardWidth, cardHeight, 5, 5, 'S');

      // Decorative elements
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(marginX + cardWidth - 45, marginY, marginX + cardWidth - 45, marginY + cardHeight);

      // Header
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text(evento.nombre_evento || 'Evento', marginX + 10, marginY + 15);

      // Event name
      // pdf.setFontSize(16);
      // pdf.text(
      //   evento.nombre_evento || 'Evento',
      //   marginX + 10,
      //   marginY + 30
      // );

      // Left side information
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      
      const fecha = evento?.fecha_evento ? new Date(evento.fecha_evento) : null;
      const formattedDate = fecha
        ? `${this.pad(fecha.getDate())}/${this.pad(fecha.getMonth() + 1)}/${fecha.getFullYear()}`
        : 'TBA';

      pdf.text(`Date: ${formattedDate}`, marginX + 10, marginY + 45);
      pdf.text(`Status: ${entrada.usado === 1 ? 'USED' : 'VALID'}`, marginX + 10, marginY + 55);
      
      // Small UUID
      pdf.setFontSize(8);
      pdf.text(`ID: ${entrada.uuid}`, marginX + 10, marginY + 75);

      // Right side - QR Code
      const qrSize = 35;
      const qrX = marginX + cardWidth - 40;
      const qrY = marginY + 25;
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, 30, 30);

      // Decorative elements
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineDashPattern([1, 1], 0);
      pdf.circle(marginX + cardWidth - 25, marginY + 70, 2, 'S');

      pdf.save(`gamepass-${evento.nombre_evento}-${entrada.uuid.slice(0, 5)}.pdf`);
    }
  }

  private pad(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }
}