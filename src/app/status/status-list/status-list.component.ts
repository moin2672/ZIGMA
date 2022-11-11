import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { first, fromEvent,  Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { Status } from '../status.model';
import { StatusService } from '../status.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-status-list',
  templateUrl: './status-list.component.html',
  styleUrls: ['./status-list.component.css'],
})
export class StatusListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchInput') searchName: ElementRef;
  requestedData = null;
  searchText_Value = null;

  isLoading = false;
  statuses: Status[] = [];
  private statusSub: Subscription;

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
  private authStatusSub: Subscription;

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
    private statusService: StatusService,
    private authService: AuthService
  ) {}

  onIncrement() {
    this.isLoading = true;
    console.log('on Inc');
    console.log(this.currentPage, this.totalPages);
    if (this.currentPage < this.totalPages) {
      this.currentPage = this.currentPage + 1;
      this.statusService.getStatuses(this.postsPerPage, this.currentPage);
      this.updatePagination();
    }
  }
  onDecrement() {
    this.isLoading = true;
    console.log('on Dec');
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
      this.statusService.getStatuses(this.postsPerPage, this.currentPage);
      this.updatePagination();
    }
  }
  updatePagination() {
    //console.log('calling functon updatePagination');
    this.totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
    //console.log('currentpage=', this.currentPage);
    //console.log('totalPages=', this.totalPages);
    //console.log('totalPosts=', this.totalPosts);
    //console.log(Math.ceil(this.totalPosts / this.postsPerPage));
    if (this.currentPage <= 1) {
      //console.log('calling 0');
      if (this.totalPages <= 1) {
        //console.log('calling 00');
        // this.hide = true;
        this.forward = false;
        this.backward = false;
      } else {
        // this.hide = false;
        //console.log('calling 000');
        if (this.currentPage < this.totalPages) {
          //console.log('calling 1');
          this.forward = true;
          this.backward = false;
        }
      }
    } else {
      //console.log('calling 0000');
      if (this.currentPage < this.totalPages) {
        //console.log('calling 2');
        this.forward = true;
        this.backward = true;
      }
      if (this.currentPage == this.totalPages) {
        //console.log('calling 3');
        this.forward = false;
        this.backward = true;
      }
    }
  }

  ngOnInit() {
    // this.status = this.statusService.getStatus()
    // console.log(this.status)
    this.isLoading = true;
    this.statusService.getStatuses(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.statusSub = this.statusService
      .getStatusUpdateListener()
      .subscribe((statusData: { statuses: Status[]; statusCount: number }) => {
        this.isLoading = false;
        this.statuses = statusData.statuses;
        this.totalPosts = statusData.statusCount;
        this.updatePagination();
        console.log('from db:', statusData);
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  ngAfterViewInit() {
    const searchTerm = fromEvent<any>(
      this.searchName.nativeElement,
      'keyup'
    ).pipe(
      map((event) => event.target.value),
      debounceTime(1000)
      //distinctUntilChanged()
    );

    searchTerm.subscribe((res) => {
      console.log('=>', res);
      this.requestedData = res;
      this.searchText_Value = res;
      setTimeout(() => {
        this.requestedData = null;
      }, 2000);

      // this.totalPosts = 0;
      // this.postsPerPage = 3; //current page
      // this.currentPage = 1;

      if (this.searchText_Value && this.searchText_Value != '') {
        console.log('value');
        this.postsPerPage = 100;
        this.currentPage = 1;

        this.statusService.getStatusesWithFilters(
          this.postsPerPage,
          this.currentPage,
          this.searchText_Value
        );
        console.log('calling status filter service 3');
        this.statusSub = this.statusService
          .getStatusUpdateListener().pipe(first())
          .subscribe(
            (statusData: { statuses: Status[]; statusCount: number }) => {
              this.isLoading = false;
              this.statuses = statusData.statuses;
              this.totalPosts = statusData.statusCount;
              this.updatePagination();
              console.log(this.statuses);
            }
          );
      } else {
        console.log('no value');
        this.statusService.getStatuses(this.postsPerPage, this.currentPage);
        this.statusSub = this.statusService
          .getStatusUpdateListener().pipe(first())
          .subscribe(
            (statusData: { statuses: Status[]; statusCount: number }) => {
              this.isLoading = false;
              this.statuses = statusData.statuses;
              this.totalPosts = statusData.statusCount;
              this.updatePagination();
              console.log('from db:', statusData);
            }
          );
      }
    });
  }

  OnDelete(statusId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.statusService.deleteStatus(statusId).subscribe({
          next: () => {
            this.statusService.getStatuses(
              this.postsPerPage,
              this.currentPage
            );
            this.Toast.fire({
              icon: 'success',
              title: 'Status Deleted Successfully',
            });
          },
          error: () => {
            this.isLoading = false;
          },
          complete: () => {
            console.info('Status Deletion Complete');
          },
        });
        // Swal.fire(
        //   'Deleted!',
        //   'Your file has been deleted.',
        //   'success'
        // )
      }else{
        Swal.fire(
          'Cancelled',
          'Your data is safe :)',
          'error'
        )
      }
    });
  }
  

  ngOnDestroy() {
    this.statusSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
