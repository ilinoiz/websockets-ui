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
  randomAttack = "randomAttack",
  turn = "turn",
  finish = "finish",
  single_play = "single_play",
}

export class CommandDTO {
  id: number;
  type: CommandType;
  data: string;
}
