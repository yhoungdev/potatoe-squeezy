import React from "react";
import { useState } from "react";
import Button from "../../button";

function UserProfileCard(props) {
  const [quantity, setQuantity] = useState(null);
  const predefinedAmount = [5, 10, 15, 20];

  return (
    <div
      className={"flex items-center gap-4  justify-center flex-col lg:flex-row"}
    >
      <div
        className={
          "bg-gray-800 w-full justify-center lg:w-[300px] rounded-xl px-4 py-4"
        }
      >
        <h2 className={"text-center font-semibold"}>Zap Obiabo</h2>
      </div>

      <div
        className={`bg-gray-900
                    w-full lg:w-[450px] rounded-xl px-4 py-4`}
      >
        <h2>Zap Obiabo</h2>

        <div className=" py-4">
          <h2>Select amount to zap</h2>

          <div className={"flex mx-4 items-center gap-4  my-4 justify-evenly"}>
            {predefinedAmount.map((amount) => {
              return (
                <div
                  className={`bg-gray-600 cursor-pointer
                                 rounded-full w-10 h-10  flex items-center justify-center`}
                  key={amount}
                  onClick={() => {
                    setQuantity(amount);
                  }}
                >
                  {amount}
                </div>
              );
            })}
          </div>
        </div>

        <Button variant={"default"} className={"w-full"}>
          Zap
        </Button>
      </div>
    </div>
  );
}

export default UserProfileCard;
