import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  standalone: false
})
export class AlertComponent {
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: string = 'success';

  @Output() alertClosed = new EventEmitter<void>();

  constructor() {}

  // Método para mostrar la alerta
  triggerAlert(message: string, type: string = 'success') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;


    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }


  closeAlert() {
    this.showAlert = false;
  }
}
