"use client"
import MarkdownPreview from "@uiw/react-markdown-preview";
import { cairo } from "~/styles/fonts";

type MarkdownView = {
  source: string,
  className?: string
}
export const MarkdownView = (props: MarkdownView) => {
  const { source, className } = props;
  return (
    <MarkdownPreview
      source={source}
      style={{ backgroundColor: "transparent", color: "white" }}
      className={`${cairo.className} ${className ?? ''}`}
    />
  )
}