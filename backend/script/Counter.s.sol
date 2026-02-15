// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {OpenTender} from "../src/OpenTender.sol";

contract CounterScript is Script {
    OpenTender public openTender;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        openTender = new OpenTender();

        vm.stopBroadcast();
    }
}
