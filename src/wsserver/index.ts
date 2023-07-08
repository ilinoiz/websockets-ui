import { WebSocketServer } from "ws";
import { LoginRequestData } from "../commands/requests/LoginRequestDTO";
import { CommandType } from "../commands/DTOBase";
import { LoginResponseDTO } from "../commands/responses/LoginResponseDTO";
import { CreateRoomRequestDTO } from "../commands/requests/CreateRoomRequestDTO";
import clientsRepository from "../ClientsRepository";
import * as WebSocket from "ws";
import { IncomingMessage } from "http";
import roomsRepository, { AttackStatus, ClientModel } from "../RoomsRepository";
import { AddUserToRoomRequestData } from "../commands/requests/AddUserToRoomRequestData";
import { AddShipsRequestData } from "../commands/requests/AddShipsRequestData";
import { parseCommand } from "../commands/parseCommand";
import { GameAttackRequestData } from "../commands/requests/GameAttackRequestData";
import winnersRepository from "../WinnersRepository";

export type WebSocketClient = WebSocket & { id: string };

const wss = new WebSocketServer({ port: 3000, clientTracking: true });

wss.on("connection", (ws: WebSocketClient, request: IncomingMessage) => {
  console.log(request.headers["sec-websocket-key"]);
  ws.on("error", console.error);
  ws.id = request.headers["sec-websocket-key"];
  ws.on("message", (data: string) => {
    const request = parseCommand(data.toString());
    console.log(
      `received data: ${JSON.stringify(request)}, sessionId=${ws.id}`
    );

    if (request.type === CommandType.login) {
      const result = request.data as LoginRequestData;
      const response: LoginResponseDTO = {
        id: 0,
        data: JSON.stringify({
          name: result.name,
          index: 0,
          error: false,
          errorText: "",
        }),
        type: CommandType.login,
      };
      clientsRepository.createUser(result.name, ws);
      ws.send(JSON.stringify(response));
    }
    if (request.type === CommandType.createRoom) {
      const result = request.data as CreateRoomRequestDTO;
      const client = clientsRepository.getClient(ws.id);
      const newRoom = roomsRepository.createRoom(client);
      const createGameData = {
        idGame: 0,
        idPlayer: 0,
      };
      const createGame = {
        type: CommandType.createGame,
        data: JSON.stringify(createGameData),
        id: 0,
      };

      ws.send(JSON.stringify(createGame));
    }
    if (request.type === CommandType.addUserToRoom) {
      const requestData = request.data as AddUserToRoomRequestData;
      const client = clientsRepository.getClient(ws.id);

      roomsRepository.addUserToRoom(client, requestData.indexRoom);
      const roomClients = roomsRepository.getRoomClients(requestData.indexRoom);
      roomClients.forEach((roomClient) => {
        const createGameData = {
          idGame: requestData.indexRoom,
          idPlayer: roomClient.index,
        };
        const createGame = {
          type: CommandType.createGame,
          data: JSON.stringify(createGameData),
          id: 0,
        };

        roomClient.client.send(JSON.stringify(createGame));
      });
    }
    if (request.type === CommandType.addShips) {
      const requestData = request.data as AddShipsRequestData;
      roomsRepository.addShips(requestData);
      const isReadyToStart = roomsRepository.isReadyToStart(requestData.gameId);
      if (isReadyToStart) {
        const roomClients = roomsRepository.getRoomClients(requestData.gameId);
        roomClients.forEach((roomClient) => {
          const startGameData = {
            ships: roomClient.sourceShips,
            currentPlayerIndex: roomClient.index,
          };
          const startGame = {
            type: CommandType.startGame,
            data: JSON.stringify(startGameData),
            id: 0,
          };

          roomClient.client.send(JSON.stringify(startGame));
        });

        roomClients.forEach((roomClient) => {
          const turnResponseData = {
            currentPlayer: requestData.indexPlayer,
          };

          const turnCommand = {
            type: CommandType.turn,
            data: JSON.stringify(turnResponseData),
            id: 0,
          };

          roomClient.client.send(JSON.stringify(turnCommand));
        });
      }
    }

    if (request.type === CommandType.attack) {
      const requestData = request.data as GameAttackRequestData;
      const attackResult = roomsRepository.getAttackResult(requestData);
      const roomClients = roomsRepository.getRoomClients(requestData.gameId);
      roomClients.forEach((roomClient) => {
        const attackResponseData = {
          position: { x: requestData.x, y: requestData.y },
          currentPlayer: requestData.indexPlayer,
          status: attackResult.status,
        };

        const attackCommand = {
          type: CommandType.attack,
          data: JSON.stringify(attackResponseData),
          id: 0,
        };

        roomClient.client.send(JSON.stringify(attackCommand));
        if (attackResult.status === AttackStatus.killed) {
          attackResult.deadShipCells.forEach((deadShip) => {
            const attackResponseData = {
              position: { x: deadShip.x, y: deadShip.y },
              currentPlayer: requestData.indexPlayer,
              status: attackResult.status,
            };

            const attackCommand = {
              type: CommandType.attack,
              data: JSON.stringify(attackResponseData),
              id: 0,
            };

            roomClient.client.send(JSON.stringify(attackCommand));
          });
          const winner = roomsRepository.getWinner(requestData.gameId);
          if (winner) {
            const finishResponseData = {
              winPlayer: winner.index,
            };

            const finishCommand = {
              type: CommandType.finish,
              data: JSON.stringify(finishResponseData),
              id: 0,
            };
            winnersRepository.addWinner(winner.userName);
            roomClient.client.send(JSON.stringify(finishCommand));
            // roomsRepository.completeGame(requestData.gameId);
          }
        }

        //turn
        const enemyClient = roomClients.find(
          (client) => client.index !== requestData.indexPlayer
        );
        const turnResponseData = {
          currentPlayer:
            attackResult.status === AttackStatus.miss
              ? enemyClient.index
              : requestData.indexPlayer,
        };

        const turnCommand = {
          type: CommandType.turn,
          data: JSON.stringify(turnResponseData),
          id: 0,
        };

        roomClient.client.send(JSON.stringify(turnCommand));
      });
    }

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
    const updateRoomCommand = {
      type: CommandType.updateRoom,
      id: 0,
      data: JSON.stringify(roomsData),
    };

    const updateWinnersCommand = {
      type: CommandType.updateWinners,
      id: 0,
      data: JSON.stringify(winnersRepository.getWinners()),
    };
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(updateRoomCommand));
      client.send(JSON.stringify(updateWinnersCommand));
    });
  });
});
