import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Customer } from '../customer.model';
import { CustomerService } from '../customer.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-customer-create',
  templateUrl: './customer-create.component.html',
  styleUrls: ['./customer-create.component.css'],
})
export class CustomerCreateComponent implements OnInit, OnDestroy {
  customerForm: FormGroup;
  customerData: Customer;
  editMode = false;
  isLoading = false;
  private customerId = null;
  private creator = null;

  private authStatusSub: Subscription;

  constructor(
    private customerService: CustomerService,
    public activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.editMode = false;
    this.customerId = null;
    this.creator = null;
    this.customerForm = new FormGroup({
      customerName: new FormControl('', { validators: [Validators.required] }),
      customerPhoneNo: new FormControl('', {
        validators: [Validators.required],
      }),
    });

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });

    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('customerId')) {
        this.editMode = true;
        this.customerId = paramMap.get('customerId');
        this.isLoading = true;
        this.customerService
          .getCustomer(this.customerId)
          .subscribe((customerDataObtained) => {
            this.isLoading = false;
            this.customerData = customerDataObtained.customer;
            this.creator = this.customerData.creator;
            this.customerForm.setValue({
              customerName: this.customerData.customerName,
              customerPhoneNo: this.customerData.customerPhoneNo,
            });
          });
      }
    });
  }

  onSubmit() {
    console.log('customer create=', this.customerForm.value);
    if (this.customerForm.invalid) {
      return;
    }

    const customerData: Customer = {
      _id: this.customerId,
      customerName: this.customerForm.value.customerName,
      customerPhoneNo: this.customerForm.value.customerPhoneNo,
      creator: this.creator,
    };
    this.isLoading = true;
    console.log("this.editMode=",this.editMode)
    if (!this.editMode) {
      console.log('customerData=', customerData);
      this.customerService.addCustomer(customerData);
    } else {
      this.customerService.updateCustomer(customerData);
    }
    this.customerForm.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
