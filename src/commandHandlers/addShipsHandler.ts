import commandSender from "../CommandSender";
import { AddShipsRequestData } from "../commands/requests/AddShipsRequestData";
import roomsRepository from "../repositories/RoomsRepository";

export const addShipsHandler = (data: AddShipsRequestData) => {
  roomsRepository.addShips(data);

  const isReadyToStart = roomsRepository.isReadyToStart(data.gameId);

  if (isReadyToStart) {
    const roomClients = roomsRepository.getRoomClients(data.gameId);
    commandSender.sendStartGame(roomClients);
    commandSender.sendTurn(data.indexPlayer, roomClients);
  }
};
