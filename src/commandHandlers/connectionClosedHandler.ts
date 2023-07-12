import commandSender from "../CommandSender";
import clientsRepository from "../repositories/ClientsRepository";
import roomsRepository from "../repositories/RoomsRepository";
import { WebSocketClient } from "../wsserver";

export const connectionClosedHandler = (
  currentSocketClient: WebSocketClient
) => {
  const disconnectedClient = clientsRepository.getClient(
    currentSocketClient.sessionId
  );

  if (!disconnectedClient) {
    return;
  }

  const clientRoom = roomsRepository.getClientsRoom(disconnectedClient.index);

  if (!clientRoom) {
    return;
  }
  const roomClients = roomsRepository.getRoomClients(clientRoom.index);

  const winnerClient = roomClients.find(
    (client) => client.index !== disconnectedClient.index
  );

  commandSender.sendWinner(winnerClient, roomClients);
  roomsRepository.completeGame(clientRoom.index);
};
