export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4">
      <h1 className="mb-2 text-2xl font-bold text-navy">User not found</h1>
      <p className="text-slate-600">
        This link doesn&apos;t match a valid H2Know bottle ID.
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Valid format: H2KNOW-102, H2KNOW-103, etc.
      </p>
    </div>
  );
}
