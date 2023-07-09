import { GameAttackRequestData } from "../commands/requests/GameAttackRequestData";
import { RandomAttackRequestData } from "../commands/requests/RandomAttackRequestData";
import { attackHandler } from "./attackHandler";

export const randomAttackHandler = (data: RandomAttackRequestData) => {
  const gameAttackRequestData: GameAttackRequestData = {
    gameId: data.gameId,
    indexPlayer: data.indexPlayer,
    x: generateRandomValue(),
    y: generateRandomValue(),
  };
  attackHandler(gameAttackRequestData);
};

const generateRandomValue = (from = 0, to = 9) => {
  return Math.floor(Math.random() * (to - from + 1) + from);
};
