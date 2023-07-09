import { ClientStoredModel } from "../dbModels/ClientStoredModel";
import { WebSocketClient } from "../wsserver";

class ClientsRepository {
  clientsDb: ClientStoredModel[] = [];

  createUser = (userName: string, client: WebSocketClient) => {
    this.clientsDb.push({ userName, client, index: this.clientsDb.length });
  };
  getClient = (sessionId: string) => {
    return this.clientsDb.find((client) => client.client.sessionId === sessionId);
  };
}

const clientsRepository = new ClientsRepository();
export default clientsRepository;
