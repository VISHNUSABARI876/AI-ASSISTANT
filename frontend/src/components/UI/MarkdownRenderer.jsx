import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
// Only register the most common languages (keeps bundle small)
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript'
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript'
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python'
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql'
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css'
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml'
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java'
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp'
import { Copy, Check } from 'lucide-react'

SyntaxHighlighter.registerLanguage('javascript', js)
SyntaxHighlighter.registerLanguage('js', js)
SyntaxHighlighter.registerLanguage('typescript', ts)
SyntaxHighlighter.registerLanguage('ts', ts)
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('py', python)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('sh', bash)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('css', css)
SyntaxHighlighter.registerLanguage('html', xml)
SyntaxHighlighter.registerLanguage('xml', xml)
SyntaxHighlighter.registerLanguage('java', java)
SyntaxHighlighter.registerLanguage('cpp', cpp)
SyntaxHighlighter.registerLanguage('c', cpp)

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-white/10 shadow-glow">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-slate-300 text-xs font-mono border-b border-white/10">
        <span className="uppercase font-bold tracking-wider text-primary-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax Highlighted Code */}
      <SyntaxHighlighter
        language={language || 'text'}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.82rem',
          lineHeight: '1.6',
          backgroundColor: '#050816',
        }}
        showLineNumbers={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const codeString = String(children).replace(/\n$/, '')

          if (!inline && (match || codeString.includes('\n'))) {
            return (
              <CodeBlock
                language={match ? match[1] : ''}
                code={codeString}
              />
            )
          }

          return (
            <code
              className="bg-slate-800 text-rose-300 px-1.5 py-0.5 rounded text-[0.85em] font-mono font-medium border border-white/10"
              {...props}
            >
              {children}
            </code>
          )
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0 leading-relaxed text-slate-200">{children}</p>
        },
        strong({ children }) {
          return <strong className="font-semibold text-white">{children}</strong>
        },
        em({ children }) {
          return <em className="italic text-slate-300">{children}</em>
        },
        ul({ children }) {
          return <ul className="list-disc list-inside mb-2 space-y-1 pl-1 text-slate-200">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-2 space-y-1 pl-1 text-slate-200">{children}</ol>
        },
        li({ children }) {
          return <li className="text-sm leading-normal text-slate-200">{children}</li>
        },
        h1({ children }) {
          return (
            <h1 className="text-lg font-bold mb-2 mt-3 text-white border-b pb-1 border-white/10">
              {children}
            </h1>
          )
        },
        h2({ children }) {
          return <h2 className="text-base font-bold mb-1.5 mt-2.5 text-white">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-sm font-semibold mb-1 mt-2 text-white">{children}</h3>
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-primary-500 pl-3 py-1 my-2 bg-primary-950/20 text-slate-300 italic text-sm rounded-r">
              {children}
            </blockquote>
          )
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3 rounded-xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-xs">
                {children}
              </table>
            </div>
          )
        },
        thead({ children }) {
          return <thead className="bg-slate-800/80 font-semibold">{children}</thead>
        },
        th({ children }) {
          return <th className="px-3 py-2 text-left text-primary-300">{children}</th>
        },
        td({ children }) {
          return (
            <td className="px-3 py-2 border-t border-white/10 text-slate-300">{children}</td>
          )
        },
        a({ children, href }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
