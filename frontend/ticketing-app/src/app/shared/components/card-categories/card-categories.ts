import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICategory } from '../../../core/models/Categories.model';


@Component({
  selector: 'app-card-categories',
  imports: [CommonModule]  ,
  templateUrl: './card-categories.html',
  styleUrls: ['./card-categories.css']
})
export class CardCategories implements OnInit {

  @Input() category: ICategory = {} as ICategory;

  constructor() { }

  ngOnInit(): void { }

}
