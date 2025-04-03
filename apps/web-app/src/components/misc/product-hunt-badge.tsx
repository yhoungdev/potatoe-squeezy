import React from "react";

const ProductHuntBadge: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-2 text-white">
      <a
        href="https://www.producthunt.com/posts/potatoe-squeezy?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-potatoe&#0045;squeezy"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=949200&theme=light&t=1743691417631"
          alt="Potatoe Squeezy - Support GitHub contributors with crypto | Product Hunt"
          width="250"
          height="54"
          style={{ width: "250px", height: "54px" }}
        />
      </a>
    </div>
  );
};

export default ProductHuntBadge;
