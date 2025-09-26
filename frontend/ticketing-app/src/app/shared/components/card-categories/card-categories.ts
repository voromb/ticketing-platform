import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { Category } from '../../../core/models/Categories.model';

@Component({
  selector: 'app-card-categories',
  imports: [],
  templateUrl: './card-categories.html',
  styleUrl: './card-categories.css'
})
export class CardCategories {

   @Input() category: Category = {} as Category;

  constructor() { }

  ngOnInit(): void {
}

}
