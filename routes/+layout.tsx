export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav>My App</nav>
      {children}
    </>
  );
}
