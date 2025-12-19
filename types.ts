
// Domain types for the Dominion Commander application

export enum DominionStatus {
  EMPTY = '空白',
  CURRENT_DOMINION = '當季霸業',
  RECEIVED = '已領過',
  GUARANTEED = '霸業前五保障',
  RECEIVED_NO_GUARANTEE = '領過(無保障)',
  LEFT_TEAM = '當季離隊',
  QUIT = '已離隊'
}

export interface SeasonalStatus {
  season: string;
  status: DominionStatus;
}

export interface Member {
  id: string;
  name: string;
  group: string;
  lineName: string;
  seasonalHistory: SeasonalStatus[];
}

export interface AppState {
  members: Member[];
}
