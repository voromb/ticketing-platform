import { IEvent } from "./Event.model";

export interface ISubcategory {
  id: number;
  category_id: number;
  name: string;
}

export interface ICategory {
  id: number;
  name: string;
  EventSubcategory: ISubcategory[];
}