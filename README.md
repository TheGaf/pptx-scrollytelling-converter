# PPTX Scrollytelling Converter

A browser-based tool that converts PowerPoint presentations into bespoke scrollytelling websites. This project extracts content, design elements, and styling from PPTX files and generates custom, responsive web experiences.

## 🎯 Overview

The PPTX Scrollytelling Converter transforms static presentations into dynamic, scroll-driven narratives. Each conversion analyzes the source deck's unique fonts, colors, layouts, and visual hierarchy to create a custom scrollytelling site that preserves the original design intent.

## ✨ Features

### Module A: PPTX Parser (Complete)

The core parsing module that processes PPTX files and extracts structured data:

- **✅ Slide Processing**
  - Unzips PPTX files using JSZip
  - Parses slide files in correct sequential order
  - Extracts slide dimensions from `ppt/presentation.xml`
  - Processes theme colors from `ppt/theme/theme1.xml`

- **✅ Text Extraction**
  - Captures all text runs with complete formatting
  - Extracts font family, font size, and colors
  - Detects bold and italic styling
  - Maintains text hierarchy and structure

- **✅ Shape Detection**
  - Identifies shape bounding boxes (x, y, width, height)
  - Extracts fill colors and stroke colors
  - Captures stroke width and corner radius
  - Converts EMU (English Metric Units) to pixels

- **✅ Image Processing**
  - Detects images via slide relationship XML files
  - Identifies file extensions (PNG, JPG, GIF, etc.)
  - Generates placeholders for unsupported formats (EMF/WMF)
  - Links images to their media files

- **✅ Theme & Design**
  - Extracts complete theme color palette
  - Maps accent colors and system colors
  - Supports scheme color references
  - Preserves color relationships

## 🚀 Quick Start

### Basic Usage

1. **Open the Demo Interface**
   ```
   Open module-a-demo.html in a modern web browser
   ```

2. **Upload a PPTX File**
   - Drag and drop a `.pptx` file onto the upload zone
   - Or click to browse and select a file

3. **View Extracted Data**
   - See summary statistics (slides, text runs, shapes, images)
   - Browse the complete JSON output
   - Review detailed slide-by-slide analysis

### Using the Parser Module

