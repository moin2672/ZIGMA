import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl,Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Status } from '../status.model';
import { StatusService } from '../status.service';
import {Subscription} from 'rxjs';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-status-create',
  templateUrl: './status-create.component.html',
  styleUrls: ['./status-create.component.css'],
})
export class StatusCreateComponent implements OnInit, OnDestroy {
  statusForm: FormGroup;
  statusData: Status;
  editMode = false;
  isLoading=false;
  private statusId=null;
  private creator=null;

  private authStatusSub: Subscription;

  constructor(
    private statusService: StatusService,
    public activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {

    this.authStatusSub=this.authService
                          .getAuthStatusListener()
                          .subscribe(authStatus=>{
                            this.isLoading=false;
                          });

    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('statusId')) {
        this.editMode = true;
        this.statusId = paramMap.get('statusId');
        this.isLoading=true;
        this.statusService.getStatus(this.statusId)
                        .subscribe(statusDataObtained=>{
                          this.isLoading=false;
                          this.statusData=statusDataObtained.status
                          this.creator=this.statusData.creator
                          // console.log(statusDataObtained)
                          // console.log("on edit")
                          // console.log("this.statusData=",this.statusData)
                          this.statusForm = new FormGroup({
                            status: new FormControl(this.statusData.status,{validators:[Validators.required,]}),
                          });
                          // this.statusForm.setValue({
                          //   status:this.statusData.status,                             
                          // })
                        })
      } else {
        this.editMode = false;
        this.statusId = null;
        this.creator=null;
        this.statusForm = new FormGroup({
          status: new FormControl('',{validators:[Validators.required,]}),
        });
      }
    });
  }

  onSubmit() {
    console.log("status create=",this.statusForm.value);
    if (this.statusForm.invalid) {
      return;
    }
    
    const statusData: Status = {_id: this.statusId,status: this.statusForm.value.status,creator:this.creator};
    this.isLoading=true;
    if (!this.editMode) {
      this.statusService.addStatus(statusData);
    }else{
      this.statusService.updateStatus(statusData);
    }
    this.statusForm.reset();
    // this.isLoading=false;
  }

  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }
}
