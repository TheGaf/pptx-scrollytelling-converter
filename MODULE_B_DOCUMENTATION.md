# Module B: Design System Extraction

## Overview

Module B is the design DNA extractor for the PPTX Scrollytelling Converter. It analyzes PowerPoint presentations and extracts a comprehensive design system including fonts, colors, spacing, and other design tokens. This module ensures that every generated scrollytelling site is bespoke and reflects the unique design characteristics of the original presentation.

## Features

### 1. Font Analysis and Mapping

#### Google Fonts Database
The system includes mappings for 45+ popular fonts to their Google Fonts equivalents:
- **Sans-serif**: Inter, Roboto, Lato, Open Sans, Poppins, Montserrat, Work Sans, Nunito, etc.
- **Serif**: Merriweather, Playfair Display, Georgia
- **Monospace**: IBM Plex Mono, Courier New
- **Display**: Bebas Neue, Anton, Impact

#### Font Fallback System
When a font cannot be mapped to Google Fonts, the system provides intelligent fallbacks:
- **Sans-serif fonts** → `Arial, Helvetica, "Helvetica Neue", sans-serif`
- **Serif fonts** → `Georgia, "Times New Roman", Times, serif`
- **Monospace fonts** → `"Courier New", Courier, monospace`
- **Display fonts** → `Impact, "Arial Black", sans-serif`

#### Font Mapping Logging
Every font mapping decision is logged:
```
[INFO] Primary font "Calibri" not found in Google Fonts, using fallback "Inter"
[INFO] Secondary font "Arial" mapped to Google Font "Arial"
```

### 2. Color Token Extraction

#### Complete Color Palette
The system extracts a full color token system from PowerPoint themes:
- **Primary**: From theme accent1
- **Secondary**: From theme accent2  
- **Accent**: From theme accent4
- **Background**: From theme lt1 (light 1)
- **Foreground**: From theme dk1 (dark 1)
- **Surface**: Calculated based on background luminance
- **Border**: Calculated based on background luminance
- **Muted**: Calculated based on background luminance
- **Additional palette colors**: From accent3, accent5, accent6

#### WCAG AA Contrast Enforcement

The system automatically checks and adjusts colors for WCAG AA compliance (4.5:1 minimum contrast ratio):

**Contrast Checking Algorithm:**
1. Calculate luminance for each color using the WCAG formula
2. Compute contrast ratio between text and background
3. If ratio < 4.5:1, automatically adjust the color
4. Log all adjustments with before/after ratios

**Example Adjustment:**
```
Original: #CCCCCC on #FFFFFF (ratio: 1.61)
Adjusted: #727272 on #FFFFFF (ratio: 4.81) ✓
```

**Contrast Functions:**
- `getLuminance(r, g, b)`: Calculate relative luminance using WCAG 2.0 formula
- `getContrastRatio(color1, color2)`: Calculate contrast ratio between two colors
- `adjustColorForContrast(textColor, bgColor, targetRatio)`: Automatically adjust colors to meet target ratio

### 3. Rhythm and Spacing Tokens

#### Spacing System
Extracted from shape dimensions and positioning in slides:

**Base Spacing Unit**: Calculated from common distances between elements (GCD algorithm)
- Default: 8px if no clear pattern detected
- Range: 4-32px based on slide geometry

**Spacing Scale**: Multiplicative scale based on base unit
```javascript
[0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8] × baseSpacing
// Example with 8px base: [2, 4, 8, 12, 16, 24, 32, 48, 64]px
```

#### Container and Layout Tokens
- **Container Max Width**: Calculated from average shape widths (800-1400px)
- **Gutter Size**: 2× base spacing unit
- **Border Radius**:
  - Small: 0.5× detected radius
  - Medium: Detected radius (average from shapes)
  - Large: 1.5× detected radius
  - Full: 9999px (for pills)

#### Border and Shadow Tokens
- **Border Widths**: thin (1px), medium (2px), thick (4px)
- **Shadow Levels**:
  - Small: `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)`
  - Medium: `0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)`
  - Large: `0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)`

### 4. Design DNA JSON Output

The complete design system is exported as a JSON file (`design-dna.json`):

```json
{
  "fonts": {
    "primary": {
      "family": "Inter",
      "fallback": "Arial, Helvetica, \"Helvetica Neue\", sans-serif",
      "source": "Calibri",
      "mapped": false,
      "weights": [400, 600, 700, 800],
      "googleFontsUrl": "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
    },
    "secondary": { /* ... */ },
    "scale": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem"
    }
  },
  "colors": {
    "primary": "#0076BA",
    "secondary": "#05A89D",
    "accent": "#F9B900",
    "background": "#ffffff",
    "foreground": "#1a1a1a",
    "surface": "#f8f9fa",
    "border": "#e5e7eb",
    "muted": "#6b7280",
    "palette": ["#0076BA", "#05A89D", "#FF5733"],
    "contrastAdjustments": [
      {
        "type": "foreground",
        "original": "#CCCCCC",
        "adjusted": "#727272",
        "originalRatio": 1.61,
        "newRatio": 4.81
      }
    ]
  },
  "rhythm": {
    "baseSpacing": 8,
    "spacingScale": [2, 4, 8, 12, 16, 24, 32, 48, 64],
    "containerMaxWidth": 1200,
    "gutterSize": 16,
    "borderRadius": {
      "small": 4,
      "medium": 8,
      "large": 12,
      "full": 9999
    },
    "borderWidth": {
      "thin": 1,
      "medium": 2,
      "thick": 4
    },
    "shadow": { /* ... */ }
  },
  "meta": {
    "extractedAt": "2026-01-11T23:16:31.659Z",
    "slideCount": 10,
    "imageCount": 5,
    "designStyle": "modern"
  }
}
```

