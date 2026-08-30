import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import HowItWorksModal from "./components/HowItWorksModal.jsx";
import Loading from "./components/Loading.jsx";

const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Catalog = lazy(() => import("./pages/Catalog.jsx"));
const Detail = lazy(() => import("./pages/Detail.jsx"));
const Rankings = lazy(() => import("./pages/Rankings.jsx"));
const Genres = lazy(() => import("./pages/Genres.jsx"));
const Compare = lazy(() => import("./pages/Compare.jsx"));
const MyList = lazy(() => import("./pages/MyList.jsx"));

export function parsePath(pathname) {
  const clean = pathname.replace(/^\/+/, "").split("?")[0];
  const parts = clean.split("/").filter(Boolean);

  if (parts[0] === "jogos" || parts[0] === "catalogo" || parts[0] === "generos") {
    return parts[1] ? { name: "detail", slug: decodeURIComponent(parts[1]) } : { name: "catalog" };
  }
  if (parts[0] === "rankings") {
    return { name: "rankings" };
  }
  if (parts[0] === "comparar") {
    return { name: "compare" };
  }
  if (parts[0] === "minha-lista" || parts[0] === "favoritos") {
    return { name: "mylist" };
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

  // Gerenciamento de tema Claro / Escuro
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("steamtwo_theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("steamtwo_theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Gerenciamento de Favoritos (Minha Lista)
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("steamtwo_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("steamtwo_favorites", JSON.stringify(favorites));
    } catch {
      /* ignore */
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (slug) => favorites.some((f) => f.slug === slug),
    [favorites]
  );

  const toggleFavorite = useCallback((game) => {
    if (!game || !game.slug) return;
    setFavorites((prev) => {
      const exists = prev.some((f) => f.slug === game.slug);
      if (exists) {
        return prev.filter((f) => f.slug !== game.slug);
      }
      return [
        {
          slug: game.slug,
          name: game.name || game.shortTitle || game.title,
          genre: game.genre || (game.genres && game.genres[0]) || "Outros",
          genres: game.genres || [],
          tagline: game.tagline || game.summary || "",
          store: game.store || "steam",
          color: game.color || "#3b5a72",
          index: game.index != null ? game.index : game.score || 0,
          rank: game.rank || game.steamRank || null,
        },
        ...prev,
      ];
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const openHow = () => setShowHow(true);
  const closeHow = useCallback(() => setShowHow(false), []);

  let page;
  if (route.name === "detail") {
    page = (
      <Detail
        slug={route.slug}
        navigate={navigate}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
      />
    );
  } else if (route.name === "catalog") {
    page = (
      <Catalog
        navigate={navigate}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
      />
    );
  } else if (route.name === "rankings") {
    page = (
      <Rankings
        navigate={navigate}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
      />
    );
  } else if (route.name === "genres") {
    page = (
      <Genres
        navigate={navigate}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
      />
    );
  } else if (route.name === "compare") {
    page = <Compare navigate={navigate} />;
  } else if (route.name === "mylist") {
    page = (
      <MyList
        navigate={navigate}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
        clearFavorites={clearFavorites}
      />
    );
  } else {
    page = (
      <Dashboard
        navigate={navigate}
        openHow={openHow}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
      />
    );
  }

  const overHero = route.name === "home";

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Pular para o conteúdo
      </a>
      <Header
        overHero={overHero}
        navigate={navigate}
        onHow={openHow}
        current={route.name}
        favoritesCount={favorites.length}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="page" id="main">
        <Suspense fallback={<Loading label="Carregando página…" />}>{page}</Suspense>
      </main>
      <Footer onHow={openHow} />
      <HowItWorksModal open={showHow} onClose={closeHow} />
    </div>
  );
}
