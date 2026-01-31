export type ApiError = {
  code: string;
  message: string;
};

export type ApiSuccess<T> = {
  data: T;
  error: null;
};

export type ApiFailure = {
  data: null;
  error: ApiError;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