### 5. Accessibility Reporting

The system generates a comprehensive `ACCESSIBILITY_REPORT.txt` with:

#### Font Mapping Section
```
FONT MAPPING
------------
Primary Font:
  Original: Calibri
  Mapped to: Inter
  Status: Not found - using fallback
  Fallback: Arial, Helvetica, "Helvetica Neue", sans-serif

Secondary Font:
  Original: Arial
  Mapped to: Arial
  Status: Found in Google Fonts
  Fallback: Arial, Helvetica, "Helvetica Neue", sans-serif
```

#### Color Tokens Section
Lists all extracted colors with their hex values.

#### Contrast Adjustments Section
```
COLOR CONTRAST ADJUSTMENTS
--------------------------
Adjusted foreground color:
  Original: #CCCCCC (ratio: 1.61)
  Adjusted: #727272 (ratio: 4.81)
  Status: Now meets WCAG AA standard (4.5:1)
```

#### Accessibility Warnings Section
```
ACCESSIBILITY WARNINGS
----------------------
⚠ Media Warning: EMF/WMF images
  Count: 3
  Message: 3 EMF/WMF images were skipped (unsupported format)
```

#### Rhythm & Spacing Section
Shows extracted spacing, container, and border tokens.

#### WCAG Compliance Notes
Includes recommendations for further accessibility testing with tools like WAVE, axe DevTools, and Lighthouse.

## Implementation Details

### Key Functions

#### `mapFont(fontName)`
Maps a font name to Google Fonts with intelligent fallbacks.

**Returns:**
```javascript
{
  googleFont: string,      // Google Font name
  fallback: string,        // CSS fallback stack
  mapped: boolean,         // True if found in Google Fonts
  source: string          // Original font name
}
```

#### `getContrastRatio(hex1, hex2)`
Calculates WCAG 2.0 contrast ratio between two colors.

**Returns:** Number (1-21)

#### `adjustColorForContrast(textColor, bgColor, targetRatio)`
Automatically adjusts a color to meet WCAG contrast requirements.

**Returns:**
```javascript
{
  color: string,           // Adjusted hex color
  adjusted: boolean,       // True if adjustment was made
  ratio: number,          // New contrast ratio
  originalRatio: number   // Original contrast ratio (if adjusted)
}
```

#### `extractRhythmTokens(slides)`
Analyzes shape dimensions to calculate spacing and rhythm tokens.

**Returns:**
```javascript
{
  baseSpacing: number,
  spacingScale: number[],
  containerMaxWidth: number,
  gutterSize: number,
  borderRadius: object,
  borderWidth: object,
  shadow: object
}
```

#### `extractPPTXData(pptxZip)`
Main extraction function that orchestrates all Module B features.

**Returns:** Complete data object with fonts, colors, slides, images, and designTokens

## Testing

All Module B functions have been tested and verified:

### Test Results
✅ Font mapping with fallback: `Calibri` → `Inter` with system fallback  
✅ Contrast ratio calculation: Black on white = 21:1  
✅ Color adjustment: #CCCCCC → #727272 (1.61 → 4.81 ratio)  
✅ Hex to RGB conversion: #FF5733 → {r: 255, g: 87, b: 51}  
✅ Rhythm extraction: Base spacing calculated from shape dimensions  
✅ Design DNA JSON: Complete token system generated  

## Usage

Module B runs automatically when a PPTX file is uploaded:

1. User uploads PPTX file
2. System extracts theme and slide data
3. Module B analyzes and creates design tokens
4. Design DNA JSON is generated
5. Accessibility report is created
6. All files are packaged in downloadable ZIP

## Benefits

1. **Bespoke Design**: Every site reflects the unique design of the source deck
2. **Accessibility**: Automatic WCAG AA compliance checking and enforcement
3. **Transparency**: Detailed logging of all design decisions
4. **Portability**: Design tokens in JSON format for reuse
5. **System Independence**: Intelligent fallbacks ensure consistency across platforms

## Future Enhancements

Potential improvements for future versions:
- Support for more Google Fonts
- WCAG AAA (7:1) compliance option
- Animation token extraction
- Typography scale detection from actual text sizes
- Advanced shape pattern recognition
- Custom color palette generation algorithms
