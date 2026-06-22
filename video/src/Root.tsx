import { Composition } from "remotion";
import { PromoComposition } from "./PromoComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PromoVideo"
        component={PromoComposition}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
