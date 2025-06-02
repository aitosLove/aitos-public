"use client";

import { cn } from "@/app/chat/(chat)/lib/utils";
import "katex/dist/katex.min.css";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Citing } from "./custom-link";
import { CodeBlock } from "@/components/ui/codeblock";
import { MemoizedReactMarkdown } from "@/components//ui/markdown";
import React from "react";

export function BotMessage({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  // Check if the content contains LaTeX patterns
  const containsLaTeX = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/.test(
    message || ""
  );

  // Modify the content to render LaTeX equations if LaTeX patterns are found
  const processedData = preprocessLaTeX(message || "");

  if (containsLaTeX) {
    return (
      <MemoizedReactMarkdown
        rehypePlugins={[
          [rehypeExternalLinks, { target: "_blank" }],
          [rehypeKatex],
        ]}
        remarkPlugins={[remarkGfm, remarkMath]}
        className={cn(
          "prose-sm prose-neutral prose-a:text-accent-foreground/50",
          className
        )}
      >
        {processedData}
      </MemoizedReactMarkdown>
    );
  }

  return (
    <MemoizedReactMarkdown
      rehypePlugins={[[rehypeExternalLinks, { target: "_blank" }]]}
      remarkPlugins={[remarkGfm]}
      className={cn(
        "prose-sm prose-neutral prose-a:text-accent-foreground/50",
        className
      )}
      components={{
        code({ node, className, children, ...props }) {
          if (!node) {
            return null;
          }

          // 判断是否为行内代码
          const isInline =
            node.tagName === "code" &&
            node.position?.start.line === node.position?.end.line;

          // 将 children 转换为字符串
          const codeString = React.Children.toArray(children).join("");

          // 处理特殊字符 '▍'
          if (codeString.includes("▍")) {
            if (codeString.trim() === "▍") {
              return (
                <span className="mt-1 cursor-default animate-pulse">▍</span>
              );
            }
            const replacedString = codeString.replace(/`▍`/g, "▍");
            return (
              <code className={className} {...props}>
                {replacedString}
              </code>
            );
          }

          const match = /language-(\w+)/.exec(className || "");

          if (isInline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }

          return (
            <CodeBlock
              key={Math.random()}
              language={(match && match[1]) || ""}
              value={String(children).replace(/\n$/, "")}
              {...props}
            />
          );
        },
        a: Citing,
      }}
    >
      {message}
    </MemoizedReactMarkdown>
  );
}

// Preprocess LaTeX equations to be rendered by KaTeX
// ref: https://github.com/remarkjs/react-markdown/issues/785
const preprocessLaTeX = (content: string) => {
  const blockProcessedContent = content.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, equation) => `$$${equation}$$`
  );
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_, equation) => `$${equation}$`
  );
  return inlineProcessedContent;
};
