import React from "react";

const ProductHuntCard: React.FC = () => {
  return (
    <div className="flex justify-center py-4">
      <iframe
        style={{ border: "none" }}
        src="https://cards.producthunt.com/cards/posts/949200?v=1"
        width="500"
        height="405"
        frameBorder="0"
        scrolling="no"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default ProductHuntCard;
