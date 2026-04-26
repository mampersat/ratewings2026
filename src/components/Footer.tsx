export default function Footer() {
  const sha = process.env.NEXT_PUBLIC_COMMIT_SHA ?? "dev";
  return (
    <footer className="border-t border-gray-700 mt-8 py-4 text-center text-xs text-gray-500">
      RateWings · <span className="font-mono">{sha}</span>
    </footer>
  );
}
