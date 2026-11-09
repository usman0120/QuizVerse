import { StorageControls } from "@/components/storage-controls";
export const metadata = { title: "Cookies & Storage" };
export default function Page() {
  return (
    <div className="page max-w-4xl">
      <h1 className="section-title mb-8">Cookies & Storage</h1>
      <StorageControls />
    </div>
  );
}
