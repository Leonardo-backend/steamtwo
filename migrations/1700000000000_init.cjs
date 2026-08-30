/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("games", {
    id: "serial primary key",
    slug: { type: "text", notNull: true, unique: true },
    name: { type: "text", notNull: true },
    genre: { type: "text", notNull: true },
    genres: { type: "jsonb", notNull: true, default: "[]" },
    store: { type: "text", notNull: true },
    store_link: { type: "text" },
    steam_app_id: { type: "text" },
    epic_store_slug: { type: "text" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.createTable("rank_snapshots", {
    id: "serial primary key",
    source: { type: "text", notNull: true }, // steam | epic | egdata-fallback
    game_slug: { type: "text", notNull: true },
    position: { type: "integer" },
    players: { type: "integer" },
    league_size: { type: "integer" },
    captured_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.createTable("popularity_snapshots", {
    id: "serial primary key",
    source: { type: "text", notNull: true }, // igdb
    game_slug: { type: "text", notNull: true },
    popularity: { type: "integer" },
    captured_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.createIndex("rank_snapshots", ["source", "captured_at"]);
  pgm.createIndex("rank_snapshots", ["game_slug"]);
  pgm.createIndex("popularity_snapshots", ["game_slug"]);
};

exports.down = (pgm) => {
  pgm.dropTable("popularity_snapshots");
  pgm.dropTable("rank_snapshots");
  pgm.dropTable("games");
};
