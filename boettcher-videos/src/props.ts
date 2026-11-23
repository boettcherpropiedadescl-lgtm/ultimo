// Props editables de la pieza. Valores tomados de examples/brief.json de la skill (demo, datos por confirmar).
export type ReelProps = {
  headline: string;
  subheadline: string;
  cta: string;
  brand: string;
  services: string[];
};

export const defaultReelProps: ReelProps = {
  headline: "¿SU DEPTO SIGUE VACÍO?",
  subheadline: "Conversemos sobre una estrategia de arriendo para su propiedad.",
  cta: "Escríbanos",
  brand: "Boettcher Propiedades",
  services: ["Publicación", "Visitas coordinadas", "Evaluación de interesados"],
};
