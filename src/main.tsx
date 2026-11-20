import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function DiagnosticScreen({ error }: { error: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: '#f8fafc',
        padding: '24px',
        fontFamily: 'system-ui, sans-serif',
        overflowWrap: 'anywhere',
      }}
    >
      <h1 style={{ color: '#f87171' }}>SILENT THOUGHTS ERROR</h1>
      <p>The application encountered an error.</p>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          background: '#1e293b',
          padding: '16px',
          borderRadius: '12px',
          color: '#fca5a5',
        }}
      >
        {error}
      </pre>
      <p>Please send a screenshot of this error.</p>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      error:
        error instanceof Error
          ? `${error.name}: ${error.message}\n\n${error.stack ?? ''}`
          : String(error),
    };
  }

  componentDidCatch(error: unknown) {
    console.error('React rendering error:', error);
  }

  render() {
    if (this.state.error) {
      return <DiagnosticScreen error={this.state.error} />;
    }

    return this.props.children;
  }
}

window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = '';
  const container = document.createElement('div');
  container.style.cssText =
    'min-height:100vh;background:#0f172a;color:white;padding:24px;font-family:system-ui;overflow-wrap:anywhere;';

  const heading = document.createElement('h1');
  heading.style.color = '#f87171';
  heading.textContent = 'JAVASCRIPT ERROR';

  const message = document.createElement('pre');
  message.style.cssText =
    'white-space:pre-wrap;background:#1e293b;padding:16px;border-radius:12px;color:#fca5a5;';
  message.textContent =
    `${event.message}\nFile: ${event.filename}\nLine: ${event.lineno}\nColumn: ${event.colno}`;

  container.append(heading, message);
  root.appendChild(container);
});

window.addEventListener('unhandledrejection', (event) => {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = '';
  const container = document.createElement('div');
  container.style.cssText =
    'min-height:100vh;background:#0f172a;color:white;padding:24px;font-family:system-ui;overflow-wrap:anywhere;';

  const heading = document.createElement('h1');
  heading.style.color = '#f87171';
  heading.textContent = 'ASYNC ERROR';

  const message = document.createElement('pre');
  message.style.cssText =
    'white-space:pre-wrap;background:#1e293b;padding:16px;border-radius:12px;color:#fca5a5;';
  message.textContent = String(event.reason?.stack ?? event.reason);

  container.append(heading, message);
  root.appendChild(container);
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML =
    '<h1 style="color:red;padding:20px">FATAL: Root element #root not found.</h1>';
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (error) {
    rootElement.innerHTML = '';
    const message = document.createElement('pre');
    message.style.cssText =
      'white-space:pre-wrap;background:#0f172a;color:#fca5a5;padding:24px;';
    message.textContent = error instanceof Error ? error.stack ?? error.message : String(error);
    rootElement.appendChild(message);
  }
}

console.log('SILENT THOUGHTS diagnostic entry loaded.');
