# Newsreader

`newsreader-italic.woff2` is bundled to avoid the build-time Google Fonts URL
processing failure in Next.js 16.2.9. The other font families still use
`next/font/google`.

Source: [Google Fonts, Newsreader Italic](https://github.com/google/fonts/blob/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/newsreader/Newsreader-Italic%5Bopsz%2Cwght%5D.ttf).
License: SIL Open Font License 1.1; see `OFL.txt`.

The source is version 1.003. Its optical-size axis is fixed at 16 to match the
previous Google Fonts output. The weight axis and full character coverage are
preserved; the layout declares the existing italic weights 400–500.

To regenerate with FontTools and Brotli installed, download the pinned source
above and run:

```python
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

font = TTFont("Newsreader-Italic[opsz,wght].ttf")
font = instantiateVariableFont(font, {"opsz": 16}, inplace=True)
font.flavor = "woff2"
font.save("newsreader-italic.woff2")
```
