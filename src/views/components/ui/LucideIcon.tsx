import type { JSX } from "hono/jsx";
import type { IconNode } from "lucide";

export type LucideIconProps = JSX.IntrinsicElements["span"] & {
  icon: IconNode;
  size?: number;
  strokeWidth?: number;
};

/**
 * Renders a Lucide icon as an inline SVG element.
 * @param props - The properties for the LucideIcon component, including:
 *   - icon: The IconNode data representing the Lucide icon to render.
 *   - size: Optional size of the icon in pixels (default is 20).
 *   - strokeWidth: Optional stroke width for the SVG paths (default is 2).
 *   - ...props: Additional HTML attributes to apply to the container span element.
 * @returns A JSX element containing the rendered SVG icon.
 * @example
 * import { BookKey } from "lucide";
 *
 * <LucideIcon icon={BookKey} size={24} strokeWidth={1.5} class="text-blue-500" />
 */
export function LucideIcon({ icon, size = 20, strokeWidth = 2, ...props }: LucideIconProps) {
  return (
    <span {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        {renderIconNode(icon)}
      </svg>
    </span>
  );
}

function renderIconNode(node: IconNode) {
  return node.map(([tag, attrs]) => {
    const Tag = tag as keyof JSX.IntrinsicElements;
    return <Tag {...attrs} />;
  });
}
