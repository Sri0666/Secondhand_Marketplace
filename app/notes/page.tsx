const notes = [
  ["What I built", "An early ReCircuit marketplace scaffold with responsive browsing, seeded listings, product pages, and backend search/Q&A routes."],
  ["Who it is for", "Buyers who are comfortable choosing between fully working devices, minor-fault listings, repair projects, and parts."],
  ["Seeded and simulated elements", "All catalogue items, prices, images, and testing notes are fictional development data."],
  ["AI coding tools used", "Editable placeholder: document the coding tools used for this assessment here."],
  ["Models powering search and Q&A", "The server-side integration hook targets the CognitioLabs OpenAI-compatible gateway. Model behaviour is not implemented in this scaffold."],
  ["What I chose not to build", "Authentication, payments, a database, vector search, and complex client state are intentionally out of scope."],
  ["Known issues / unfinished work", "Natural-language intent extraction, grounded generated answers, image uploads, and listing comparison remain future work."]
];
export default function NotesPage() { return <section className="max-w-3xl"><h1 className="text-3xl font-bold tracking-tight">Project notes</h1><div className="mt-8 space-y-7">{notes.map(([heading, body]) => <section key={heading}><h2 className="font-semibold text-ink">{heading}</h2><p className="mt-2 leading-7 text-slate-600">{body}</p></section>)}</div></section>; }
