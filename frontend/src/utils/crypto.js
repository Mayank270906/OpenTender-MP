import { keccak256, solidityPacked, hexlify, randomBytes } from 'ethers';

/**
 * Generate a random 16-byte hex secret key
 */
export function generateSecretKey() {
    return hexlify(randomBytes(16));
}

/**
 * Generate the same commitment hash as Solidity:
 * keccak256(abi.encodePacked(amount, secret))
 */
export function generateCommitment(amount, secret) {
    return keccak256(
        solidityPacked(
            ['uint256', 'string'],
            [amount.toString(), secret]
        )
    );
}
