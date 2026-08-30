import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import HowItWorksModal from "./components/HowItWorksModal.jsx";
import Loading from "./components/Loading.jsx";

const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Catalog = lazy(() => import("./pages/Catalog.jsx"));
const Detail = lazy(() => import("./pages/Detail.jsx"));

export function parsePath(pathname) {
  const parts = pathname.replace(/^\/+/, "").split("/").filter(Boolean);
  if (parts[0] === "jogos") {
    return parts[1] ? { name: "detail", slug: decodeURIComponent(parts[1]) } : { name: "catalog" };
  }
  return { name: "home" };
}

export function useRoute() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = useCallback((to) => {
    window.history.pushState({}, "", to);
    setPathname(to);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  return { route: parsePath(pathname), navigate, pathname };
}

export default function App() {
  const { route, navigate } = useRoute();
  const [showHow, setShowHow] = useState(false);

  const openHow = () => setShowHow(true);
  const closeHow = useCallback(() => setShowHow(false), []);

  let page;
  if (route.name === "detail") page = <Detail slug={route.slug} navigate={navigate} />;
  else if (route.name === "catalog") page = <Catalog navigate={navigate} />;
  else page = <Dashboard navigate={navigate} openHow={openHow} />;

  const overHero = route.name === "home";

  return (
    <div className="app">
      <a href="#main" className="skip-link">Pular para o conteúdo</a>
      <Header overHero={overHero} navigate={navigate} onHow={openHow} current={route.name} />
      <main className="page" id="main">
        <Suspense fallback={<Loading label="Carregando página…" />}>{page}</Suspense>
      </main>
      <Footer onHow={openHow} />
      <HowItWorksModal open={showHow} onClose={closeHow} />
    </div>
  );
}
