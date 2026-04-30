import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

const INSTALL_CODE = `# Install EnvGuard CLI globally
npm install -g envguard-tool

# Run commands
envguard login
envguard projects
envguard list
envguard pull`;


const COMMANDS = [
  { cmd: 'envguard login', desc: 'Authenticate with your EnvGuard account' },
  { cmd: 'envguard projects', desc: 'Select active project' },
  { cmd: 'envguard list', desc: 'List all secrets in project' },
  { cmd: 'envguard pull', desc: 'Download secrets to .env file' },
];

const TERMINAL_LINES = [
  { text: '$ envguard login', color: 'var(--accent3)' },
  { text: '  ✓ Logged in successfully', color: 'var(--accent3)' },
  { text: '$ envguard projects', color: 'var(--accent3)' },
  { text: '  ✓ Active project set', color: 'var(--accent3)' },
  { text: '$ envguard pull', color: 'var(--accent3)' },
  { text: '  ↓ Pulling secrets...', color: 'var(--muted)' },
  { text: '  ✓ PORT', color: 'var(--accent)' },
  { text: '  ✓ CLIENT_URL', color: 'var(--accent)' },
  { text: '  ✓ JWT_SECRET', color: 'var(--accent)' },
  { text: '  ✓ 8 secrets written to .env', color: 'var(--accent3)' },
];

export default function CLI() {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const copy = async (text, setter) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 1500);
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>CLI Tool</h1>
          <span className="badge badge-warn">Live</span>
        </div>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Command line interface for managing secrets in CI/CD pipelines and local development</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Installation */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Installation</h2>
              <button className="btn-icon accent" onClick={() => copy(INSTALL_CODE, setCopiedInstall)}>
                {copiedInstall ? <Check size={14} style={{ color: 'var(--accent3)' }} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="code-block">{INSTALL_CODE}</div>
          </div>

          {/* Commands */}
          <div className="card">
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Commands Reference</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {COMMANDS.map(({ cmd, desc }) => (
                <div key={cmd} style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                  <code className="mono" style={{ fontSize: 12, color: 'var(--accent)', flexShrink: 0, minWidth: 260 }}>{cmd}</code>
                  <span style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.4 }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

        
        </div>

        {/* Right — Terminal preview */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div className="terminal">
            <div className="terminal-bar">
              <div className="terminal-dot" style={{ background: '#ff5f57' }} />
              <div className="terminal-dot" style={{ background: '#febc2e' }} />
              <div className="terminal-dot" style={{ background: '#28c840' }} />
              <span style={{ marginLeft: 8, fontSize: 12, color: '#888', fontFamily: 'var(--font-mono)' }}>envguard  terminal</span>
            </div>
            <div className="terminal-body">
              {TERMINAL_LINES.map((line, i) => (
                <div key={i} style={{ color: line.color, animationDelay: `${i * 80}ms` }} className="animate-fade-up">
                  {line.text}
                </div>
              ))}
              <div style={{ marginTop: 4 }}>
                <span style={{ color: 'var(--accent3)' }}>$ </span>
                <span className="cursor" />
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}
