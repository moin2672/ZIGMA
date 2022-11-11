import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomerService } from '../../customer/customer.service';
import { StatusService } from '../../status/status.service';
import { TypeService } from '../../type/type.service';
import { Order } from '../order.model';
import { OrderService } from '../order.service';
import { AuthService } from '../../auth/auth.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ImageService } from '../../shared/image.service';
import { DateService } from '../../shared/date.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-create',
  templateUrl: './order-create.component.html',
  styleUrls: ['./order-create.component.css'],
})
export class OrderCreateComponent implements OnInit {
  orderForm: FormGroup;

  customerPhoneNos_list = [];
  orderType_list = [];
  orderStatus_list = [];
  imagePreview = '';
  isNewImageUploaded=false;
  imageRemovedFromDb_id=""
  formData = new FormData();
  rawFile = null;
  _amountPaid=0
  _orderBillNo="";
  imageUploadedOutput_Id=""
  transactionSummary_str=""

  orderData: Order;
  editMode = false;
  isLoading = false;
  private orderId = null;
  private creator = null;

  private authStatusSub: Subscription;
  private customerPhoneNosSub: Subscription;
  private statusSub: Subscription;
  private typeSub: Subscription;

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
    private typeSerivce: TypeService,
    private statusService: StatusService,
    private orderService: OrderService,
    private customerService: CustomerService,
    private imageService: ImageService,
    private dateService: DateService,
    public activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.editMode = false;
    this.orderId = null;
    this.creator = null;

    // GETTING LIST OF CUSTOMER NOS
    this.customerService.getCustomerPhoneNos();
    this.customerPhoneNosSub = this.customerService
      .getCustomerPhoneNosUpdateListener()
      .subscribe((custData) => {
        this.customerPhoneNos_list = custData.customerPhoneNos;
      });

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

