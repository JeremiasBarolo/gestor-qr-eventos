import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { AlertComponent } from '../alert/alert.component';
import JSZip from 'jszip'; // Asegúrate de tener instalada esta librería
import * as FileSaver from 'file-saver';
import { AuthService } from '../../services/auth.service';


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
  bloques:any
  cantidad_agregar = 0
  mostrarCantidad:boolean = false
  apiUrl:any
  mostrarMensaje:boolean = false
  progress = 0;

  chunkedEntradas:any[] = []
  exporting: boolean = false;
  exporting_block: boolean = false;
  selectedBlock: any = 1;
  constructor(
    private route: ActivatedRoute,
    private apiService:ApiService,
    public authService: AuthService
  ){
    this.route.params.subscribe(params => {
      this.id = params['id'] || null;
    });

    this.apiUrl = this.apiService.API_URL_QR
  }

  @ViewChild(AlertComponent) alertComponent!: AlertComponent;

  ngOnInit(){
   this.cargarDatos()
  }

  ngOnChanges(): void {
    if (this.entradas) {

    }
  }

  async onExport(evento: any, bloque = false) {
    this.progress = 0; // Reiniciar barra de progreso
    if(bloque){
      this.exporting_block = true
    }
    else{
      this.exporting = true
    }
    await this.exportAllToPdf2(evento, bloque, (progress: number) => {
      this.progress = progress; // Actualizar la barra de progreso
    });
    this.exporting = false
    this.exporting_block = false
  }

  private chunkArray(arr: any[], size: number): any[][] {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  cargarDatos(){
    this.apiService.getEvento(this.id).subscribe((res) => {


      if (res) {
        console.log(res);

        this.evento = res.evento[0];
        this.entradas = res.evento[0].entradas;
        this.bloques = res.bloques;
        console.log(this.bloques);


        if(this.entradas[0].uuid === null ){
          this.mostrarMensaje = true
        }

        this.chunkedEntradas = this.chunkArray(this.entradas, 20);

        const today = new Date();
        const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        this.entradas.map((entrada: any) => {

          entrada.api_url = `${this.apiUrl}/${entrada.uuid}`;


          const eventoFecha = this.evento.fecha_evento
            ? this.evento.fecha_evento.split('T')[0]
            : null;

          if (eventoFecha !== todayString) {
            entrada.estado = 'Entrada inválida';
          } else if (entrada.usado === 1) {
            entrada.estado = 'Entrada ya usada';
          } else {
            entrada.estado = 'Válida';
          }
        });

        // Mostrar cantidad según la primera entrada
        this.mostrarCantidad = this.entradas.length > 0 && !!this.entradas[0].uuid;
      }
    });
  }

  generarEntradas(){

    if(this.cantidad_agregar <= 0){
      this.alertComponent.triggerAlert('Debe asignar una cantidad superior a 0', 'info');
    }else{
      this.apiService.createQR({cantidad: this.cantidad_agregar, id_evento: this.id}).subscribe((res)=>{
        if(res){
          this.evento = {}
          this.cargarDatos()
          this.alertComponent.triggerAlert(`Se crearon ${this.cantidad_agregar} nuevas entradas`, 'success');
          this.cantidad_agregar = 0
          this.mostrarMensaje = false
          this.cargarDatos()
        }

      })
    }


  }

  async exportAllToPdf2(evento: any, bloque: any, updateProgress: (progress: number) => void) {
    const cardWidth = 180;  // Ancho de la entrada
    const cardHeight = 85;  // Alto de la entrada
    const zip = new JSZip(); // Crear una nueva instancia del archivo ZIP
    const totalEntradas = evento.entradas.length; // Número total de entradas
    let processedCount = 0;

    let entradas_download = [...evento.entradas]
    if(bloque){

      entradas_download = [...evento.entradas.filter((e: any) => e.id_bloque == this.selectedBlock)]
      console.log(evento.entradas);

    }
    for (const entrada of entradas_download) {
      if (!entrada.uuid) continue;

      // Generar código QR (simulación async)
      const qrDataUrl = await QRCode.toDataURL(
        `http://192.168.0.11:8080/api/v1/validate/${entrada.uuid}`,
        { width: 400, margin: 2 }
      );

      const pdf = new jsPDF({
        unit: 'mm',
        orientation: 'landscape',
        format: [cardWidth, cardHeight],
        compress: true
      });

      pdf.setFillColor(51, 51, 153);
      pdf.rect(0, 0, cardWidth, cardHeight, 'F');
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(0, 0, cardWidth, cardHeight, 5, 5, 'S');
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(cardWidth - 45, 0, cardWidth - 45, cardHeight);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text(evento.nombre_evento || 'Evento', 10, 15);

      const fecha = evento?.fecha_evento ? new Date(evento.fecha_evento) : null;
      const formattedDate = fecha
        ? `${this.pad(fecha.getDate())}/${this.pad(fecha.getMonth() + 1)}/${fecha.getFullYear()}`
        : 'TBA';

      pdf.text(`Fecha: ${formattedDate}`, 10, 45);
      pdf.text(`Estado: ${entrada.usado === 1 ? 'USADA' : 'VALIDA'}`, 10, 55);
      pdf.setFontSize(8);
      pdf.text(`ID: ${entrada.uuid}`, 10, 75);
      pdf.addImage(qrDataUrl, 'PNG', cardWidth - 40, 25, 30, 30);
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineDashPattern([1, 1], 0);
      pdf.circle(cardWidth - 25, 70, 2, 'S');

      const pdfBlob = pdf.output('blob');
      zip.file(`entrada_${entrada.uuid.slice(0, 5)}.pdf`, pdfBlob);

      processedCount++;
      updateProgress((processedCount / totalEntradas) * 100); // Actualizar progreso

      // Permitir que el navegador actualice el DOM
      await new Promise((resolve) => setTimeout(resolve, 0));
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

  eliminarEntrada(entrada:any){
    this.apiService.deleteQR(entrada.id).subscribe((res)=>{
      this.alertComponent.triggerAlert(`Se elimino la entrada para el evento: ${this.evento.nombre_evento}`, 'success');
      this.cargarDatos()
    })

  }


  async exportarEntrada(entrada:any){
    const cardWidth = 180; // Ancho del ticket
    const cardHeight = 85; // Alto del ticket

    if (!entrada?.uuid) {
      console.error("La entrada no tiene un UUID válido.");
      return;
    }

    // Generar el código QR
    const qrDataUrl = await QRCode.toDataURL(
      `${entrada.api_url}`,
      { width: 400, margin: 2 }
    );

    // Crear el PDF con jsPDF
    const pdf = new jsPDF({
      unit: 'mm',
      orientation: 'landscape',
      format: [cardWidth, cardHeight], // Tamaño personalizado del PDF
      compress: true,
    });

    // Fondo de color
    pdf.setFillColor(51, 51, 153);
    pdf.rect(0, 0, cardWidth, cardHeight, 'F');

    // Borde con esquinas redondeadas
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(0, 0, cardWidth, cardHeight, 5, 5, 'S');

    // Línea decorativa punteada
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineDashPattern([2, 2], 0);
    pdf.line(cardWidth - 45, 0, cardWidth - 45, cardHeight);

    // Cabecera: Nombre del evento
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text(this.evento.nombre_evento || 'Evento', 10, 15);

    // Información del evento
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);

    // Fecha y estado
    const fecha = this.evento?.fecha_evento ? new Date(this.evento.fecha_evento) : null;
    const formattedDate = fecha
      ? `${this.pad(fecha.getDate())}/${this.pad(fecha.getMonth() + 1)}/${fecha.getFullYear()}`
      : 'TBA';

    pdf.text(`Fecha: ${formattedDate}`, 10, 45);
    pdf.text(`Estado: ${entrada.usado === 1 ? 'USADA' : 'VALIDA'}`, 10, 55);

    // UUID de la entrada
    pdf.setFontSize(8);
    pdf.text(`ID: ${entrada.uuid}`, 10, 75);

    // Código QR
    pdf.addImage(qrDataUrl, 'PNG', cardWidth - 40, 25, 30, 30);

    // Elemento decorativo
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineDashPattern([1, 1], 0);
    pdf.circle(cardWidth - 25, 70, 2, 'S');

    // Descargar el PDF
    const pdfBlob = pdf.output('blob');
    FileSaver.saveAs(pdfBlob, `entrada_${entrada.uuid.slice(0, 5)}.pdf`);
  }

  getCantidadEntradas(id_bloque: any){
    return this.entradas.filter((e:any) => e.id_bloque == id_bloque).length
  }


  selectBlock(bloque: number) {
    this.selectedBlock = (this.selectedBlock === bloque) ? null : bloque;  // Alterna la selección
  }



}

