import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { config } from './config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, AsyncPipe],
  template: `
    <div style="max-width:700px;margin:30px auto;font-family:Arial">
      <h2>Student Form</h2>

      @if (auth.isAuthenticated$ | async) {
        <p>
          Hello {{ (auth.user$ | async)?.name }}
          <button (click)="auth.logout({ logoutParams: { returnTo: origin } })">Logout</button>
        </p>

        <form (ngSubmit)="save()" style="display:grid;gap:8px">
          <input [(ngModel)]="student.name" name="name" placeholder="Name" required />
          <input [(ngModel)]="student.email" name="email" placeholder="Email" required />
          <input [(ngModel)]="student.course" name="course" placeholder="Course" />
          <input [(ngModel)]="student.age" name="age" type="number" placeholder="Age" />
          <input type="file" (change)="uploadPhoto($event)" />
          @if (student.photoUrl) { <img [src]="student.photoUrl" width="80" /> }
          <button type="submit">{{ student._id ? 'Update' : 'Add' }} Student</button>
          @if (student._id) { <button type="button" (click)="reset()">Cancel</button> }
        </form>

        <table border="1" cellpadding="6" style="margin-top:20px;width:100%">
          <tr><th>Photo</th><th>Name</th><th>Email</th><th>Course</th><th>Age</th><th>Actions</th></tr>
          @for (s of students; track s._id) {
            <tr>
              <td>@if (s.photoUrl) { <img [src]="s.photoUrl" width="40" /> }</td>
              <td>{{ s.name }}</td>
              <td>{{ s.email }}</td>
              <td>{{ s.course }}</td>
              <td>{{ s.age }}</td>
              <td>
                <button (click)="edit(s)">Edit</button>
                <button (click)="remove(s._id)">Delete</button>
              </td>
            </tr>
          }
        </table>
      } @else {
        <button (click)="auth.loginWithRedirect()">Login with Auth0</button>
      }
    </div>
  `,
})
export class AppComponent implements OnInit {
  students: any[] = [];
  student: any = {};
  origin = window.location.origin;

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit() {
    // load the list once the user is logged in
    this.auth.isAuthenticated$.subscribe((loggedIn) => {
      if (loggedIn) this.load();
    });
  }

  load() {
    this.http.get<any[]>(config.apiUrl + '/students').subscribe((d) => (this.students = d));
  }

  save() {
    if (this.student._id) {
      this.http.put(`${config.apiUrl}/students/${this.student._id}`, this.student)
        .subscribe(() => { this.reset(); this.load(); });
    } else {
      this.http.post(config.apiUrl + '/students', this.student)
        .subscribe(() => { this.reset(); this.load(); });
    }
  }

  edit(s: any) {
    this.student = { ...s };
  }

  remove(id: string) {
    this.http.delete(`${config.apiUrl}/students/${id}`).subscribe(() => this.load());
  }

  reset() {
    this.student = {};
  }

  uploadPhoto(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    this.http.post<any>(config.apiUrl + '/upload', form)
      .subscribe((r) => (this.student.photoUrl = r.url));
  }
}
