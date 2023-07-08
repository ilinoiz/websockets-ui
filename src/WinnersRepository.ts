import { ClientModel } from "./RoomsRepository";
import { WebSocketClient } from "./wsserver";

interface WinnersModel {
  name: string;
  wins: number;
}

class WinnersRepository {
  winnersDb: WinnersModel[] = [];

  addWinner = (userName: string) => {
    const winnerIndex = this.winnersDb.findIndex(
      (winner) => winner.name === userName
    );
    if (winnerIndex > -1) {
      this.winnersDb[winnerIndex].wins++;
    } else {
      this.winnersDb.push({
        name: userName,
        wins: 1,
      });
    }
  };

  getWinners = () => {
    return this.winnersDb;
  };
}

const winnersRepository = new WinnersRepository();
export default winnersRepository;
