import React from "react";

const ProductHuntBadge: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-2 text-white lg:flex-row">
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
      <a
        href="https://www.producthunt.com/posts/potatoe-squeezy?embed=true&utm_source=badge-top-post-topic-badge&utm_medium=badge&utm_souce=badge-potatoe&#0045;squeezy"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/top-post-topic-badge.svg?post_id=949200&theme=light&period=weekly&topic_id=501&t=1744078440770"
          alt="Potatoe&#0032;Squeezy - Support&#0032;github&#0032;contributors&#0032;with&#0032;crypto&#0032; | Product Hunt"
          style={{ width: "250px", height: "54px" }}
          width="250"
          height="54"
        />
      </a>
    </div>
  );
};

export default ProductHuntBadge;
