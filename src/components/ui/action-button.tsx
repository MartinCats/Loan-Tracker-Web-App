import Link from "next/link";

type ActionButtonProps = {
  children: React.ReactNode;
  href: string;
};

export function ActionButton({ children, href }: ActionButtonProps) {
  return (
    <Link className="action-button" href={href}>
      <span aria-hidden="true">+</span>
      {children}
    </Link>
  );
}
