import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css']
})
export class PaginationComponent {
  @Input() totalPages: number = 1;
  @Input() currentPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  /** Número máximo de páginas visibles en la barra */
  visibleCount = 5;


  get pages(): number[] {
    const half = Math.floor(this.visibleCount / 2);
    let start = this.currentPage - half;
    let end = this.currentPage + half;


    if (start < 1) {
      start = 1;
      end = Math.min(this.visibleCount, this.totalPages);
    }


    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - this.visibleCount + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  first() {
    this.goToPage(1);
  }

  previous() {
    this.goToPage(this.currentPage - 1);
  }

  next() {
    this.goToPage(this.currentPage + 1);
  }

  last() {
    this.goToPage(this.totalPages);
  }
}
