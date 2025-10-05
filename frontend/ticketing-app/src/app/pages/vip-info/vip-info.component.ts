import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-vip-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vip-info.component.html',
  styleUrls: ['./vip-info.component.css']
})
export class VipInfoComponent {

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/profile']);
  }
}
