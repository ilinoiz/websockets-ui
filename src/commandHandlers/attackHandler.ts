import commandSender from "../CommandSender";
import { GameAttackRequestData } from "../commands/requests/GameAttackRequestData";
import { ClientStoredModel } from "../dbModels/ClientStoredModel";
import { RoomStoredModel } from "../dbModels/RoomStoredModel";
import { AttackResult, AttackStatus } from "../models/attackResultModel";
import roomsRepository from "../repositories/RoomsRepository";
import winnersRepository from "../repositories/WinnersRepository";
import { randomAttackHandler } from "./randomAttackHandler";
import { CellCoordinates } from "c:/RsSchool/myProjects/NodeJs/websockets-ui/src/dbModels/ShipCoordinatesStoredModel";

export const attackHandler = (data: GameAttackRequestData) => {
  const attackResult = roomsRepository.getAttackResult(data);
  const room = roomsRepository.getClientsRoom(data.gameId);
  if (!room) {
    return;
  }

  const currentTurnClientId = roomsRepository.getCurrentTurnClientId(
    data.gameId
  );
  if (data.indexPlayer !== currentTurnClientId) {
    console.log(
      `wrong client made his turn turnMade client = ${data.indexPlayer} but should client =${currentTurnClientId}`
    );
    return;
  }

  const client = room.roomUsers.find(
    (client) => client.index === data.indexPlayer
  );
  if (
    client.history?.some(
      (historyCell) => historyCell.x === data.x && historyCell.y === data.y
    )
  ) {
    console.log(
      `client=${data.indexPlayer} tried to attack to the cell which was already attacked`
    );
    return;
  }

  commandSender.sendAttack(data, attackResult.status, room.roomUsers);
  roomsRepository.addClientTurnToHistory(data.indexPlayer, data.gameId, {
    x: data.x,
    y: data.y,
  });

  if (attackResult.status === AttackStatus.killed) {
    attackResult.deadShipCells.forEach((deadShip) => {
      sendDeadShipCell(deadShip, data, room);
    });
    attackResult.missedCells.forEach((missedCell) => {
      sendMissedCell(missedCell, data, room);
    });

    const winner = roomsRepository.getWinner(data.gameId);

    if (winner) {
      winnersRepository.addWinner(winner.userName);
      commandSender.sendWinner(winner, room.roomUsers);
      roomsRepository.completeGame(data.gameId);
      return;
    }
  }

  const enemyClient = room.roomUsers.find(
    (client) => client.index !== data.indexPlayer
  );
  const { currentClient, currentClientId } = changeTurn(
    attackResult,
    enemyClient,
    data,
    room
  );

  if (room.isSinglePlayerRoom && currentClient.isBot) {
    setTimeout(() => {
      randomAttackHandler({
        gameId: data.gameId,
        indexPlayer: currentClientId,
      });
    }, 2000);
  }
};
function sendDeadShipCell(
  deadShip: CellCoordinates,
  data: GameAttackRequestData,
  room: RoomStoredModel
) {
  const sendAttackData = {
    x: deadShip.x,
    y: deadShip.y,
    indexPlayer: data.indexPlayer,
    gameId: data.gameId,
  };
  commandSender.sendAttack(sendAttackData, AttackStatus.killed, room.roomUsers);
}

function sendMissedCell(
  missedCell: CellCoordinates,
  data: GameAttackRequestData,
  room: RoomStoredModel
) {
  const sendAttackData = {
    x: missedCell.x,
    y: missedCell.y,
    indexPlayer: data.indexPlayer,
    gameId: data.gameId,
  };
  roomsRepository.addClientTurnToHistory(data.indexPlayer, data.gameId, {
    x: missedCell.x,
    y: missedCell.y,
  });
  commandSender.sendAttack(sendAttackData, AttackStatus.miss, room.roomUsers);
}

function changeTurn(
  attackResult: AttackResult,
  enemyClient: ClientStoredModel,
  data: GameAttackRequestData,
  room: RoomStoredModel
) {
  const currentClientId =
    attackResult.status === AttackStatus.miss
      ? enemyClient.index
      : data.indexPlayer;
  commandSender.sendTurn(currentClientId, room.roomUsers);
  roomsRepository.setCurrentTurnClientId(data.gameId, currentClientId);

  const currentClient = room.roomUsers.find(
    (client) => client.index === currentClientId
  );
  return { currentClient, currentClientId };
}
