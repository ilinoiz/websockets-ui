import clientsRepository from "../repositories/ClientsRepository";
import { WebSocketClient } from "../wsserver";
import roomsRepository from "../repositories/RoomsRepository";
import commandSender from "../CommandSender";

export const createRoomHandler = (currentSocketClient: WebSocketClient) => {
  const client = clientsRepository.getClient(currentSocketClient.sessionId);
  const newRoom = roomsRepository.createRoom(client);
  commandSender.sendCreateRoom(newRoom, client);
};
