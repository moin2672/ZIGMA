import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { ResetComponent } from './auth/reset/reset.component';
import { SignupComponent } from './auth/signup/signup.component';
import { CustomerCreateComponent } from './customer/customer-create/customer-create.component';
import { CustomerListComponent } from './customer/customer-list/customer-list.component';
import { GalleryCreateComponent } from './gallery/gallery-create/gallery-create.component';
import { GalleryDetailComponent } from './gallery/gallery-detail/gallery-detail.component';
import { GalleryListComponent } from './gallery/gallery-list/gallery-list.component';
import { GdriveCreateComponent } from './gdrive/gdrive-create/gdrive-create.component';
import { GdriveListComponent } from './gdrive/gdrive-list/gdrive-list.component';
import { OrderCreateComponent } from './order/order-create/order-create.component';
import { OrderListComponent } from './order/order-list/order-list.component';
import { OrganizationCreateComponent } from './organization/organization-create/organization-create.component';
import { OrganizationListComponent } from './organization/organization-list/organization-list.component';
import { StatusCreateComponent } from './status/status-create/status-create.component';
import { StatusListComponent } from './status/status-list/status-list.component';
import { TypeCreateComponent } from './type/type-create/type-create.component';
import { TypeListComponent } from './type/type-list/type-list.component';

const routes: Routes = [
  // {
  //   path:'status',
  //   component:StatusComponent,
  //   canActivate:[AuthGuard],
  //   children:[
  //     {path:'new',component:StatusCreateComponent},
  //     {path:'edit/:statusId',component:StatusCreateComponent},
  //   ]
  // },
  { path: 'home', component: GalleryListComponent },
  { path: 'status/list', component: StatusListComponent, canActivate:[AuthGuard] },
  { path: 'status/new', component: StatusCreateComponent, canActivate:[AuthGuard] },
  { path:'status/edit/:statusId', component: StatusCreateComponent, canActivate:[AuthGuard]},
  { path: 'gdrive', component: GdriveListComponent, canActivate:[AuthGuard] },
  { path: 'gdrive/new', component: GdriveCreateComponent, canActivate:[AuthGuard] },
  { path:'gdrive/edit/:gdriveId', component: GdriveCreateComponent, canActivate:[AuthGuard]},
  { path: 'type/list', component: TypeListComponent, canActivate:[AuthGuard] },
  { path: 'type/new', component: TypeCreateComponent, canActivate:[AuthGuard] },
  { path:'type/edit/:typeId', component: TypeCreateComponent, canActivate:[AuthGuard]},
  { path: 'customer/list', component: CustomerListComponent, canActivate:[AuthGuard] },
  { path: 'customer/new', component: CustomerCreateComponent, canActivate:[AuthGuard] },
  { path: 'customer/edit/:customerId', component: CustomerCreateComponent, canActivate:[AuthGuard] },
  { path: 'model/new', component: GalleryCreateComponent, canActivate:[AuthGuard]  },
  { path: 'model/edit/:modelId', component: GalleryCreateComponent, canActivate:[AuthGuard]  },
  { path: 'model/:modelId', component: GalleryDetailComponent},
  { path: 'orders/list', component: OrderListComponent , canActivate:[AuthGuard]},
  { path: 'orders/new', component: OrderCreateComponent , canActivate:[AuthGuard]},
  { path: 'orders/edit/:orderId', component: OrderCreateComponent , canActivate:[AuthGuard]},
  // { path: 'organization', component: OrganizationListComponent, canActivate:[AuthGuard] },
  { path: 'shop', component: OrganizationListComponent },
  { path: 'organization/new', component: OrganizationCreateComponent, canActivate:[AuthGuard] },
  { path:'organization/edit/:organizationId', component: OrganizationCreateComponent, canActivate:[AuthGuard]},
  { path: 'login', component: LoginComponent },
  { path: 'reset', component: ResetComponent, canActivate:[AuthGuard]  },
  { path: 'signup', component: SignupComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers:[AuthGuard]
})
export class AppRoutingModule {}
