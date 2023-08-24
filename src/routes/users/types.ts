
export type TUserCreate = {
  id_user: number;
  name: string;
  email: string;
  password: string;
  verify?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  access_token?: string;
  refresh_token?: string;
}