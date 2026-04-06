import type { JSX } from "hono/jsx";
import type { IconNode } from "lucide";

type LucideIconProps = JSX.IntrinsicElements["span"] & {
  icon: IconNode;
  size?: number;
  strokeWidth?: number;
};

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