      this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });

    this.initForm();
  }

  initForm() {
    let orderStatus = ''; //this.orderStatus_list[0].status
    let customerPhoneNo = '';
    let orderType = '';
    let orderModelNo = '';
    let orderDescription = '';
    let totalAmount = '';
    let amountPaid = '';
    // let image = '';
    let transactionType='Cash';
    let amountPaidToday=''

    this.orderForm = new FormGroup({
      customerPhoneNo: new FormControl(customerPhoneNo),
      orderStatus: new FormControl(orderStatus),
      orderType: new FormControl(orderType),
      orderModelNo: new FormControl(orderModelNo),
      orderDescription: new FormControl(orderDescription),
      totalAmount: new FormControl(totalAmount),
      amountPaidToday: new FormControl(amountPaidToday),
      transactionType: new FormControl(transactionType),
      amountPaid: new FormControl(amountPaid),
      image: new FormControl(this.imageUploadedOutput_Id),
    });

    this.orderForm.controls['amountPaid'].disable();

    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('orderId')) {
        this.editMode = true;
        this.orderId = paramMap.get('orderId');
        this.isLoading = true;
        this.orderService
          .getOrder(this.orderId)
          .subscribe((orderDataObtained) => {
            this.isLoading = false;
            this.orderData = orderDataObtained.order;
            this.creator = this.orderData.creator;
            this._amountPaid=this.orderData.amountPaid;
            this._orderBillNo=this.orderData.orderBillNo;
            this.imageUploadedOutput_Id=this.orderData.image;
            this.transactionSummary_str=this.orderData.transactionSummary;
            this.imagePreview='https://drive.google.com/thumbnail?id='+this.orderData.image;
            this.orderForm.setValue({
              customerPhoneNo: this.orderData.customerPhoneNo,
              orderStatus: this.orderData.orderStatus,
              orderType: this.orderData.orderType,
              orderModelNo: this.orderData.orderModelNo,
              orderDescription: this.orderData.orderDescription,
              totalAmount: this.orderData.totalAmount,
              amountPaidToday: '', //this.orderData.amountPaidToday,
              transactionType: 'Cash',//this.orderData.orderStatus,
              amountPaid: this.orderData.amountPaid,
              image: '',
            });
          });
      }
    });

  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file){
      this.formData.append('image', file);
      this.isNewImageUploaded=true;
    }
    this.rawFile = file;
    this.previewFile(file);
  }

  previewFile(file) {
    const reader = new FileReader();
    let result = '';
    reader.onload = () => {
      // convert an image to code base64
      this.imagePreview = reader.result as string;
      // console.log(this.listOfImages_Preview)
    };

    if (file) {
      reader.readAsDataURL(file);
    } else {
      this.imagePreview = '';
    }
  }

  onSubmit() {
    console.log("this.orderForm.value",this.orderForm.value);
    let resultMsg = 'Model Added Successfully';
    if (this.editMode) {
      resultMsg = 'Model Updated Successfully';
    }
    if (this.orderForm.invalid) {
      return;
    }
    if(this.orderForm.value.amountPaidToday!=""){
      this.transactionSummary_str=this.transactionSummary_str+"\n"+this.dateService.dateConverter(this.dateService.getTodaysDate())+"\t= "+this.orderForm.value.amountPaidToday.toFixed(2).toString()+" (" +this.orderForm.value.transactionType+")<br>";
    }

    const order: Order = {
      _id:this.orderId,
      customerPhoneNo:this.orderForm.value.customerPhoneNo,
      orderBillNo:this._orderBillNo,
      orderType: this.orderForm.value.orderType,
      orderStatus: this.orderForm.value.orderStatus,
      orderModelNo:this.orderForm.value.orderModelNo,
      orderDescription: this.orderForm.value.orderDescription,
      totalAmount:this.orderForm.value.totalAmount,
      amountPaid: this._amountPaid,
      amountPaidToday: this.orderForm.value.amountPaidToday,
      transactionType:this.orderForm.value.transactionType,
      transactionSummary:this.transactionSummary_str,
      lastUpdatedDate: this.dateService.getTodaysDate(),
      // "image":this.orderForm.value.image,
      image: this.imageUploadedOutput_Id,
      creator: this.creator,
    };

console.log("order=",order)

    if (!this.editMode) {
      if(this.isNewImageUploaded){
        this.imageService.addImage(this.formData).subscribe((responseData) => {
          console.log('responseData.message=', responseData);
          if (responseData.fileId === 'invalid_grant') {
            Swal.fire(
              'Image Upload Error',
              'Please update the REFRESH_TOKEN of google drive',
              'error'
            );
            return;
          } else {
            this.imageUploadedOutput_Id=responseData.fileId;
            
            this.Toast.fire({
              icon: 'success',
              title: 'Image Added Successfully',
            });
            //this.router.navigate(['/image']);
              order.image = this.imageUploadedOutput_Id;
              console.log('(new)order=', order);
              this.orderService.addOrder(order);
              // Swal.fire({
              //   icon: 'question',
              //   title: resultMsg,
              //   text: 'We are on +Order page, Would you like to add more Orders.',
              //   showConfirmButton: false,
              //   timer: 3000,
              // });
          }
        }); 
      }else{
        Swal.fire(
          'No Images Found',
          'Atleast one image should be uploaded',
          'error'
        );
        return;
      }
    }else{
      if(this.isNewImageUploaded){
        this.imageService.addImage(this.formData).subscribe((responseData) => {
          console.log('responseData.message=', responseData);
          if (responseData.fileId === 'invalid_grant') {
            Swal.fire(
              'Image Upload Error',
              'Please update the REFRESH_TOKEN of google drive',
              'error'
            );
            return;
          } else {
            this.imageRemovedFromDb_id=this.imageUploadedOutput_Id;
            this.imageUploadedOutput_Id=responseData.fileId;
            
            this.Toast.fire({
              icon: 'success',
              title: 'Image Added Successfully',
            });
            //this.router.navigate(['/image']);
              order.image = this.imageUploadedOutput_Id;
              console.log('(update)order=', order);
              this.orderService.updateOrder(order);
              if(this.imageRemovedFromDb_id!==""){
                this.imageService.deleteImage(this.imageRemovedFromDb_id).subscribe((responseData)=>{
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
              Swal.fire({
                icon: 'question',
                title: resultMsg,
                text: 'We are on +Order page, Would you like to add more Orders.',
                showConfirmButton: false,
                timer: 3000,
              });
          }
        }); 
      }else{
        this.orderService.updateOrder(order);
        
      }
    }
    Swal.fire({
      icon: 'question',
      title: resultMsg,
      text: 'We are on +Order page, Would you like to add more Orders.',
      showConfirmButton: false,
      timer: 3000,
    });
    this.orderForm.reset()
    this.imagePreview=""
  }
  
}
