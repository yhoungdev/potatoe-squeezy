import { createFileRoute } from "@tanstack/react-router";
import Homepage from "@/components/pages/homepage";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { useProfile } from "@/hooks/useProfile";
import ProductHuntBadge from "@/components/misc/product-hunt-badge";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: search.token as string | undefined,
    };
  },
  component: IndexRoute,
});

function IndexRoute() {
  const { token } = Route.useSearch();
  useProfile();

  useEffect(() => {
    if (token) {
      Cookies.set("auth-token", token, {
        secure: true,
        sameSite: "lax",
        expires: 7,
      });
    }
  }, [token]);

  return (
      <>
        <Homepage/>
        <ProductHuntBadge/>
        <a href='https://www.sideprojectors.com/project/56365/potatoe-squeezy'
           title='Potatoe Squeezy is for sale at @SideProjectors'>
          {/* <img
            style={{position: 'fixed', zIndex: 1000, top: '-5px', right: '20px', border: 0}}
            src='https://www.sideprojectors.com/img/badges/badge_2_red.png'
            alt='Potatoe Squeezy is for sale at @SideProjectors'
          /> */}
        </a>
        <div  className={'text-center  lg:w-[40%]  text-gray-500 mt-4  text-sm mx-auto'}>
          I would love to keep Potatoe in good hands, so I am offering to sell it.{' '}
          <a 
            href="https://x.com/obiabo_immanuel" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{color: '#1DA1F2', textDecoration: 'none'}}
          >
            @obiabo_immanuel
          </a>
        </div>
      </>
  );
}
