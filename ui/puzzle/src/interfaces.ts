import { CevalCtrl, NodeEvals } from 'ceval';
import { Prop } from 'common';
import { TreeWrapper } from 'tree';
import { VNode } from 'snabbdom/vnode'
import { Api as CgApi } from 'chessground/api';
import { Config as CgConfig } from 'chessground/config';
import { Role } from 'chessground/types';

export type MaybeVNode = VNode | string | null | undefined;
export type MaybeVNodes = MaybeVNode[];

export type Redraw = () => void;

export interface KeyboardController {
  vm: Vm;
  redraw: Redraw;
  userJump(path: Tree.Path): void;
  getCeval(): CevalCtrl;
  toggleCeval(): void;
  toggleThreatMode(): void;
  playBestMove(): void;
}

export interface Controller extends KeyboardController {
  nextNodeBest(): string | undefined;
  disableThreatMode?: Prop<Boolean>;
  gameOver: (node?: Tree.Node) => 'draw' | 'checkmate' | false;
  mandatoryCeval?: Prop<boolean>;
  showEvalGauge: Prop<boolean>;
  currentEvals(): NodeEvals;
  ongoing: boolean;
  playUci(uci: string): void;
  getOrientation(): Color;
  threatMode: Prop<boolean>;
  getNode(): Tree.Node;
  showComputer(): boolean;
  trans: Trans;
  getData(): PuzzleData;
  getTree(): TreeWrapper;
  ground: Prop<CgApi | undefined>;
  makeCgOpts(): CgConfig;
  viewSolution(): void;
  nextPuzzle(): void;
  recentHash(): string;
  callToVote(): boolean;
  thanks(): boolean;
  vote(v: boolean): void;
  pref: PuzzlePrefs;
  userMove(orig: Key, dest: Key): void;
  promotion: any;

  path?: Tree.Path;
  autoScrollRequested?: boolean;
}

export interface Vm {
  path: Tree.Path;
  nodeList: Tree.Node[];
  node: Tree.Node;
  mainline: Tree.Node[];
  mode: 'play' | 'view' | 'try';
  loading: boolean;
  round: any;
  voted?: boolean | null;
  justPlayed?: Key;
  resultSent: boolean;
  lastFeedback: 'init' | 'fail' | 'win' | 'good' | 'retry';
  initialPath: Tree.Path;
  initialNode: Tree.Node;
  canViewSolution: boolean;
  autoScrollRequested: boolean;
  autoScrollNow: boolean;
  cgConfig: CgConfig;
  showComputer(): boolean;
  showAutoShapes(): boolean;
}

export interface PuzzleOpts {
  pref: PuzzlePrefs;
  data: PuzzleData;
  i18n: { [key: string]: string | undefined };
  element: HTMLElement;
}

export interface PuzzlePrefs {
  coords: 0 | 1 | 2;
  is3d: boolean;
  destination: boolean;
  rookCastle: boolean;
  moveEvent: number;
  highlight: boolean;
  resizeHandle: number;
  animation: {
    duration: number;
  };
  blindfold: boolean;
}

export interface PuzzleData {
  puzzle: Puzzle;
  game: {
    treeParts: Tree.Node[];
  };
  user: PuzzleUser | undefined;
  voted: boolean | null | undefined;
}

export interface PuzzleUser {
  rating: number;
  recent: Array<[number, number, number]>;
}

export interface Puzzle {
  id: number;
  enabled: boolean;
  vote: number;
  color: Color;
  lines: Lines;
  branch: any;
}

export interface PuzzleRound {
  user: PuzzleUser;
  round?: {
    ratingDiff: number;
    win: boolean;
  };
  voted?: null | true | false;
}

export interface PuzzleVote {
  0: true | false; // up/down
  1: number; // new score
}

export interface Promotion {
  start(orig: Key, dest: Key, callback: (orig: Key, dest: Key, prom: Role) => void): boolean;
  cancel(): void;
  view(): MaybeVNode;
}

export type Lines = { [uci: string]: Lines } | 'fail' | 'win';

export interface MoveTest {
  orig: Key;
  dest: Key;
  promotion?: Role;
  fen: Fen;
  path: Tree.Path;
}
