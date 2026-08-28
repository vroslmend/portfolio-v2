import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only answers for qualities listed here (the default is [75]), and
    // returns 400 for anything else. 75 is the wall's thumbnails; 90 is the
    // lightbox, where the photo is the whole point of the screen and the frame
    // is being sized to the box it occupies rather than shipped oversized — so
    // the quality budget is better spent on the encoder than on pixels the
    // display cannot resolve.
    qualities: [75, 90],
  },
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
