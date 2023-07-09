import clientsRepository from "../repositories/ClientsRepository";
import { LoginRequestData } from "../commands/requests/LoginRequestDTO";
import { WebSocketClient } from "../wsserver";
import commandSender from "../CommandSender";
import authenticationService from "../AuthenticationService";
import { LoginResponseData } from "../commands/responses/LoginResponseDTO";

export const loginHandler = (
  data: LoginRequestData,
  currentSocketClient: WebSocketClient
) => {
  const authResult = authenticationService.auth(data.name, data.password);
  let loginData: LoginResponseData = {
    name: data.name,
    index: 0,
    error: false,
    errorText: "",
  };
  if (!authResult.isAuthenticated) {
    loginData.error = true;
    loginData.errorText = authResult.errorMessage;
  } else {
    const client = clientsRepository.createClient(
      data.name,
      currentSocketClient
    );
    loginData.index = client.index;
  }
  commandSender.sendLogin(loginData, currentSocketClient);
};
