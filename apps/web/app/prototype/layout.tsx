/* eslint-disable @next/next/no-page-custom-font */
import "./prototype.css";

export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=42dot+Sans:wght@300;400;600;700;800&display=swap"
      />
      <link rel="stylesheet" href="https://use.typekit.net/usz6qzd.css" />
      <div className="prototype-root">{children}</div>
    </>
  );
}
