import Image from 'next/image';
import type { ReactNode } from 'react';

/** A static rendered figure in the same frame the interactive ones use. */
export function Fig({ label, title, src, alt, width, height, axis, caption }: {
  label: string; title: string; src: string; alt: string;
  width: number; height: number; axis?: string[]; caption: ReactNode;
}) {
  return (
    <figure className="fig">
      <div className="fig-head"><span className="fig-label">{label}</span><span className="fig-title">{title}</span></div>
      <div className="fig-plot">
        <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 720px) 100vw, 680px" />
      </div>
      {axis && (
        <div className="fig-axis">{axis.map((a) => <span key={a}>{a}</span>)}</div>
      )}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/** Numbered citation, jumping to the reference list. */
export function Cite({ n }: { n: number }) {
  return <sup className="cite"><a href={`#ref-${n}`}>[{n}]</a></sup>;
}

export const REFERENCES = [
  { authors: 'Jonathan Ho, Tim Salimans', title: 'Classifier-Free Diffusion Guidance', venue: 'NeurIPS 2021 Workshop on Deep Generative Models', arxiv: '2207.12598' },
  { authors: 'Yuchen Wu, Minshuo Chen, Zihao Li, Mengdi Wang, Yuting Wei', title: 'Theoretical Insights for Diffusion Guidance: A Case Study for Gaussian Mixture Models', venue: 'ICML 2024', arxiv: '2403.01639' },
  { authors: 'Gen Li, Yuchen Jiao', title: 'Provable Efficiency of Guidance in Diffusion Models for General Data Distribution', venue: '2025', arxiv: '2505.01382' },
  { authors: 'Tero Karras, Miika Aittala, Tuomas Kynkäänniemi, Jaakko Lehtinen, Timo Aila, Samuli Laine', title: 'Guiding a Diffusion Model with a Bad Version of Itself', venue: 'NeurIPS 2024', arxiv: '2406.02507' },
  { authors: 'Xiang Li, Rongrong Wang, Qing Qu', title: 'Towards Understanding the Mechanisms of Classifier-Free Guidance', venue: '2025', arxiv: '2505.19210' },
];

export function References({ heading }: { heading: string }) {
  return (
    <>
      <h2 className="refs-h">{heading}</h2>
      <ol className="refs">
        {REFERENCES.map((r, i) => (
          <li key={r.arxiv} id={`ref-${i + 1}`}>
            {r.authors}. <em>{r.title}.</em> {r.venue}.{' '}
            <a href={`https://arxiv.org/abs/${r.arxiv}`}>arXiv:{r.arxiv}</a>
          </li>
        ))}
      </ol>
    </>
  );
}
