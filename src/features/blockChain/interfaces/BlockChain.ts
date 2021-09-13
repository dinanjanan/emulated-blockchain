export interface Block {
  index: number;
  data: string;
  timeStamp: number;
  hash: string;
  previousHash: string;
  nonce: number;
}

export type BlockChain = {
  [index: number]: Block;
};

export interface Peer {
  id: string;
  name: string;
  blockChain: BlockChain;
}

export type Peers = {
  [id: string]: Peer;
};

export type UnhashedBlock = Omit<
  Block,
  keyof { hash: string; timeStamp: number; nonce: number }
>;
