import React from "react";

const TransactionList = ({ transactions }) => {
  return (
    <div>
      <h2>Transactions: (-1 means failed transaction)</h2>
      <ul>
        {transactions.map((transaction, index) => (
          <li key={index}>{transaction}</li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;
