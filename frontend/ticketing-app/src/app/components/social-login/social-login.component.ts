import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleAuthService } from '../../core/services/google-auth.service';

@Component({
  selector: 'app-social-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-login.component.html',
  styleUrl: './social-login.component.css'
})
export class SocialLoginComponent implements OnInit, AfterViewInit {

  constructor(private googleAuthService: GoogleAuthService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // Renderizar botón de Google después de que la vista se inicialice
    setTimeout(() => {
      this.googleAuthService.renderGoogleButton('google-signin-button');
    }, 100);
  }

  signInWithGoogle() {
    this.googleAuthService.signInWithGoogle().catch(error => {
      console.error('Error al iniciar Google Sign-In:', error);
    });
  }

  signInWithGitHub() {
    // Implementaremos GitHub después
    console.log('GitHub login - próximamente');
  }

  signInWithFacebook() {
    // Implementaremos Facebook después
    console.log('Facebook login - próximamente');
  }
}
