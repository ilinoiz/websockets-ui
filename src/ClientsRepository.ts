import { ClientModel } from "./RoomsRepository";
import { WebSocketClient } from "./wsserver";

class ClientsRepository {
  clientsDb: ClientModel[] = [];

  createUser = (userName: string, client: WebSocketClient) => {
    this.clientsDb.push({ userName, client, index: this.clientsDb.length });
  };
  getClient = (sessionId: string) => {
    return this.clientsDb.find((client) => client.client.id === sessionId);
  };
}

const clientsRepository = new ClientsRepository();
export default clientsRepository;
