import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl,Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Organization } from '../organization.model';
import { OrganizationService } from '../organization.service';
import {Subscription} from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { DateService } from '../../shared/date.service';


@Component({
  selector: 'app-organization-create',
  templateUrl: './organization-create.component.html',
  styleUrls: ['./organization-create.component.css'],
})
export class OrganizationCreateComponent implements OnInit, OnDestroy {
  organizationForm: FormGroup;
  organizationData: Organization;
  editMode = false;
  isLoading=false;
  private organizationId=null;
  private creator=null;

  private authStatusSub: Subscription;

  constructor(
    private organizationService: OrganizationService,
    public activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private dateService: DateService
  ) {}

  ngOnInit() {
    this.editMode = false;
    this.organizationId = null;
    this.creator=null;
    this.organizationForm = new FormGroup({
        organizationName: new FormControl('',{validators:[Validators.required,]}),
        organizationPhoneNo: new FormControl('',{validators:[Validators.required,]}),
        organizationWhatsAppNo: new FormControl('',{validators:[Validators.required,]}),
        organizationAddress: new FormControl('',{validators:[Validators.required,]}),
        organizationEmail: new FormControl('',{validators:[Validators.required,]}),
        organizationDescription: new FormControl('',{validators:[Validators.required,]}),
        organizationGoogleMap: new FormControl('',{validators:[Validators.required,]}),
    });

    this.authStatusSub=this.authService
                          .getAuthStatusListener()
                          .subscribe(authStatus=>{
                            this.isLoading=false;
                          });

    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('organizationId')) {
        this.editMode = true;
        this.organizationId = paramMap.get('organizationId');
        this.isLoading=true;
        this.organizationService.getOrganization(this.organizationId)
                        .subscribe(organizationDataObtained=>{
                          this.isLoading=false;
                          this.organizationData=organizationDataObtained.organization
                          this.creator=this.organizationData.creator
                          this.organizationForm.setValue({
                            organizationName: this.organizationData.organizationName,
                            organizationPhoneNo: this.organizationData.organizationPhoneNo,
                            organizationWhatsAppNo:this.organizationData.organizationWhatsAppNo,
                            organizationAddress: this.organizationData.organizationAddress,
                            organizationEmail: this.organizationData.organizationEmail,
                            organizationDescription:this.organizationData.organizationDescription,
                            organizationGoogleMap:this.organizationData.organizationGoogleMap,                          
                          })
                        })
      }
    });
  }

  onSubmit() {
    console.log("organization create=",this.organizationForm.value);
    if (this.organizationForm.invalid) {
      return;
    }
    
    const organizationData: Organization = {
      _id: this.organizationId,
      organizationName: this.organizationForm.value.organizationName,
      organizationPhoneNo: this.organizationForm.value.organizationPhoneNo,
      organizationWhatsAppNo: this.organizationForm.value.organizationWhatsAppNo,
      organizationAddress: this.organizationForm.value.organizationAddress,
      organizationEmail: this.organizationForm.value.organizationEmail,
      organizationDescription: this.organizationForm.value.organizationDescription,
      organizationGoogleMap: this.organizationForm.value.organizationGoogleMap,
      lastUpdatedDate: this.dateService.getTodaysDate(),
      creator:this.creator
    };
    this.isLoading=true;
    if (!this.editMode) {
      this.organizationService.addOrganization(organizationData);
    }else{
      this.organizationService.updateOrganization(organizationData);
    }
    this.organizationForm.reset();
  }

  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }
}
