import { createFileRoute } from "@tanstack/react-router";
import { EditorApp } from "@/editor/EditorApp";
import { Toaster } from "sonner";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <>
      <EditorApp />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          className: "bg-surface text-fg border-border",
        }}
      />
    </>
  );
}
