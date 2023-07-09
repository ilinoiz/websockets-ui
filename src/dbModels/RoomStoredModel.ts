import { ClientStoredModel } from "./ClientStoredModel";

export interface RoomStoredModel {
  roomUsers: ClientStoredModel[];
  index: number;
  currentTurnClientId?: number;
}
