export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  preferences?: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPreferences {
  favoriteCategories: string[];
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
}
