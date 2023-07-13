import commandSender from "../CommandSender";
import clientsRepository from "../repositories/ClientsRepository";
import roomsRepository from "../repositories/RoomsRepository";
import winnersRepository from "../repositories/WinnersRepository";
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
    clientsRepository.deleteClient(currentSocketClient.sessionId);
    return;
  }

  const winnerClient = clientRoom.roomUsers.find(
    (client) => client.index !== disconnectedClient.index
  );
  if (winnerClient) {
    winnersRepository.addWinner(winnerClient.userName);
    commandSender.sendWinner(winnerClient, clientRoom.roomUsers);
  }
  roomsRepository.completeGame(clientRoom.index);
  clientsRepository.deleteClient(currentSocketClient.sessionId);
};
