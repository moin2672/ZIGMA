import { BrowserModule } from '@angular/platform-browser';
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { HeaderComponent } from './header/header.component';
import { CarouselComponent } from './carousel/carousel.component';
import { GalleryListComponent } from './gallery/gallery-list/gallery-list.component';
import { GalleryService } from './gallery/gallery.service';
import { GalleryDetailComponent } from './gallery/gallery-detail/gallery-detail.component';
import { OrganizationListComponent } from './organization/organization-list/organization-list.component';
import { OrganizationService } from './organization/organization.service';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NewCarouselComponent } from './new-carousel/new-carousel.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { GalleryCreateComponent } from './gallery/gallery-create/gallery-create.component';
import { StatusCreateComponent } from './status/status-create/status-create.component';
import { StatusService } from './status/status.service';
import { CommonModule } from '@angular/common';
import { StatusListComponent } from './status/status-list/status-list.component';
import { TypeCreateComponent } from './type/type-create/type-create.component';
import { TypeListComponent } from './type/type-list/type-list.component';
import { TypeService } from './type/type.service';
import { CustomerCreateComponent } from './customer/customer-create/customer-create.component';
import { CustomerListComponent } from './customer/customer-list/customer-list.component';
import { OrderCreateComponent } from './order/order-create/order-create.component';
import { OrderListComponent } from './order/order-list/order-list.component';
import { OrderService } from './order/order.service';
import { CustomerService } from './customer/customer.service';
import { GdriveCreateComponent } from './gdrive/gdrive-create/gdrive-create.component';
import { GdriveListComponent } from './gdrive/gdrive-list/gdrive-list.component';
import { GdriveService } from './gdrive/gdrive.service';
import { AuthService } from './auth/auth.service';
import { AuthInterceptor } from './auth/auth-interceptor';
import { ErrorInterceptor } from './error-interceptor';
import { ImageService } from './shared/image.service';
import { DateService } from './shared/date.service';
import { OrganizationCreateComponent } from './organization/organization-create/organization-create.component';
import { ResetComponent } from './auth/reset/reset.component';
import { UrlService } from './shared/url.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    CommonModule,
  ],
  declarations: [
    AppComponent,
    HelloComponent,
    HeaderComponent,
    CarouselComponent,
    GalleryListComponent,
    GalleryDetailComponent,
    OrganizationCreateComponent,
    OrganizationListComponent,
    NewCarouselComponent,
    LoginComponent,
    SignupComponent,
    ResetComponent,
    GalleryCreateComponent,
    StatusCreateComponent,
    StatusListComponent,
    TypeCreateComponent,
    TypeListComponent,
    CustomerCreateComponent,
    CustomerListComponent,
    OrderCreateComponent,
    OrderListComponent,
    GdriveCreateComponent,
    GdriveListComponent,
  ],
  providers: [
    GalleryService,
    OrganizationService,
    StatusService,
    TypeService,
    OrderService,
    CustomerService,
    GdriveService,
    AuthService,
    ImageService,
    DateService,
    UrlService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
