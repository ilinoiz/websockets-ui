import clientsRepository from "../repositories/ClientsRepository";
import { LoginRequestData } from "../commands/requests/LoginRequestDTO";
import { WebSocketClient } from "../wsserver";
import commandSender from "../CommandSender";

export const loginHandler = (
  data: LoginRequestData,
  currentSocketClient: WebSocketClient
) => {
  clientsRepository.createUser(data.name, currentSocketClient);
  commandSender.sendLogin(data, currentSocketClient);
};
