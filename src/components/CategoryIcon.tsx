import {
  GiPrayer, GiConcentricCrescents, GiSamaraMosque,
  GiBlood, GiWheat,
} from 'react-icons/gi'
import { FaScaleBalanced } from 'react-icons/fa6'
import { MdElectricBolt } from 'react-icons/md'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GiPrayer,
  GiConcentricCrescents,
  GiSamaraMosque,
  GiBlood,
  GiWheat,
  FaScaleBalanced,
  MdElectricBolt,
}

type Props = {
  name: string
  className?: string
}

export function CategoryIcon({ name, className = 'w-6 h-6' }: Props) {
  const Icon = iconMap[name]
  if (!Icon) return <span className={className} />
  return <Icon className={className} />
}
