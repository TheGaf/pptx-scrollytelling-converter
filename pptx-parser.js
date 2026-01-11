/**
 * Module A: PPTX Scrollytelling Converter - PPTX Parser
 * 
 * This module processes PPTX files and extracts:
 * - Slide dimensions and theme colors
 * - Text runs with formatting (font, size, color, bold, italic)
 * - Shapes with bounding boxes and styling
 * - Images with extension detection and EMF/WMF placeholder handling
 * 
 * Browser-compatible, no Node.js dependencies.
 */

var PPTXParser = (function() {
    'use strict';

    // EMU (English Metric Units) to pixels conversion (914400 EMU = 1 inch, 96 DPI)
    var EMU_TO_PX = 1 / 9525;
    
    /**
     * Parse color from various PPTX color formats
     */
    function parseColor(colorNode, themeColors) {
        if (!colorNode) return null;
        
        // sRGB color
        var srgbMatch = colorNode.match(/<a:srgbClr val="([0-9A-Fa-f]{6})"/);
        if (srgbMatch) {
            return '#' + srgbMatch[1].toUpperCase();
        }
        
        // Scheme color (reference to theme)
        var schemeMatch = colorNode.match(/<a:schemeClr val="([^"]+)"/);
        if (schemeMatch && themeColors) {
            var schemeName = schemeMatch[1];
            return themeColors[schemeName] || null;
        }
        
        // System color
        var sysMatch = colorNode.match(/<a:sysClr val="([^"]+)"[^>]*lastClr="([0-9A-Fa-f]{6})"/);
        if (sysMatch) {
            return '#' + sysMatch[2].toUpperCase();
        }
        
        return null;
    }
    
    /**
     * Convert EMU to pixels
     */
    function emuToPx(emu) {
        return Math.round(parseFloat(emu) * EMU_TO_PX);
    }
    
    /**
     * Extract theme colors from theme1.xml
     */
    function extractThemeColors(themeXml) {
        var colors = {
            dk1: '#000000',
            lt1: '#FFFFFF',
            dk2: '#1F4E78',
            lt2: '#EEECE1',
            accent1: '#4472C4',
            accent2: '#ED7D31',
            accent3: '#A5A5A5',
            accent4: '#FFC000',
            accent5: '#5B9BD5',
            accent6: '#70AD47'
        };
        
        // Parse dark1
        var dk1Match = themeXml.match(/<a:dk1>[\s\S]*?<a:srgbClr val="([0-9A-Fa-f]{6})"/);
        if (dk1Match) colors.dk1 = '#' + dk1Match[1].toUpperCase();
        
        // Parse light1
        var lt1Match = themeXml.match(/<a:lt1>[\s\S]*?<a:srgbClr val="([0-9A-Fa-f]{6})"/);
        if (lt1Match) colors.lt1 = '#' + lt1Match[1].toUpperCase();
        
        // Parse accent colors
        var accentNames = ['accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6'];
        for (var i = 0; i < accentNames.length; i++) {
            var name = accentNames[i];
            var regex = new RegExp('<a:' + name + '>[\\s\\S]*?<a:srgbClr val="([0-9A-Fa-f]{6})"');
            var match = themeXml.match(regex);
            if (match) {
                colors[name] = '#' + match[1].toUpperCase();
            }
        }
        
        return colors;
    }
    
    /**
     * Extract slide dimensions from presentation.xml
     */
    function extractSlideDimensions(presentationXml) {
        var dimensions = {
            width: 9144000,  // Default: 10 inches
            height: 6858000, // Default: 7.5 inches
            widthPx: 960,
            heightPx: 720
        };
        
        var sldSzMatch = presentationXml.match(/<p:sldSz[^>]*cx="(\d+)"[^>]*cy="(\d+)"/);
        if (sldSzMatch) {
            dimensions.width = parseInt(sldSzMatch[1]);
            dimensions.height = parseInt(sldSzMatch[2]);
            dimensions.widthPx = emuToPx(dimensions.width);
            dimensions.heightPx = emuToPx(dimensions.height);
        }
        
        return dimensions;
    }
    
    /**
     * Extract text runs with formatting from slide XML
     */
    function extractTextRuns(slideXml, themeColors) {
        var textRuns = [];
        
        // Match all text run elements <a:r>...</a:r>
        var runRegex = /<a:r>([\s\S]*?)<\/a:r>/g;
        var runMatch;
        
        while ((runMatch = runRegex.exec(slideXml)) !== null) {
            var runContent = runMatch[1];
            
            // Extract text content
            var textMatch = runContent.match(/<a:t[^>]*>([^<]*)<\/a:t>/);
            if (!textMatch) continue;
            
            var text = textMatch[1];
            
            // Extract run properties
            var rPrMatch = runContent.match(/<a:rPr[^>]*>([\s\S]*?)<\/a:rPr>/);
            var properties = {
                text: text,
                fontFamily: null,
                fontSize: null,
                color: null,
                bold: false,
                italic: false
            };
            
            if (rPrMatch) {
                var rPrContent = rPrMatch[0];
                
                // Font size (in points * 100)
                var szMatch = rPrContent.match(/sz="(\d+)"/);
                if (szMatch) {
                    properties.fontSize = parseInt(szMatch[1]) / 100;
                }
                
                // Bold
                properties.bold = /b="1"/.test(rPrContent) || /b="true"/.test(rPrContent);
                
                // Italic
                properties.italic = /i="1"/.test(rPrContent) || /i="true"/.test(rPrContent);
                
                // Font family
                var latinMatch = rPrContent.match(/<a:latin typeface="([^"]+)"/);
                if (latinMatch) {
                    properties.fontFamily = latinMatch[1];
                }
                
                // Color - check for solidFill
                var solidFillMatch = rPrContent.match(/<a:solidFill>([\s\S]*?)<\/a:solidFill>/);
                if (solidFillMatch) {
                    properties.color = parseColor(solidFillMatch[1], themeColors);
                }
            }
            
            textRuns.push(properties);
        }
        
        return textRuns;
    }
    
    /**
     * Extract shape information from slide XML
     */
    function extractShapes(slideXml, themeColors) {
        var shapes = [];
        
        // Match all shape elements <p:sp>...</p:sp>
        var shapeRegex = /<p:sp>([\s\S]*?)<\/p:sp>/g;
        var shapeMatch;
        
        while ((shapeMatch = shapeRegex.exec(slideXml)) !== null) {
            var shapeContent = shapeMatch[1];
            
            var shape = {
                boundingBox: { x: 0, y: 0, width: 0, height: 0 },
                fillColor: null,
                strokeColor: null,
                strokeWidth: null,
                cornerRadius: null
            };
            
            // Extract bounding box from xfrm (transform)
            var xfrmMatch = shapeContent.match(/<a:xfrm>([\s\S]*?)<\/a:xfrm>/);
            if (xfrmMatch) {
                var xfrmContent = xfrmMatch[1];
                
                var offMatch = xfrmContent.match(/<a:off x="(\d+)" y="(\d+)"/);
                if (offMatch) {
                    shape.boundingBox.x = emuToPx(offMatch[1]);
                    shape.boundingBox.y = emuToPx(offMatch[2]);
                }
                
                var extMatch = xfrmContent.match(/<a:ext cx="(\d+)" cy="(\d+)"/);
                if (extMatch) {
                    shape.boundingBox.width = emuToPx(extMatch[1]);
                    shape.boundingBox.height = emuToPx(extMatch[2]);
                }
            }
            
            // Extract fill color
            var solidFillMatch = shapeContent.match(/<a:solidFill>([\s\S]*?)<\/a:solidFill>/);
            if (solidFillMatch) {
                shape.fillColor = parseColor(solidFillMatch[1], themeColors);
            }
            
            // Extract stroke/outline properties
            var lnMatch = shapeContent.match(/<a:ln[^>]*w="(\d+)"[^>]*>([\s\S]*?)<\/a:ln>/);
            if (lnMatch) {
                shape.strokeWidth = emuToPx(lnMatch[1]);
                
                var lnContent = lnMatch[2];
                var lnSolidFillMatch = lnContent.match(/<a:solidFill>([\s\S]*?)<\/a:solidFill>/);
                if (lnSolidFillMatch) {
                    shape.strokeColor = parseColor(lnSolidFillMatch[1], themeColors);
                }
            }
            
            // Extract corner radius from prstGeom (preset geometry)
            var prstGeomMatch = shapeContent.match(/<a:prstGeom prst="([^"]+)">([\s\S]*?)<\/a:prstGeom>/);
            if (prstGeomMatch) {
                var geomType = prstGeomMatch[1];
                var geomContent = prstGeomMatch[2];
                
                // Check for rounded rectangle
                if (geomType.includes('RoundRect') || geomType.includes('roundRect')) {
                    var avLstMatch = geomContent.match(/<a:avLst>([\s\S]*?)<\/a:avLst>/);
                    if (avLstMatch) {
                        var adjMatch = avLstMatch[1].match(/<a:gd name="adj" fmla="val (\d+)"/);
                        if (adjMatch) {
                            // Corner radius as percentage, convert to pixels
                            var adjValue = parseInt(adjMatch[1]);
                            shape.cornerRadius = Math.round(adjValue / 100000 * Math.min(shape.boundingBox.width, shape.boundingBox.height));
                        }
                    }
                }
            }
            
            shapes.push(shape);
        }
        
        return shapes;
    }
    
    /**
     * Extract images from slide and relationships
     */
    function extractImages(slideXml, slideRelsXml, mediaFolder) {
        var images = [];
        
        if (!slideRelsXml) return images;
        
        // Find all blip (image) references in slide
        var blipRegex = /<a:blip r:embed="([^"]+)"/g;
        var blipMatch;
        var embedIds = [];
        
        while ((blipMatch = blipRegex.exec(slideXml)) !== null) {
            embedIds.push(blipMatch[1]);
        }
        
        // Match embed IDs to actual file paths in relationships
        for (var i = 0; i < embedIds.length; i++) {
            var embedId = embedIds[i];
            var relRegex = new RegExp('<Relationship[^>]*Id="' + embedId + '"[^>]*Target="([^"]+)"');
            var relMatch = slideRelsXml.match(relRegex);
            
            if (relMatch) {
                var targetPath = relMatch[1].replace('../', 'ppt/');
                var filename = targetPath.split('/').pop();
                var extension = filename.split('.').pop().toLowerCase();
                
                var imageInfo = {
                    embedId: embedId,
                    path: targetPath,
                    filename: filename,
                    extension: extension,
                    supported: true,
                    data: null
                };
                
                // Check for unsupported formats
                if (extension === 'emf' || extension === 'wmf') {
                    imageInfo.supported = false;
                    imageInfo.placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkVNRi9XTUYgbm90IHN1cHBvcnRlZDwvdGV4dD48L3N2Zz4=';
                } else if (mediaFolder) {
                    // Try to get the actual image data
                    var mediaFile = mediaFolder.file(filename);
                    if (mediaFile) {
                        imageInfo.data = mediaFile;
                    }
                }
                
                images.push(imageInfo);
            }
        }
        
        return images;
    }
    
    /**
     * Process a single slide
     */
    function processSlide(slideXml, slideRelsXml, slideNumber, themeColors, mediaFolder) {
        return {
            slideNumber: slideNumber,
            textRuns: extractTextRuns(slideXml, themeColors),
            shapes: extractShapes(slideXml, themeColors),
            images: extractImages(slideXml, slideRelsXml, mediaFolder)
        };
    }
    
    /**
     * Main parsing function
     */
    function parsePPTX(pptxZip) {
        return new Promise(function(resolve, reject) {
            try {
                var result = {
                    dimensions: { width: 9144000, height: 6858000, widthPx: 960, heightPx: 720 },
                    themeColors: {},
                    slides: []
                };
                
                // Extract slide dimensions
                var presentationFile = pptxZip.file('ppt/presentation.xml');
                if (presentationFile) {
                    presentationFile.async('text').then(function(presentationXml) {
                        result.dimensions = extractSlideDimensions(presentationXml);
                        
                        // Extract theme colors
                        var themeFile = pptxZip.file('ppt/theme/theme1.xml');
                        var themePromise = themeFile ? themeFile.async('text') : Promise.resolve(null);
                        
                        return themePromise;
                    }).then(function(themeXml) {
                        if (themeXml) {
                            result.themeColors = extractThemeColors(themeXml);
                        }
                        
                        // Get all slide files
                        var slideFolder = pptxZip.folder('ppt/slides');
                        var slideFiles = [];
                        
                        if (slideFolder) {
                            slideFolder.forEach(function(path, file) {
                                if (path.match(/^slide\d+\.xml$/) && !path.includes('_rels')) {
                                    slideFiles.push(path);
                                }
                            });
                        }
                        
                        // Sort slide files numerically
                        slideFiles.sort(function(a, b) {
                            var numA = parseInt(a.match(/\d+/)[0]);
                            var numB = parseInt(b.match(/\d+/)[0]);
                            return numA - numB;
                        });
                        
                        // Process slides sequentially
                        var slidePromises = [];
                        var mediaFolder = pptxZip.folder('ppt/media');
                        
                        for (var i = 0; i < slideFiles.length; i++) {
                            (function(index, slidePath) {
                                var slideFile = slideFolder.file(slidePath);
                                var slideNumber = parseInt(slidePath.match(/\d+/)[0]);
                                
                                // Get slide XML
                                var slideXmlPromise = slideFile.async('text');
                                
                                // Get slide relationships XML
                                var relsFolder = pptxZip.folder('ppt/slides/_rels');
                                var relsPath = slidePath.replace('.xml', '.xml.rels');
                                var relsFile = relsFolder ? relsFolder.file(relsPath) : null;
                                var relsXmlPromise = relsFile ? relsFile.async('text') : Promise.resolve(null);
                                
                                slidePromises.push(
                                    Promise.all([slideXmlPromise, relsXmlPromise]).then(function(values) {
                                        var slideXml = values[0];
                                        var relsXml = values[1];
                                        return processSlide(slideXml, relsXml, slideNumber, result.themeColors, mediaFolder);
                                    })
                                );
                            })(i, slideFiles[i]);
                        }
                        
                        return Promise.all(slidePromises);
                    }).then(function(slides) {
                        result.slides = slides;
                        resolve(result);
                    }).catch(reject);
                } else {
                    reject(new Error('presentation.xml not found'));
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // Public API
    return {
        parse: parsePPTX,
        version: '1.0.0'
    };
})();
