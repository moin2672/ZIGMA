import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { first, fromEvent,  Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { Gallery } from '../gallery.model';
import { GalleryService } from '../gallery.service';
import Swal from 'sweetalert2';
import { ImageService } from 'src/app/shared/image.service';

@Component({
  selector: 'app-gallery-list',
  templateUrl: './gallery-list.component.html',
  styleUrls: ['./gallery-list.component.css'],
})
export class GalleryListComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchName: ElementRef;
  requestedData = null;
  searchText_Value = null;

  isLoading = false;
  gallerys: Gallery[] = [];
  private gallerySub: Subscription;
  list_of_imageId_Removed_fromDB_exception=[];

  totalPosts = 0; //total no of posts
  postsPerPage = 9; //current page
  currentPage = 1;
  pageSizeOptions = [9, 15, 21];

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
    private galleryService: GalleryService,
    private authService: AuthService,
    private imageService: ImageService
  ) {}

  onIncrement() {
    this.isLoading = true;
    console.log('on Inc');
    console.log(this.currentPage, this.totalPages);
    if (this.currentPage < this.totalPages) {
      this.currentPage = this.currentPage + 1;
      this.galleryService.getGallerys(this.postsPerPage, this.currentPage);
      this.updatePagination();
    }
  }
  onDecrement() {
    this.isLoading = true;
    console.log('on Dec');
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
      this.galleryService.getGallerys(this.postsPerPage, this.currentPage);
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
    // this.gallery = this.galleryService.getGallery()
    // console.log(this.gallery)
    this.isLoading = true;
    this.galleryService.getGallerys(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.gallerySub = this.galleryService
      .getGalleryUpdateListener()
      .subscribe(
        (galleryData: { gallerys: Gallery[]; galleryCount: number }) => {
          this.isLoading = false;
          this.gallerys = galleryData.gallerys;
          this.totalPosts = galleryData.galleryCount;
          this.updatePagination();
          console.log('from db:', galleryData);
        }
      );
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
        this.postsPerPage = 9;
        this.currentPage = 1;

        this.galleryService.getGallerysWithFilters(
          this.postsPerPage,
          this.currentPage,
          this.searchText_Value
        );
        console.log('calling gallery filter service 3');
        this.gallerySub = this.galleryService
          .getGalleryUpdateListener().pipe(first())
          .subscribe(
            (galleryData: { gallerys: Gallery[]; galleryCount: number }) => {
              this.isLoading = false;
              this.gallerys = galleryData.gallerys;
              this.totalPosts = galleryData.galleryCount;
              this.updatePagination();
              console.log(this.gallerys);
            }
          );
      } else {
        console.log('no value');
        this.galleryService.getGallerys(this.postsPerPage, this.currentPage);
        this.gallerySub = this.galleryService
          .getGalleryUpdateListener().pipe(first())
          .subscribe(
            (galleryData: { gallerys: Gallery[]; galleryCount: number }) => {
              this.isLoading = false;
              this.gallerys = galleryData.gallerys;
              this.totalPosts = galleryData.galleryCount;
              this.updatePagination();
              console.log('from db:', galleryData);
            }
          );
      }
    });
  }


  OnDelete(galleryId: string, links:any[]) {
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
        this.galleryService.deleteGallery(galleryId).subscribe({
          next: () => {
            // deleting the images of the gallery
            if(links.length>0){
              links.forEach(id=>{
                if(id!=""){
                  this.imageService.deleteImage(id).subscribe((responseData)=>{
                    console.log("(del)responseData.message=",responseData.message)
                    if(responseData.message!=="Image Deleted Successfully!"){
                      this.Toast.fire({
                        icon: 'error',
                        title: responseData.message,
                      });
                    }else{
                      this.Toast.fire({
                        icon: 'info',
                        title: responseData.message,
                      });
                    }
                  });
                }
              })
            }
            // getting back to gallery
            this.galleryService.getGallerys(
              this.postsPerPage,
              this.currentPage
            );
            this.Toast.fire({
              icon: 'success',
              title: 'Gallery Deleted Successfully',
            });
          },
          error: () => {
            this.isLoading = false;
          },
          complete: () => {
            console.info('Gallery Deletion Complete');
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
    this.gallerySub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
