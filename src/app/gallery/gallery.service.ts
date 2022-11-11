import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Gallery } from './gallery.model';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/models";
@Injectable()
export class GalleryService {
  private gallerys: Gallery[] = [];
  private gallerysUpdated = new Subject<{gallerys:Gallery[], galleryCount:number}>();

  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  constructor(private httpClient: HttpClient,private router:Router) {}

  getGallerys(postsPerPage:number, currentPage: number) {
    const queryParams=`?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    this.httpClient
      .get<{ message: string; models: Gallery[], maxModels:number }>(
        BACKEND_URL+queryParams
      )
      .subscribe((galleryData) => {
        console.log("galleryData=",galleryData)
        this.gallerys = galleryData.models;
        this.gallerysUpdated.next({gallerys:[...this.gallerys], galleryCount:galleryData.maxModels});
      });
  }
  getGalleryUpdateListener() {
    return this.gallerysUpdated.asObservable();
  }

  getGallery(galleryId:string){
    // return {...this.gallerys.find(p=>p._id===galleryId)};
    return this.httpClient.get<{model:Gallery}>(BACKEND_URL+"/"+galleryId);
  }

  addGallery(gallery: Gallery) {
    console.log("adding gallery=",gallery)
    this.httpClient
      .post<{ message: string, galleryId:string }>(BACKEND_URL, gallery)
      .subscribe((responseData) => {
        console.log("responseData.message=",responseData);
        this.Toast.fire({
          icon: 'success',
          title: 'Gallery Added Successfully'
        })
        this.router.navigate(['/model/new']);   
      });
  }

  updateGallery(gallery: Gallery){
    console.log("in updateGallery",gallery)
    this.httpClient.put(BACKEND_URL+"/"+gallery._id, gallery)
    .subscribe(response=>{
      // console.log(response)
      this.Toast.fire({
        icon: 'success',
        title: 'Gallery Updated Successfully'
      })
      this.router.navigate(['/model/new']);
    })
  }

  
getGallerysWithFilters(
  postsPerPage: number,
  currentPage: number,
  searchText: string
) {
  // return [...this.gallerys];
  let queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}&searchtext=${searchText}`;
  if (searchText == "") {
    queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
  }
  //console.log(queryParams);
  this.httpClient
    .get<{ message: string; models: Gallery[], maxModels:number }>(
      BACKEND_URL+"/search" + queryParams
    )
    .subscribe(postData => {
      this.gallerys = postData.models;

      //console.log(postData);
      this.gallerysUpdated.next({
        gallerys: [...this.gallerys],
        galleryCount: postData.maxModels
      });
    });
}

  deleteGallery(galleryId: string) {
    return this.httpClient
      .delete(BACKEND_URL+'/' + galleryId)
     
  }
}
