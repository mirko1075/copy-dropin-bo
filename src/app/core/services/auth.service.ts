import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Editor = 'editor',
  Viewer = 'viewer'
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  currentUser = this.userSignal.asReadonly();
  token = this.tokenSignal.asReadonly();

  constructor(private router: Router) {
    this.loadFromStorage();
  }

  login(username: string, password: string): Promise<boolean> {
    // TODO: Implement real authentication
    // For now, mock login
    const mockUser: User = {
      id: 1,
      username,
      email: `${username}@example.com`,
      role: UserRole.Admin,
      token: 'mock-jwt-token'
    };

    this.userSignal.set(mockUser);
    this.tokenSignal.set(mockUser.token!);
    localStorage.setItem('auth-user', JSON.stringify(mockUser));
    localStorage.setItem('auth-token', mockUser.token!);

    return Promise.resolve(true);
  }

  logout(): void {
    this.userSignal.set(null);
    this.tokenSignal.set(null);
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-token');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.userSignal() !== null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.userSignal();
    return user?.role === role;
  }

  private loadFromStorage(): void {
    const userStr = localStorage.getItem('auth-user');
    const token = localStorage.getItem('auth-token');

    if (userStr && token) {
      this.userSignal.set(JSON.parse(userStr));
      this.tokenSignal.set(token);
    }
  }
}
