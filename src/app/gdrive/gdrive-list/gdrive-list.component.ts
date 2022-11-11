import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { Gdrive } from '../gdrive.model';
import { GdriveService } from '../gdrive.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gdrive-list',
  templateUrl: './gdrive-list.component.html',
  styleUrls: ['./gdrive-list.component.css'],
})
export class GdriveListComponent implements OnInit, OnDestroy {
  isLoading = false;
  gdrives: Gdrive[] = [];
  private gdriveSub: Subscription;

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
  private authGdriveSub: Subscription;

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
    private gdriveService: GdriveService,
    private authService: AuthService
  ) {}

  onIncrement() {
    this.isLoading = true;
    console.log('on Inc');
    console.log(this.currentPage, this.totalPages);
    if (this.currentPage < this.totalPages) {
      this.currentPage = this.currentPage + 1;
      this.gdriveService.getGdrives(this.postsPerPage, this.currentPage);
      this.updatePagination();
    }
  }
  onDecrement() {
    this.isLoading = true;
    console.log('on Dec');
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
      this.gdriveService.getGdrives(this.postsPerPage, this.currentPage);
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
    // this.gdrive = this.gdriveService.getGdrive()
    // console.log(this.gdrive)
    this.isLoading = true;
    this.gdriveService.getGdrives(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.gdriveSub = this.gdriveService
      .getGdriveUpdateListener()
      .subscribe((gdriveData: { gdrives: Gdrive[]; gdriveCount: number }) => {
        this.isLoading = false;
        this.gdrives = gdriveData.gdrives;
        this.totalPosts = gdriveData.gdriveCount;
        this.updatePagination();
        console.log('from db:', gdriveData);
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authGdriveSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  OnDelete(gdriveId: string) {
    this.isLoading = true;
    this.gdriveService.deleteGdrive(gdriveId).subscribe({
      next: () => {
        this.gdriveService.getGdrives(this.postsPerPage, this.currentPage);
        this.Toast.fire({
          icon: 'success',
          title: 'Gdrive Deleted Successfully',
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = true;
      },
      complete: () => {
        console.info('Gdrive Deletion Complete');
      },
    });
  }

  ngOnDestroy() {
    this.gdriveSub.unsubscribe();
    this.authGdriveSub.unsubscribe();
  }
}
