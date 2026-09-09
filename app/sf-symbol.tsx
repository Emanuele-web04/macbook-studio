type SymbolName =
  | 'info.circle'
  | 'arrow.up.left.and.arrow.down.right'
  | 'arrow.down.right.and.arrow.up.left'
  | 'view.3d'
  | 'rotate.3d'
  | 'laptopcomputer'
  | 'minus'
  | 'plus'
  | 'arrow.counterclockwise';

// Apple artwork is licensed separately; see assets/sf-symbols/NOTICE.md.
export function SfSymbol({ name, size = 20 }: { name: SymbolName; size?: number }) {
  const mask = `url("/symbols/${name}.svg") center / contain no-repeat`;
  return <span aria-hidden="true" style={{
    display: 'inline-block',
    width: size,
    height: size,
    flexShrink: 0,
    backgroundColor: 'currentColor',
    mask,
    WebkitMask: mask,
  }}/>;
}
