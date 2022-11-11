import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Organization } from '../../organization/organization.model';
import { OrganizationService } from '../../organization/organization.service';
import { Image } from '../../shared/image.model';
import { Gallery } from '../gallery.model';
import { GalleryService } from '../gallery.service';

@Component({
  selector: 'app-gallery-detail',
  templateUrl: './gallery-detail.component.html',
  styleUrls: ['./gallery-detail.component.css']
})
export class GalleryDetailComponent implements OnInit, OnDestroy {
  myId="demo"
  galleryModel: Gallery={_id: "",
    modelNo:  "",
    modelName:  "",
    modelDescription:  "",
    isAvailable:false,
    links: [],
    creator: "",
    lastUpdatedDate:  "",};
  imageArray=[]
  modelId=""
  currentUrl=""
  isLoading=false;
  organizationSub:Subscription;
  WhatsAppNo=""

  constructor(private galleryService: GalleryService, public activatedRoute: ActivatedRoute, private organizationService: OrganizationService) { }

  ngOnInit() {
    this.organizationService.getOrganizations(100, 1);
    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('modelId')) {
        this.modelId = paramMap.get('modelId');
        this.organizationSub = this.organizationService
        .getOrganizationUpdateListener()
        .subscribe((organizationData: { organizations: Organization[]; organizationCount: number }) => {
          this.isLoading = false;
          this.WhatsAppNo = organizationData.organizations[0].organizationWhatsAppNo;
          // this.currentUrl=`https://wa.me/91${this.WhatsAppNo}?text=https://angular-ivy-n1rsw6.stackblitz.io/model/${this.modelId}%0AI'm%20interested%20in%20your%20product.`
          this.currentUrl=`https://wa.me/91${this.WhatsAppNo}?text=${window.location.href}%0AI'm%20interested%20in%20your%20product.`
          // window.location.href
          console.log('from db:', organizationData);
        });
        // this.currentUrl="https://wa.me/918680858856?text=https://angular-ivy-n1rsw6.stackblitz.io/model/"+this.modelId+"%0AI'm%20interested%20in%20your%20product."
        this.isLoading = true;
        this.galleryService
        .getGallery(this.modelId)
        .subscribe((galleryDataObtained) => {
          console.log("galleryDataObtained=",galleryDataObtained)
          this.isLoading = false;
          this.galleryModel = galleryDataObtained.model;
          this.imageArray=this.galleryModel.links.map(
            (id) => 'https://drive.google.com/uc?export=view&id=' + id.toString()
          );
        });     
      }

  })
  }

  ngOnDestroy(){
    this.organizationSub.unsubscribe()
  }
}