import cn from 'clsx'
import { Image } from 'components/image'
import s from './composable-image.module.scss'

export function ComposableImage({
  sources,
  width = 684,
  height = 403,
  large = false,
  small = false,
}) {
  const amount = sources.items.length
  return (
    <div className={s.images}>
      {sources.items.map((source) => (
        <Image
          key={source.url}
          src={source.url}
          alt={source.title}
          width={width / amount}
          height={height}
          className={cn(s.image, large && s.large, small && s.small)}
          style={{ '--height': height, '--width': width / amount }}
        />
      ))}
    </div>
  )
}
