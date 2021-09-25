import { PeerMessageIcons } from '../../app/constants';

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

export type PeerConnection = {
  peerId: Peer['id'];
  initiated: boolean;
};

export type Peer = {
  id: string;
  name: string;
  /**
   * Connected peers in chronological order of time of connection.
   */
  connectedPeers: PeerConnection[];
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

export type PeerMessage = {
  id: string;
  message: string;
  iconUrl: typeof PeerMessageIcons[keyof typeof PeerMessageIcons];
};

export type PeerInitiatorMessages = {
  [initiator: Peer['id']]: {
    [receiver: Peer['id']]: PeerMessage[];
  };
};

export type PeerReceiverMessages = {
  [receiver: Peer['id']]: {
    [initiator: Peer['id']]: PeerMessage[];
  };
};
