import { keccak256, solidityPacked } from "ethers";

/**
 * Generates the same hash as Solidity:
 * keccak256(abi.encodePacked(amount, secret))
 */
export function generateCommitment(amount, secret) {
  return keccak256(
    solidityPacked(
      ["uint256", "string"],
      [amount.toString(), secret]
    )
  );
}
