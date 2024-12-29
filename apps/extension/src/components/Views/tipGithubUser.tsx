import React, { useState } from "react";
import { defaultAxios } from "../../../../../config/axios";

const TipGithubUser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const handleCustomAmountChange = (e) => {
    setCustomAmount(e.target.value);
  };

  const handleConfirm = () => {
    if (customAmount) {
      alert(`You are tipping $${customAmount}!`);
    } else {
      alert("Please select an amount to tip!");
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        style={{
          padding: "5px 16px",
          margin: "0.5rem",
          backgroundColor: "#212830",
          color: "#F0F6FC",
          borderRadius: "10px",
          width: "97%",
          cursor: "pointer",
          border: ".5px solid #80808054",
        }}
        onClick={() => setIsOpen(true)}
      >
        🍟 Zap User ⚡
      </button>

      {isOpen && (
        <div
          style={{
            background: "rgba(0, 0, 0, 0.7)",
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "999",
          }}
        >
          <div
            style={{
              background: "#212830",
              borderRadius: "12px",
              padding: "1.5rem",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#F0F6FC",
                marginBottom: "1rem",
              }}
            >
              Select Amount
            </h3>
            <p
              style={{
                fontSize: "1rem",
                color: "#ADB5BD",
                marginBottom: "1.5rem",
              }}
            >
              Choose the amount to tip the GitHub user.
            </p>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {[1, 5, 10].map((amount) => (
                <button
                  key={amount}
                  style={{
                    padding: "0.6rem 1.2rem",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: "orange",
                    color: "#F0F6FC",
                    transition: "background-color 0.2s ease-in-out",
                  }}
                  onClick={() => setCustomAmount(amount)}
                >
                  ${amount}
                </button>
              ))}
            </div>

            <input
              type="number"
              placeholder="Enter custom amount"
              value={customAmount}
              onChange={handleCustomAmountChange}
              style={{
                width: "100%",
                padding: "0.6rem",
                marginBottom: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #ADB5BD",
                backgroundColor: "#212830",
                color: "#F0F6FC",
                fontSize: "1rem",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.5rem",
              }}
            >
              <button
                style={{
                  padding: "0.6rem 1.2rem",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: "#ADB5BD",
                  color: "#212830",
                  transition: "background-color 0.2s ease-in-out",
                }}
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "0.6rem 1.2rem",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: "orange",
                  color: "#F0F6FC",
                  transition: "background-color 0.2s ease-in-out",
                }}
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TipGithubUser;
