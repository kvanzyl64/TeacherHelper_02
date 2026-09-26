# Navigation icons

`Icon` renders a symbol from `/images/line-art/icons.svg`.

Use an icon without `label` when nearby visible text already communicates its meaning. The
component marks that usage as decorative with `aria-hidden`. Pass a concise `label` when the icon
is the only meaningful content, such as an icon-only button; the wrapper then exposes an accessible
name and uses `role="img"`.

Icons support visual context only. Status, permission, and action meaning must also be expressed in
text or an accessible name, and controls using unfamiliar symbols should provide a tooltip.