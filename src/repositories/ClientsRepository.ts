import { ClientStoredModel } from "../dbModels/ClientStoredModel";
import { WebSocketClient } from "../wsserver";

class ClientsRepository {
  clientsDb: ClientStoredModel[] = [];

  createClient = (userName: string, client: WebSocketClient) => {
    const newClient = { userName, client, index: this.clientsDb.length };
    this.clientsDb.push(newClient);
    return newClient;
  };
  getClient = (sessionId: string) => {
    return this.clientsDb.find(
      (client) => client.client.sessionId === sessionId
    );
  };
}

const clientsRepository = new ClientsRepository();
export default clientsRepository;
