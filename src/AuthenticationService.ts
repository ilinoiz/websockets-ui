import { usersDb } from "./usersDb";

export interface AuthResultModel {
  isAuthenticated: boolean;
  errorMessage?: string;
}

class AuthenticationService {
  auth = (userName: string, password: string): AuthResultModel => {
    const userIndex = usersDb.findIndex(
      (user) => user.name.toLowerCase() === userName.toLowerCase()
    );
    if (userIndex >= 0) {
      const isValidPassword = usersDb[userIndex].password === password;
      if (!isValidPassword) {
        return {
          isAuthenticated: false,
          errorMessage: "Invalid login or password",
        };
      }
    } else {
      usersDb.push({ name: userName, password });
    }
    return {
      isAuthenticated: true,
    };
  };
}

const authenticationService = new AuthenticationService();
export default authenticationService;
