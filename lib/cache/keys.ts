export const cacheKeys = {
  challenges: "challenges:all",
  challengeBySlug: (slug: string) => `challenges:${slug}`,
  skills: "skills:all",
  skillCatalog: "skills:catalog",
  relicCatalog: "armory:catalog",
};
