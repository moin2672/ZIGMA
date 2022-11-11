import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Status } from './status.model';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/status";

@Injectable()
export class StatusService {
  private statuses: Status[] = [];
  private statusesUpdated = new Subject<{statuses:Status[], statusCount:number}>();
  private statusesOnly: string[] = [];
  private statusesOnlyUpdated = new Subject<{statusesOnly:string[]}>();

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

  getStatuses(postsPerPage:number, currentPage: number) {
    const queryParams=`?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    this.httpClient
      .get<{ message: string; statuses: Status[], maxStatuses:number }>(
        BACKEND_URL+queryParams
      )
      .subscribe((statusData) => {
        console.log("statusData=",statusData)
        this.statuses = statusData.statuses;
        this.statusesUpdated.next({statuses:[...this.statuses], statusCount:statusData.maxStatuses});
      });
  }
  getStatusUpdateListener() {
    return this.statusesUpdated.asObservable();
  }

  getStatusesOnly() {
    this.httpClient
      .get<{ statusesOnly: any[] }>(
        BACKEND_URL+'/statusonly'
      )
      .subscribe((statusData) => {
        this.statusesOnly = statusData.statusesOnly;
        this.statusesOnlyUpdated.next({statusesOnly:[...this.statusesOnly]});
      });
  }
  getStatusOnlyUpdateListener() {
    return this.statusesOnlyUpdated.asObservable();
  }

  getStatus(statusId:string){
    // return {...this.statuses.find(p=>p._id===statusId)};
    return this.httpClient.get<{status:Status}>(BACKEND_URL+"/"+statusId);
  }

  addStatus(status: Status) {
    this.httpClient
      .post<{ message: string, statusId:string }>(BACKEND_URL, status)
      .subscribe((responseData) => {
        console.log("responseData.message=",responseData);
        this.Toast.fire({
          icon: 'success',
          title: 'Status Added Successfully'
        })
        this.router.navigate(['/status/list']);   
      });
  }

  updateStatus(status: Status){
    console.log("in updateStatus",status)
    this.httpClient.put(BACKEND_URL+"/"+status._id, status)
    .subscribe(response=>{
      // console.log(response)
      this.Toast.fire({
        icon: 'success',
        title: 'Status Updated Successfully'
      })
      this.router.navigate(['/status/list']);
    })
  }

  getStatusesWithFilters(
    postsPerPage: number,
    currentPage: number,
    searchText: string
  ) {
    // return [...this.statuses];
    let queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}&searchtext=${searchText}`;
    if (searchText == "") {
      queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    }
    //console.log(queryParams);
    this.httpClient
      .get<{ message: string; statuses: Status[]; maxStatuses: number }>(
        BACKEND_URL+"/search" + queryParams
      )
      .subscribe(postData => {
        this.statuses = postData.statuses;

        //console.log(postData);
        this.statusesUpdated.next({
          statuses: [...this.statuses],
          statusCount: postData.maxStatuses
        });
      });
  }

  deleteStatus(statusId: string) {
    return this.httpClient
      .delete(BACKEND_URL+'/' + statusId)
     
  }
}
