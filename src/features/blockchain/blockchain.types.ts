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
  /**
   * Connected peers in chronological order of time of connection.
   */
  connectedPeers: Peer['id'][];
  /**
   * Peers that connected to this peer.
   * Used to broadcast changes to all peers that have connected to this peer.
   * Maintained in tandem with connectedPeers
   */
  // peersThatConnected: Peer['id'][];
};

export type Peers = {
  [id: string]: Peer;
};

export type UnhashedBlock = Omit<
  Block,
  keyof { id: string; hash: string; timeStamp: number; nonce: number }
> & { id?: string | undefined };
