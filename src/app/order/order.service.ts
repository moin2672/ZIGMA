import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Order } from './order.model';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/orders";
@Injectable()
export class OrderService {
  private orders: Order[] = [];
  private ordersUpdated = new Subject<{orders:Order[], orderCount:number}>();

  private customerOrderProp: BehaviorSubject<{totalPosts:number, searchOrder:string, clicked:boolean}> = new BehaviorSubject<{totalPosts:number, searchOrder:string, clicked:boolean}>({totalPosts:0, searchOrder:"", clicked:false});
  public customerOrderProp$: Observable<{totalPosts:number, searchOrder:string, clicked:boolean}> = this.customerOrderProp.asObservable();


  private orderPhoneNos=[]
private orderPhoneNosUpdated = new Subject<{orderPhoneNos:string[]}>();

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

  setCustomerOrderProp(totalPosts:number, searchOrder:string, clicked:boolean){
    this.customerOrderProp.next({totalPosts:totalPosts, searchOrder:searchOrder, clicked: clicked})
  }

  getOrders(postsPerPage:number, currentPage: number) {
    const queryParams=`?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    this.httpClient
      .get<{ message: string; orders: Order[], maxOrders:number }>(
        BACKEND_URL+queryParams
      )
      .subscribe((orderData) => {
        console.log("orderData=",orderData)
        this.orders = orderData.orders;
        // this.orderPhoneNos=this.orders.map(cust=>cust.orderPhoneNo)
        this.ordersUpdated.next({orders:[...this.orders], orderCount:orderData.maxOrders});
      });
  }



  getOrderUpdateListener() {
    return this.ordersUpdated.asObservable();
  }

  getOrder(orderId:string){
    // return {...this.orders.find(p=>p._id===orderId)};
    return this.httpClient.get<{order:Order}>(BACKEND_URL+"/"+orderId);
  }

getOrderPhoneNos(){
  this.httpClient.get<{orderPhoneNos:any[]}>(BACKEND_URL+'/phone')
                .subscribe((custData)=>{
                  this.orderPhoneNos=custData.orderPhoneNos;
                  this.orderPhoneNosUpdated.next({orderPhoneNos:[...this.orderPhoneNos]})
                })
}

getOrderPhoneNosUpdateListener() {
  return this.orderPhoneNosUpdated.asObservable();
}

  addOrder(order: Order) {
    console.log("adding order=",order)
    this.httpClient
      .post<{ message: string, orderId:string }>(BACKEND_URL, order)
      .subscribe((responseData) => {
        console.log("responseData.message=",responseData);
        this.Toast.fire({
          icon: 'success',
          title: 'Order Added Successfully'
        })
        this.router.navigate(['/orders/new']);   
      });
  }

  updateOrder(order: Order){
    console.log("in updateOrder",order)
    this.httpClient.put(BACKEND_URL+"/"+order._id, order)
    .subscribe(response=>{
      // console.log(response)
      this.Toast.fire({
        icon: 'success',
        title: 'Order Updated Successfully'
      })
      this.router.navigate(['/orders/new']);
    })
  }

  getOrdersWithFilters(
    postsPerPage: number,
    currentPage: number,
    orderedFromDate:string,
    orderedToDate:string,
    orderStatus:string,
    orderType:string,
    orderModelNo: string,
    customerPhoneNo:string
  ) {
    // return [...this.orders]; &currentpage=${}
    let queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}&orderedFromDate=${orderedFromDate}&orderedToDate=${orderedToDate}&orderStatus=${orderStatus}&orderType=${orderType}&orderModelNo=${orderModelNo}&customerPhoneNo=${customerPhoneNo}`;
    console.log("get order with filter=", queryParams)
    this.httpClient
      .get<{ message: string; orders: Order[]; maxOrders: number }>(
        BACKEND_URL+"/search" + queryParams
      )
      .subscribe(postData => {
        this.orders = postData.orders;

        ////console.log(postData);
        this.ordersUpdated.next({
          orders: [...this.orders],
          orderCount: postData.maxOrders
        });
      });
  }

  deleteOrder(orderId: string) {
    return this.httpClient
      .delete(BACKEND_URL+'/' + orderId)
     
  }
}
