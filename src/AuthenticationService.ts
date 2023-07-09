import { usersDb } from "./usersDb";

export interface AuthResultModel {
  isAuthenticated: boolean;
  errorMessage?: string;
}

class AuthenticationService {
  auth = (userName: string, password: string): AuthResultModel => {
    const user = usersDb.find(
      (user) =>
        user.name.toLowerCase() === userName.toLowerCase() &&
        user.password === password
    );
    if (!user) {
      return {
        isAuthenticated: false,
        errorMessage: "Invalid login or password",
      };
    } else {
      return {
        isAuthenticated: true,
      };
    }
  };
}

const authenticationService = new AuthenticationService();
export default authenticationService;
