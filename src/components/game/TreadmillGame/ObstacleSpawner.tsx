import type { ObstacleData } from "./Game";
import Obstacle from "./Obstacle";

interface Props {
  obstacles: ObstacleData[];
}

export default function ObstacleSpawner({ obstacles }: Props) {
  return (
    <>
      {obstacles.map((obs) => (
        <Obstacle key={obs.id} data={obs} />
      ))}
    </>
  );
}
