import * as WebSocket from "ws";
import winnersRepository from "./repositories/WinnersRepository";
import roomsRepository from "./repositories/RoomsRepository";
import { ClientStoredModel } from "./dbModels/ClientStoredModel";
import { AttackStatus } from "./models/attackResultModel";
import { GameAttackRequestData } from "./commands/requests/GameAttackRequestData";
import { RoomStoredModel } from "./dbModels/RoomStoredModel";
import { WebSocketClient } from "./wsserver";
import { CommandDTO, CommandType } from "./commands/CommandDTO";
import { AddUserToRoomRequestData } from "./commands/requests/AddUserToRoomRequestData";
import { LoginResponseData } from "./commands/responses/LoginResponseDTO";

class CommandSender {
  sendStartGame = (roomClients: ClientStoredModel[]) => {
    roomClients.forEach((roomClient) => {
      const startGameData = {
        ships: roomClient.sourceShips,
        currentPlayerIndex: roomClient.index,
      };
      this.sendCommand(roomClient.client, startGameData, CommandType.startGame);
    });
  };

  sendLogin = (
    data: LoginResponseData,
    currentSocketClient: WebSocketClient
  ) => {
    this.sendCommand(currentSocketClient, data, CommandType.login);
  };

  sendCreateRoom = (
    newRoom: RoomStoredModel,
    { index, client }: ClientStoredModel
  ) => {
    const createGameData = {
      idGame: newRoom.index,
      idPlayer: index,
    };
    this.sendCommand(client, createGameData, CommandType.createGame);
  };

  sendCreateGame = (
    roomClients: ClientStoredModel[],
    indexRoom:number
  ) => {
    roomClients.forEach((roomClient) => {
      const createGameData = {
        idGame: indexRoom,
        idPlayer: roomClient.index,
      };
      this.sendCommand(
        roomClient.client,
        createGameData,
        CommandType.createGame
      );
    });
  };

  sendUpdateRoom = (wssClients: Set<WebSocket>) => {
    const availableRooms = roomsRepository.getAvailableRooms();

    const roomsData = availableRooms.map((room) => {
      return {
        roomId: room.index,
        roomUsers: room.roomUsers.map(({ userName, index }) => {
          return {
            name: userName,
            index,
          };
        }),
      };
    });
    wssClients.forEach((client) => {
      this.sendCommand(client, roomsData, CommandType.updateRoom);
    });
  };

  sendTurn = (currentClientId: number, roomClients: ClientStoredModel[]) => {
    roomClients.forEach((roomClient) => {
      const turnResponseData = {
        currentPlayer: currentClientId,
      };
      this.sendCommand(roomClient.client, turnResponseData, CommandType.turn);
    });
  };

  sendAttack = (
    data: GameAttackRequestData,
    attackResultStatus: AttackStatus,
    roomClients: ClientStoredModel[]
  ) => {
    roomClients.forEach(({ client }) => {
      const attackResponseData = {
        position: { x: data.x, y: data.y },
        currentPlayer: data.indexPlayer,
        status: attackResultStatus,
      };
      this.sendCommand(client, attackResponseData, CommandType.attack);
    });
  };

  sendWinner = (
    winner: ClientStoredModel,
    roomClients: ClientStoredModel[]
  ) => {
    roomClients.forEach((roomClient) => {
      const finishResponseData = {
        winPlayer: winner.index,
      };
      this.sendCommand(
        roomClient.client,
        finishResponseData,
        CommandType.finish
      );
    });
  };

  sendUpdateWinners = (wssClients: Set<WebSocket>) => {
    const updateWinnersData = winnersRepository.getWinners();
    wssClients.forEach((client) => {
      this.sendCommand(client, updateWinnersData, CommandType.updateWinners);
    });
  };

  private sendCommand = <T>(
    webSocketClient: WebSocketClient | WebSocket,
    data: T,
    commandType: CommandType
  ) => {
    const command: CommandDTO = {
      type: commandType,
      data: JSON.stringify(data),
      id: 0,
    };

    webSocketClient.send(JSON.stringify(command));
  };
}

const commandSender = new CommandSender();
export default commandSender;
