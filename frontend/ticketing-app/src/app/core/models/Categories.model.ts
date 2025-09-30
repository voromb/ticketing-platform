import { IEvent } from "./Event.model";

export interface Category {
    slug: string;
    id_cat: string;
    category_name: string;
    image: string;
    events: IEvent[];
}