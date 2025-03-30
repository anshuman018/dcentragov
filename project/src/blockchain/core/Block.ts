import { sha256 } from '../utils/crypto';

export interface BlockData {
  timestamp: number;
  transactions: any[];
  previousHash: string;
  hash: string;
  nonce: number;
}

export class Block {
  timestamp: number;
  transactions: any[];
  previousHash: string;
  hash: string;
  nonce: number;

  constructor(timestamp: number, transactions: any[], previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = '';
  }

  async calculateHash(): Promise<string> {
    return await sha256(
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.transactions) +
      this.nonce
    );
  }

  async mineBlock(difficulty: number) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')
    ) {
      this.nonce++;
      this.hash = await this.calculateHash();
    }
  }
}