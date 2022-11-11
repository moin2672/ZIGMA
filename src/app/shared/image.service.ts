import { HttpClient, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Image } from './image.model';

@Injectable()
export class ImageService {

  private customersUpdated = new Subject<{images:Image[], imageCount:number}>();

  

  constructor(private httpClient: HttpClient,private router:Router) {}

  addImage(image) {
    return this.httpClient
      .post<{ message: string, fileId:string, links:any }>('https://zigma-gdrive-api.herokuapp.com/api/files', image)
      
  }

 deleteImage(imageId: string) {
    return this.httpClient
      .delete<{ message: string}>('https://zigma-gdrive-api.herokuapp.com/api/files/' + imageId)
     
  }
}
