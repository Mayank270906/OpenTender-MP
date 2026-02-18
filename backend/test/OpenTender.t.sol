// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/OpenTender.sol"; // Adjust path if your file is named differently

contract OpenTenderTest is Test {
    OpenTender public tenderContract;

    // Define test users
    address public admin = address(1);
    address public alice = address(2); // Bidder 1
    address public bob = address(3); // Bidder 2

    function setUp() public {
        // Deploy contract as Admin
        vm.prank(admin);
        tenderContract = new OpenTender();

        // Give our users some fake ether (optional, but good practice)
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);

        // Register companies (needed for BIDDER_ROLE)
        vm.prank(alice);
        tenderContract.registerCompany("Alice Corp", "REG-A", "alice@example.com", "QmAlice");

        vm.prank(bob);
        tenderContract.registerCompany("Bob Corp", "REG-B", "bob@example.com", "QmBob");
    }

    // --- Helper to generate hash matching the contract's logic ---
    function getCommitment(uint256 amount, string memory secret) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(amount, secret));
    }

    function test_FullTenderLifecycle() public {
        // 1. CREATE TENDER
        // -------------------------------------------------------
        vm.prank(admin);
        uint256 tenderId = tenderContract.createTender(
            "Road Project",
            "Build a road",
            OpenTender.Category.Construction,
            "QmHash123",
            1 days, // Bidding lasts 1 day
            1 days, // Reveal lasts 1 day after that
            1000 // Min bid
        );

        assertEq(tenderId, 1);

        // 2. SUBMIT BIDS (COMMIT PHASE)
        // -------------------------------------------------------

        // Alice bids 5000 with secret "aliceSecret"
        vm.prank(alice);
        bytes32 aliceHash = getCommitment(5000, "aliceSecret");
        tenderContract.submitBid(tenderId, aliceHash);

        // Bob bids 4000 (Lower is better!) with secret "bobSecret"
        vm.prank(bob);
        bytes32 bobHash = getCommitment(4000, "bobSecret");
        tenderContract.submitBid(tenderId, bobHash);

        // Verify bids are counted but not revealed
        assertEq(tenderContract.getBidsCount(tenderId), 2);
        (bool revealed, uint256 amt) = tenderContract.getBidDetails(tenderId, alice);
        assertEq(revealed, false); // Alice's bid should still be hidden
        assertEq(amt, 0);

        // 3. TIME TRAVEL -> REVEAL PHASE
        // -------------------------------------------------------
        // We warp time forward by 1 day + 1 second to enter Reveal Phase
        vm.warp(block.timestamp + 1 days + 1 seconds);

        // Alice reveals
        vm.prank(alice);
        tenderContract.revealBid(tenderId, 5000, "aliceSecret");

        // Bob reveals
        vm.prank(bob);
        tenderContract.revealBid(tenderId, 4000, "bobSecret");

        // Verify reveal worked
        (revealed, amt) = tenderContract.getBidDetails(tenderId, bob);
        assertEq(revealed, true);
        assertEq(amt, 4000);

        // 4. TIME TRAVEL -> CLOSE PHASE
        // -------------------------------------------------------
        // Warp forward another day to pass the Reveal Deadline
        vm.warp(block.timestamp + 1 days + 1 seconds);

        // Close the tender
        vm.prank(admin);
        tenderContract.closeTender(tenderId);

        // 5. CHECK WINNER
        // -------------------------------------------------------
        // We access the `winners` mapping directly since it's public
        (address winnerAddr, uint256 winnerAmt,) = tenderContract.winners(tenderId);

        console.log("Winner is:", winnerAddr);
        console.log("Winning Amount:", winnerAmt);

        // Bob should win because 4000 < 5000
        assertEq(winnerAddr, bob);
        assertEq(winnerAmt, 4000);
    }

    function test_RevertIf_RevealWithWrongSecret() public {
        // Setup tender
        vm.prank(admin);
        uint256 id = tenderContract.createTender("Job", "Desc", OpenTender.Category.IT, "Qm", 100, 100, 10);

        // Alice commits to 500 with secret "pass123"
        vm.prank(alice);
        tenderContract.submitBid(id, getCommitment(500, "pass123"));

        // Warp to reveal time
        vm.warp(block.timestamp + 101);

        // Alice tries to reveal with WRONG secret
        vm.startPrank(alice);

        // We expect the next call to revert with "Hash mismatch! Invalid amount/secret"
        vm.expectRevert("Hash mismatch! Invalid amount/secret");
        tenderContract.revealBid(id, 500, "WRONG_PASSWORD");

        vm.stopPrank();
    }

    function test_RevertIf_ChangeAmountDuringReveal() public {
        // Setup tender
        vm.prank(admin);
        uint256 id = tenderContract.createTender("Job", "Desc", OpenTender.Category.IT, "Qm", 100, 100, 10);

        // Alice commits to 500
        vm.prank(alice);
        tenderContract.submitBid(id, getCommitment(500, "pass123"));

        // Warp to reveal time
        vm.warp(block.timestamp + 101);

        // Alice tries to cheat and claim she bid 400 instead of 500
        vm.startPrank(alice);

        vm.expectRevert("Hash mismatch! Invalid amount/secret");
        tenderContract.revealBid(id, 400, "pass123"); // Amount doesn't match hash

        vm.stopPrank();
    }
}
