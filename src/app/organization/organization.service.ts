import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Organization } from './organization.model';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/organizations";
@Injectable()
export class OrganizationService {
  private whatsAppNo=""
  private organizations: Organization[] = [];
  private organizationsUpdated = new Subject<{organizations:Organization[], organizationCount:number}>();

  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  constructor(private httpClient: HttpClient,private router:Router) {}

  getOrganizations(postsPerPage:number, currentPage: number) {
    const queryParams=`?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    this.httpClient
      .get<{ message: string; organizations: Organization[], maxOrganizations:number }>(
        BACKEND_URL+queryParams
      )
      .subscribe((organizationData) => {
        console.log("organizationData=",organizationData)
        this.organizations = organizationData.organizations;
        this.whatsAppNo=organizationData.organizations[0].organizationWhatsAppNo
        this.organizationsUpdated.next({organizations:[...this.organizations], organizationCount:organizationData.maxOrganizations});
      });
  }

  getWhatsAppNo(){
    return this.whatsAppNo;
  }

  getOrganizationUpdateListener() {
    return this.organizationsUpdated.asObservable();
  }

  getOrganization(organizationId:string){
    // return {...this.organizations.find(p=>p._id===organizationId)};
    return this.httpClient.get<{organization:Organization}>(BACKEND_URL+"/"+organizationId);
  }

  addOrganization(organization: Organization) {
    this.httpClient
      .post<{ message: string, organizationId:string }>(BACKEND_URL, organization)
      .subscribe((responseData) => {
        console.log("responseData.message=",responseData);
        this.Toast.fire({
          icon: 'success',
          title: 'Organization Added Successfully'
        })
        this.router.navigate(['/shop']);   
      });
  }

  updateOrganization(organization: Organization){
    console.log("in updateOrganization",organization)
    this.httpClient.put(BACKEND_URL+"/"+organization._id, organization)
    .subscribe(response=>{
      // console.log(response)
      this.Toast.fire({
        icon: 'success',
        title: 'Organization Updated Successfully'
      })
      this.router.navigate(['/shop']);
    })
  }

  deleteOrganization(organizationId: string) {
    return this.httpClient
      .delete(BACKEND_URL+'/' + organizationId)
     
  }
}
