/**
 * A CSS-only smoked atmosphere. Each oversized veil is a static rasterized
 * gradient; the slow drift begins after the drawer's opening spring and moves
 * only composited transforms. No canvas, WebGL context, or render loop is
 * created on the first pull.
 */
export function DrawerAtmosphere() {
  return (
    <div aria-hidden className="drawer-atmosphere">
      <span className="drawer-atmosphere__veil drawer-atmosphere__veil--near" />
      <span className="drawer-atmosphere__veil drawer-atmosphere__veil--far" />
    </div>
  );
}
