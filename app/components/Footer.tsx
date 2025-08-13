"use client";

export function Footer() {
  return (
    <footer className="text-center py-8">
      <p className="text-white/40 text-sm">
        Created by{" "}
        <a
          href="https://x.com/azacharyf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 hover:text-white transition-colors underline"
        >
          @azacharyf
        </a>
        {" • "}
        <a
          href="https://github.com/azf20/zory"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 hover:text-white transition-colors underline"
        >
          Source code
        </a>
        {" • "}
        <a
          href="https://buidlguidl.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 hover:text-white transition-colors underline"
        >
          BuidlGuidl
        </a>
      </p>
    </footer>
  );
}
