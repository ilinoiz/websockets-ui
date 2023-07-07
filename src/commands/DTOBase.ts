import { CreateRoomRequestData } from "./requests/CreateRoomRequestDTO";
import { LoginRequestData } from "./requests/LoginRequestDTO";

export enum CommandType {
  login = "reg",
  updateWinners = "update_winners",
  createRoom = "create_room",
  addUserToRoom = "add_user_to_room",
  createGame = "create_game",
  updateRoom = "update_room",
  addShips = "add_ships",
  startGame = "start_game",
  attack = "attack",
  random_attack = "random_attack",
  turn = "turn",
  finish = "finish",
}

export class Command {
  id: number;
  type: CommandType;
  data: string;
}

export interface DTOBase {
  id: number;
  type: CommandType;
}

export function parseCommand(message: string) {
  const command: Command = JSON.parse(message);
  if (!command.data) {
    return null;
  }

  let data: LoginRequestData | CreateRoomRequestData;
  switch (command.type) {
    case CommandType.login:
      data = parseCommandData<LoginRequestData>(command.data);
      break;
    case CommandType.createRoom:
      data = parseCommandData<CreateRoomRequestData>(command.data);
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
