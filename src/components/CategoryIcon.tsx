import {
  GiPrayer,
  GiConcentricCrescents,
  GiSamaraMosque,
  GiBlood,
  GiWheat,
  GiMeal,
} from "react-icons/gi";
import { FaScaleBalanced, FaMosque } from "react-icons/fa6";
import {
  MdElectricBolt,
  MdOutlineMosque,
  MdOutlineBloodtype,
} from "react-icons/md";
import { FaKaaba } from "react-icons/fa";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GiPrayer,
  GiMeal,
  FaKaaba,
  GiConcentricCrescents,
  GiSamaraMosque,
  GiBlood,
  GiWheat,
  FaScaleBalanced,
  FaMosque,
  MdElectricBolt,
  MdOutlineMosque,
  MdOutlineBloodtype,
};

type Props = {
  name: string;
  className?: string;
};

export function CategoryIcon({ name, className = "w-6 h-6" }: Props) {
  const Icon = iconMap[name];
  if (!Icon) return <span className={className} />;
  return <Icon className={className} />;
}
