export interface TemplateElement {
  id: string;
  kind: "text" | "image" | "link" | "button" | "section";
  text?: string;
  html?: string;
  tag: string;
  href?: string;
  src?: string;
  alt?: string;
  styles: {
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    backgroundImage?: string;
  };
  sectionIndex?: number;
}

export interface TemplateSection {
  id: string;
  tag: string;
  label: string;
  index: number;
}