Include the parser in your HTML:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="pptx-parser.js"></script>
```

Use it in your JavaScript:

```javascript
// Load PPTX file
var fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', function(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    
    reader.onload = function(e) {
        JSZip.loadAsync(e.target.result)
            .then(function(zip) {
                return PPTXParser.parse(zip);
            })
            .then(function(data) {
                console.log('Extracted data:', data);
                // Use the extracted data
                processSlides(data.slides);
                applyTheme(data.themeColors);
            })
            .catch(function(error) {
                console.error('Error:', error);
            });
    };
    
    reader.readAsArrayBuffer(file);
});
```

## 📊 JSON Output Format

The parser generates a clean JSON model with the following structure:

```json
{
  "dimensions": {
    "width": 9144000,
    "height": 6858000,
    "widthPx": 960,
    "heightPx": 720
  },
  "themeColors": {
    "dk1": "#000000",
    "lt1": "#FFFFFF",
    "accent1": "#4472C4",
    "accent2": "#ED7D31",
    "accent3": "#A5A5A5",
    "accent4": "#FFC000",
    "accent5": "#5B9BD5",
    "accent6": "#70AD47"
  },
  "slides": [
    {
      "slideNumber": 1,
      "textRuns": [
        {
          "text": "Welcome to Our Presentation",
          "fontFamily": "Calibri",
          "fontSize": 44,
          "color": "#000000",
          "bold": true,
          "italic": false
        }
      ],
      "shapes": [
        {
          "boundingBox": {
            "x": 100,
            "y": 150,
            "width": 800,
            "height": 400
          },
          "fillColor": "#4472C4",
          "strokeColor": "#2E5C9A",
          "strokeWidth": 2,
          "cornerRadius": 8
        }
      ],
      "images": [
        {
          "embedId": "rId2",
          "path": "ppt/media/image1.png",
          "filename": "image1.png",
          "extension": "png",
          "supported": true,
          "data": null
        }
      ]
    }
  ]
}
```

## 🔧 Technical Details

### Browser Compatibility

- **Supported**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Required**: ES5+ JavaScript support
- **Dependencies**: JSZip 3.10.1+ (loaded via CDN)

### Architecture

The parser is built as a self-contained module with:

- **No Node.js dependencies** - Runs entirely in the browser
- **Robust XML parsing** - Handles various PPTX format variations
- **Namespace support** - Properly parses Office Open XML namespaces
- **Error handling** - Graceful degradation for missing or malformed data

### Conversion Units

- **EMU to Pixels**: 1 inch = 914,400 EMU = 96 pixels (at 96 DPI)
- **Font Size**: Stored as points × 100 in PPTX (e.g., 4400 = 44pt)
- **Colors**: Converted to hex format (#RRGGBB)

### XML Namespaces

The parser handles these Office Open XML namespaces:

- `a:` - DrawingML (graphics and text formatting)
- `p:` - PresentationML (slide structure)
- `r:` - Relationships (links between parts)

## 📁 File Structure

```
pptx-scrollytelling-converter/
├── README.md                                    # This file
├── pptx-parser.js                              # Core Module A parser
├── module-a-demo.html                          # Interactive demo interface
├── index.html                                  # Main converter application
└── pptx-scrollytelling-converter-bespoke.html # Alternative interface
```

## 🎨 Examples

### Extract Theme Colors

```javascript
PPTXParser.parse(pptxZip).then(function(data) {
    var primaryColor = data.themeColors.accent1;
    var secondaryColor = data.themeColors.accent2;
    
    document.body.style.setProperty('--primary-color', primaryColor);
    document.body.style.setProperty('--secondary-color', secondaryColor);
});
```

### Process All Slides

```javascript
PPTXParser.parse(pptxZip).then(function(data) {
    data.slides.forEach(function(slide) {
        console.log('Slide ' + slide.slideNumber + ':');
        console.log('  Text runs: ' + slide.textRuns.length);
        console.log('  Shapes: ' + slide.shapes.length);
        console.log('  Images: ' + slide.images.length);
        
        // Extract all text
        var allText = slide.textRuns.map(function(run) {
            return run.text;
        }).join(' ');
        
        console.log('  Content: ' + allText);
    });
});
```

### Filter Unsupported Images

```javascript
PPTXParser.parse(pptxZip).then(function(data) {
    data.slides.forEach(function(slide) {
        var unsupportedImages = slide.images.filter(function(img) {
            return !img.supported;
        });
        
        if (unsupportedImages.length > 0) {
            console.warn('Slide ' + slide.slideNumber + ' has ' + 
                        unsupportedImages.length + ' unsupported images');
            unsupportedImages.forEach(function(img) {
                console.log('  - ' + img.filename + ' (' + img.extension + ')');
            });
        }
    });
});
```

## 🐛 Known Limitations

- **EMF/WMF Images**: Enhanced Metafile (EMF) and Windows Metafile (WMF) formats are not supported in browsers. The parser generates SVG placeholders for these images.
- **Embedded Fonts**: Custom embedded fonts are not extracted; font names are mapped to web-safe alternatives.
- **Animations**: PowerPoint animations and transitions are not captured.
- **Charts**: Embedded Excel charts are treated as images if rendered.
- **Videos**: Embedded videos are detected but not extracted.

## 🔮 Future Enhancements

### Module B: Layout Generation (Planned)
- Convert slide layouts to responsive HTML/CSS
- Generate scroll-triggered animations
- Optimize for mobile and desktop viewports

### Module C: Asset Processing (Planned)
- Embed images as base64 or separate files
- Optimize image sizes and formats
- Extract and embed custom fonts

### Module D: Output Packaging (Planned)
- Generate standalone HTML files
- Create downloadable ZIP archives
- Include design reports and metadata

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

1. **Enhanced XML Parsing**: Handle more PPTX variations and edge cases
2. **Additional Shape Types**: Support for more complex shapes and SmartArt
3. **Performance**: Optimize for large presentations (100+ slides)
4. **Testing**: Add comprehensive test suite with sample PPTX files

## 📄 License

This project is provided as-is for educational and commercial use.

## 🙏 Acknowledgments

- Built with [JSZip](https://stuk.github.io/jszip/) for PPTX file handling
- Follows [Office Open XML standards](http://officeopenxml.com/)
- Inspired by modern scrollytelling frameworks

## 📞 Support

For issues, questions, or feature requests, please check:

1. The demo interface (`module-a-demo.html`) for usage examples
2. The JSON output structure documentation above
3. Browser console for detailed error messages

---

**Version**: 1.0.0 (Module A Complete)  
**Last Updated**: January 2026  
**Status**: ✅ Module A Ready for Production
