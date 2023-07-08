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

