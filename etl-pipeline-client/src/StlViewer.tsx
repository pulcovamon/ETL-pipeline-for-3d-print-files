import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FC, SetStateAction, useEffect, useState } from "react";
import { BufferGeometry, NormalBufferAttributes } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { Html, useProgress } from "@react-three/drei";

interface Props {
  fileUrl: string;
}

const Loader = () => {
  const { progress } = useProgress();
  return <Html center>Loading... {Math.round(progress)}%</Html>;
};

const STLViewer: FC<Props> = ({ fileUrl }) => {
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stlLoader = new STLLoader();
    stlLoader.load(
      fileUrl,
      (geo: SetStateAction<BufferGeometry<NormalBufferAttributes> | null>) => {
        setGeometry(geo);
        setLoading(false);
      },
      undefined,
      () => {
        setLoading(false);
      }
    );
  }, [fileUrl]);

  return (
    <Canvas style={{ width: "600px", height: "600px" }} camera={{ position: [0, 0, 10] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <OrbitControls />

      {loading ? <Loader /> : geometry && (
        <mesh geometry={geometry}>
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      )}
    </Canvas>
  );
};

export default STLViewer;
