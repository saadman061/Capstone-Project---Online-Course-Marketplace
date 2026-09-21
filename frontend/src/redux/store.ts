import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Auth Slice
interface AuthState {
  isAuthenticated: boolean;
  user: {
    userId: string;
    email: string;
    name: string;
    role: string;
  } | null;
  token: string | null;
  loading: boolean;
}

const initialAuthState: AuthState = {
  isAuthenticated: !!localStorage.getItem('authToken'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('authToken'),
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

// Cart Slice
interface CartItem {
  courseId: string;
  title: string;
  price: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

const initialCartState: CartState = {
  items: localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')!) : [],
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const exists = state.items.find(item => item.courseId === action.payload.courseId);
      if (!exists) {
        state.items.push(action.payload);
        state.total += action.payload.price;
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.courseId === action.payload);
      if (item) {
        state.total -= item.price;
        state.items = state.items.filter(item => item.courseId !== action.payload);
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      localStorage.removeItem('cart');
    },
  },
});

// Courses Slice
interface CoursesState {
  items: any[];
  selectedCourse: any | null;
  loading: boolean;
  error: string | null;
}

const initialCoursesState: CoursesState = {
  items: [],
  selectedCourse: null,
  loading: false,
  error: null,
};

const coursesSlice = createSlice({
  name: 'courses',
  initialState: initialCoursesState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCourses: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
      state.error = null;
    },
    setSelectedCourse: (state, action: PayloadAction<any>) => {
      state.selectedCourse = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartSlice.reducer,
    courses: coursesSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const authActions = authSlice.actions;
export const cartActions = cartSlice.actions;
export const coursesActions = coursesSlice.actions;

export default store;
