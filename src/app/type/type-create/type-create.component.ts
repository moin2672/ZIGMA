import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl,Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Type } from '../type.model';
import { TypeService } from '../type.service';
import {Subscription} from 'rxjs';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-type-create',
  templateUrl: './type-create.component.html',
  styleUrls: ['./type-create.component.css'],
})
export class TypeCreateComponent implements OnInit, OnDestroy {
  typeForm: FormGroup;
  typeData: Type;
  editMode = false;
  isLoading=false;
  private typeId=null;
  private creator=null;

  private authStatusSub: Subscription;

  constructor(
    private typeService: TypeService,
    public activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.editMode = false;
    this.typeId = null;
    this.creator=null;
    this.typeForm = new FormGroup({
        type: new FormControl("", {validators:[Validators.required,]})
    });

    this.authStatusSub=this.authService
                          .getAuthStatusListener()
                          .subscribe(authStatus=>{
                            this.isLoading=false;
                          });

    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('typeId')) {
        this.editMode = true;
        this.typeId = paramMap.get('typeId');
        this.isLoading=true;
        this.typeService.getType(this.typeId)
                        .subscribe(typeDataObtained=>{
                          this.isLoading=false;
                          this.typeData=typeDataObtained.type
                          this.creator=this.typeData.creator
                          this.typeForm.setValue({
                            type:this.typeData.type                            
                          })
                        })
      }
    });
  }

  onSubmit() {
    console.log("type create=",this.typeForm.value);
    if (this.typeForm.invalid) {
      return;
    }
    
    const typeData: Type = {
      _id: this.typeId,
      type: this.typeForm.value.type,
      creator:this.creator
    };
    this.isLoading=true;
    if (!this.editMode) {
      this.typeService.addType(typeData);
    }else{
      this.typeService.updateType(typeData);
    }
    this.typeForm.reset();
    // this.isLoading=false;
  }

  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }
}
