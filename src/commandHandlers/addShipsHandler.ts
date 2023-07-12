import commandSender from "../CommandSender";
import { AddShipsRequestData } from "../commands/requests/AddShipsRequestData";
import { randomShipsGenerator } from "../randomShipsGenerator";
import roomsRepository from "../repositories/RoomsRepository";

export const addShipsHandler = (data: AddShipsRequestData) => {
  const room = roomsRepository.getClientsRoom(data.gameId);

  if (!room.isSinglePlayerRoom) {
    roomsRepository.addShips(data);

    const isReadyToStart = roomsRepository.isReadyToStart(data.gameId);

    if (isReadyToStart) {
      const roomClients = roomsRepository.getRoomClients(data.gameId);
      commandSender.sendStartGame(roomClients);
      roomsRepository.setCurrentTurnClientId(data.gameId, data.indexPlayer);
      commandSender.sendTurn(data.indexPlayer, roomClients);
    }
  } else {
    roomsRepository.setCurrentTurnClientId(data.gameId, data.indexPlayer);
    const randomShips = randomShipsGenerator();
    room.roomUsers.forEach((client) => {
      roomsRepository.addShips({
        gameId: data.gameId,
        indexPlayer: client.index,
        ships: client.isBot ? randomShips : data.ships,
      });
    });

    commandSender.sendStartGame(room.roomUsers);
    commandSender.sendTurn(data.indexPlayer, room.roomUsers);
  }
};
