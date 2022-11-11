import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Type } from './type.model';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/types";
@Injectable()
export class TypeService {
  private types: Type[] = [];
  private typesUpdated = new Subject<{types:Type[], typeCount:number}>();

  private typesOnly: string[] = [];
  private typesOnlyUpdated = new Subject<{typesOnly: string[]}>();

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

  getTypes(postsPerPage:number, currentPage: number) {
    const queryParams=`?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    this.httpClient
      .get<{ message: string; types: Type[], maxTypes:number }>(
        BACKEND_URL+queryParams
      )
      .subscribe((typeData) => {
        console.log("typeData=",typeData)
        this.types = typeData.types;
        this.typesUpdated.next({types:[...this.types], typeCount:typeData.maxTypes});
      });
  }
  getTypeUpdateListener() {
    return this.typesUpdated.asObservable();
  }

  getTypesOnly() {
    this.httpClient
      .get<{ typesOnly: any[] }>(
        BACKEND_URL+'/typeonly'
      )
      .subscribe((typeData) => {
        this.typesOnly = typeData.typesOnly;
        this.typesOnlyUpdated.next({typesOnly:[...this.typesOnly]});
      });
  }
  getTypeOnlyUpdateListener() {
    return this.typesOnlyUpdated.asObservable();
  }

  getType(typeId:string){
    // return {...this.types.find(p=>p._id===typeId)};
    return this.httpClient.get<{type:Type}>(BACKEND_URL+"/"+typeId);
  }

  addType(type: Type) {
    this.httpClient
      .post<{ message: string, typeId:string }>(BACKEND_URL, type)
      .subscribe((responseData) => {
        console.log("responseData.message=",responseData);
        this.Toast.fire({
          icon: 'success',
          title: 'Type Added Successfully'
        })
        this.router.navigate(['/type/list']);   
      });
  }

  updateType(type: Type){
    console.log("in updateType",type)
    this.httpClient.put(BACKEND_URL+"/"+type._id, type)
    .subscribe(response=>{
      // console.log(response)
      this.Toast.fire({
        icon: 'success',
        title: 'Type Updated Successfully'
      })
      this.router.navigate(['/type/list']);
    })
  }

  getTypesWithFilters(
    postsPerPage: number,
    currentPage: number,
    searchText: string
  ) {
    // return [...this.types];
    let queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}&searchtext=${searchText}`;
    if (searchText == "") {
      queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    }
    //console.log(queryParams);
    this.httpClient
      .get<{ message: string; types: Type[]; maxTypes: number }>(
        BACKEND_URL+"/search" + queryParams
      )
      .subscribe(postData => {
        this.types = postData.types;

        //console.log(postData);
        this.typesUpdated.next({
          types: [...this.types],
          typeCount: postData.maxTypes
        });
      });
  }

  deleteType(typeId: string) {
    return this.httpClient
      .delete(BACKEND_URL+'/' + typeId)
     
  }
}
