//SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import {Script, console} from "../lib/forge-std/src/Script.sol";
import {DevOpsTools} from "../lib/foundry-devops/src/DevOpsTools.sol";
import {FundIdris} from "../src/FundIdris.sol";

contract FundFundIdris is Script{
    uint256 constant SEND_VALUE = 6 ether;

    function fundFundIdris(address mostRecentlyDeployed) public {
        vm.startBroadcast();
        FundIdris(payable(mostRecentlyDeployed)).fund{value: SEND_VALUE}();
        vm.stopBroadcast();
        console.log("Funded FundIdris with ", SEND_VALUE);
    }

    function run() external{
        address mostRecentlyDeployed = DevOpsTools.get_most_recent_deployment("FundMe", block.chainid);
        fundFundIdris(mostRecentlyDeployed);
    }
}

contract WithdrawFundIdris is Script{
    function withdrawFundIdris(address mostRecentlyDeployed) public {
        vm.startBroadcast();
        FundIdris(payable(mostRecentlyDeployed)).withdraw();
        vm.stopBroadcast();
        console.log("Withdrew from FundIdris");
    }

    function run() external{
        address mostRecentlyDeployed = DevOpsTools.get_most_recent_deployment("FundMe", block.chainid);
        withdrawFundIdris(mostRecentlyDeployed);
    }
}