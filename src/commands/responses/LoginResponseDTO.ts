import { DTOBase } from "../DTOBase";

export interface LoginResponseDTO extends DTOBase {
  data: LoginResponseData | string;
}

export interface LoginResponseData {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}
