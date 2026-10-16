import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ExpenseFilters } from "../types";

const initialState: ExpenseFilters = {
  categoryId: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  search: undefined,
  sortBy: "date",
  order: "desc",
  page: 1,
  limit: 10,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<ExpenseFilters>>) {
      return { ...state, ...action.payload, page: 1 };
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const { setFilters, setPage, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
