"use client";

import React from 'react'; 
import { useState, useEffect } from "react";
import { writeContract, readContract, waitForTransactionReceipt } from "@wagmi/core";
import { parseEther, formatEther } from "viem";
import toast from "react-hot-toast";
import { fundIdrisAddress, fundIdrisABI } from "@/constants";
import InputField from "./ui/InputField";
import { useChainId, useConfig, useAccount } from "wagmi";

export default function FundIdrisDashboard() {
    // State management remains the same
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

    // Data fetching functions remain the same
    const fetchBalance = async () => {
        if (!userAddress) return;
        setIsFetchingBalance(true);
        try {
            const balance = await readContract(config, {
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
            const owner = await readContract(config, {
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
                } catch { }
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
            const tx = await writeContract(config, {
                address: fundIdrisAddress,
                abi: fundIdrisABI,
                functionName: "fund",
                chainId,
                value: parseEther(fundAmount),
            });

            await waitForTransactionReceipt(config, { hash: tx });
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
            const tx = await writeContract(config, {
                address: fundIdrisAddress,
                abi: fundIdrisABI,
                functionName: "withdraw",
                chainId,
            });

            await waitForTransactionReceipt(config, { hash: tx });
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
        <div className="max-w-md mx-auto space-y-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-gray-800">
            {/* Funding Section */}
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-800/20 p-5 rounded-xl border border-emerald-800/50">
                <h2 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
                    <CurrencyIcon /> Fund the Project
                </h2>

                <InputField
                    label="ETH Amount"
                    type="number"
                    placeholder="Enter ETH amount"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    min="0"
                    step="0.001"
                />

                <div className="mt-4 flex flex-col gap-3">
                    <button
                        onClick={handleFund}
                        disabled={isFunding || !fundAmount || parseFloat(fundAmount) <= 0}
                        className={`btn-primary ${isFunding ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-500 rounded-lg'}`}
                    >
                        {isFunding ? (
                            <ButtonLoader label="Processing Transaction" />
                        ) : (
                            "Send Funds"
                        )}
                    </button>

                    <div className="text-sm flex justify-between text-gray-300 pt-2">
                        <span>Your Balance:</span>
                        <span className="font-medium">
                            {isFetchingBalance ? (
                                <span className="inline-flex items-center gap-1">
                                    <MiniSpinner /> Loading...
                                </span>
                            ) : userBalance !== null ? (
                                `${userBalance} ETH`
                            ) : (
                                "0 ETH"
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-br from-blue-900/30 to-indigo-800/20 p-5 rounded-xl border border-indigo-800/50">
                <h3 className="font-semibold text-indigo-300 mb-3">Funding Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard
                        label="Total Funders"
                        value={funderCount.toString()}
                        icon={<UsersIcon />}
                    />
                    <StatCard
                        label="Total Funded"
                        value={`${totalFunded} ETH`}
                        icon={<CollectionIcon />}
                    />
                </div>
            </div>

            {/* Owner Section */}
            {ownerAddress === userAddress && (
                <div className="bg-gradient-to-br from-rose-900/30 to-red-800/20 p-5 rounded-xl border border-rose-800/50">
                    <h3 className="font-semibold text-rose-300 mb-3">Owner Actions</h3>
                    <button
                        onClick={handleWithdraw}
                        disabled={isWithdrawing}
                        className={`btn-primary ${isWithdrawing ? 'bg-rose-700' : 'bg-rose-600 hover:bg-rose-500 rounded-lg w-50'}`}
                    >
                        {isWithdrawing ? (
                            <ButtonLoader label="Withdrawing Funds" />
                        ) : (
                            "Withdraw All Funds"
                        )}
                    </button>
                    <p className="text-xs text-rose-200/70 mt-2">
                        Only visible to contract owner
                    </p>
                </div>
            )}
        </div>
    );
}

// Reusable components
const ButtonLoader = ({ label }: { label: string }) => (
    <span className="flex items-center justify-center gap-2">
        <Spinner /> {label}
    </span>
);

function Spinner() {
    return (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
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

function MiniSpinner() {
    return (
        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24">
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="8"
                stroke="currentColor"
                strokeWidth="3"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
        </svg>
    );
}

const StatCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
    <div className="bg-black/20 p-3 rounded-lg border border-gray-800 flex items-center gap-3">
        <div className="text-indigo-400">
            {icon}
        </div>
        <div>
            <div className="text-xs text-gray-400">{label}</div>
            <div className="font-bold">{value}</div>
        </div>
    </div>
);

// Icons (could be moved to separate file)
const CurrencyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95a1 1 0 001.715 1.029zM7 9a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm2 4a1 1 0 100 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
);

const CollectionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm-2 4a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
    </svg>
);