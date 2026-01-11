# PPTX to Scrollytelling Converter

Convert your PowerPoint presentations into beautiful, accessible, interactive scrollytelling websites.

![PPTX to Scrollytelling Converter](https://github.com/user-attachments/assets/212a0e94-5726-433c-a249-5e41a67411ac)

## Features

### 🎨 **Design Extraction**
- **Automatic Font Extraction**: Extracts title and body fonts from your PPTX theme
- **Color Palette Extraction**: Pulls background, text, and accent colors directly from your presentation
- **Image Support**: Automatically extracts and embeds all images (background and inline)
- **Web-Safe Fallbacks**: Uses web-safe font fallbacks when custom fonts aren't available

### ♿ **WCAG 2.2 AA Compliance**
- **Contrast Validation**: Automatically validates color contrast ratios (minimum 4.5:1)
- **Keyboard Navigation**: Full keyboard accessibility with visible focus indicators
- **Skip Links**: Quick navigation skip link for screen readers
- **High Contrast Mode**: Toggle for enhanced visibility
- **Alt Text**: Automatic alt text generation for all images
- **Semantic HTML**: Proper heading hierarchy and ARIA labels

### 🎯 **Editable Output**
- **CSS Variables**: All colors and fonts use CSS custom properties for easy editing
- **Single HTML File**: Self-contained output with embedded images
- **Designer Comments**: Meaningful HTML comments guide customization
- **No Dependencies**: Generated HTML works standalone

### 📱 **Responsive Design**
- Mobile-first approach with fluid typography
- Adaptive layouts for all screen sizes
- Smooth scrolling animations
- Progress indicator

## How to Use

1. **Open `index.html`** in your web browser
2. **Upload your PPTX file** via drag & drop or file picker
3. **Customize** site title, copyright, and theme (optional)
4. **Generate Preview** to see your scrollytelling site
5. **Download** the final HTML file

## Technical Details

### Font Extraction
The converter reads `ppt/theme/theme1.xml` to extract:
- Major font (used for headings/titles)
- Minor font (used for body text)

Fonts are mapped to web-safe alternatives with proper fallback chains.

### Color Extraction
Extracts from the PPTX color scheme:
- `dk1`, `dk2`: Background colors
- `lt1`, `lt2`: Text colors  
- `accent1`, `accent2`, `accent3`: Accent colors

All colors are validated for WCAG AA contrast compliance.

### Image Handling
- Reads images from `ppt/media/` folder
- Parses slide relationship files (`ppt/slides/_rels/slide*.xml.rels`)
- Maps images to specific slides (background vs. inline)
- Embeds as base64 data URIs in output HTML

### Text Structure Preservation
- First text element per slide becomes the heading
- Subsequent text elements become paragraphs
- Lists and formatting are preserved where possible

## Generated HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- CSS Variables for easy customization -->
  <style>
    :root {
      --color-primary: #extracted-from-pptx;
      --color-secondary: #extracted-from-pptx;
      --font-title: ExtractedFont, fallback;
      --font-body: ExtractedFont, fallback;
    }
  </style>
</head>
<body>
  <!-- Skip link for accessibility -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <!-- High contrast toggle -->
  <button class="contrast-toggle">High Contrast</button>
  
  <!-- Progress bar -->
  <div class="pb" role="progressbar"></div>
  
  <!-- Hero section -->
  <section id="hero">...</section>
  
  <!-- Content sections from slides -->
  <main id="main-content">
    <section>
      <h2>Slide Title</h2>
      <p>Slide content...</p>
      <img src="data:image/..." alt="Descriptive alt text">
    </section>
  </main>
  
  <!-- Footer -->
  <footer>...</footer>
</body>
</html>
```

## Accessibility Features

### Keyboard Navigation
- `Tab`: Navigate between interactive elements
- `Enter`/`Space`: Activate buttons and links
- All interactive elements have visible focus indicators

### Screen Reader Support
- Semantic HTML structure
- ARIA labels on interactive elements
- Skip link to main content
- Progress bar with `role="progressbar"`

### Visual Accessibility
- WCAG AA color contrast (4.5:1 minimum)
- High contrast mode toggle
- Scalable text (uses `clamp()` for fluid typography)
- No reliance on color alone for information

## Browser Support

- Modern Chrome, Firefox, Safari, Edge
- Requires JavaScript enabled
- Uses ES5-compatible JavaScript (no transpilation needed)

## Dependencies

The converter interface uses:
- [JSZip](https://stuk.github.io/jszip/) (3.10.1) - For reading PPTX files

The generated HTML has **no dependencies** and works standalone.

## Limitations

- Custom fonts are not embedded (uses web-safe fallbacks)
- Complex animations/transitions are not preserved
- Some advanced formatting may be simplified
- Works best with standard PowerPoint layouts

## Future Enhancements

- [ ] Custom font embedding via Google Fonts or font files
- [ ] Animation preservation from PPTX
- [ ] Video/audio support
- [ ] More sophisticated list handling
- [ ] Table support
- [ ] Custom CSS theme injection

## License

© 2026 The Gaf NYC

## Contributing

Contributions welcome! Please ensure:
- Maintain WCAG 2.2 AA compliance
- Test with multiple PPTX files
- Keep the single-file architecture
- Document new features

## Support

For issues or questions, please open an issue on GitHub.
