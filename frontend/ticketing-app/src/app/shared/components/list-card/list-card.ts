import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardCategories } from '../card-categories/card-categories';
import { Category } from '../../../core/models/Categories.model';
import { MOCK_CATEGORIES } from '../../../core/mocks/Categories';

@Component({
  selector: 'app-list-card',
  standalone: true, 
  imports: [CommonModule, CardCategories], 
  templateUrl: './list-card.html',
  styleUrls: ['./list-card.css']
})
export class ListCard implements OnInit {
  categories: Category[] = [];

  ngOnInit(): void {
    // Por ahora cargamos las categorías mock
    this.categories = MOCK_CATEGORIES;
  }
}

