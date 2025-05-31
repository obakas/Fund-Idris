/* FundSection.tsx */
"use client";

import { useState, useEffect } from "react";
import { writeContract, readContract, waitForTransactionReceipt } from "@wagmi/core";
import { parseEther, formatEther } from "viem";
import toast from "react-hot-toast";
import {fundIdrisAddress, fundIdrisABI} from "@/constants";
import InputField from "./ui/InputField";
import { useChainId, useConfig, useAccount } from "wagmi";


// interface FundSectionProps {
//   fundIdrisAddress: `0x${string}`;
//   chainId: number;
// }

// { fundIdrisAddress }: FundSectionProps

export default function FundIdrisForm() {
  const [fundAmount, setFundAmount] = useState("");
  const [isFunding, setIsFunding] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [userBalance, setUserBalance] = useState<string | null>(null);
  const [ownerAddress, setOwnerAddress] = useState<`0x${string}` | null>(null);
  const [totalFunded, setTotalFunded] = useState<string>("0");
  const [funderCount, setFunderCount] = useState<number>(0);
  const config = useConfig();
  const chainId = useChainId();


  const { address: userAddress } = useAccount();

  const fetchBalance = async () => {
    if (!userAddress) return;
    setIsFetchingBalance(true);
    try {
      const balance = await readContract(config,{
        address: fundIdrisAddress,
        abi: fundIdrisABI,
        functionName: "getAddressToAmmountFunded",
        args: [userAddress],
        chainId,
      });
      setUserBalance(formatEther(balance as bigint));
    } catch (err: any) {
      toast.error(`Couldn't fetch balance: ${err.message || err}`);
    } finally {
      setIsFetchingBalance(false);
    }
  };

  const fetchOwner = async () => {
    try {
      const owner = await readContract(config,{
        address: fundIdrisAddress,
        abi: fundIdrisABI,
        functionName: "getOwner",
        chainId,
      });
      setOwnerAddress(owner as `0x${string}`);
    } catch (err: any) {
      toast.error(`Failed to fetch owner: ${err.message || err}`);
    }
  };

  const fetchFunderStats = async () => {
    try {
      const funders: string[] = [];
      let index = 0;
      while (true) {
        try {
          const funder = await readContract(config, {
            address: fundIdrisAddress,
            abi: fundIdrisABI,
            functionName: "getFunder",
            args: [index],
            chainId,
          });
          funders.push(funder as string);
          index++;
        } catch {
          break; // stop when getFunder(index) fails (out of bounds)
        }
      }
      setFunderCount(funders.length);

      let total = BigInt(0);
      for (const addr of funders) {
        try {
          const amount = await readContract(config, {
            address: fundIdrisAddress,
            abi: fundIdrisABI,
            functionName: "getAddressToAmmountFunded",
            args: [addr],
            chainId,
          });
          total += BigInt(amount as bigint);
        } catch {}
      }

      setTotalFunded(formatEther(total));
    } catch (err: any) {
      toast.error(`Failed to fetch stats: ${err.message || err}`);
    }
  };


  useEffect(() => {
    fetchBalance();
    fetchOwner();
    fetchFunderStats();
  }, [userAddress]);

  const handleFund = async () => {
    setIsFunding(true);
    const toastId = toast.loading("Sending transaction...");

    try {
      const tx = await writeContract(config,{
        address: fundIdrisAddress,
        abi: fundIdrisABI,
        functionName: "fund",
        chainId,
        value: parseEther(fundAmount),
      });

      await waitForTransactionReceipt(config,{ hash: tx });
      toast.success("Transaction complete!", { id: toastId });
      fetchBalance();
      fetchFunderStats();
    } catch (err: any) {
      toast.error(`Funding failed: ${err.message || err}`, { id: toastId });
    } finally {
      setIsFunding(false);
    }
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    const toastId = toast.loading("Withdrawing funds...");

    try {
      const tx = await writeContract(config,{
        address: fundIdrisAddress,
        abi: fundIdrisABI,
        functionName: "withdraw",
        chainId,
      });

      await waitForTransactionReceipt(config,{ hash: tx });
      toast.success("Withdraw complete!", { id: toastId });
      fetchBalance();
      fetchFunderStats();
    } catch (err: any) {
      toast.error(`Withdraw failed: ${err.message || err}`, { id: toastId });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-4">
      <InputField
        label="ETH Amount to Fund"
        type="number"
        placeholder="Amount greater than 5"
        value={fundAmount}
        onChange={(e) => setFundAmount(e.target.value)}
      />

      <button
        onClick={handleFund}
        disabled={isFunding}
        className={`w-full py-2 px-4 rounded-md transition-colors duration-200
          ${isFunding ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
          text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
      >
        {isFunding ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner /> Funding...
          </span>
        ) : (
          "Fund"
        )}
      </button>

      <div className="text-sm text-gray-700">
        {isFetchingBalance
          ? "Checking balance..."
          : userBalance !== null
          ? `Your Funded Balance: ${userBalance} ETH`
          : "No balance info yet."}
      </div>
      
      <div className="text-sm text-gray-700">
            <p>Total Funders: {funderCount}</p>
            <p>Total Funded: {totalFunded} ETH</p>
        </div>

      <button
        onClick={fetchBalance}
        disabled={isFetchingBalance}
        className={`w-full py-2 px-4 rounded-md transition-colors duration-200
          ${isFetchingBalance ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
          text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      >
        {isFetchingBalance ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner /> Checking...
          </span>
        ) : (
          "Get My Balance"
        )}
      </button>

    {ownerAddress === userAddress && (
      <button
        onClick={handleWithdraw}
        disabled={isWithdrawing}
        className={`w-full py-2 px-4 rounded-md transition-colors duration-200
          ${isWithdrawing ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}
          text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
      >
        {isWithdrawing ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner /> Withdrawing...
          </span>
        ) : (
          "Withdraw"
        )}
      </button>
    )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      ></path>
    </svg>
  );
}


// "use client"

// import React, { useState } from "react";
// import InputField from "./ui/InputField";
// import { useChainId, useConfig, useAccount } from "wagmi";
// import {fundIdrisAddress, fundIdrisABI} from "@/constants";
// import {readContract, writeContract, waitForTransactionReceipt} from "@wagmi/core";
// import { parseEther, formatEther } from 'viem'
// import toast from 'react-hot-toast'


// export default function FundIdrisForm(){
//     const [fundAmount, setFundAmount] = useState("");
//     const { address: userAddress } = useAccount();
//     const chainId = useChainId();
//     const config = useConfig();
//     const [isFunding, setIsFunding] = useState(false);
//     const [isWithdrawing, setIsWithdrawing] = useState(false);
//     const [isFetchingBalance, setIsFetchingBalance] = useState(false);



//     async function handleFund() {
//         setIsFunding(true);
//         const loadingToast = toast.loading('Sending transaction...')
//         try {
//             // console.log("Funding with amount:", fundAmount);
//             // console.log("Chain ID:", chainId);
//             // console.log("Fund Idris Address:", fundIdrisAddress);

//             const ethAmount = parseFloat(fundAmount);
//             if (isNaN(ethAmount) || ethAmount <= 0) {
//                 throw new Error("Invalid ETH amount");
//             }

//             const tx = await writeContract(config, {
//                 address: fundIdrisAddress,
//                 abi: fundIdrisABI,
//                 functionName: 'fund',
//                 chainId: chainId,
//                 value: parseEther(fundAmount), 
//             });

//             // console.log('Transaction sent! Waiting for confirmation...', tx);

//             const receipt = await waitForTransactionReceipt(config, {
//                 hash: tx,
//             });

//             toast.success('Funded successfully! 🎉', { id: loadingToast })
//             // console.log('Transaction confirmed!', receipt);
//             // ✅ Show success message or toast

//         } catch (err: any) {
//             toast.error(`Funding failed: ${err.message || err}`, { id: loadingToast })
//             // console.error('Funding failed:', err.message || err);
//             // ❌ Show user-friendly error message or toast
//         } finally {
//             setIsFunding(false);
//         }
//     }


    
//     async function handleGetBalance() {
//         try {
//             const balance = await readContract(config, {
//             address: fundIdrisAddress,
//             abi: fundIdrisABI,
//             functionName: 'getAddressToAmmountFunded',
//             args: [userAddress], // Use `useAccount()` to get this
//             });

//             toast.success(`You funded: ${formatEther(balance as bigint)} ETH 💸`)
//             // console.log(`Your balance is: ${formatEther(balance as bigint)} ETH`);
//         } catch (err: any) {
//             toast.error(`Couldn't fetch balance: ${err.message || err}`)
//             // console.error('Failed to get balance:', err.message || err);
//         }
//     }

//     async function handleWithdraw() {
//         setIsWithdrawing(true);
//         const toastId = toast.loading('Processing withdraw...')

//         try {
//             const tx = await writeContract(config, {
//             address: fundIdrisAddress,
//             abi: fundIdrisABI,
//             functionName: 'withdraw',
//             });

//             const receipt = await waitForTransactionReceipt(config, { hash: tx });
//             toast.success('Withdraw successful! 💰', { id: toastId })
//             // console.log('Withdraw successful:', receipt);
//         } catch (err: any) {
//             toast.error(`Withdraw failed: ${err.message || err}`, { id: toastId })
//             // console.error('Withdraw failed:', err.message || err);
//         }finally {
//             setIsWithdrawing(false);
//         }
//     }




//     return (
//         <div className="space-y-4">      
//             <InputField
//                 label="ETH Amount to Fund"
//                 type="number"
//                 placeholder="Amount greater than 5"
//                 value={fundAmount}
//                 onChange={(e) => setFundAmount(e.target.value)}
//             />

//             <button
//                 onClick={handleFund}
//                 disabled={isFunding}
//                 className={`w-full py-2 px-4 rounded-md transition-colors duration-200
//                     ${isFunding ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
//                     text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
//                 >
//                 {isFunding ? (
//                     <span className="flex items-center justify-center gap-2">
//                     <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24">
//                         <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                         ></circle>
//                         <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//                         ></path>
//                     </svg>
//                     Funding...
//                     </span>
//                 ) : (
//                     "Fund"
//                 )}
//             </button>


//             <button
//                 onClick={handleGetBalance}
//                 className="w-full py-2 px-4 bg-blue-600 text-white rounded-md
//                         hover:bg-blue-700 transition-colors duration-200
//                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//                 Get My Balance
//             </button>

//             <button
//                 onClick={handleWithdraw}
//                 disabled={isWithdrawing}
//                 className={`w-full py-2 px-4 rounded-md transition-colors duration-200
//                     ${isWithdrawing ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}
//                     text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
//                 >
//                 {isWithdrawing ? (
//                     <span className="flex items-center justify-center gap-2">
//                     <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                     </svg>
//                     Withdrawing...
//                     </span>
//                 ) : (
//                     "Withdraw"
//                 )}
//             </button>

//         </div>

//     )
// }



