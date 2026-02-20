import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Evaluation {
  id: string;
  name: string;
  company: string;
  sector?: string;
  status: string;
  globalMaturity?: number;
  classification?: string;
}

interface EvaluationState {
  current: Evaluation | null;
  list: Evaluation[];
}

const initialState: EvaluationState = {
  current: null,
  list: [],
};

const evaluationSlice = createSlice({
  name: 'evaluation',
  initialState,
  reducers: {
    setCurrent: (state, action: PayloadAction<Evaluation>) => {
      state.current = action.payload;
    },
    setList: (state, action: PayloadAction<Evaluation[]>) => {
      state.list = action.payload;
    },
    updateCurrent: (state, action: PayloadAction<Partial<Evaluation>>) => {
      if (state.current) {
        state.current = { ...state.current, ...action.payload };
      }
    },
  },
});

export const { setCurrent, setList, updateCurrent } = evaluationSlice.actions;
export default evaluationSlice.reducer;
