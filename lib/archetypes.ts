export const SUPPORTED_ARCHETYPES = ["Maker", "Architect", "Catalyst"] as const;

export type SupportedArchetype = (typeof SUPPORTED_ARCHETYPES)[number];

const ARCHETYPE_ALIASES: Record<string, SupportedArchetype> = {
  maker: "Maker",
  architect: "Architect",
  catalyst: "Catalyst",
  MAKER: "Maker",
  ARCHITECT: "Architect",
  CATALYST: "Catalyst",
};

export function normalizeArchetype(value: string | null | undefined): SupportedArchetype | null {
  if (!value) return null;
  return ARCHETYPE_ALIASES[value] ?? null;
}

export function isSupportedArchetype(value: string | null | undefined): value is SupportedArchetype {
  return normalizeArchetype(value) !== null;
}
