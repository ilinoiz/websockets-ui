import clientsRepository from "../repositories/ClientsRepository";
import { AddUserToRoomRequestData } from "../commands/requests/AddUserToRoomRequestData";
import { WebSocketClient } from "../wsserver";
import roomsRepository from "../repositories/RoomsRepository";
import { CommandType } from "../commands/CommandDTO";
import commandSender from "../CommandSender";

export const addUserToRoomHandler = (
  data: AddUserToRoomRequestData,
  currentSocketClient: WebSocketClient
) => {
  const client = clientsRepository.getClient(currentSocketClient.sessionId);
  roomsRepository.addUserToRoom(client, data.indexRoom);
  const roomClients = roomsRepository.getRoomClients(data.indexRoom);
  commandSender.sendCreateGame(roomClients, data.indexRoom);
};
