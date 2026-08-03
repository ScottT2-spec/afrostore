import type { EditorNode } from "@/lib/visual-editor/node-tree";

export const PERFUMES_JOURNAL_PRESET: EditorNode[] = [
  {
    id: "perfumes-journal-hero",
    type: "perfumesPageHero",
    settings: {
      title: "Journal",
    },
  },
  {
    id: "perfumes-journal-grid",
    type: "perfumesJournalGrid",
    settings: {
      columns: 3,
    },
  },
];
