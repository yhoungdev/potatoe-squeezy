import React from 'react';
import {DASHBOARDNAV} from "../../data/dashboardData.ts";
import useAuth from "../../hooks/useAuth.ts";
import '../../style/index.css'


function DashboardHeader() {
    const {session , user} = useAuth();
    const { user_metadata} = user;

    const { } = user_metadata || {}

   // if (!session) {
   //    if (typeof  window !== "undefined") {
   //        window.location.href = '/'
   //    }
   // }
    return (
        <div className={' w-full mx-auto flex items-center gap-2 justify-between'}>

            <div>
                <a href={'/app'}>
                    <h1 className="text-xl text-red-50">
                        <img src={'public/logo/logo.png'}
                             width={80} alt={'logo'}/>
                    </h1>
                </a>
            </div>

            <div>
                <div className={'bg-gray-500  w-10 h-10 rounded-full'}>

                </div>
            </div>

        </div>
    );
}

export default DashboardHeader;
