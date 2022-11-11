import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  FormBuilder,
} from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Gallery } from '../gallery.model';
import { GalleryService } from '../gallery.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ImageService } from '../../shared/image.service';
import Swal from 'sweetalert2';
import { DateService } from '../../shared/date.service';

@Component({
  selector: 'app-gallery-create',
  templateUrl: './gallery-create.component.html',
  styleUrls: ['./gallery-create.component.css'],
})
export class GalleryCreateComponent implements OnInit, OnDestroy {
  modelForm: FormGroup;
  listOfImages_Preview = [];
  list_of_formData = [];
  list_of_imageUploadedOutputData = [];
  list_of_imageId_fromDB = [];
  list_of_imageId_Removed_fromDB = [];
  list_of_imageId_Removed_fromDB_exception = [];
  imagePreview = '';

  galleryData: Gallery;
  editMode = false;
  isLoading = false;
  private modelId = null;
  private creator = null;

  private authStatusSub: Subscription;

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
    private fb: FormBuilder,
    private galleryService: GalleryService,
    public activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private imageService: ImageService,
    private dateService: DateService
  ) {}

  ngOnInit() {
    let list_of_images_link = new FormArray([]);
    this.editMode = false;
    this.modelId = null;
    this.creator = null;

    this.modelForm = new FormGroup({
      modelNo: new FormControl('', { validators: [Validators.required] }),
      modelName: new FormControl(''),
      modelDescription: new FormControl(''),
      isAvailable: new FormControl(false),
      list_of_images: list_of_images_link,
    });

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });

    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('modelId')) {
        this.editMode = true;
        this.modelId = paramMap.get('modelId');
        this.isLoading = true;
        this.galleryService
          .getGallery(this.modelId)
          .subscribe((galleryDataObtained) => {
            this.isLoading = false;
            this.galleryData = galleryDataObtained.model;
            this.creator = this.galleryData.creator;
            if (this.galleryData.links.length > 0) {
              this.list_of_imageId_fromDB = this.galleryData.links;
              //this.list_of_imageUploadedOutputData=this.list_of_imageId_fromDB;
              this.listOfImages_Preview = this.list_of_imageId_fromDB.map(
                (id) => 'https://drive.google.com/thumbnail?id=' + id.toString()
              );
              this.galleryData.links.forEach((id) => {
                this.list_of_formData.push('');
                this.list_of_imageId_Removed_fromDB.push('');
                list_of_images_link.push(
                  this.fb.group({
                    image: '',
                  })
                );
              });
            }
            this.modelForm = new FormGroup({
              modelNo: new FormControl(this.galleryData.modelNo, {
                validators: [Validators.required],
              }),
              modelName: new FormControl(this.galleryData.modelName),
              modelDescription: new FormControl(
                this.galleryData.modelDescription
              ),
              isAvailable: new FormControl(this.galleryData.isAvailable),
              list_of_images: list_of_images_link,
            });
          });
      }
    });
  }

  onSubmit() {
    let resultMsg = 'Model Added Successfully';
    if (this.editMode) {
      resultMsg = 'Model Updated Successfully';
    }
    if (this.modelForm.invalid) {
      return;
    }

    const galleryData: Gallery = {
      _id: this.modelId,
      modelNo: this.modelForm.value.modelNo,
      modelName: this.modelForm.value.modelName,
      modelDescription: this.modelForm.value.modelDescription,
      isAvailable: this.modelForm.value.isAvailable,
      links: this.list_of_imageUploadedOutputData,
      creator: this.creator,
      lastUpdatedDate: this.dateService.getTodaysDate(),
    };
    if (!this.editMode) {
      if (this.modelForm.value.list_of_images.length > 0) {
        if (
          this.list_of_formData.length > 0 &&
          this.list_of_formData.length ===
            this.modelForm.value.list_of_images.length
        ) {
          console.log('files');
          let count = 0;
          this.list_of_formData.forEach((fData) => {
            this.imageService.addImage(fData).subscribe((responseData) => {
              console.log('responseData.message=', responseData);
              if (responseData.fileId === 'invalid_grant') {
                Swal.fire(
                  'Image Upload Error',
                  'Please update the REFRESH_TOKEN of google drive',
                  'error'
                );
                return;
              } else {
                this.list_of_imageUploadedOutputData.push(responseData.fileId);
                this.Toast.fire({
                  icon: 'success',
                  title: 'Image Added Successfully',
                });
                //this.router.navigate(['/image']);
                count++;
                console.log('count=', count);
                console.log(
                  'this.list_of_formData.length=',
                  this.list_of_formData.length
                );
                if (count === this.list_of_formData.length) {
                  console.log(this.list_of_imageUploadedOutputData);
                  galleryData.links = this.list_of_imageUploadedOutputData;
                  console.log('(new)galleryData=', galleryData);
                  this.galleryService.addGallery(galleryData);
                  Swal.fire({
                    icon: 'question',
                    title: resultMsg,
                    text: 'We are on +Model page, Would you like to add more Models.',
                    showConfirmButton: false,
                    timer: 7000,
                  });
                }
              }
            });
          });
        }
      } else {
        Swal.fire(
          'No Images Found',
          'Atleast one image should be uploaded',
          'error'
        );
        return;
      }
    } else {
      if (this.modelForm.value.list_of_images.length > 0) {
        if (
          this.list_of_formData.length === this.list_of_imageId_fromDB.length &&
          this.list_of_imageId_fromDB.length ===
            this.list_of_imageId_Removed_fromDB.length &&
          this.list_of_imageId_Removed_fromDB.length ===
            this.modelForm.value.list_of_images.length
        ) {
          console.log('All correct');
          let count = 0;
          for (let i = 0; i < this.list_of_formData.length; i++) {
            if (this.list_of_formData[i] != '') {
              this.imageService
                .addImage(this.list_of_formData[i])
                .subscribe((responseData) => {
                  console.log('responseData.message=', responseData);
                  if (responseData.fileId === 'invalid_grant') {
                    Swal.fire(
                      'Image Upload Error',
                      'Please update the REFRESH_TOKEN of google drive',
                      'error'
                    );
                    return;
                  } else {
                    this.list_of_imageUploadedOutputData.push(
                      responseData.fileId
                    );
                    this.Toast.fire({
                      icon: 'success',
                      title: 'Image Added Successfully',
                    });
                    count++;
                    if (count === this.list_of_formData.length) {
                      console.log(this.list_of_imageUploadedOutputData);
                      galleryData.links = this.list_of_imageUploadedOutputData;
                      console.log('(update)galleryData=', galleryData);
                      this.galleryService.updateGallery(galleryData);
                    }
                  }
                });
            } else {
              this.list_of_imageUploadedOutputData.push(
                this.list_of_imageId_fromDB[i]
              );
              count++;
              if (count === this.list_of_formData.length) {
                console.log(this.list_of_imageUploadedOutputData);
                galleryData.links = this.list_of_imageUploadedOutputData;
                console.log('(update)galleryData=', galleryData);
                this.galleryService.updateGallery(galleryData);
                Swal.fire({
                  icon: 'question',
                  title: resultMsg,
                  text: 'We are on +Model page, Would you like to add more Models.',
                  showConfirmButton: false,
                  timer: 7000,
                });
              }
            }
          }        
        }
        if(this.list_of_imageId_Removed_fromDB.length>0){
          this.list_of_imageId_Removed_fromDB.forEach(id=>{
            if(id!=""){
              this.imageService.deleteImage(id).subscribe((responseData)=>{
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
          })
        }
        if(this.list_of_imageId_Removed_fromDB_exception.length>0){
          this.list_of_imageId_Removed_fromDB_exception.forEach(id=>{
            if(id!=""){
              this.imageService.deleteImage(id).subscribe((responseData)=>{
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
          })
        }
      } else {
        Swal.fire(
          'No Images Found',
          'Atleast one image should be uploaded',
          'error'
        );
        return;
      }
    }

    this.modelForm.reset();
    if (this.modelForm.value.list_of_images.length > 0) {
      let frmArray = this.modelForm.get('list_of_images') as FormArray;
      frmArray.clear();
    }
  }

  newImage(): FormGroup {
    return this.fb.group({
      image: '',
    });
  }

  listOfImages(): FormArray {
    return this.modelForm.get('list_of_images') as FormArray;
  }

  removeImage(empIndex: number) {
    console.log('remove Item clicked=', empIndex);
    this.listOfImages().removeAt(empIndex);
    this.listOfImages_Preview.splice(empIndex, 1);
    if (this.editMode) {
      this.list_of_imageId_Removed_fromDB_exception.push(
        this.list_of_imageId_fromDB[empIndex]
      );
      this.list_of_imageId_fromDB.splice(empIndex, 1);
      this.list_of_imageId_Removed_fromDB.splice(empIndex, 1);
      // this.list_of_imageUploadedOutputData.splice(empIndex, 1);
      this.list_of_formData.splice(empIndex, 1);
    }else{
      this.list_of_formData.splice(empIndex, 1);
    }
  }

  addImage() {
    console.log('Adding an Image');
    this.listOfImages().push(this.newImage());
    this.listOfImages_Preview.push('');
    if (this.editMode) {
      this.list_of_imageId_fromDB.push('');
      this.list_of_imageId_Removed_fromDB.push('');
      this.list_of_formData.push('');
      // this.list_of_imageUploadedOutputData.push('');
    }
  }

  onImagePicked(event: Event, image_index) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      if (image_index < this.list_of_formData.length) {
        const formData = new FormData();
        formData.append('image', file);
        this.list_of_formData[image_index] = formData;
        if (this.editMode) {
          this.list_of_imageId_Removed_fromDB[image_index] =
            this.list_of_imageId_fromDB[image_index];
          this.list_of_imageId_fromDB[image_index] = '';
        }
      } else {
        const formData = new FormData();
        formData.append('image', file);
        this.list_of_formData.push(formData);
      }
      this.previewFile(file, image_index);
    }
  }

  getImagePreview(image_index) {
    return this.listOfImages_Preview[image_index];
  }

  previewFile(file, image_index) {
    const reader = new FileReader();
    let result = '';
    reader.onload = () => {
      // convierte la imagen a una cadena en base64
      this.listOfImages_Preview[image_index] = reader.result as string;
      // console.log(this.listOfImages_Preview)
    };

    if (file) {
      reader.readAsDataURL(file);
    } else {
      this.listOfImages_Preview[image_index] = '';
    }
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
