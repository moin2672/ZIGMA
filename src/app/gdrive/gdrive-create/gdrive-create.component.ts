import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl,Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Gdrive } from '../gdrive.model';
import { GdriveService } from '../gdrive.service';
import {Subscription} from 'rxjs';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-gdrive-create',
  templateUrl: './gdrive-create.component.html',
  styleUrls: ['./gdrive-create.component.css'],
})
export class GdriveCreateComponent implements OnInit, OnDestroy {
  gdriveForm: FormGroup;
  gdriveData: Gdrive;
  editMode = false;
  isLoading=false;
  private gdriveId=null;
  private creator=null;

  private authGdriveSub: Subscription;

  constructor(
    private gdriveService: GdriveService,
    public activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.editMode = false;
    this.gdriveId = null;
    this.creator=null;
    this.gdriveForm = new FormGroup({
      client_id: new FormControl('',{validators:[Validators.required,]}),
      client_secret: new FormControl('',{validators:[Validators.required,]}),
      redirect_url: new FormControl('',{validators:[Validators.required,]}),
      refresh_token: new FormControl('',{validators:[Validators.required,]}),
    });

    this.authGdriveSub=this.authService
                          .getAuthStatusListener()
                          .subscribe(authGdrive=>{
                            this.isLoading=false;
                          });

    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('gdriveId')) {
        this.editMode = true;
        this.gdriveId = paramMap.get('gdriveId');
        this.isLoading=true;
        this.gdriveService.getGdrive(this.gdriveId)
                        .subscribe(gdriveDataObtained=>{
                          this.isLoading=false;
                          this.gdriveData=gdriveDataObtained.gdrive
                          this.creator=this.gdriveData.creator
                          this.gdriveForm.setValue({
                            client_id:this.gdriveData.client_id,   
                            client_secret:this.gdriveData.client_secret,   
                            redirect_url:this.gdriveData.redirect_url,   
                            refresh_token:this.gdriveData.refresh_token,                             
                          })
                        })
      }
    });
  }

  onSubmit() {
    console.log("gdrive create=",this.gdriveForm.value);
    if (this.gdriveForm.invalid) {
      return;
    }
    
    const gdriveData: Gdrive = {
      _id: this.gdriveId,
      client_id: this.gdriveForm.value.client_id,
      client_secret: this.gdriveForm.value.client_secret,
      redirect_url: this.gdriveForm.value.redirect_url,
      refresh_token: this.gdriveForm.value.refresh_token,
      creator:this.creator
    };
    this.isLoading=true;
    if (!this.editMode) {
      this.gdriveService.addGdrive(gdriveData);
    }else{
      this.gdriveService.updateGdrive(gdriveData);
    }
    this.gdriveForm.reset();
  }

  ngOnDestroy(){
    this.authGdriveSub.unsubscribe();
  }
}
