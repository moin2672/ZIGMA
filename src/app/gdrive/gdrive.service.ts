import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Gdrive } from './gdrive.model';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/gdrives";

@Injectable()
export class GdriveService {
  private gdrives: Gdrive[] = [];
  private gdrivesUpdated = new Subject<{gdrives:Gdrive[], gdriveCount:number}>();

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

  getGdrives(postsPerPage:number, currentPage: number) {
    const queryParams=`?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    this.httpClient
      .get<{ message: string; gdrives: Gdrive[], maxGdrives:number }>(
        BACKEND_URL+queryParams
      )
      .subscribe((gdriveData) => {
        console.log("gdriveData=",gdriveData)
        this.gdrives = gdriveData.gdrives;
        this.gdrivesUpdated.next({gdrives:[...this.gdrives], gdriveCount:gdriveData.maxGdrives});
      });
  }
  getGdriveUpdateListener() {
    return this.gdrivesUpdated.asObservable();
  }

  getGdrive(gdriveId:string){
    // return {...this.gdrives.find(p=>p._id===gdriveId)};
    return this.httpClient.get<{gdrive:Gdrive}>(BACKEND_URL+"/"+gdriveId);
  }

  addGdrive(gdrive: Gdrive) {
    this.httpClient
      .post<{ message: string, gdriveId:string }>(BACKEND_URL, gdrive)
      .subscribe((responseData) => {
        console.log("responseData.message=",responseData);
        this.Toast.fire({
          icon: 'success',
          title: 'Gdrive Added Successfully'
        })
        this.router.navigate(['/gdrive']);   
      });
  }

  updateGdrive(gdrive: Gdrive){
    console.log("in updateGdrive",gdrive)
    this.httpClient.put(BACKEND_URL+"/"+gdrive._id, gdrive)
    .subscribe(response=>{
      // console.log(response)
      this.Toast.fire({
        icon: 'success',
        title: 'Gdrive Updated Successfully'
      })
      this.router.navigate(['/gdrive']);
    })
  }

  deleteGdrive(gdriveId: string) {
    return this.httpClient
      .delete(BACKEND_URL+'/' + gdriveId)
     
  }
}
