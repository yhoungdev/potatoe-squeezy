import React from "react";
import { useState } from "react";
import Button from "../../button";

interface IUserProfile {
  id?: number;
  name?: string;
}

function UserProfileCard({ id, name }: IUserProfile) {
  const [quantity, setQuantity] = useState<number>(0);
  const predefinedAmount = [5, 10, 15, 20];
  return (
    <div className={"flex gap-4   justify-center flex-col lg:flex-row"}>
      <div
        className={
          " h-fit text-center w-full justify-center lg:w-[300px] rounded-xl px-4 py-4"
        }
      >
        <div className={"bg-gray-900 w-20 mx-auto h-20 rounded-xl"}></div>
        <div>
          <h2 className={"text-center font-semibold"}>Emmanuel Obiabo</h2>
          <small className={"text-gray-600"}>@yhoungdev</small>
        </div>

        <Button variant={'default'}>Github Profile</Button>
      </div>

      <div
        className={`bg-gray-900
                    w-full lg:w-[450px] rounded-xl px-4 py-4`}
      >
        <div className=" py-4">
          <h2 className={"text-center font-semibold"}>Select amount to zap</h2>

          <div className={"flex mx-4 items-center gap-4  my-4 justify-evenly"}>
            {predefinedAmount.map((amount) => {
              const isSelected = amount === quantity;

              return (
                <div
                  className={`bg-gray-600 cursor-pointer
                                 rounded-xl w-10 h-10 
                                  flex items-center justify-center
                                  border-[1px] border-white/20 ${
                                    isSelected && "bg-red-700"
                                  }`}
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

          <div>
              <textarea
                  placeholder={'Hey i just squashed potatoe to sol, enjoy'}
                  className={`w-full p-2 text-sm bg-transparent border-2 border-white/20 rounded-xl`}/>
          </div>

        <Button variant={"danger"} className={"w-full"}>
          Zap
        </Button>
      </div>
    </div>
  );
}

export default UserProfileCard;
