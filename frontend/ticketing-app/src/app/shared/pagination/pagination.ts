import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone:true,
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css']
})
export class PaginationComponent {
  @Input() totalPages: number = 1;
  @Input() currentPage: number = 1;
  
  @Output() pageChange = new EventEmitter<number>();

  
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  previous() {
    this.goToPage(this.currentPage - 1);
  }

  next() {
    this.goToPage(this.currentPage + 1);
  }
}
