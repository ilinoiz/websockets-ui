import { GameAttackRequestData } from "../commands/requests/GameAttackRequestData";
import { RandomAttackRequestData } from "../commands/requests/RandomAttackRequestData";
import { generateRandomValue } from "../randomShipsGenerator";
import roomsRepository from "../repositories/RoomsRepository";
import { attackHandler } from "./attackHandler";

export const randomAttackHandler = (data: RandomAttackRequestData) => {
  const history = roomsRepository.getClientTurnsHistory(
    data.indexPlayer,
    data.gameId
  );

  if (!history) {
    return;
  }

  let isUsedCoordinates = true;
  const cellCoordinates = {
    x: 0,
    y: 0,
  };

  do {
    cellCoordinates.x = generateRandomValue();
    cellCoordinates.y = generateRandomValue();
    isUsedCoordinates = history.some(
      (coordinate) =>
        coordinate.x === cellCoordinates.x && coordinate.y === cellCoordinates.y
    );
  } while (isUsedCoordinates);

  const gameAttackRequestData: GameAttackRequestData = {
    gameId: data.gameId,
    indexPlayer: data.indexPlayer,
    ...cellCoordinates,
  };
  attackHandler(gameAttackRequestData);
};
