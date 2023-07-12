import commandSender from "../CommandSender";
import clientsRepository from "../repositories/ClientsRepository";
import roomsRepository from "../repositories/RoomsRepository";
import { WebSocketClient } from "../wsserver";

export const singlePlayHandler = (currentSocketClient: WebSocketClient) => {
  const bot = clientsRepository.createClient("bot", null, true);
  const client = clientsRepository.getClient(currentSocketClient.sessionId);
  const newRoom = roomsRepository.createSinglePlayerRoom(client);
  roomsRepository.addUserToRoom(bot, newRoom.index);
  commandSender.sendCreateRoom(newRoom, client);
  commandSender.sendCreateGame([client], newRoom.index);
};
