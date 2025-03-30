import { IdentityChain, IdentityData } from '../identity/IdentityChain';
import { generateKeyPair, sha256 } from '../utils/crypto';

export class BlockchainService {
  private static instance: BlockchainService;
  private chain: IdentityChain;
  private documentHashes: Map<string, string>;

  private constructor() {
    this.chain = new IdentityChain();
    this.documentHashes = new Map();
  }

  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  // Add this new method
  async getDocumentHash(documentId: string): Promise<string> {
    // First check if we already have the hash
    const existingHash = this.documentHashes.get(documentId);
    if (existingHash) {
      return existingHash;
    }

    // If not, generate a new hash
    const hash = await sha256(`${documentId}-${Date.now()}`);
    this.documentHashes.set(documentId, hash);
    return hash;
  }

  // Add method to store document hash
  async storeDocumentHash(documentId: string, content: string): Promise<string> {
    const hash = await sha256(content);
    this.documentHashes.set(documentId, hash);
    return hash;
  }

  async createIdentity(userId: string): Promise<{ publicKey: string; privateKey: string }> {
    const { publicKey, privateKey } = await generateKeyPair();
    
    const identityData: IdentityData = {
      userId,
      publicKey,
      documents: []
    };

    await this.chain.addIdentity(identityData);
    return { publicKey, privateKey };
  }

  async verifyIdentity(userId: string): Promise<boolean> {
    const identity = this.chain.verifyIdentity(userId);
    return !!identity;
  }

  async getChainStatus(): Promise<{ blocks: number; isValid: boolean }> {
    return {
      blocks: this.chain.chain.length,
      isValid: await this.chain.isChainValid()
    };
  }
}