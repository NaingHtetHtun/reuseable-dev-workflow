/**
 * AES-256-GCM encryption service for credential storage.
 *
 * Uses Node.js built-in crypto module — no external dependencies.
 * Each encryption uses a random IV, ensuring different ciphertexts for the same plaintext.
 * Authenticated encryption provides both confidentiality and integrity.
 */
export declare class EncryptionService {
    private readonly key;
    constructor(keyHex: string);
    /**
     * Encrypt plaintext string.
     * Returns base64-encoded string: iv (12 bytes) + authTag (16 bytes) + ciphertext
     */
    encrypt(plaintext: string): string;
    /**
     * Decrypt base64-encoded encrypted string.
     * Input format: iv (12 bytes) + authTag (16 bytes) + ciphertext
     */
    decrypt(encryptedData: string): string;
    /**
     * Encrypt a JSON object.
     * Serializes to JSON string, then encrypts.
     */
    encryptObject(data: Record<string, unknown>): string;
    /**
     * Decrypt to a JSON object.
     * Decrypts, then parses JSON string.
     */
    decryptObject<T = Record<string, unknown>>(encryptedData: string): T;
}
//# sourceMappingURL=encryption.d.ts.map