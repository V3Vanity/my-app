import React from "react";
import "/src/components/RewardPage.css";

import rewardImage from "../assets/reward.png";

export default function RewardPage() {
  return (
    <div className="reward-page-container">
      <div className="reward-frame">
        <div className="reward-image-container">
          <img
            src={rewardImage}
            alt="Награда за прохождение квеста"
            className="reward-image"
          />
        </div>
      </div>
    </div>
  );
}
