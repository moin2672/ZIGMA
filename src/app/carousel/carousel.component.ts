import { Component, OnInit,Input   } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {
  @Input() id: string;
  @Input() data: any[];
  constructor() { }
  id1="demo"
  ref_id="#"+this.id1

  ngOnInit() {
    console.log(this.id)
    console.log(this.data)
    console.log(this.ref_id)
  }

}