import { ClientStoredModel } from "../dbModels/ClientStoredModel";
import { WebSocketClient } from "../wsserver";

class ClientsRepository {
  clientsDb: ClientStoredModel[] = [];

  isUsernameTaken = (username: string): boolean => {
    return this.clientsDb.some(
      (client) => client.userName.toLowerCase() === username.toLowerCase()
    );
  };

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

  deleteClient = (sessionId: string) => {
    this.clientsDb = this.clientsDb.filter(
      ({ client }) => client?.sessionId !== sessionId
    );
  };
}

const clientsRepository = new ClientsRepository();
export default clientsRepository;
