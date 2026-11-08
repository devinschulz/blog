import * as React from 'react';
import { useEffect, useState } from 'react';
import { mountReactDemo } from './mount-react-demo';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Streamdown, type Components } from 'streamdown';

const examples = {
  Bold: 'A response with **incomplete formatting** becomes readable as it arrives.',
  Link: 'Read [the documentation](https://example.com/docs) for the complete example.',
  Table: '| Name | Value |\n| --- | --- |\n| Chunks | 12 |\n| Complete | Yes |',
  Code: '```typescript\nconst greet = (name: string) => {\n  return `Hello, ${name}`;\n};\n```',
  Lists:
    '- First item\n  - Nested item\n  - Another **nested item**\n- Last item',
  Document:
    Array.from(
      { length: 12 },
      (_, i) =>
        `## Section ${i + 1}\n\nA paragraph with **bold text** and a [reference][docs].\n\n`,
    ).join('') + '[docs]: https://example.com/docs',
};
const plugins = [remarkGfm];
// Share presentation so only parsing behaviour differs between panels.
const components: Components = {
  table: ({ children }) => <table>{children}</table>,
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children, style }) => <th style={style}>{children}</th>,
  td: ({ children, style }) => <td style={style}>{children}</td>,
  ul: ({ children }) => <ul>{children}</ul>,
  ol: ({ children }) => <ol>{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  h2: ({ children }) => <h2>{children}</h2>,
  p: ({ children }) => <p>{children}</p>,
  pre: ({ children }) => <pre>{children}</pre>,
  code: ({ children, className }) => (
    <code className={className}>{children}</code>
  ),
};
function Playground() {
  const [example, setExample] = useState<keyof typeof examples>('Bold');
  const [position, setPosition] = useState(0);
  const [chunk, setChunk] = useState(4);
  const [delay, setDelay] = useState(100);
  const [playing, setPlaying] = useState(false);
  const source = examples[example];
  const content = source.slice(0, position);
  useEffect(() => {
    if (!playing) return;
    if (position >= source.length) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(
      () => setPosition((p) => Math.min(p + chunk, source.length)),
      delay,
    );
    return () => window.clearTimeout(timer);
  }, [playing, position, chunk, delay, source]);
  return (
    <section
      className="streaming-demo"
      aria-label="Streaming Markdown playground"
    >
      <div className="streaming-controls">
        <label>
          Example{' '}
          <select
            aria-label="Example"
            value={example}
            onChange={(e) => {
              setPlaying(false);
              setPosition(0);
              setExample(e.target.value as keyof typeof examples);
            }}
          >
            {Object.keys(examples).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <label>
          Chunk size{' '}
          <select
            aria-label="Chunk size"
            value={chunk}
            onChange={(e) => setChunk(Number(e.target.value))}
          >
            {[1, 4, 10, 30].map((n) => (
              <option key={n} value={n}>
                {n} characters
              </option>
            ))}
          </select>
        </label>
        <label>
          Interval{' '}
          <select
            aria-label="Interval"
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
          >
            {[30, 100, 300].map((n) => (
              <option key={n} value={n}>
                {n} ms
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            if (position >= source.length) setPosition(0);
            setPlaying(!playing);
          }}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          disabled={position >= source.length}
          onClick={() => {
            setPlaying(false);
            setPosition((p) => Math.min(p + chunk, source.length));
          }}
        >
          Next chunk
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            setPosition(0);
          }}
        >
          Reset
        </button>
      </div>
      <label className="streaming-progress">
        Stream position: {position} / {source.length} characters
        <input
          aria-label="Stream position"
          type="range"
          min="0"
          max={source.length}
          value={position}
          onChange={(e) => {
            setPlaying(false);
            setPosition(Number(e.target.value));
          }}
        />
      </label>
      <p role="status">
        {playing
          ? 'Playing'
          : position === source.length
            ? 'Complete'
            : 'Paused'}
      </p>
      <details open>
        <summary>Incoming Markdown</summary>
        <pre className="streaming-source">
          <code>{content || 'Waiting for the first chunk…'}</code>
        </pre>
      </details>
      <div className="streaming-previews">
        <section>
          <h3>react-markdown</h3>
          <div className="streaming-output">
            <Markdown remarkPlugins={plugins} components={components} skipHtml>
              {content}
            </Markdown>
          </div>
        </section>
        <section>
          <h3>Streamdown</h3>
          <div className="streaming-output">
            <Streamdown
              components={components}
              isAnimating={position < source.length}
              controls={false}
              skipHtml
            >
              {content}
            </Streamdown>
          </div>
        </section>
      </div>
      <p>
        Both previews receive the same source. Playback is simulated locally; no
        requests are sent to an AI service.
      </p>
    </section>
  );
}
mountReactDemo('[data-streaming-markdown-root]', (root) => {
  root.render(<Playground />);
});
