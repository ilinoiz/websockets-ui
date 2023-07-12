import { ClientStoredModel } from "../dbModels/ClientStoredModel";
import { WebSocketClient } from "../wsserver";

class ClientsRepository {
  clientsDb: ClientStoredModel[] = [];

  createClient = (
    userName: string,
    client: WebSocketClient,
    isBot: boolean = false
  ) => {
    const newClient = {
      userName,
      client,
      index: this.clientsDb.length,
      isBot,
    };
    if (isBot && this.clientsDb.some((client) => client.isBot)) {
      console.log(`bot user already exists and will be reused for new game`);
      return newClient;
    }
    this.clientsDb.push(newClient);
    return newClient;
  };
  getClient = (sessionId: string) => {
    return this.clientsDb.find(
      (client) => client.client?.sessionId === sessionId
    );
  };
}

const clientsRepository = new ClientsRepository();
export default clientsRepository;
