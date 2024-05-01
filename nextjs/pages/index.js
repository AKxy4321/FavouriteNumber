import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import TransactionList from "./TransactionList";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_favoriteNumber",
        type: "uint256",
      },
    ],
    name: "addPerson",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "nameToFavoriteNumber",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "people",
    outputs: [
      {
        internalType: "uint256",
        name: "favoriteNumber",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "retrieve",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_favoriteNumber",
        type: "uint256",
      },
    ],
    name: "store",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);
  const [signer, setSigner] = useState(undefined);
  const [transactions, setTransactions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTransactionPending, setIsTransactionPending] = useState(false);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  });

  async function connect() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setIsConnected(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setSigner(provider.getSigner());
      } catch (e) {
        console.log(e);
      }
    } else {
      setIsConnected(false);
    }
  }

  async function getCurrentFavoriteNumber() {
    if (isTransactionPending) {
      alert("A transaction is pending. Please wait for it to be completed.");
      return;
    }
    if (typeof window.ethereum !== "undefined") {
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const num = await contract.retrieve();
        console.log(parseInt(num));
        alert("Current Favourite Number is: " + parseInt(num));
      } catch (error) {
        console.log(error);
        return -1;
      }
    } else {
      console.log("Please install MetaMask");
    }
  }
  
  
  function clearTransactions() {
    setTransactions([]);
  }

  async function execute() {
    if (typeof window.ethereum !== "undefined") {
      setIsTransactionPending(true);
      const value = parseInt(inputValue);
      if (value <= 0 || isNaN(value)) {
        alert("Please enter a positive number");
        setIsTransactionPending(false);
        return;
      }
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const tx = await contract.store(inputValue);
        tx.wait();
        setTransactions([...transactions, inputValue]);
        setIsTransactionPending(false);
      } catch (error) {
        console.log(error);
        setTransactions([...transactions, -1]);
        setIsTransactionPending(false);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>MetaMask Integration</title>
        <meta name="description" content="MetaMask Integration with Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Favourite Number</h1>

        <div className={styles.contentWrapper}>
          <div className={styles.buttonContainer}>
            {hasMetamask ? (
              isConnected ? (
                <p className={styles.status}>Connected!</p>
              ) : (
                <button className={styles.connectButton} onClick={() => connect()}>
                  Connect MetaMask
                </button>
              )
            ) : (
              <p className={styles.status}>Please install MetaMask</p>
            )}

            {isConnected && (
              <>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setInputValue(value.toString());
                  }}
                  className={styles.input}
                  placeholder="Enter a Number"
                />
                <button className={styles.executeButton} onClick={() => execute()}>
                  Execute Transaction
                </button>

                <button className={styles.button} onClick={getCurrentFavoriteNumber}>
                  Get Current Favorite Number
                </button>

                <button className={styles.button} onClick={clearTransactions}>
                  Clear Transactions
                </button>
              </>
            )}
          </div>

          <div className={styles.transactionListContainer}>
            <TransactionList transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
}
