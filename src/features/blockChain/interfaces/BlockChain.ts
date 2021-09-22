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
  /**
   * The copy of the blockchain held by the peer.
   */
  blockChain: BlockChain;
  /**
   * Connected peers in chronological order of time of connection.
   */
  connectedPeers: Peer['id'][];
  /**
   * Peers that connected to this peer.
   * Used to broadcast changes to all peers that have connected to this peer.
   * Maintained in tandem with connectedPeers
   */
  peersThatConnected: Peer['id'][];
}

export type Peers = {
  [id: string]: Peer;
};

export type UnhashedBlock = Omit<
  Block,
  keyof { hash: string; timeStamp: number; nonce: number }
>;
