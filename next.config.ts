import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // the resume opens in a tab rather than downloading, so give it a
        // filename worth saving under. `inline` keeps it in the viewer.
        source: "/resume.pdf",
        headers: [
          {
            key: "Content-Disposition",
            value: 'inline; filename="Ammar-Hassan_Resume.pdf"',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
