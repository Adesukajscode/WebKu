import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { CopyIcon, CheckIcon } from "./Icons";

export default function ChatMessage({ message, index }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.15) }}
      className={`group flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div className={`flex max-w-[85%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-br-md shadow-blue-500/20"
              : "glass-strong text-slate-800 dark:text-slate-100 rounded-bl-md border border-blue-100/70 dark:border-blue-900/40"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                  a: ({ children, href }) => (
                    <a href={href} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline underline-offset-2">
                      {children}
                    </a>
                  ),
                  code: ({ inline, children }) =>
                    inline ? (
                      <code className="bg-blue-100/70 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg my-2 overflow-x-auto text-xs border border-blue-900/50">
                        <code>{children}</code>
                      </pre>
                    ),
                  ul: ({ children }) => <ul className="list-disc pl-4 my-1.5 space-y-0.5">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 my-1.5 space-y-0.5">{children}</ol>,
                  h1: ({ children }) => <h1 className="text-base font-bold my-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold my-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold my-1.5">{children}</h3>,
                }}
              >
                {message.content}
              </ReactMarkdown>
              {message.streaming && (
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-500 animate-blink align-middle rounded-sm" />
              )}
            </div>
          )}
        </div>

        {!isUser && message.content && !message.streaming && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleCopy}
            className="mt-1 ml-1 text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
          >
            {copied ? (
              <>
                <CheckIcon size={12} />
                Tersalin
              </>
            ) : (
              <>
                <CopyIcon size={12} />
                Salin
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
