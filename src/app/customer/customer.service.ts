import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Customer } from './customer.model';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/customers";

@Injectable()
export class CustomerService {
  private customers: Customer[] = [];
  private customersUpdated = new Subject<{customers:Customer[], customerCount:number}>();

  private customerPhoneNos=[]
private customerPhoneNosUpdated = new Subject<{customerPhoneNos:string[]}>();

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

  getCustomers(postsPerPage:number, currentPage: number) {
    const queryParams=`?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    this.httpClient
      .get<{ message: string; customers: Customer[], maxCustomers:number }>(
        BACKEND_URL+queryParams
      )
      .subscribe((customerData) => {
        console.log("customerData=",customerData)
        this.customers = customerData.customers;
        // this.customerPhoneNos=this.customers.map(cust=>cust.customerPhoneNo)
        this.customersUpdated.next({customers:[...this.customers], customerCount:customerData.maxCustomers});
      });
  }



  getCustomerUpdateListener() {
    return this.customersUpdated.asObservable();
  }

  getCustomer(customerId:string){
    // return {...this.customers.find(p=>p._id===customerId)};
    return this.httpClient.get<{customer:Customer}>(BACKEND_URL+"/"+customerId);
  }

getCustomerPhoneNos(){
  this.httpClient.get<{customerPhoneNos:any[]}>(BACKEND_URL+'/phone')
                .subscribe((custData)=>{
                  this.customerPhoneNos=custData.customerPhoneNos;
                  this.customerPhoneNosUpdated.next({customerPhoneNos:[...this.customerPhoneNos]})
                })
}

getCustomerPhoneNosUpdateListener() {
  return this.customerPhoneNosUpdated.asObservable();
}

  addCustomer(customer: Customer) {
    console.log("adding customer=",customer)
    this.httpClient
      .post<{ message: string, customerId:string }>(BACKEND_URL, customer)
      .subscribe((responseData) => {
        console.log("responseData.message=",responseData);
        this.Toast.fire({
          icon: 'success',
          title: 'Customer Added Successfully'
        })
        this.router.navigate(['/customer/list']);   
      });
  }

  updateCustomer(customer: Customer){
    console.log("in updateCustomer",customer)
    this.httpClient.put(BACKEND_URL+"/"+customer._id, customer)
    .subscribe(response=>{
      // console.log(response)
      this.Toast.fire({
        icon: 'success',
        title: 'Customer Updated Successfully'
      })
      this.router.navigate(['/customer/list']);
    })
  }

  deleteCustomer(customerId: string) {
    return this.httpClient
      .delete(BACKEND_URL+'/' + customerId)
     
  }

  getCustomersWithFilters(
    postsPerPage: number,
    currentPage: number,
    searchText: string
  ) {
    // return [...this.customers];
    let queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}&searchtext=${searchText}`;
    if (searchText == "") {
      queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    }
    //console.log(queryParams);
    this.httpClient
      .get<{ message: string; customers: Customer[]; maxCustomers: number }>(
        BACKEND_URL+"/search" + queryParams
      )
      .subscribe(postData => {
        this.customers = postData.customers;

        //console.log(postData);
        this.customersUpdated.next({
          customers: [...this.customers],
          customerCount: postData.maxCustomers
        });
      });
  }


  // getCustomersWithFilters1(
  //   searchText: string
  // ) {
  //   // return [...this.customers];
  //   let queryParams = `?searchtext=${searchText}`;

  //   ////console.log(queryParams);
  //   this.httpClient
  //     .get<{ message: string; customers: Customer[]; maxCustomers: number }>(
  //       BACKEND_URL+"/search" + queryParams
  //     )
  //     .subscribe(postData => {
  //       this.customers = postData.customers;

  //       ////console.log(postData);
  //       this.customersUpdated.next({
  //         customers: [...this.customers],
  //         customerCount: postData.maxCustomers
  //       });
  //     });
  // }

}
