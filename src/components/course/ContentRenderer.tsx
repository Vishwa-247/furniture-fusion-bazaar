import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentRendererProps {
  content: string;
}

const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <Button
        onClick={handleCopy}
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-1" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </>
        )}
      </Button>
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          padding: '1rem',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export const ContentRenderer = ({ content }: ContentRendererProps) => {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const value = String(children).replace(/\n$/, '');
            const inline = !match;
            
            return !inline && match ? (
              <CodeBlock language={match[1]} value={value} />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          img({ src, alt }) {
            // Handle placeholder images
            if (src === 'placeholder') {
              return (
                <div className="my-6 p-8 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center text-center">
                  <div>
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-medium">{alt}</p>
                  </div>
                </div>
              );
            }
            return <img src={src} alt={alt} className="rounded-lg" />;
          },
          table({ children }) {
            return (
              <div className="my-6 overflow-x-auto">
                <table className="w-full border-collapse">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-border px-4 py-2">
                {children}
              </td>
            );
          },
          h1({ children }) {
            return <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>;
          },
          p({ children }) {
            return <p className="my-4 leading-7">{children}</p>;
          },
          ul({ children }) {
            return <ul className="my-4 ml-6 list-disc">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="my-4 ml-6 list-decimal">{children}</ol>;
          },
          li({ children }) {
            return <li className="my-2">{children}</li>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
