import { WinnersStoredModel } from "../dbModels/WinnerStoredModel";

class WinnersRepository {
  winnersDb: WinnersStoredModel[] = [];

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
