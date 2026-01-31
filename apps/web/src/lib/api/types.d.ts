export type APIResponse<T> = {
  message: string;
  data: T;
  [key: string]: any;
}