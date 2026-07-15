/** @type {import('next').NextConfig} */
const nextConfig = {
  // Genera un servidor autónomo mínimo, ideal para el contenedor de Cloud Run.
  output: "standalone",
  outputFileTracingIncludes: {
    // Asegura que el logo y las fuentes usados al generar el PDF viajen al build.
    "/api/**": ["./public/**"],
  },
};

export default nextConfig;
