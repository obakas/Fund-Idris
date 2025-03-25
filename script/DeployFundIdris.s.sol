// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import {Script} from "../lib/forge-std/src/Script.sol";
import {FundIdris} from "../src/FundIdris.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployFundIdris is Script {


    function run() external returns (FundIdris) {
        HelperConfig helperConfig = new HelperConfig();
        address ethUsdPriceFeed = helperConfig.activeNetworkConfig();
        
        vm.startBroadcast();
        FundIdris fundIdris = new FundIdris(ethUsdPriceFeed);
        vm.stopBroadcast();
        return fundIdris;
    }

   
}