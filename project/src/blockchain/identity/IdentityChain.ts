import { Block } from '../core/Block';

export interface IdentityData {
  userId: string;
  publicKey: string;
  documents: {
    docType: string;
    docHash: string;
    timestamp: number;
  }[];
}

export class IdentityChain {
  chain: Block[];
  difficulty: number;
  pendingTransactions: IdentityData[];

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
  }

  private createGenesisBlock(): Block {
    return new Block(Date.now(), [], "0");
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  async addIdentity(identityData: IdentityData): Promise<void> {
    this.pendingTransactions.push(identityData);
    
    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    
    await block.mineBlock(this.difficulty);
    this.chain.push(block);
    this.pendingTransactions = [];
  }

  verifyIdentity(userId: string): IdentityData | null {
    for (const block of this.chain.reverse()) {
      const identity = block.transactions.find(
        (tx: IdentityData) => tx.userId === userId
      );
      if (identity) return identity;
    }
    return null;
  }

  async isChainValid(): Promise<boolean> {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== await currentBlock.calculateHash()) return false;
      if (currentBlock.previousHash !== previousBlock.hash) return false;
    }
    return true;
  }
}