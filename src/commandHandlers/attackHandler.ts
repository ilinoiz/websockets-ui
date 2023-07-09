import commandSender from "../CommandSender";
import { GameAttackRequestData } from "../commands/requests/GameAttackRequestData";
import { AttackStatus } from "../models/attackResultModel";
import roomsRepository from "../repositories/RoomsRepository";
import winnersRepository from "../repositories/WinnersRepository";

export const attackHandler = (data: GameAttackRequestData) => {
  const attackResult = roomsRepository.getAttackResult(data);
  const roomClients = roomsRepository.getRoomClients(data.gameId);

  commandSender.sendAttack(data, attackResult, roomClients);

  if (attackResult.status === AttackStatus.killed) {
    attackResult.deadShipCells.forEach((deadShip) => {
      const sendAttackData = {
        x: deadShip.x,
        y: deadShip.y,
        indexPlayer: data.indexPlayer,
        gameId: data.gameId,
      };
      commandSender.sendAttack(sendAttackData, attackResult, roomClients);
    });

    const winner = roomsRepository.getWinner(data.gameId);
    if (winner) {
      winnersRepository.addWinner(winner.userName);
      commandSender.sendWinner(winner, roomClients);
    }
  }

  //turn
  const enemyClient = roomClients.find(
    (client) => client.index !== data.indexPlayer
  );
  const currentClientId =
    attackResult.status === AttackStatus.miss
      ? enemyClient.index
      : data.indexPlayer;
  commandSender.sendTurn(currentClientId, roomClients);
};
