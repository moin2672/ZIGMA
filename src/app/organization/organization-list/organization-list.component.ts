import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { Organization } from '../organization.model';
import { OrganizationService } from '../organization.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.css'],
})
export class OrganizationListComponent implements OnInit, OnDestroy {
  isLoading = false;
  organizationDetail: Organization={
    _id: "",
    organizationName: "",
    organizationPhoneNo:  "",
    organizationWhatsAppNo: "",
    organizationAddress:  "",
    organizationEmail: "",
    organizationDescription: "",
    organizationGoogleMap: "",
    lastUpdatedDate:  "",
    creator:  "",
  };
  organizations: Organization[] = [];
  private organizationSub: Subscription;

  totalPosts = 0; //total no of posts
  postsPerPage = 10; //current page
  currentPage = 1;
  pageSizeOptions = [10, 15, 20];

  /* checking the new pagination */
  totalPages = 0;
  // totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
  forward = false;
  backward = false;

  userIsAuthenticated = false;
  private authOrganizationSub: Subscription;

  userId: string;

  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  constructor(
    private organizationService: OrganizationService,
    private authService: AuthService
  ) {}

  onIncrement() {
    this.isLoading = true;
    console.log('on Inc');
    console.log(this.currentPage, this.totalPages);
    if (this.currentPage < this.totalPages) {
      this.currentPage = this.currentPage + 1;
      this.organizationService.getOrganizations(this.postsPerPage, this.currentPage);
      this.updatePagination();
    }
  }
  onDecrement() {
    this.isLoading = true;
    console.log('on Dec');
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
      this.organizationService.getOrganizations(this.postsPerPage, this.currentPage);
      this.updatePagination();
    }
  }
  updatePagination() {
    this.totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
    console.log('currentpage=', this.currentPage);
    console.log('totalPages=', this.totalPages);
    console.log('totalPosts=', this.totalPosts);
    console.log(Math.ceil(this.totalPosts / this.postsPerPage));
    if (this.currentPage <= 1) {
      if (this.totalPages <= 1) {
        // this.hide = true;
      } else {
        // this.hide = false;
        if (this.currentPage < this.totalPages) {
          this.forward = true;
          this.backward = false;
        }
      }
    } else {
      if (this.currentPage < this.totalPages) {
        this.forward = true;
        this.backward = true;
      }
      if (this.currentPage == this.totalPages) {
        this.forward = false;
        this.backward = true;
      }
    }
  }

  ngOnInit() {
    // this.organization = this.organizationService.getOrganization()
    // console.log(this.organization)
    this.isLoading = true;
    this.organizationService.getOrganizations(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.organizationSub = this.organizationService
      .getOrganizationUpdateListener()
      .subscribe((organizationData: { organizations: Organization[]; organizationCount: number }) => {
        this.isLoading = false;
        this.organizations = organizationData.organizations;
        if(this.organizations.length>0){
          this.organizationDetail=this.organizations[0]
        }
        this.totalPosts = organizationData.organizationCount;
        this.updatePagination();
        console.log('from db:', organizationData);
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authOrganizationSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  OnDelete(organizationId: string) {
    this.isLoading = true;
    this.organizationService.deleteOrganization(organizationId).subscribe({
      next: () => {
        this.organizationService.getOrganizations(this.postsPerPage, this.currentPage);
        this.Toast.fire({
          icon: 'success',
          title: 'Organization Deleted Successfully',
        });
      },
      error: () => {
        this.isLoading = false;
      },
      complete: () => {
        console.info('Organization Deletion Complete');
      },
    });
  }

  ngOnDestroy() {
    this.organizationSub.unsubscribe();
    this.authOrganizationSub.unsubscribe();
  }
}
