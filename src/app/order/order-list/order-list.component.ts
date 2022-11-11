import { Component, OnDestroy, OnInit } from '@angular/core';
import { first, Observable, Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { Order } from '../order.model';
import { OrderService } from '../order.service';
import Swal from 'sweetalert2';
import { FormControl, FormGroup } from '@angular/forms';
import { TypeService } from '../../type/type.service';
import { StatusService } from '../../status/status.service';
import { DateService } from '../../shared/date.service';
import { UrlService } from '../../shared/url.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
})
export class OrderListComponent implements OnInit, OnDestroy {
  orderSearchForm: FormGroup;
  orderType_list = [];
  orderStatus_list = [];
  clicked = false;
  isLoading = false;
  orders: Order[] = [];
  private orderSub: Subscription;
  private typeSub: Subscription;
  private statusSub:Subscription;

  previousUrl: Observable<string> = this.urlService.previousUrl$;
prev_Url="";
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
    private orderService: OrderService,
    private authService: AuthService,
    private typeSerivce: TypeService,
    private statusService: StatusService,
    private dateService: DateService,
    private urlService: UrlService
  ) {}

  onIncrement() {
    this.isLoading = true;
    console.log('on Inc');
    console.log(this.currentPage, this.totalPages);
    if (this.currentPage < this.totalPages) {
      this.currentPage = this.currentPage + 1;
      this.orderService.getOrders(this.postsPerPage, this.currentPage);
      this.updatePagination();
    }
  }
  onDecrement() {
    this.isLoading = true;
    console.log('on Dec');
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
      this.orderService.getOrders(this.postsPerPage, this.currentPage);
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
  
  initForm_Order() {
    let orderedFromDate = '';
    let orderedToDate = '';
    let orderStatus = '';
    let orderType = '';
    let orderModelNo = '';
    let customerPhoneNo='';

    this.orderSearchForm = new FormGroup({
      orderedFromDate: new FormControl(orderedFromDate),
      orderedToDate: new FormControl(orderedToDate),
      orderStatus: new FormControl(orderStatus),
      orderType: new FormControl(orderType),
      orderModelNo: new FormControl(orderModelNo),
      customerPhoneNo: new FormControl(customerPhoneNo),
    });
  }

  ngOnInit() {
    // this.order = this.orderService.getOrder()
    // console.log(this.order)
    this.orderType_list = [];
    this.orderStatus_list = [];
    // this.orderType_list = this.typeSerivce.getType()
    // this.orderStatus_list = this.statusService.getStatus()

    // GETTING LIST OF STATUSES
this.typeSerivce.getTypesOnly();
this.typeSub = this.typeSerivce
  .getTypeOnlyUpdateListener()
  .subscribe((typeData) => {
    this.orderType_list = typeData.typesOnly;
  });
    
    // GETTING LIST OF STATUSES
    this.statusService.getStatusesOnly();
    this.statusSub = this.statusService
      .getStatusOnlyUpdateListener()
      .subscribe((statusData) => {
        this.orderStatus_list = statusData.statusesOnly;
      });

    this.initForm_Order();

    this.urlService.previousUrl$
      .pipe(first())
      .subscribe((previousUrl: string) => {
        //console.log('previousUrl=', previousUrl);
        this.prev_Url = previousUrl;
        console.log("NEW ORDER previous url: ", previousUrl);
      });

      this.isLoading = true;

      this.Initial_Data_Loading();

    this.userId = this.authService.getUserId();
    // this.orderService.getOrders(this.postsPerPage, this.currentPage);
    this.orderSub = this.orderService
      .getOrderUpdateListener()
      .subscribe(
        (orderData: { orders: Order[]; orderCount: number }) => {
          this.isLoading = false;
          this.orders = orderData.orders;
          this.totalPosts = orderData.orderCount;
          this.updatePagination();
          console.log('from db:', orderData);
        }
      );
    // this.clearAll();
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  Initial_Data_Loading(){
    if(this.prev_Url==='/customer/list'){
      this.orderService.customerOrderProp$.pipe(first()).subscribe((data) => {
        //console.log('obtained data=', data);
    
        if (data && data.clicked) {
          this.clicked = !this.clicked;
          this.postsPerPage = data.totalPosts;
          this.currentPage = 1;
          if (data.searchOrder != '') {
            // this.searchText_Value=data.searchOrder
            // this.orderService.getOrdersWithFilters(
            //   this.postsPerPage,
            //   this.currentPage,
            //   data.searchOrder
            // );
            this.orderService.getOrdersWithFilters(
              this.postsPerPage,
            this.currentPage,
              '',
              '',
              '',
              '',
              '',
              data.searchOrder
            );
    
            //console.log('calling order filter service 1');
          } else {
            this.orderService.getOrders(
              this.postsPerPage,
              this.currentPage
            );
            //console.log('calling order service 1');
          }
        } else {
          this.orderService.getOrders(
            this.postsPerPage,
            this.currentPage
          );
          //console.log('calling order service 1');
        }
      });
    }else {
      this.orderService.getOrders(this.postsPerPage, this.currentPage);
      //console.log('calling order service 2');
    }
  }

  onSearchOrder() {
    console.log(this.orderSearchForm.value);

    if (
      this.orderSearchForm.value.orderedFromDate ||
      this.orderSearchForm.value.orderedToDate ||
      this.orderSearchForm.value.orderStatus ||
      this.orderSearchForm.value.orderType ||
      this.orderSearchForm.value.orderModelNo ||
      this.orderSearchForm.value.customerPhoneNo
    ) {
      this.postsPerPage = 10; //check again
        this.currentPage = 1;

      console.log("out")
      if (
       ( this.orderSearchForm.value.orderedFromDate &&
        this.orderSearchForm.value.orderedToDate) || ( !this.orderSearchForm.value.orderedFromDate &&
          !this.orderSearchForm.value.orderedToDate)
      ) {
        console.log("out 1")
        this.orderService.getOrdersWithFilters(
          this.postsPerPage,
          this.currentPage,
          this.orderSearchForm.value.orderedFromDate,
          this.orderSearchForm.value.orderedToDate,
          this.orderSearchForm.value.orderStatus,
          this.orderSearchForm.value.orderType,
          this.orderSearchForm.value.orderModelNo,
          this.orderSearchForm.value.customerPhoneNo
        );
      } else {
        if (
          !this.orderSearchForm.value.orderedFromDate &&
          this.orderSearchForm.value.orderedToDate
        ) {
          console.log("out 2")
          this.orderService.getOrdersWithFilters(
            this.postsPerPage,
          this.currentPage,
            this.dateService.getTodaysDate(),
            this.orderSearchForm.value.orderedToDate,
            this.orderSearchForm.value.orderStatus,
            this.orderSearchForm.value.orderType,
            this.orderSearchForm.value.orderModelNo,
            this.orderSearchForm.value.customerPhoneNo
          );
        }
        if (
          this.orderSearchForm.value.orderedFromDate &&
          !this.orderSearchForm.value.orderedToDate
        ) {
          console.log("out 3")
          this.orderService.getOrdersWithFilters(
            this.postsPerPage,
          this.currentPage,
            this.orderSearchForm.value.orderedFromDate,
            this.dateService.getTodaysDate(),
            this.orderSearchForm.value.orderStatus,
            this.orderSearchForm.value.orderType,
            this.orderSearchForm.value.orderModelNo,
            this.orderSearchForm.value.customerPhoneNo
          );
        }
      }
      
      this.orderSub = this.orderService
      .getOrderUpdateListener()
      .pipe(first())
      .subscribe(
        (orderData: { orders: Order[]; orderCount: number }) => {
          this.isLoading = false;
          this.orders = orderData.orders;
          this.totalPosts = orderData.orderCount;
          this.updatePagination();
          console.log('from db (search order):', orderData);
        }
      );

    }

  }

  OnDelete(orderId: string) {
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
        this.orderService.deleteOrder(orderId).subscribe({
          next: () => {
            // this.orderService.getOrders(
            //   this.postsPerPage,
            //   this.currentPage
            // );
            // this.clearAll();
            this.Initial_Data_Loading();
            this.isLoading = false;
            this.Toast.fire({
              icon: 'success',
              title: 'Order Deleted Successfully',
            });
          },
          error: () => {
            this.isLoading = true;
          },
          complete: () => {
            console.info('Order Deletion Complete');
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

clearAll(){
  this.orderSearchForm.reset();
  this.orderService.getOrders(this.postsPerPage, this.currentPage);
  this.orderSub = this.orderService
      .getOrderUpdateListener().pipe(first())
      .subscribe(
        (orderData: { orders: Order[]; orderCount: number }) => {
          this.isLoading = false;
          this.orders = orderData.orders;
          this.totalPosts = orderData.orderCount;
          this.updatePagination();
          console.log('from db:', orderData);
        }
      );
}

  ngOnDestroy() {
    this.orderSub.unsubscribe();
    this.typeSub.unsubscribe();
    this.statusSub.unsubscribe();
    this.authStatusSub.unsubscribe();
    this.orderService.setCustomerOrderProp(0, '', false);
    this.clicked = !this.clicked;
  }
}
