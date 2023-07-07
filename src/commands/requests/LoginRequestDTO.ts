import { DTOBase } from "../DTOBase";

export interface LoginRequestDTO extends DTOBase {
  data: LoginRequestData;
}

export interface LoginRequestData {
  name: string;
  password: string;
}
