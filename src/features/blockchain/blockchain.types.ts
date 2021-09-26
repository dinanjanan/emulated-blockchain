export type Block = {
  id: string;
  index: number;
  data: string;
  timeStamp: number;
  hash: string;
  previousHash: string;
  nonce: number;
};

export type BlockChain = {
  [index: number]: Block;
};

export type PeerToBlockchainMap = {
  [peerId: Peer['id']]: Block['id'][];
};

export type Peer = {
  id: string;
  name: string;
  connectedPeers: Peer['id'][];
};

export type Peers = {
  [id: string]: Peer;
};

export type UnhashedBlock = Omit<
  Block,
  keyof { id: string; hash: string; timeStamp: number; nonce: number }
> & { id?: string | undefined };
