import { type ProductListResponse } from "@/api/owner";

export interface FormState {
  name: string;
  price: number;
  descp: string;
  active: boolean;
  soldOut: boolean;
  recommended: boolean;
}

export const EMPTY_FORM: FormState = {
  name: "",
  price: 0,
  descp: "",
  active: true,
  soldOut: false,
  recommended: false,
};

export function toFormState(p: ProductListResponse): FormState {
  return {
    name: p.name,
    price: p.price,
    descp: p.descp ?? "",
    active: p.active,
    soldOut: p.soldOut,
    recommended: p.recommended,
  };
}
