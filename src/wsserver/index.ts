import { WebSocketServer } from "ws";
import { LoginRequestData } from "../commands/requests/LoginRequestDTO";
import { CommandType, parseCommand } from "../commands/DTOBase";
import { LoginResponseDTO } from "../commands/responses/LoginResponseDTO";

const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    const request = parseCommand(data.toString());
    console.log("received data: %s ", request);

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
      ws.send(JSON.stringify(response));
    }
  });
});
