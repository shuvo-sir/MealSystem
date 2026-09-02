export type BackendUser = {
  _id: string;
  name: string;
  email: string;
  role: "member" | "manager" | "owner";
  mealGroup?: string | null;
  balance: number;
  totalMeals: number;
};

export type MealGroup = {
  _id: string;
  groupName: string;
  inviteCode: string;
  totalExpense: number;
  totalDeposit: number;
  totalMeals: number;
  mealRate: number;
  owner?: string;
  manager?: string;
  members?: any[];
};

export type MealEntry = {
  _id: string;
  user: string | Pick<BackendUser, "_id" | "name" | "email">;
  date: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  totalMeals: number;
  note?: string;
};

export type GroupNote = {
  _id: string;
  message: string;
  user?: Pick<BackendUser, "name">;
  createdAt: string;
};

export type GroupAction = "create" | "join" | null;
