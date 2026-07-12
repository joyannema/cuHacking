"use client";

import StreamScreen from "@/components/screens/StreamScreen";
import { SEED_NOTES } from "@/lib/data";

export default function Preview() {
  return (
    <div style={{ height: "100vh", width: "420px" }}>
      <StreamScreen
        notes={SEED_NOTES}
        topFolders={[]}
        showViewAll={false}
        onOpenNote={() => {}}
        onOpenCategory={() => {}}
        onGoCabinet={() => {}}
      />
    </div>
  );
}
