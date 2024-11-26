import { Component } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  standalone: false
})
export class AlertComponent {
  showAlert: boolean = false; // Controla si la alerta está visible
  alertMessage: string = ''; // Mensaje de la alerta
  alertType: string = 'success'; // Tipo de alerta ('success', 'danger', 'warning', 'info')

  constructor() {}

  // Método para mostrar la alerta
  triggerAlert(message: string, type: string = 'success') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    // Opcional: Ocultar la alerta automáticamente después de 5 segundos
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  // Método para cerrar la alerta manualmente
  closeAlert() {
    this.showAlert = false;
  }
}
