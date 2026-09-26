import { tuning } from '../../tuning'

interface Props {
  // Reduced motion: the ink keeps its hand-drawn wobble but stops boiling.
  still: boolean
}

// The shared SVG filters, mounted once for the whole page (design §3 Texture, §4 Line boil).
// - #ink-boil: the outlines jitter a few times a second, like hand-drawn animation. A turbulence
//   field displaces the drawing; SMIL steps its seed. With reduced motion the seed stays put.
// - #paper-cut: the cat's paper cut-out. It grows a rough margin of paper around the drawing and
//   drops a soft shadow on the page, so a black cat reads on a black night.
// - #paper-edge: a wobbly, hand-drawn edge for cards and boxes.
export function InkDefs({ still }: Props) {
  const { boil, paperCut, paperEdge } = tuning.ink
  const seeds = Array.from({ length: boil.seeds }, (_, i) => i).join(';')
  return (
    <svg className="ink-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <filter id="ink-boil" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency={boil.frequency} numOctaves={boil.octaves} seed={0} result="noise">
            {!still && (
              <animate
                attributeName="seed"
                values={seeds}
                dur={`${boil.seeds / boil.fps}s`}
                calcMode="discrete"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={boil.scale} xChannelSelector="R" yChannelSelector="G" />
        </filter>

        <filter id="paper-cut" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius={paperCut.radius} result="grown" />
          <feTurbulence type="fractalNoise" baseFrequency={paperCut.roughness} numOctaves={2} seed={7} result="grain" />
          <feDisplacementMap in="grown" in2="grain" scale={paperCut.roughScale} xChannelSelector="R" yChannelSelector="G" result="cut" />
          <feFlood className="ink-paper-flood" result="paperColor" />
          <feComposite in="paperColor" in2="cut" operator="in" result="paper" />
          <feGaussianBlur in="cut" stdDeviation={paperCut.shadow.blur} result="soft" />
          <feOffset in="soft" dx={paperCut.shadow.dx} dy={paperCut.shadow.dy} result="drop" />
          <feFlood className="ink-shadow-flood" floodOpacity={paperCut.shadow.opacity} result="shadowColor" />
          <feComposite in="shadowColor" in2="drop" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="paper" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="paper-edge" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency={paperEdge.frequency} numOctaves={paperEdge.octaves} seed={3} result="wobble" />
          <feDisplacementMap in="SourceGraphic" in2="wobble" scale={paperEdge.scale} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}
