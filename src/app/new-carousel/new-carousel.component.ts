import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-carousel',
  templateUrl: './new-carousel.component.html',
  styleUrls: ['./new-carousel.component.css']
})
export class NewCarouselComponent implements OnInit {
  @Input() id: string;
  @Input() imageArray: any[];
  constructor() { }
  id1="demo"
  ref_id="#"+this.id1

  ngOnInit() {
    console.log(this.id)
    console.log(this.imageArray)
    console.log(this.ref_id)
  }

}