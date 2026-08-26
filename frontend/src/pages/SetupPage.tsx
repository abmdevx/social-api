import { AppShell } from "../components/layout/AppShell";
import { PageContainer } from "../components/layout/PageContainer";

const SetupPage = () => (
  <AppShell>
    <PageContainer>
      <section className="max-w-3xl py-16 sm:py-24">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Ready for implementation</p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-100 sm:text-6xl">The frontend foundation is in place.</h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-slate-500">A focused workspace for video, conversation, and creators. Product surfaces will connect to the backend contract here.</p>
      </section>
    </PageContainer>
  </AppShell>
);

export default SetupPage;
