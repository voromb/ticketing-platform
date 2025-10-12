export interface ISubcategory {
  id: number;
  categoryId: number;
  name: string;
}

export interface ICategory {
  id: number;
  name: string;
  subcategories: ISubcategory[];
  _count?: {
    events: number;
    subcategories: number;
  };
   image?: string; 
}
