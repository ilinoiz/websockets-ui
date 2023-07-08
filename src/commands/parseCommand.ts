import { Command, CommandType } from "./DTOBase";
import { AddShipsRequestData } from "./requests/AddShipsRequestData";
import { AddUserToRoomRequestData } from "./requests/AddUserToRoomRequestData";
import { CreateRoomRequestData } from "./requests/CreateRoomRequestDTO";
import { GameAttackRequestData } from "./requests/GameAttackRequestData";
import { LoginRequestData } from "./requests/LoginRequestDTO";


export function parseCommand(message: string) {
  const command: Command = JSON.parse(message);
  if (!command.data) {
    return command;
  }

  let data: LoginRequestData | CreateRoomRequestData;
  switch (command.type) {
    case CommandType.login:
      data = parseCommandData<LoginRequestData>(command.data);
      break;
    case CommandType.createRoom:
      data = command.data;
      break;
    case CommandType.addUserToRoom:
      data = parseCommandData<AddUserToRoomRequestData>(command.data);
      break;
    case CommandType.addShips:
      data = parseCommandData<AddShipsRequestData>(command.data);
      break;
    case CommandType.attack:
      data = parseCommandData<GameAttackRequestData>(command.data);
      break;
    default:
      break;
  }

  return {
    ...command,
    data,
  };
}

export function parseCommandData<T>(data: string): T {
  return JSON.parse(data) as T;
}
