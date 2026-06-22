import { Routes } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { UserComponent } from './user/user.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
    {
        path: 'signin',
        component: SigninComponent,
    },
    {
        path: 'signup',
        component: SignupComponent,
    },
    {
        path: 'user',
        component: UserComponent,
    },
    {
        path: 'admin',
        component: AdminComponent,
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'signin',
    },
];
